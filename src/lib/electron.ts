import { SyncRequest } from '../types';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    electronAPI?: {
      selectDirectory: () => Promise<string | null>;
      showNotification: (title: string, message: string) => void;
      getAutoStart: () => Promise<boolean>;
      setAutoStart: (enabled: boolean) => Promise<boolean>;
      dbGetSyncRequests: () => Promise<any[]>;
      dbSaveSyncRequest: (request: any) => Promise<boolean>;
      dbDeleteSyncRequest: (id: string) => Promise<boolean>;
      dbUpdateSyncRequestPaths: (id: string, localPath: string, remoteFolder: string) => Promise<boolean>;
      dbUpdateSyncRequestStatus: (id: string, status: string) => Promise<boolean>;
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
  // Browser Mock representation: return mock selected path based on OS guess
  return null;
}

export function showNotification(title: string, message: string): void {
  if (isElectron()) {
    window.electronAPI!.showNotification(title, message);
  } else {
    console.log(`[Notification Mock] ${title}: ${message}`);
  }
}

export async function getAutoStart(): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.getAutoStart();
  }
  const saved = localStorage.getItem('devsync_autostart');
  return saved === 'true';
}

export async function setAutoStart(enabled: boolean): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.setAutoStart(enabled);
  }
  localStorage.setItem('devsync_autostart', String(enabled));
  return enabled;
}

// Default initial requests for fallback simulation
const defaultSyncRequests: SyncRequest[] = [
  {
    id: 'aws-s3-prod',
    name: 'AWS S3 Production Backup',
    provider: 'aws-s3',
    status: 'syncing',
    localPath: '/Users/david/workspace/devsync/prod-data',
    remoteFolder: 's3://production-vault-sync-us-east-1/backups/',
    lastSync: '2026-06-20 05:30:12',
    schedule: 'Every 30 Minutes',
    description: 'Backup important production data',
  },
  {
    id: 'gdrive-design',
    name: 'Design & Brand Guidelines',
    provider: 'google-drive',
    status: 'idle',
    localPath: '/Users/david/designs/brand-vault',
    remoteFolder: 'gdrive://shared-drives/design-assets-hub/',
    lastSync: '2026-06-20 04:15:00',
    schedule: 'Daily at 02:00 AM',
    description: 'Design system and brand assets',
  },
  {
    id: 'gdrive-budget',
    name: 'Q2 Budgeting Sync',
    provider: 'google-drive',
    status: 'failed',
    localPath: '/Users/david/finance/q2-work',
    remoteFolder: 'gdrive://my-drive/finance-archives/q2-2026/',
    lastSync: '2026-06-19 18:22:10',
    schedule: 'Manual Trigger Only',
    description: 'Finance documents and reports',
  },
  {
    id: 'aws-s3-media',
    name: 'Client Video Assets',
    provider: 'aws-s3',
    status: 'paused',
    localPath: '/Users/david/videos/render-outputs',
    remoteFolder: 's3://client-delivery-bucket-s3/master-renders/',
    lastSync: '2026-06-18 10:45:30',
    schedule: 'Every 6 Hours',
    description: 'Rendered videos and final outputs',
  },
];

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
      description: row.description || undefined
    }));
  }

  const stored = localStorage.getItem('devsync_requests');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultSyncRequests;
    }
  }
  localStorage.setItem('devsync_requests', JSON.stringify(defaultSyncRequests));
  return defaultSyncRequests;
}

export async function saveSyncRequest(req: SyncRequest): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.dbSaveSyncRequest(req);
  }

  const current = await getSyncRequests();
  const index = current.findIndex(item => item.id === req.id);
  if (index >= 0) {
    current[index] = req;
  } else {
    current.push(req);
  }
  localStorage.setItem('devsync_requests', JSON.stringify(current));
  return true;
}

export async function deleteSyncRequest(id: string): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.dbDeleteSyncRequest(id);
  }

  const current = await getSyncRequests();
  const filtered = current.filter(item => item.id !== id);
  localStorage.setItem('devsync_requests', JSON.stringify(filtered));
  return true;
}

export async function updateSyncRequestPaths(id: string, localPath: string, remoteFolder: string): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.dbUpdateSyncRequestPaths(id, localPath, remoteFolder);
  }

  const current = await getSyncRequests();
  const index = current.findIndex(item => item.id === id);
  if (index >= 0) {
    current[index].localPath = localPath;
    current[index].remoteFolder = remoteFolder;
    localStorage.setItem('devsync_requests', JSON.stringify(current));
    return true;
  }
  return false;
}

export async function updateSyncRequestStatus(id: string, status: 'syncing' | 'idle' | 'failed' | 'paused'): Promise<boolean> {
  if (isElectron()) {
    return await window.electronAPI!.dbUpdateSyncRequestStatus(id, status);
  }

  const current = await getSyncRequests();
  const index = current.findIndex(item => item.id === id);
  if (index >= 0) {
    current[index].status = status;
    localStorage.setItem('devsync_requests', JSON.stringify(current));
    return true;
  }
  return false;
}
