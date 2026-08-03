import * as fs from 'fs';
import * as path from 'path';
import { getApiClient } from './ApiClient';
import { setSetting } from './DatabaseService';

export class AwsService {
  static async verifyConnection(
    tenantId: string,
    accessKey: string,
    secretKey: string,
    region: string
  ): Promise<any> {
    try {
      const client = getApiClient();
      const response = await client.post(`/api/connection/aws/${tenantId}/verify`, {
        accessKey,
        secretKey,
        region,
      });

      // Save AWS details in local SQLite settings if verified
      if (response.data && response.data.status === 'VERIFIED') {
        setSetting('aws_access_key', accessKey);
        setSetting('aws_secret_key', secretKey);
        setSetting('aws_region', region);
        setSetting('tenant_status', 'VERIFIED');
      }

      return response.data;
    } catch (err: any) {
      console.error('[AwsService] AWS Verification failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'AWS Credential verification failed');
    }
  }

  static async listBuckets(tenantId: string): Promise<any[]> {
    try {
      const client = getApiClient();
      const response = await client.get(`/api/operations/aws/buckets/${tenantId}`);
      return response.data || [];
    } catch (err: any) {
      console.error('[AwsService] List Buckets failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'Failed to retrieve S3 Buckets');
    }
  }

  static async createBucket(tenantId: string, bucketName: string): Promise<void> {
    try {
      const client = getApiClient();
      await client.post('/api/operations/aws/buckets/createB', {
        tenantId,
        bucketName,
      });
    } catch (err: any) {
      console.error('[AwsService] Create Bucket failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'Failed to create S3 Bucket');
    }
  }

  static async uploadFile(
    tenantId: string,
    bucketName: string,
    folderName: string,
    filePath: string,
    relativeTargetName: string
  ): Promise<any> {
    try {
      const client = getApiClient();
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);

      // Construct form data using native FormData
      const formData = new FormData();
      formData.append('tenantId', tenantId);
      formData.append('bucketName', bucketName);
      // Ensure folderName is normalized (subfolders allowed)
      const targetFolder = folderName ? path.join(folderName, path.dirname(relativeTargetName)) : path.dirname(relativeTargetName);
      formData.append('folderName', targetFolder.replace(/\\/g, '/'));
      
      const fileBlob = new Blob([fileBuffer]);
      formData.append('file', fileBlob, fileName);

      const response = await client.post('/api/operations/aws/upload', formData);

      return response.data;
    } catch (err: any) {
      console.error('[AwsService] S3 Upload failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'S3 Upload failed');
    }
  }

  static async downloadFile(
    tenantId: string,
    bucketName: string,
    folderName: string,
    fileName: string,
    localSavePath: string
  ): Promise<void> {
    try {
      const client = getApiClient();
      const response = await client.post(
        '/api/operations/aws/download',
        {
          tenantId,
          bucketName,
          folderName,
          fileName,
        },
        {
          responseType: 'arraybuffer',
        }
      );

      // Create target directory if it doesn't exist
      const dir = path.dirname(localSavePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(localSavePath, Buffer.from(response.data));
    } catch (err: any) {
      console.error('[AwsService] S3 Download failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'S3 Download failed');
    }
  }

  static async deleteFile(
    tenantId: string,
    bucketName: string,
    folderName: string,
    fileName: string
  ): Promise<void> {
    try {
      const client = getApiClient();
      // axios delete can take body but configuration object with data is required
      await client.delete('/api/operations/aws/delete', {
        data: {
          tenantId,
          bucketName,
          folderName,
          fileName,
        },
      });
    } catch (err: any) {
      console.error('[AwsService] S3 Delete failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'S3 Delete failed');
    }
  }

  static async scanFolderMetadata(
    tenantId: string,
    bucketName: string,
    folderName: string
  ): Promise<any[]> {
    try {
      const client = getApiClient();
      const response = await client.post('/api/operations/aws/statusF', {
        tenantId,
        bucketName,
        folderName,
      });
      return response.data || [];
    } catch (err: any) {
      console.error('[AwsService] S3 Folder Metadata scan failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'S3 Folder Metadata scan failed');
    }
  }
}
