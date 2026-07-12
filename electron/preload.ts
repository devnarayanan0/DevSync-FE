import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Native Shell OS methods
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  showNotification: (title: string, message: string) => ipcRenderer.send('show-notification', { title, message }),
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
  setAutoStart: (enabled: boolean) => ipcRenderer.invoke('set-auto-start', enabled),
  
  // Authentication IPCs
  authRegister: (email: string, password: string) => ipcRenderer.invoke('auth:register', { email, password }),
  authLogin: (email: string, password: string) => ipcRenderer.invoke('auth:login', { email, password }),
  authLogout: () => ipcRenderer.invoke('auth:logout'),
  authGetSession: () => ipcRenderer.invoke('auth:getSession'),
  
  // Connection / Tenant Management IPCs
  tenantCreate: (tenantName: string, provider: 'AWS' | 'GDRIVE') => ipcRenderer.invoke('connection:create', { tenantName, provider }),
  tenantGetActive: () => ipcRenderer.invoke('connection:getActive'),
  
  // AWS S3 proxy operations
  awsVerify: (tenantId: string, accessKey: string, secretKey: string, region: string) => 
    ipcRenderer.invoke('connection:verifyAws', { tenantId, accessKey, secretKey, region }),
  awsListBuckets: (tenantId: string) => ipcRenderer.invoke('operations:aws:listBuckets', tenantId),
  awsCreateBucket: (tenantId: string, bucketName: string) => ipcRenderer.invoke('operations:aws:createBucket', { tenantId, bucketName }),
  
  // Google Drive proxy operations
  gdriveGetAuthUrl: (tenantId: string) => ipcRenderer.invoke('connection:getGdriveAuthUrl', tenantId),
  gdriveListFolders: (tenantId: string, folderId?: string) => ipcRenderer.invoke('operations:gdrive:listFolders', { tenantId, folderId }),
  gdriveCreateFolder: (tenantId: string, folderName: string, parentFolderId?: string) => 
    ipcRenderer.invoke('operations:gdrive:createFolder', { tenantId, folderName, parentFolderId }),

  // Synchronization Pipeline Configs (SQLite DB)
  dbGetSyncRequests: () => ipcRenderer.invoke('db-get-sync-requests'),
  dbSaveSyncRequest: (request: any) => ipcRenderer.invoke('db-save-sync-request', request),
  dbDeleteSyncRequest: (id: string) => ipcRenderer.invoke('db-delete-sync-request', id),
  dbUpdateSyncRequestPaths: (id: string, localPath: string, remoteFolder: string) => 
    ipcRenderer.invoke('db-update-sync-request-paths', { id, localPath, remoteFolder }),
  dbUpdateSyncRequestStatus: (id: string, status: string) => 
    ipcRenderer.invoke('db-update-sync-request-status', { id, status }),
  
  // Sync engine execution triggers
  syncTriggerNow: (requestId: string) => ipcRenderer.invoke('sync:triggerSync', requestId),
  syncPreviewChanges: (requestId: string) => ipcRenderer.invoke('sync:previewChanges', requestId),
  syncGetQueue: (requestId?: string) => ipcRenderer.invoke('sync:getQueue', requestId),
  syncGetActivityLog: (requestId?: string) => ipcRenderer.invoke('sync:getActivityLog', requestId),
  
  // Key-value local settings
  settingsGet: (key: string, defaultValue?: string) => ipcRenderer.invoke('settings:get', { key, defaultValue }),
  settingsSet: (key: string, value: string) => ipcRenderer.invoke('settings:set', { key, value }),

  // Custom live sync triggers
  onSyncTriggered: (callback: (id: string) => void) => {
    const subscription = (_event: any, id: string) => callback(id);
    ipcRenderer.on('sync-triggered', subscription);
    return () => ipcRenderer.removeListener('sync-triggered', subscription);
  }
});
