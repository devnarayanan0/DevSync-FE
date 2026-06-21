import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  showNotification: (title: string, message: string) => ipcRenderer.send('show-notification', { title, message }),
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
  setAutoStart: (enabled: boolean) => ipcRenderer.invoke('set-auto-start', enabled),
  
  // SQLite methods
  dbGetSyncRequests: () => ipcRenderer.invoke('db-get-sync-requests'),
  dbSaveSyncRequest: (request: any) => ipcRenderer.invoke('db-save-sync-request', request),
  dbDeleteSyncRequest: (id: string) => ipcRenderer.invoke('db-delete-sync-request', id),
  dbUpdateSyncRequestPaths: (id: string, localPath: string, remoteFolder: string) => 
    ipcRenderer.invoke('db-update-sync-request-paths', { id, localPath, remoteFolder }),
  dbUpdateSyncRequestStatus: (id: string, status: string) => 
    ipcRenderer.invoke('db-update-sync-request-status', { id, status }),
  
  // Custom listen channels
  onSyncTriggered: (callback: (id: string) => void) => {
    const subscription = (_event: any, id: string) => callback(id);
    ipcRenderer.on('sync-triggered', subscription);
    return () => ipcRenderer.removeListener('sync-triggered', subscription);
  }
});
