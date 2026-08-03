import * as fs from 'fs';
import * as path from 'path';
import { getApiClient } from './ApiClient';

export class GoogleDriveService {
  static async getAuthUrl(tenantId: string): Promise<string> {
    try {
      const client = getApiClient();
      const response = await client.get(`/api/connection/gcp/${tenantId}/auth`);
      return response.data?.authUrl || '';
    } catch (err: any) {
      console.error('[GoogleDriveService] Get Auth URL failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'Failed to get GDrive auth URL');
    }
  }

  static async listFolders(tenantId: string, folderId?: string): Promise<any[]> {
    try {
      const client = getApiClient();
      const endpoint = folderId 
        ? `/api/operations/gdrive/folder/${tenantId}/${folderId}`
        : `/api/operations/gdrive/folder/${tenantId}`;
      const response = await client.get(endpoint);
      return response.data || [];
    } catch (err: any) {
      console.error('[GoogleDriveService] List folders failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'Failed to list GDrive folders');
    }
  }

  static async createFolder(
    tenantId: string,
    folderName: string,
    parentFolderId?: string
  ): Promise<any> {
    try {
      const client = getApiClient();
      const response = await client.post('/api/operations/gdrive/folder/create', {
        tenantId,
        parentFolderId: parentFolderId || null,
        folderName,
      });
      return response.data;
    } catch (err: any) {
      console.error('[GoogleDriveService] Create folder failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'Failed to create GDrive folder');
    }
  }

  static async uploadFile(
    tenantId: string,
    folderId: string,
    filePath: string
  ): Promise<any> {
    try {
      const client = getApiClient();
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);

      const formData = new FormData();
      formData.append('tenantId', tenantId);
      formData.append('folderId', folderId);

      const fileBlob = new Blob([fileBuffer]);
      formData.append('file', fileBlob, fileName);

      const response = await client.post('/api/operations/gdrive/upload', formData);

      return response.data;
    } catch (err: any) {
      console.error('[GoogleDriveService] GDrive upload failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'GDrive upload failed');
    }
  }

  static async downloadFile(
    tenantId: string,
    fileId: string,
    localSavePath: string
  ): Promise<void> {
    try {
      const client = getApiClient();
      const response = await client.get(`/api/operations/gdrive/download/${tenantId}/${fileId}`, {
        responseType: 'arraybuffer',
      });

      const dir = path.dirname(localSavePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(localSavePath, Buffer.from(response.data));
    } catch (err: any) {
      console.error('[GoogleDriveService] GDrive download failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'GDrive download failed');
    }
  }

  static async deleteFile(tenantId: string, fileId: string): Promise<void> {
    try {
      const client = getApiClient();
      await client.delete(`/api/operations/gdrive/delete/${tenantId}/${fileId}`);
    } catch (err: any) {
      console.error('[GoogleDriveService] GDrive delete failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'GDrive delete failed');
    }
  }

  static async scanFolderMetadata(tenantId: string, folderId: string): Promise<any[]> {
    try {
      const client = getApiClient();
      const response = await client.get(`/api/operations/gdrive/folder/status/${tenantId}/${folderId}`);
      return response.data || [];
    } catch (err: any) {
      console.error('[GoogleDriveService] GDrive folder scan failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'GDrive folder scan failed');
    }
  }
}
