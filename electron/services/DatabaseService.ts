import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

let db: Database.Database | null = null;

export function initDatabase() {
  if (db) return db;

  try {
    const dbPath = path.join(app.getPath('userData'), 'devsync.db');
    console.log(`[DatabaseService] Connecting SQLite database at: ${dbPath}`);
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
        description TEXT,
        tenantId TEXT,
        bucketName TEXT,
        folderId TEXT
      )
    `).run();

    // Create settings table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `).run();

    // Create file_metadata table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS file_metadata (
        sync_request_id TEXT,
        relative_path TEXT,
        size INTEGER,
        last_modified TEXT,
        synced_at TEXT,
        PRIMARY KEY (sync_request_id, relative_path)
      )
    `).run();

    // Create sync_queue table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        sync_request_id TEXT NOT NULL,
        relative_path TEXT NOT NULL,
        action TEXT NOT NULL, -- CREATE, UPDATE, DELETE
        status TEXT NOT NULL, -- PENDING, IN_PROGRESS, SUCCESS, FAILED
        attempts INTEGER DEFAULT 0,
        error TEXT,
        created_at TEXT NOT NULL
      )
    `).run();

    // Create activity_log table for local sync logs
    db.prepare(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id TEXT PRIMARY KEY,
        sync_request_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        action TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT,
        timestamp TEXT NOT NULL
      )
    `).run();

    console.log('[DatabaseService] Database schemas initialized successfully.');
    return db;
  } catch (err) {
    console.error('[DatabaseService] Failed to initialize SQLite database:', err);
    throw err;
  }
}

export function getDb(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

// Key-Value settings persistence helpers
export function getSetting(key: string, defaultValue: string = ''): string {
  try {
    const database = getDb();
    const row = database.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
    return row ? row.value : defaultValue;
  } catch (err) {
    console.error(`[DatabaseService] Failed to get setting ${key}:`, err);
    return defaultValue;
  }
}

export function setSetting(key: string, value: string): void {
  try {
    const database = getDb();
    database.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
  } catch (err) {
    console.error(`[DatabaseService] Failed to set setting ${key}:`, err);
  }
}

export function deleteSetting(key: string): void {
  try {
    const database = getDb();
    database.prepare('DELETE FROM settings WHERE key = ?').run(key);
  } catch (err) {
    console.error(`[DatabaseService] Failed to delete setting ${key}:`, err);
  }
}
