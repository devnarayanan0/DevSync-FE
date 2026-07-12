import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs';
import { getDb } from './DatabaseService';
import { SyncService } from './SyncService';

export class FolderWatcherService {
  private static watchers = new Map<string, chokidar.FSWatcher>();

  static initWatchers() {
    console.log('[FolderWatcherService] Initializing folder watchers from active sync requests...');
    try {
      const db = getDb();
      const activeRequests = db.prepare("SELECT * FROM sync_requests WHERE status IN ('syncing', 'idle')").all() as any[];

      // Stop any existing watchers first
      this.stopAllWatchers();

      for (const req of activeRequests) {
        this.startWatcher(req);
      }
    } catch (err) {
      console.error('[FolderWatcherService] Failed to initialize watchers:', err);
    }
  }

  static startWatcher(req: any) {
    if (!req.localPath || !fs.existsSync(req.localPath)) {
      console.warn(`[FolderWatcherService] Cannot watch path: ${req.localPath} (does not exist or is empty)`);
      return;
    }

    if (this.watchers.has(req.id)) {
      this.stopWatcher(req.id);
    }

    console.log(`[FolderWatcherService] Starting watcher for [${req.name}] at: ${req.localPath}`);

    // Create watcher
    const watcher = chokidar.watch(req.localPath, {
      ignored: /(^|[\/\\])\../, // ignore hidden files/directories (starting with dot)
      persistent: true,
      ignoreInitial: true, // ignore files detected during initialization (only detect real-time changes)
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    });

    const queueJob = (action: 'CREATE' | 'UPDATE' | 'DELETE', filePath: string) => {
      const relativePath = path.relative(req.localPath, filePath).replace(/\\/g, '/');
      console.log(`[FolderWatcherService] Change detected [${action}] for file: ${relativePath}`);
      
      try {
        const db = getDb();
        const jobId = `${req.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        // Add job to local sync queue
        db.prepare(`
          INSERT INTO sync_queue (id, sync_request_id, relative_path, action, status, created_at)
          VALUES (?, ?, ?, ?, 'PENDING', ?)
        `).run(jobId, req.id, relativePath, action, new Date().toISOString());

        // Log to activity log
        const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        db.prepare(`
          INSERT INTO activity_log (id, sync_request_id, file_path, action, status, message, timestamp)
          VALUES (?, ?, ?, ?, 'PENDING', ?, ?)
        `).run(
          logId,
          req.id,
          relativePath,
          action,
          `Queued ${action.toLowerCase()} job for synchronization.`,
          new Date().toISOString()
        );

        // Notify client or trigger instant delta sync
        SyncService.processQueueForRequest(req.id).catch(console.error);
      } catch (err) {
        console.error('[FolderWatcherService] Failed to queue sync job:', err);
      }
    };

    watcher
      .on('add', (filePath) => queueJob('CREATE', filePath))
      .on('change', (filePath) => queueJob('UPDATE', filePath))
      .on('unlink', (filePath) => queueJob('DELETE', filePath))
      .on('error', (error) => console.error(`[FolderWatcherService] Watcher error for [${req.name}]:`, error));

    this.watchers.set(req.id, watcher);
  }

  static stopWatcher(requestId: string) {
    const watcher = this.watchers.get(requestId);
    if (watcher) {
      watcher.close();
      this.watchers.delete(requestId);
      console.log(`[FolderWatcherService] Stopped watcher for sync request: ${requestId}`);
    }
  }

  static stopAllWatchers() {
    for (const [id, watcher] of this.watchers.entries()) {
      watcher.close();
    }
    this.watchers.clear();
    console.log('[FolderWatcherService] Stopped all folder watchers.');
  }
}
