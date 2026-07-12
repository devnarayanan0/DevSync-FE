import * as fs from 'fs';
import * as path from 'path';
import { getDb } from './DatabaseService';
import { AwsService } from './AwsService';
import { GoogleDriveService } from './GoogleDriveService';

export interface FileMeta {
  relativePath: string;
  size: number;
  lastModified: string; // ISO String UTC
}

export class SyncService {
  // Recursively read local folder metadata
  private static getLocalFiles(dirPath: string, rootDir: string): FileMeta[] {
    const results: FileMeta[] = [];
    if (!fs.existsSync(dirPath)) return [];

    const list = fs.readdirSync(dirPath);
    for (const file of list) {
      if (file.startsWith('.')) continue; // skip hidden files

      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        results.push(...this.getLocalFiles(filePath, rootDir));
      } else {
        const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
        results.push({
          relativePath,
          size: stat.size,
          lastModified: stat.mtime.toISOString(),
        });
      }
    }
    return results;
  }

  // Primary entrypoint to sync a single pipeline
  static async runSync(requestId: string): Promise<boolean> {
    console.log(`[SyncService] Starting synchronization pipeline: ${requestId}`);
    const db = getDb();

    // Set request status to syncing
    db.prepare("UPDATE sync_requests SET status = 'syncing' WHERE id = ?").run(requestId);

    try {
      const req = db.prepare('SELECT * FROM sync_requests WHERE id = ?').get(requestId) as any;
      if (!req) {
        throw new Error(`Sync request not found with id: ${requestId}`);
      }

      const { provider, localPath, remoteFolder, tenantId, bucketName, folderId } = req;

      if (!localPath || !fs.existsSync(localPath)) {
        throw new Error(`Local directory does not exist: ${localPath}`);
      }

      if (!tenantId) {
        throw new Error('Tenant identification token is missing for this sync pipeline.');
      }

      // 1. Gather local file metas
      const localFiles = this.getLocalFiles(localPath, localPath);

      // 2. Gather remote file metas from Spring Boot gateway
      let remoteFiles: any[] = [];
      if (provider === 'aws-s3') {
        const prefix = remoteFolder ? remoteFolder.replace('s3://', '').split('/').slice(1).join('/') : '';
        remoteFiles = await AwsService.scanFolderMetadata(tenantId, bucketName || '', prefix);
      } else if (provider === 'google-drive') {
        remoteFiles = await GoogleDriveService.scanFolderMetadata(tenantId, folderId || '');
      }

      console.log(`[SyncService] Scanned ${localFiles.length} local files & ${remoteFiles.length} remote files.`);

      // Normalise remote files format:
      // Remote scans from S3 return fileNames as full keys like "backups/engineering/file.txt"
      // or similar. We need to normalize them to represent the relative path within the pipeline folder.
      const normalizedRemote: FileMeta[] = remoteFiles.map((f: any) => {
        // For S3: fileName may contain folderName prefix. Strip prefix to match relative path
        let relPath = f.fileName;
        if (provider === 'aws-s3') {
          const prefix = remoteFolder ? remoteFolder.replace('s3://', '').split('/').slice(1).join('/') : '';
          if (prefix && relPath.startsWith(prefix)) {
            relPath = relPath.substring(prefix.length).replace(/^\//, '');
          }
        }
        return {
          relativePath: relPath,
          size: f.size,
          lastModified: f.lastModified,
          // Custom identifier if Google Drive file
          fileId: f.fileId,
        };
      });

      // 3. Bidirectional Sync Algorithm (Latest Modified Wins)
      const localMap = new Map<string, FileMeta>(localFiles.map(f => [f.relativePath, f]));
      const remoteMap = new Map<string, any>(normalizedRemote.map(f => [f.relativePath, f]));

      // Keep tracking of changes for log report
      let uploads = 0;
      let downloads = 0;
      let deletes = 0;

      // Local to Remote / Comparison
      for (const [relPath, localFile] of localMap.entries()) {
        const remoteFile = remoteMap.get(relPath);

        if (!remoteFile) {
          // File does not exist on remote, upload it
          console.log(`[SyncService] Uploading new file: ${relPath}`);
          await this.executeUpload(req, localPath, relPath);
          uploads++;
        } else {
          // File exists on both sides, compare size & timestamps
          const localTime = new Date(localFile.lastModified).getTime();
          const remoteTime = new Date(remoteFile.lastModified).getTime();

          // Check if difference is significant (e.g. > 2 seconds to allow rounding margins)
          const timeDiff = Math.abs(localTime - remoteTime);
          const isSizeDifferent = localFile.size !== remoteFile.size;

          if (isSizeDifferent || timeDiff > 2000) {
            if (localTime > remoteTime) {
              console.log(`[SyncService] Local file is newer: ${relPath} (Local: ${localFile.lastModified}, Remote: ${remoteFile.lastModified})`);
              await this.executeUpload(req, localPath, relPath);
              uploads++;
            } else {
              console.log(`[SyncService] Remote file is newer: ${relPath} (Local: ${localFile.lastModified}, Remote: ${remoteFile.lastModified})`);
              await this.executeDownload(req, localPath, relPath, remoteFile.fileId);
              downloads++;
            }
          } else {
            console.log(`[SyncService] File is identical on both sides: ${relPath}`);
          }
        }
      }

      // Remote to Local (Files present on remote but not locally)
      for (const [relPath, remoteFile] of remoteMap.entries()) {
        if (!localMap.has(relPath)) {
          console.log(`[SyncService] Remote file not found locally, downloading: ${relPath}`);
          await this.executeDownload(req, localPath, relPath, remoteFile.fileId);
          downloads++;
        }
      }

      // Update last sync details in database
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      db.prepare("UPDATE sync_requests SET status = 'idle', lastSync = ? WHERE id = ?").run(timestamp, requestId);

      // Log success activity
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      db.prepare(`
        INSERT INTO activity_log (id, sync_request_id, file_path, action, status, message, timestamp)
        VALUES (?, ?, 'Complete Sync', 'SYNC', 'SUCCESS', ?, ?)
      `).run(
        logId,
        requestId,
        `Pipeline complete. Sync summary: ${uploads} uploaded, ${downloads} downloaded, ${deletes} deleted.`,
        new Date().toISOString()
      );

      return true;
    } catch (err: any) {
      console.error(`[SyncService] Sync failed for pipeline ${requestId}:`, err);
      db.prepare("UPDATE sync_requests SET status = 'failed' WHERE id = ?").run(requestId);

      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      db.prepare(`
        INSERT INTO activity_log (id, sync_request_id, file_path, action, status, message, timestamp)
        VALUES (?, ?, 'Sync Job', 'SYNC', 'FAILED', ?, ?)
      `).run(
        logId,
        requestId,
        `Pipeline sync failed: ${err.message || err}`,
        new Date().toISOString()
      );

      return false;
    }
  }

  // Preview changes without actually syncing (for GitHub Desktop-like view)
  static async previewChanges(requestId: string): Promise<any> {
    console.log(`[SyncService] Previewing changes for pipeline: ${requestId}`);
    const db = getDb();
    
    try {
      const req = db.prepare('SELECT * FROM sync_requests WHERE id = ?').get(requestId) as any;
      if (!req) {
        throw new Error(`Sync request not found with id: ${requestId}`);
      }

      const { provider, localPath, remoteFolder, tenantId, bucketName, folderId } = req;

      if (!localPath || !fs.existsSync(localPath)) {
        throw new Error(`Local directory does not exist: ${localPath}`);
      }

      if (!tenantId) {
        throw new Error('Tenant identification token is missing for this sync pipeline.');
      }

      // 1. Gather local file metas
      const localFiles = this.getLocalFiles(localPath, localPath);

      // 2. Gather remote file metas from Spring Boot gateway
      let remoteFiles: any[] = [];
      if (provider === 'aws-s3') {
        const prefix = remoteFolder ? remoteFolder.replace('s3://', '').split('/').slice(1).join('/') : '';
        remoteFiles = await AwsService.scanFolderMetadata(tenantId, bucketName || '', prefix);
      } else if (provider === 'google-drive') {
        remoteFiles = await GoogleDriveService.scanFolderMetadata(tenantId, folderId || '');
      }

      // Normalize remote files format
      const normalizedRemote: FileMeta[] = remoteFiles.map((f: any) => {
        let relPath = f.fileName;
        if (provider === 'aws-s3') {
          const prefix = remoteFolder ? remoteFolder.replace('s3://', '').split('/').slice(1).join('/') : '';
          if (prefix && relPath.startsWith(prefix)) {
            relPath = relPath.substring(prefix.length).replace(/^\//, '');
          }
        }
        return {
          relativePath: relPath,
          size: f.size,
          lastModified: f.lastModified,
          fileId: f.fileId,
        };
      });

      // 3. Compare
      const localMap = new Map<string, FileMeta>(localFiles.map(f => [f.relativePath, f]));
      const remoteMap = new Map<string, any>(normalizedRemote.map(f => [f.relativePath, f]));

      const changes = {
        uploads: [] as { path: string; type: 'added' | 'modified' }[],
        downloads: [] as { path: string; type: 'added' | 'modified' }[],
        identical: [] as string[]
      };

      for (const [relPath, localFile] of localMap.entries()) {
        const remoteFile = remoteMap.get(relPath);

        if (!remoteFile) {
          changes.uploads.push({ path: relPath, type: 'added' });
        } else {
          const localTime = new Date(localFile.lastModified).getTime();
          const remoteTime = new Date(remoteFile.lastModified).getTime();
          const timeDiff = Math.abs(localTime - remoteTime);
          const isSizeDifferent = localFile.size !== remoteFile.size;

          if (isSizeDifferent || timeDiff > 2000) {
            if (localTime > remoteTime) {
              changes.uploads.push({ path: relPath, type: 'modified' });
            } else {
              changes.downloads.push({ path: relPath, type: 'modified' });
            }
          } else {
            changes.identical.push(relPath);
          }
        }
      }

      for (const [relPath, remoteFile] of remoteMap.entries()) {
        if (!localMap.has(relPath)) {
          changes.downloads.push({ path: relPath, type: 'added' });
        }
      }

      return changes;
    } catch (err: any) {
      console.error(`[SyncService] Preview failed for pipeline ${requestId}:`, err);
      throw err;
    }
  }

  // Handle single upload to S3 or GDrive
  private static async executeUpload(req: any, localPath: string, relativePath: string) {
    const fullPath = path.join(localPath, relativePath);
    if (!fs.existsSync(fullPath)) return;

    if (req.provider === 'aws-s3') {
      const prefix = req.remoteFolder ? req.remoteFolder.replace('s3://', '').split('/').slice(1).join('/') : '';
      await AwsService.uploadFile(req.tenantId, req.bucketName || '', prefix, fullPath, relativePath);
    } else if (req.provider === 'google-drive') {
      await GoogleDriveService.uploadFile(req.tenantId, req.folderId || '', fullPath);
    }

    // Cache metadata locally in database
    const stat = fs.statSync(fullPath);
    const db = getDb();
    db.prepare(`
      INSERT OR REPLACE INTO file_metadata (sync_request_id, relative_path, size, last_modified, synced_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.id, relativePath, stat.size, stat.mtime.toISOString(), new Date().toISOString());
  }

  // Handle single download from S3 or GDrive
  private static async executeDownload(req: any, localPath: string, relativePath: string, remoteFileId?: string) {
    const savePath = path.join(localPath, relativePath);

    if (req.provider === 'aws-s3') {
      const prefix = req.remoteFolder ? req.remoteFolder.replace('s3://', '').split('/').slice(1).join('/') : '';
      const folderPart = prefix ? path.join(prefix, path.dirname(relativePath)).replace(/\\/g, '/') : path.dirname(relativePath).replace(/\\/g, '/');
      const baseName = path.basename(relativePath);
      await AwsService.downloadFile(req.tenantId, req.bucketName || '', folderPart, baseName, savePath);
    } else if (req.provider === 'google-drive') {
      if (!remoteFileId) {
        throw new Error(`Google Drive download requires fileId, none provided for file: ${relativePath}`);
      }
      await GoogleDriveService.downloadFile(req.tenantId, remoteFileId, savePath);
    }

    // Cache metadata locally in database
    if (fs.existsSync(savePath)) {
      const stat = fs.statSync(savePath);
      const db = getDb();
      db.prepare(`
        INSERT OR REPLACE INTO file_metadata (sync_request_id, relative_path, size, last_modified, synced_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(req.id, relativePath, stat.size, stat.mtime.toISOString(), new Date().toISOString());
    }
  }

  // Handle real-time file updates queue processing (Delta Sync)
  static async processQueueForRequest(requestId: string): Promise<void> {
    const db = getDb();
    const pendingJobs = db.prepare(`
      SELECT * FROM sync_queue 
      WHERE sync_request_id = ? AND status = 'PENDING' 
      ORDER BY created_at ASC
    `).all(requestId) as any[];

    if (pendingJobs.length === 0) return;

    console.log(`[SyncService] Processing ${pendingJobs.length} queued real-time changes for request: ${requestId}`);
    const req = db.prepare('SELECT * FROM sync_requests WHERE id = ?').get(requestId) as any;
    if (!req) return;

    for (const job of pendingJobs) {
      // Mark job as in-progress
      db.prepare('UPDATE sync_queue SET status = ?, attempts = attempts + 1 WHERE id = ?').run('IN_PROGRESS', job.id);

      try {
        if (job.action === 'CREATE' || job.action === 'UPDATE') {
          await this.executeUpload(req, req.localPath, job.relative_path);
        } else if (job.action === 'DELETE') {
          if (req.provider === 'aws-s3') {
            const prefix = req.remoteFolder ? req.remoteFolder.replace('s3://', '').split('/').slice(1).join('/') : '';
            const folderPart = prefix ? path.join(prefix, path.dirname(job.relative_path)).replace(/\\/g, '/') : path.dirname(job.relative_path).replace(/\\/g, '/');
            const baseName = path.basename(job.relative_path);
            await AwsService.deleteFile(req.tenantId, req.bucketName || '', folderPart, baseName);
          } else if (req.provider === 'google-drive') {
            // Retrieve fileId cache from database metadata to delete
            const cache = db.prepare('SELECT relative_path FROM file_metadata WHERE sync_request_id = ? AND relative_path = ?').get(req.id, job.relative_path) as any;
            if (cache) {
              // Wait, GDrive delete needs fileId. To keep upload simple, we find files remotely.
              // But since this is a delete action, we can scan remote and delete matching file name.
              const remoteFiles = await GoogleDriveService.scanFolderMetadata(req.tenantId, req.folderId || '');
              const foundFile = remoteFiles.find((f: any) => f.fileName === job.relative_path);
              if (foundFile && foundFile.fileId) {
                await GoogleDriveService.deleteFile(req.tenantId, foundFile.fileId);
              }
            }
          }
          // Remove local metadata cache entry
          db.prepare('DELETE FROM file_metadata WHERE sync_request_id = ? AND relative_path = ?').run(req.id, job.relative_path);
        }

        // Mark as success
        db.prepare('UPDATE sync_queue SET status = ? WHERE id = ?').run('SUCCESS', job.id);
        
        // Log success
        db.prepare(`
          UPDATE activity_log 
          SET status = 'SUCCESS', message = ? 
          WHERE sync_request_id = ? AND file_path = ? AND action = ? AND status = 'PENDING'
        `).run(
          `Successfully synchronized ${job.action.toLowerCase()} job to cloud.`,
          req.id,
          job.relative_path,
          job.action
        );
      } catch (err: any) {
        console.error(`[SyncService] Failed to process job ${job.id}:`, err);
        db.prepare('UPDATE sync_queue SET status = ?, error = ? WHERE id = ?').run('FAILED', err.message || String(err), job.id);
        
        db.prepare(`
          UPDATE activity_log 
          SET status = 'FAILED', message = ? 
          WHERE sync_request_id = ? AND file_path = ? AND action = ? AND status = 'PENDING'
        `).run(
          `Failed delta sync: ${err.message || err}`,
          req.id,
          job.relative_path,
          job.action
        );
      }
    }
  }
}
