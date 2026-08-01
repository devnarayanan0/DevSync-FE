import { app, BrowserWindow, ipcMain, dialog, Notification, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
const envPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envPath) });
// Fallback
dotenv.config();

app.name = 'DevSync';

// Import local services
import { initDatabase, getDb, getSetting, setSetting } from './services/DatabaseService';
import { AuthService } from './services/AuthService';
import { TenantService } from './services/TenantService';
import { AwsService } from './services/AwsService';
import { GoogleDriveService } from './services/GoogleDriveService';
import { SyncService } from './services/SyncService';
import { FolderWatcherService } from './services/FolderWatcherService';
import { SyncSchedulerService } from './services/SyncSchedulerService';

// Resolve directory name under ESM if needed (since main.js is compiled to CommonJS via esbuild, __dirname will be populated by esbuild automatically)
const actualDirName = __dirname;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
  const isDev = process.env.NODE_ENV !== 'production';

  // Create main window with show: false
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    title: 'DevSync',
    titleBarStyle: 'hidden',
    titleBarOverlay: process.platform === 'win32' ? {
      color: '#06070A',
      symbolColor: '#ffffff',
      height: 32
    } : false,
    webPreferences: {
      preload: path.join(actualDirName, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(actualDirName, '../dist/index.html'));
  }

  // Once-ready transition
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const trayIcon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVR42mNkHPjfz4AEYGTYyYBMgK4eG6C7BhsgmgbYkB6NYEA0g6GBAV0uGMDmgg8AAPmDFXm0eC0YAAAAAElFTkSuQmCC'
  );
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Launch DevSync Control Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    {
      label: 'Trigger Sync on All Pipelines',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('sync-triggered', 'all');
          new Notification({
            title: 'DevSync Tray Action',
            body: 'Manual synchronization request broadcasted to all active pipelines.',
          }).show();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Exit Application',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('DevSync Background Daemon Active');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
}

