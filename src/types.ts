export type Theme = 'light' | 'dark';

export interface Tab {
  id: string; // 'dashboard', 'requests', 'activity', 'logs', 'settings', or request-specific ids like 'req-aws'
  title: string;
  type: 'dashboard' | 'tab-requests' | 'tab-activity' | 'tab-logs' | 'tab-settings' | 'tab-profile' | 'sync-request-workspace';
  requestData?: SyncRequest; // Optional details if the tab represents an active sync request workspace
}

export type ProviderType = 'aws-s3' | 'google-drive' | 'azure' | 'dropbox';

export interface SyncRequest {
  id: string;
  name: string;
  provider: ProviderType;
  status: 'syncing' | 'idle' | 'failed' | 'paused';
  localPath: string;
  remoteFolder: string;
  lastSync: string;
  schedule: string;
  description?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  tenant: string;
  avatarUrl?: string;
}
