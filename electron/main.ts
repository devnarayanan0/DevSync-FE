import { app, BrowserWindow, ipcMain, dialog, Notification, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import Database from 'better-sqlite3';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let db: Database.Database | null = null;

// Initialize SQLite database in application user data path
function initDatabase() {
  try {
    const dbPath = path.join(app.getPath('userData'), 'devsync.db');
    console.log(`Connecting SQLite database at: ${dbPath}`);
    db = new Database(dbPath);
    
    // Create sync_requests table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS sync_requests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        status TEXT NOT NULL,
        localPath TEXT NOT NULL,
        remoteFolder TEXT NOT NULL,
        lastSync TEXT,
        schedule TEXT,
        description TEXT
      )
    `).run();

    // Check if table has seed data (optional mockup values)
    const countResult = db.prepare('SELECT count(*) as count FROM sync_requests').get() as { count: number };
    if (countResult.count === 0) {
      console.log('Seeding SQLite database with default Sync Requests...');
      const seedStatements = [
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

      const insertStmt = db.prepare(`
        INSERT INTO sync_requests (id, name, provider, status, localPath, remoteFolder, lastSync, schedule, description)
        VALUES (@id, @name, @provider, @status, @localPath, @remoteFolder, @lastSync, @schedule, @description)
      `);

      for (const item of seedStatements) {
        insertStmt.run(item);
      }
    }
  } catch (err) {
    console.error('Failed to initialize SQLite Database:', err);
  }
}

function createWindow() {
  const isDev = process.env.NODE_ENV !== 'production';

  // Create native frameless loading/splash window first
  const splash = new BrowserWindow({
    width: 500,
    height: 350,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  // Load beautifully structured inline loader sequence
  const splashHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Loading DevSync Desktop...</title>
      <style>
        body {
          background-color: #0b0f19;
          color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid rgba(99, 102, 241, 0.25);
        }
        .main-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 30px;
        }
        .logo {
          position: relative;
          width: 72px;
          height: 72px;
          margin-bottom: 24px;
        }
        .logo-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid #6366f1;
          border-radius: 20px;
          animation: ringPulse 2s infinite ease-in-out;
          opacity: 0.8;
        }
        .logo-core {
          position: absolute;
          inset: 6px;
          background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 24px;
          color: #ffffff;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }
        h1 {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 6px 0;
          letter-spacing: -0.025em;
          background: linear-gradient(to right, #ffffff 30%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 28px 0;
          font-weight: 600;
        }
        .progress-container {
          width: 260px;
          height: 5px;
          background-color: #1e293b;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }
        .progress-bar {
          position: absolute;
          height: 100%;
          width: 35%;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          border-radius: 10px;
          animation: loadAnim 1.6s infinite ease-in-out;
        }
        .status-text {
          margin-top: 14px;
          font-size: 10px;
          color: #475569;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          letter-spacing: 0.05em;
        }
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.18); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes loadAnim {
          0% { left: -40%; }
          50% { left: 40%; width: 50%; }
          100% { left: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="main-container">
        <div class="logo">
          <div class="logo-pulse"></div>
          <div class="logo-core">DS</div>
        </div>
        <h1>DevSync Desktop</h1>
        <div class="subtitle">Secure Storage Synchronizer</div>
        <div class="progress-container">
          <div class="progress-bar"></div>
        </div>
        <div class="status-text">INITIALIZING SECURE SHELL CONTAINER...</div>
      </div>
    </body>
    </html>
  `;
  
  splash.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHTML)}`);

  // Create main window with show: false
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    title: 'DevSync Desktop Native App Client',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Once-ready transition
  mainWindow.once('ready-to-show', () => {
    // Elegant transition sequence - simulated delay for seamless asset rendering
    setTimeout(() => {
      if (splash && !splash.isDestroyed()) {
        splash.close();
      }
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
        if (isDev) {
          mainWindow.webContents.openDevTools();
        }
      }
    }, 1800);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Use a base64 16x16 blue block icon as fallback or default tray icon
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

// IPC Handlers
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

  // DB Handlers
  ipcMain.handle('db-get-sync-requests', () => {
    if (!db) return [];
    try {
      return db.prepare('SELECT * FROM sync_requests').all();
    } catch (err) {
      console.error('db-get-sync-requests error:', err);
      return [];
    }
  });

  ipcMain.handle('db-save-sync-request', (_event, req) => {
    if (!db) return false;
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO sync_requests (id, name, provider, status, localPath, remoteFolder, lastSync, schedule, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(req.id, req.name, req.provider, req.status, req.localPath, req.remoteFolder, req.lastSync, req.schedule, req.description || '');
      return true;
    } catch (err) {
      console.error('db-save-sync-request error:', err);
      return false;
    }
  });

  ipcMain.handle('db-delete-sync-request', (_event, id: string) => {
    if (!db) return false;
    try {
      db.prepare('DELETE FROM sync_requests WHERE id = ?').run(id);
      return true;
    } catch (err) {
      console.error('db-delete-sync-request error:', err);
      return false;
    }
  });

  ipcMain.handle('db-update-sync-request-paths', (_event, { id, localPath, remoteFolder }) => {
    if (!db) return false;
    try {
      db.prepare('UPDATE sync_requests SET localPath = ?, remoteFolder = ? WHERE id = ?').run(localPath, remoteFolder, id);
      return true;
    } catch (err) {
      console.error('db-update-sync-request-paths error:', err);
      return false;
    }
  });

  ipcMain.handle('db-update-sync-request-status', (_event, { id, status }) => {
    if (!db) return false;
    try {
      db.prepare('UPDATE sync_requests SET status = ? WHERE id = ?').run(status, id);
      return true;
    } catch (err) {
      console.error('db-update-sync-request-status error:', err);
      return false;
    }
  });
}

app.whenReady().then(() => {
  initDatabase();
  setupIpcHandlers();
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