// IPC Handlers wiring
function setupIpcHandlers() {
  // Folder picker dialog
  ipcMain.handle('select-directory', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Sync Folder Node',
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  // Native notification
  ipcMain.on('show-notification', (_event, { title, message }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body: message }).show();
    }
  });

  // Auto-start toggling
  ipcMain.handle('get-auto-start', () => {
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle('set-auto-start', (_event, enabled: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: process.execPath,
    });
    return app.getLoginItemSettings().openAtLogin;
  });

  // Authentication IPCs
  ipcMain.handle('auth:register', async (_event, { email, password }) => {
    return await AuthService.register(email, password);
  });

  ipcMain.handle('auth:login', async (_event, { email, password }) => {
    return await AuthService.login(email, password);
  });

  ipcMain.handle('auth:logout', async () => {
    await AuthService.logout();
    return true;
  });

  ipcMain.handle('auth:getSession', () => {
    return AuthService.getSession();
  });

  // Tenant / Cloud connection IPCs
  ipcMain.handle('connection:create', async (_event, { tenantName, provider }) => {
    return await TenantService.createTenant(tenantName, provider);
  });

  ipcMain.handle('connection:getActive', () => {
    return TenantService.getActiveTenant();
  });

  // AWS operations
  ipcMain.handle('connection:verifyAws', async (_event, { tenantId, accessKey, secretKey, region }) => {
    return await AwsService.verifyConnection(tenantId, accessKey, secretKey, region);
  });

  ipcMain.handle('operations:aws:listBuckets', async (_event, tenantId) => {
    return await AwsService.listBuckets(tenantId);
  });

  ipcMain.handle('operations:aws:createBucket', async (_event, { tenantId, bucketName }) => {
    await AwsService.createBucket(tenantId, bucketName);
    return true;
  });

  // Google Drive operations
  ipcMain.handle('connection:getGdriveAuthUrl', async (_event, tenantId) => {
    return await GoogleDriveService.getAuthUrl(tenantId);
  });

  ipcMain.handle('operations:gdrive:listFolders', async (_event, { tenantId, folderId }) => {
    return await GoogleDriveService.listFolders(tenantId, folderId);
  });

  ipcMain.handle('operations:gdrive:createFolder', async (_event, { tenantId, folderName, parentFolderId }) => {
    return await GoogleDriveService.createFolder(tenantId, folderName, parentFolderId);
  });

  // Database Handlers for sync requests
  ipcMain.handle('db-get-sync-requests', () => {
    const db = getDb();
    try {
      return db.prepare('SELECT * FROM sync_requests').all();
    } catch (err) {
      console.error('db-get-sync-requests error:', err);
      return [];
    }
  });

  ipcMain.handle('db-save-sync-request', (_event, req) => {
    const db = getDb();
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO sync_requests (
          id, name, provider, status, localPath, remoteFolder, lastSync, schedule, description, tenantId, bucketName, folderId
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        req.id,
        req.name,
        req.provider,
        req.status,
        req.localPath,
        req.remoteFolder,
        req.lastSync || '',
        req.schedule || '',
        req.description || '',
        req.tenantId || null,
        req.bucketName || null,
        req.folderId || null
      );

      // Re-initialize watchers and schedules for changes to take action
      FolderWatcherService.startWatcher(req);
      SyncSchedulerService.scheduleRequest(req);
      return true;
    } catch (err) {
      console.error('db-save-sync-request error:', err);
      return false;
    }
  });

  ipcMain.handle('db-delete-sync-request', (_event, id: string) => {
    const db = getDb();
    try {
      db.prepare('DELETE FROM sync_requests WHERE id = ?').run(id);
      FolderWatcherService.stopWatcher(id);
      SyncSchedulerService.unscheduleRequest(id);
      return true;
    } catch (err) {
      console.error('db-delete-sync-request error:', err);
      return false;
    }
  });

  ipcMain.handle('db-update-sync-request-paths', (_event, { id, localPath, remoteFolder }) => {
    const db = getDb();
    try {
      db.prepare('UPDATE sync_requests SET localPath = ?, remoteFolder = ? WHERE id = ?').run(localPath, remoteFolder, id);
      const req = db.prepare('SELECT * FROM sync_requests WHERE id = ?').get(id) as any;
      if (req) {
        FolderWatcherService.startWatcher(req);
      }
      return true;
    } catch (err) {
      console.error('db-update-sync-request-paths error:', err);
      return false;
    }
  });

  ipcMain.handle('db-update-sync-request-status', (_event, { id, status }) => {
    const db = getDb();
    try {
      db.prepare('UPDATE sync_requests SET status = ? WHERE id = ?').run(status, id);
      const req = db.prepare('SELECT * FROM sync_requests WHERE id = ?').get(id) as any;
      if (req) {
        if (status === 'paused') {
          FolderWatcherService.stopWatcher(id);
          SyncSchedulerService.unscheduleRequest(id);
        } else {
          FolderWatcherService.startWatcher(req);
          SyncSchedulerService.scheduleRequest(req);
        }
      }
      return true;
    } catch (err) {
      console.error('db-update-sync-request-status error:', err);
      return false;
    }
  });

  // Sync execution triggers
  ipcMain.handle('sync:triggerSync', async (_event, requestId) => {
    return await SyncService.runSync(requestId);
  });

  ipcMain.handle('sync:previewChanges', async (_event, requestId) => {
    return await SyncService.previewChanges(requestId);
  });

  ipcMain.handle('sync:getQueue', (_event, requestId) => {
    const db = getDb();
    try {
      if (requestId) {
        return db.prepare('SELECT * FROM sync_queue WHERE sync_request_id = ? ORDER BY created_at DESC').all(requestId);
      }
      return db.prepare('SELECT * FROM sync_queue ORDER BY created_at DESC LIMIT 100').all();
    } catch (err) {
      console.error('sync:getQueue error:', err);
      return [];
    }
  });

  ipcMain.handle('sync:getActivityLog', (_event, requestId) => {
    const db = getDb();
    try {
      if (requestId) {
        return db.prepare('SELECT * FROM activity_log WHERE sync_request_id = ? ORDER BY timestamp DESC').all(requestId);
      }
      return db.prepare('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 200').all();
    } catch (err) {
      console.error('sync:getActivityLog error:', err);
      return [];
    }
  });

  // Local settings
  ipcMain.handle('settings:get', (_event, { key, defaultValue }) => {
    return getSetting(key, defaultValue);
  });

  ipcMain.handle('settings:set', (_event, { key, value }) => {
    setSetting(key, value);
    return true;
  });
}

// App lifecycle
app.whenReady().then(() => {
  initDatabase();
  setupIpcHandlers();

  // Start the background services
  FolderWatcherService.initWatchers();
  SyncSchedulerService.initSchedules();

  createWindow();

  try {
    createTray();
  } catch (err) {
    console.warn('System tray creation failed, running headless tray:', err);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
