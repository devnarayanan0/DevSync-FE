import { SyncRequest, UserProfile } from '../types';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    electronAPI?: {
      selectDirectory: () => Promise<string | null>;
      showNotification: (title: string, message: string) => void;
      getAutoStart: () => Promise<boolean>;
      setAutoStart: (enabled: boolean) => Promise<boolean>;
      
      // Authentication
      authRegister: (email: string, password: string) => Promise<boolean>;
      authLogin: (email: string, password: string) => Promise<any>;
      authLogout: () => Promise<boolean>;
      authGetSession: () => Promise<{ isLoggedIn: boolean; token: string; user: UserProfile | null }>;

      // Tenant Connection
      tenantCreate: (tenantName: string, provider: 'AWS' | 'GDRIVE') => Promise<any>;
      tenantGetActive: () => Promise<any | null>;

      // AWS S3 Operations
      awsVerify: (tenantId: string, accessKey: string, secretKey: string, region: string) => Promise<any>;
      awsListBuckets: (tenantId: string) => Promise<any[]>;
      awsCreateBucket: (tenantId: string, bucketName: string) => Promise<boolean>;

      // Google Drive Operations
      gdriveGetAuthUrl: (tenantId: string) => Promise<string>;
      gdriveListFolders: (tenantId: string, folderId?: string) => Promise<any[]>;
      gdriveCreateFolder: (tenantId: string, folderName: string, parentFolderId?: string) => Promise<any>;

      // SQLite Sync pipeline configuration
      dbGetSyncRequests: () => Promise<any[]>;
      dbSaveSyncRequest: (request: any) => Promise<boolean>;
      dbDeleteSyncRequest: (id: string) => Promise<boolean>;
      dbUpdateSyncRequestPaths: (id: string, localPath: string, remoteFolder: string) => Promise<boolean>;
      dbUpdateSyncRequestStatus: (id: string, status: string) => Promise<boolean>;
      
      // Sync execution triggers and stats
      syncTriggerNow: (requestId: string) => Promise<boolean>;
      syncPreviewChanges: (requestId: string) => Promise<{
        uploads: { path: string; type: 'added' | 'modified' }[];
        downloads: { path: string; type: 'added' | 'modified' }[];
        identical: string[];
      }>;
      syncGetQueue: (requestId?: string) => Promise<any[]>;
      syncGetActivityLog: (requestId?: string) => Promise<any[]>;

      // Local persistent settings
      settingsGet: (key: string, defaultValue?: string) => Promise<string>;
      settingsSet: (key: string, value: string) => Promise<boolean>;

      onSyncTriggered: (callback: (id: string) => void) => () => void;
    };
  }
}

export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
}

export async function selectDirectory(): Promise<string | null> {
  if (isElectron()) {
    return await window.electronAPI!.selectDirectory();
  }
  return null;
}

export function showNotification(title: string, message: string): void {
  if (isElectron()) {
    window.electronAPI!.showNotification(title, message);
  } else {
    console.log(`[Notification] ${title}: ${message}`);
  }
}

export async function getAutoStart(): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.getAutoStart();
  }
  return false;
}

export async function setAutoStart(enabled: boolean): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.setAutoStart(enabled);
  }
  return enabled;
}

// Wrapper Functions with premium web fallbacks
export async function authRegister(email: string, password: string): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.authRegister(email, password);
  }
  return true;
}

export async function authLogin(email: string, password: string): Promise<any> {
  if (isElectron()) {
    return await window.electronAPI!.authLogin(email, password);
  }
  const localUser: UserProfile = {
    name: email.split('@')[0],
    email: email,
    role: 'Local Admin',
    tenant: 'Local System',
  };
  localStorage.setItem('devsync_is_logged_in', 'true');
  localStorage.setItem('devsync_user_profile', JSON.stringify(localUser));
  return { isLoggedIn: true, token: 'browser-token', user: localUser };
}

export async function authLogout(): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.authLogout();
  }
  localStorage.removeItem('devsync_is_logged_in');
  return true;
}

export async function authGetSession(): Promise<{ isLoggedIn: boolean; token: string; user: UserProfile | null }> {
  if (isElectron()) {
    return await window.electronAPI!.authGetSession();
  }
  const isLoggedIn = localStorage.getItem('devsync_is_logged_in') === 'true';
  let localUser: UserProfile | null = null;
  if (isLoggedIn) {
    const storedUser = localStorage.getItem('devsync_user_profile');
    if (storedUser) {
      localUser = JSON.parse(storedUser);
    } else {
      localUser = { name: 'Browser User', email: 'browser@local.dev', role: 'Local Admin', tenant: 'Local System' };
    }
  }
  return { isLoggedIn, token: isLoggedIn ? 'browser-token' : '', user: localUser };
}

export async function tenantCreate(tenantName: string, provider: 'AWS' | 'GDRIVE'): Promise<any> {
  if (isElectron()) {
    return await window.electronAPI!.tenantCreate(tenantName, provider);
  }
  return null;
}

