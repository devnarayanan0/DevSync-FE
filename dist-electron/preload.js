// electron/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Native Shell OS methods
  selectDirectory: () => import_electron.ipcRenderer.invoke("select-directory"),
  showNotification: (title, message) => import_electron.ipcRenderer.send("show-notification", { title, message }),
  getAutoStart: () => import_electron.ipcRenderer.invoke("get-auto-start"),
  setAutoStart: (enabled) => import_electron.ipcRenderer.invoke("set-auto-start", enabled),
  // Authentication IPCs
  authRegister: (email, password) => import_electron.ipcRenderer.invoke("auth:register", { email, password }),
  authLogin: (email, password) => import_electron.ipcRenderer.invoke("auth:login", { email, password }),
  authLogout: () => import_electron.ipcRenderer.invoke("auth:logout"),
  authGetSession: () => import_electron.ipcRenderer.invoke("auth:getSession"),
  // Connection / Tenant Management IPCs
  tenantCreate: (tenantName, provider) => import_electron.ipcRenderer.invoke("connection:create", { tenantName, provider }),
  tenantGetActive: () => import_electron.ipcRenderer.invoke("connection:getActive"),
  // AWS S3 proxy operations
  awsVerify: (tenantId, accessKey, secretKey, region) => import_electron.ipcRenderer.invoke("connection:verifyAws", { tenantId, accessKey, secretKey, region }),
  awsListBuckets: (tenantId) => import_electron.ipcRenderer.invoke("operations:aws:listBuckets", tenantId),
  awsCreateBucket: (tenantId, bucketName) => import_electron.ipcRenderer.invoke("operations:aws:createBucket", { tenantId, bucketName }),
  // Google Drive proxy operations
  gdriveGetAuthUrl: (tenantId) => import_electron.ipcRenderer.invoke("connection:getGdriveAuthUrl", tenantId),
  gdriveListFolders: (tenantId, folderId) => import_electron.ipcRenderer.invoke("operations:gdrive:listFolders", { tenantId, folderId }),
  gdriveCreateFolder: (tenantId, folderName, parentFolderId) => import_electron.ipcRenderer.invoke("operations:gdrive:createFolder", { tenantId, folderName, parentFolderId }),
  // Synchronization Pipeline Configs (SQLite DB)
  dbGetSyncRequests: () => import_electron.ipcRenderer.invoke("db-get-sync-requests"),
  dbSaveSyncRequest: (request) => import_electron.ipcRenderer.invoke("db-save-sync-request", request),
  dbDeleteSyncRequest: (id) => import_electron.ipcRenderer.invoke("db-delete-sync-request", id),
  dbUpdateSyncRequestPaths: (id, localPath, remoteFolder) => import_electron.ipcRenderer.invoke("db-update-sync-request-paths", { id, localPath, remoteFolder }),
  dbUpdateSyncRequestStatus: (id, status) => import_electron.ipcRenderer.invoke("db-update-sync-request-status", { id, status }),
  // Sync engine execution triggers
  syncTriggerNow: (requestId) => import_electron.ipcRenderer.invoke("sync:triggerSync", requestId),
  syncPreviewChanges: (requestId) => import_electron.ipcRenderer.invoke("sync:previewChanges", requestId),
  syncGetQueue: (requestId) => import_electron.ipcRenderer.invoke("sync:getQueue", requestId),
  syncGetActivityLog: (requestId) => import_electron.ipcRenderer.invoke("sync:getActivityLog", requestId),
  // Key-value local settings
  settingsGet: (key, defaultValue) => import_electron.ipcRenderer.invoke("settings:get", { key, defaultValue }),
  settingsSet: (key, value) => import_electron.ipcRenderer.invoke("settings:set", { key, value }),
  // Custom live sync triggers
  onSyncTriggered: (callback) => {
    const subscription = (_event, id) => callback(id);
    import_electron.ipcRenderer.on("sync-triggered", subscription);
    return () => import_electron.ipcRenderer.removeListener("sync-triggered", subscription);
  }
});