export async function tenantGetActive(): Promise<any | null> {
  if (isElectron()) {
    return await window.electronAPI!.tenantGetActive();
  }
  return null;
}

export async function awsVerify(tenantId: string, accessKey: string, secretKey: string, region: string): Promise<any> {
  if (isElectron()) {
    return await window.electronAPI!.awsVerify(tenantId, accessKey, secretKey, region);
  }
  return null;
}

export async function awsListBuckets(tenantId: string): Promise<any[]> {
  if (isElectron()) {
    return await window.electronAPI!.awsListBuckets(tenantId);
  }
  return [];
}

export async function awsCreateBucket(tenantId: string, bucketName: string): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.awsCreateBucket(tenantId, bucketName);
  }
  return true;
}

export async function gdriveGetAuthUrl(tenantId: string): Promise<string> {
  if (isElectron()) {
    return await window.electronAPI!.gdriveGetAuthUrl(tenantId);
  }
  return '';
}

export async function gdriveListFolders(tenantId: string, folderId?: string): Promise<any[]> {
  if (isElectron()) {
    return await window.electronAPI!.gdriveListFolders(tenantId, folderId);
  }
  return [];
}

export async function gdriveCreateFolder(tenantId: string, folderName: string, parentFolderId?: string): Promise<any> {
  if (isElectron()) {
    return await window.electronAPI!.gdriveCreateFolder(tenantId, folderName, parentFolderId);
  }
  return null;
}

export async function getSyncRequests(): Promise<SyncRequest[]> {
  if (isElectron()) {
    const fromDb = await window.electronAPI!.dbGetSyncRequests();
    return fromDb.map(row => ({
      id: row.id,
      name: row.name,
      provider: row.provider as any,
      status: row.status as any,
      localPath: row.localPath,
      remoteFolder: row.remoteFolder,
      lastSync: row.lastSync || '',
      schedule: row.schedule || '',
      description: row.description || undefined,
      tenantId: row.tenantId || undefined,
      bucketName: row.bucketName || undefined,
      folderId: row.folderId || undefined
    }));
  }
  const stored = localStorage.getItem('devsync_user_requests');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse devsync_user_requests', e);
    }
  }
  return [];
}

export async function saveSyncRequest(req: SyncRequest): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.dbSaveSyncRequest(req);
  }
  const reqs = await getSyncRequests();
  const index = reqs.findIndex(r => r.id === req.id);
  if (index > -1) {
    reqs[index] = req;
  } else {
    reqs.push(req);
  }
  localStorage.setItem('devsync_user_requests', JSON.stringify(reqs));
  return true;
}

export async function deleteSyncRequest(id: string): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.dbDeleteSyncRequest(id);
  }
  const reqs = await getSyncRequests();
  const filtered = reqs.filter(r => r.id !== id);
  localStorage.setItem('devsync_user_requests', JSON.stringify(filtered));
  return true;
}

export async function updateSyncRequestPaths(id: string, localPath: string, remoteFolder: string): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.dbUpdateSyncRequestPaths(id, localPath, remoteFolder);
  }
  const reqs = await getSyncRequests();
  const updated = reqs.map(r => r.id === id ? { ...r, localPath, remoteFolder } : r);
  localStorage.setItem('devsync_user_requests', JSON.stringify(updated));
  return true;
}

export async function updateSyncRequestStatus(id: string, status: 'syncing' | 'idle' | 'failed' | 'paused'): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.dbUpdateSyncRequestStatus(id, status);
  }
  const reqs = await getSyncRequests();
  const updated = reqs.map(r => r.id === id ? { ...r, status } : r);
  localStorage.setItem('devsync_user_requests', JSON.stringify(updated));
  return true;
}

export async function syncTriggerNow(requestId: string): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.syncTriggerNow(requestId);
  }
  await updateSyncRequestStatus(requestId, 'syncing');
  setTimeout(() => {
    updateSyncRequestStatus(requestId, 'idle');
  }, 2000);
  return true;
}

export async function syncPreviewChanges(requestId: string): Promise<any> {
  if (isElectron()) {
    return await window.electronAPI!.syncPreviewChanges(requestId);
  }
  return { uploads: [], downloads: [], identical: [] };
}

export async function syncGetQueue(requestId?: string): Promise<any[]> {
  if (isElectron()) {
    return await window.electronAPI!.syncGetQueue(requestId);
  }
  return [];
}

export async function syncGetActivityLog(requestId?: string): Promise<any[]> {
  if (isElectron()) {
    return await window.electronAPI!.syncGetActivityLog(requestId);
  }
  return [];
}

export async function settingsGet(key: string, defaultValue: string = ''): Promise<string> {
  if (isElectron()) {
    return await window.electronAPI!.settingsGet(key, defaultValue);
  }
  return localStorage.getItem(`devsync_setting_${key}`) || defaultValue;
}

export async function settingsSet(key: string, value: string): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.settingsSet(key, value);
  }
  localStorage.setItem(`devsync_setting_${key}`, value);
  return true;
}
