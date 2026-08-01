var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron2 = require("electron");
var path6 = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);

// electron/services/DatabaseService.ts
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var path = __toESM(require("path"), 1);
var import_electron = require("electron");
var db = null;
function initDatabase() {
  if (db) return db;
  try {
    const dbPath = path.join(import_electron.app.getPath("userData"), "devsync.db");
    console.log(`[DatabaseService] Connecting SQLite database at: ${dbPath}`);
    db = new import_better_sqlite3.default(dbPath);
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
    db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `).run();
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
    console.log("[DatabaseService] Database schemas initialized successfully.");
    return db;
  } catch (err) {
    console.error("[DatabaseService] Failed to initialize SQLite database:", err);
    throw err;
  }
}
function getDb() {
  if (!db) {
    return initDatabase();
  }
  return db;
}
function getSetting(key, defaultValue = "") {
  try {
    const database = getDb();
    const row = database.prepare("SELECT value FROM settings WHERE key = ?").get(key);
    return row ? row.value : defaultValue;
  } catch (err) {
    console.error(`[DatabaseService] Failed to get setting ${key}:`, err);
    return defaultValue;
  }
}
function setSetting(key, value) {
  try {
    const database = getDb();
    database.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
  } catch (err) {
    console.error(`[DatabaseService] Failed to set setting ${key}:`, err);
  }
}
function deleteSetting(key) {
  try {
    const database = getDb();
    database.prepare("DELETE FROM settings WHERE key = ?").run(key);
  } catch (err) {
    console.error(`[DatabaseService] Failed to delete setting ${key}:`, err);
  }
}

// electron/services/ApiClient.ts
var import_axios = __toESM(require("axios"), 1);
var envUrl = process.env.API_BASE_URL || "http://localhost:8080";
var envTimeout = process.env.API_TIMEOUT ? parseInt(process.env.API_TIMEOUT, 10) : 3e4;
var apiClientInstance = null;
function getApiClient() {
  if (apiClientInstance) {
    return apiClientInstance;
  }
  console.log(`[ApiClient] Initializing Axios Client targeting: ${envUrl}`);
  apiClientInstance = import_axios.default.create({
    baseURL: envUrl,
    timeout: envTimeout,
    headers: {
      "Content-Type": "application/json"
    }
  });
  apiClientInstance.interceptors.request.use(
    (config) => {
      const token = getSetting("jwt_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  apiClientInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.warn("[ApiClient] 401 Unauthorized detected. Clearing session.");
        setSetting("jwt_token", "");
        setSetting("is_logged_in", "false");
        setSetting("user_profile", "");
      }
      return Promise.reject(error);
    }
  );
  return apiClientInstance;
}

// electron/services/AuthService.ts
var AuthService = class {
  static async register(email, password) {
    try {
      const client = getApiClient();
      const response = await client.post("/api/auth/register", { email, password });
      return !!response.data;
    } catch (err) {
      console.error("[AuthService] Registration failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "Registration failed");
    }
  }
  static async login(email, password) {
    try {
      const client = getApiClient();
      const response = await client.post("/api/auth/login", { email, password });
      const userData = response.data;
      if (userData && userData.token) {
        setSetting("jwt_token", userData.token);
        setSetting("is_logged_in", "true");
        setSetting("user_profile", JSON.stringify({
          id: userData.id,
          email: userData.email,
          role: userData.role
        }));
        console.log(`[AuthService] Login successful for: ${email}`);
        return userData;
      }
      throw new Error("Invalid server login response. Token is missing.");
    } catch (err) {
      console.error("[AuthService] Login failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "Login failed");
    }
  }
  static async logout() {
    try {
      setSetting("jwt_token", "");
      setSetting("is_logged_in", "false");
      setSetting("user_profile", "");
      deleteSetting("tenant_id");
      deleteSetting("tenant_name");
      deleteSetting("tenant_provider");
      deleteSetting("tenant_status");
      console.log("[AuthService] Logout complete. Session cleared.");
    } catch (err) {
      console.error("[AuthService] Logout error:", err);
    }
  }
  static getSession() {
    const isLoggedIn = getSetting("is_logged_in") === "true";
    const token = getSetting("jwt_token");
    const profileRaw = getSetting("user_profile");
    let user = null;
    if (profileRaw) {
      try {
        user = JSON.parse(profileRaw);
      } catch (e) {
        console.error("[AuthService] Failed to parse user profile setting:", e);
      }
    }
    return {
      isLoggedIn: isLoggedIn && !!token,
      token,
      user
    };
  }
};

// electron/services/TenantService.ts
var TenantService = class {
  static async createTenant(tenantName, provider) {
    try {
      const client = getApiClient();
      const response = await client.post("/api/connection/create", { tenantName, provider });
      const tenant = response.data;
      if (tenant && tenant.tenantId) {
        setSetting("tenant_id", tenant.tenantId);
        setSetting("tenant_name", tenant.tenantName);
        setSetting("tenant_provider", tenant.provider);
        setSetting("tenant_status", tenant.status);
        console.log(`[TenantService] Tenant created & registered in SQLite: ${tenant.tenantId}`);
        return tenant;
      }
      throw new Error("Connection creation failed. Invalid response payload.");
    } catch (err) {
      console.error("[TenantService] Failed to create tenant:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "Tenant registration failed");
    }
  }
  static getActiveTenant() {
    const tenantId = getSetting("tenant_id");
    if (!tenantId) return null;
    return {
      tenantId,
      tenantName: getSetting("tenant_name"),
      provider: getSetting("tenant_provider"),
      status: getSetting("tenant_status")
    };
  }
  static updateTenantStatus(status) {
    setSetting("tenant_status", status);
  }
};

// electron/services/AwsService.ts
var fs = __toESM(require("fs"), 1);
var path2 = __toESM(require("path"), 1);
var AwsService = class {
  static async verifyConnection(tenantId, accessKey, secretKey, region) {
    try {
      const client = getApiClient();
      const response = await client.post(`/api/connection/aws/${tenantId}/verify`, {
        accessKey,
        secretKey,
        region
      });
      if (response.data && response.data.status === "VERIFIED") {
        setSetting("aws_access_key", accessKey);
        setSetting("aws_secret_key", secretKey);
        setSetting("aws_region", region);
        setSetting("tenant_status", "VERIFIED");
      }
      return response.data;
    } catch (err) {
      console.error("[AwsService] AWS Verification failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "AWS Credential verification failed");
    }
  }
  static async listBuckets(tenantId) {
    try {
      const client = getApiClient();
      const response = await client.get(`/api/operations/aws/buckets/${tenantId}`);
      return response.data || [];
    } catch (err) {
      console.error("[AwsService] List Buckets failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "Failed to retrieve S3 Buckets");
    }
  }
  static async createBucket(tenantId, bucketName) {
    try {
      const client = getApiClient();
      await client.post("/api/operations/aws/buckets/createB", {
        tenantId,
        bucketName
      });
    } catch (err) {
      console.error("[AwsService] Create Bucket failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "Failed to create S3 Bucket");
    }
  }
  static async uploadFile(tenantId, bucketName, folderName, filePath, relativeTargetName) {
    try {
      const client = getApiClient();
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path2.basename(filePath);
      const formData = new FormData();
      formData.append("tenantId", tenantId);
      formData.append("bucketName", bucketName);
      const targetFolder = folderName ? path2.join(folderName, path2.dirname(relativeTargetName)) : path2.dirname(relativeTargetName);
      formData.append("folderName", targetFolder.replace(/\\/g, "/"));
      const fileBlob = new Blob([fileBuffer]);
      formData.append("file", fileBlob, fileName);
      const response = await client.post("/api/operations/aws/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    } catch (err) {
      console.error("[AwsService] S3 Upload failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "S3 Upload failed");
    }
  }
  static async downloadFile(tenantId, bucketName, folderName, fileName, localSavePath) {
    try {
      const client = getApiClient();
      const response = await client.post(
        "/api/operations/aws/download",
        {
          tenantId,
          bucketName,
          folderName,
          fileName
        },
        {
          responseType: "arraybuffer"
        }
      );
      const dir = path2.dirname(localSavePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(localSavePath, Buffer.from(response.data));
    } catch (err) {
      console.error("[AwsService] S3 Download failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "S3 Download failed");
    }
  }
  static async deleteFile(tenantId, bucketName, folderName, fileName) {
    try {
      const client = getApiClient();
      await client.delete("/api/operations/aws/delete", {
        data: {
          tenantId,
          bucketName,
          folderName,
          fileName
        }
      });
    } catch (err) {
      console.error("[AwsService] S3 Delete failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "S3 Delete failed");
    }
  }
  static async scanFolderMetadata(tenantId, bucketName, folderName) {
    try {
      const client = getApiClient();
      const response = await client.post("/api/operations/aws/statusF", {
        tenantId,
        bucketName,
        folderName
      });
      return response.data || [];
    } catch (err) {
      console.error("[AwsService] S3 Folder Metadata scan failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "S3 Folder Metadata scan failed");
    }
  }
};

// electron/services/GoogleDriveService.ts
var fs2 = __toESM(require("fs"), 1);
var path3 = __toESM(require("path"), 1);
var GoogleDriveService = class {
  static async getAuthUrl(tenantId) {
    try {
      const client = getApiClient();
      const response = await client.get(`/api/connection/gcp/${tenantId}/auth`);
      return response.data?.authUrl || "";
    } catch (err) {
      console.error("[GoogleDriveService] Get Auth URL failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "Failed to get GDrive auth URL");
    }
  }
  static async listFolders(tenantId, folderId) {
    try {
      const client = getApiClient();
      const endpoint = folderId ? `/api/operations/gdrive/folder/${tenantId}/${folderId}` : `/api/operations/gdrive/folder/${tenantId}`;
      const response = await client.get(endpoint);
      return response.data || [];
    } catch (err) {
      console.error("[GoogleDriveService] List folders failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "Failed to list GDrive folders");
    }
  }
  static async createFolder(tenantId, folderName, parentFolderId) {
    try {
      const client = getApiClient();
      const response = await client.post("/api/operations/gdrive/folder/create", {
        tenantId,
        parentFolderId: parentFolderId || null,
        folderName
      });
      return response.data;
    } catch (err) {
      console.error("[GoogleDriveService] Create folder failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "Failed to create GDrive folder");
    }
  }
  static async uploadFile(tenantId, folderId, filePath) {
    try {
      const client = getApiClient();
      const fileBuffer = fs2.readFileSync(filePath);
      const fileName = path3.basename(filePath);
      const formData = new FormData();
      formData.append("tenantId", tenantId);
      formData.append("folderId", folderId);
      const fileBlob = new Blob([fileBuffer]);
      formData.append("file", fileBlob, fileName);
      const response = await client.post("/api/operations/gdrive/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    } catch (err) {
      console.error("[GoogleDriveService] GDrive upload failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "GDrive upload failed");
    }
  }
  static async downloadFile(tenantId, fileId, localSavePath) {
    try {
      const client = getApiClient();
      const response = await client.get(`/api/operations/gdrive/download/${tenantId}/${fileId}`, {
        responseType: "arraybuffer"
      });
      const dir = path3.dirname(localSavePath);
      if (!fs2.existsSync(dir)) {
        fs2.mkdirSync(dir, { recursive: true });
      }
      fs2.writeFileSync(localSavePath, Buffer.from(response.data));
    } catch (err) {
      console.error("[GoogleDriveService] GDrive download failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "GDrive download failed");
    }
  }
  static async deleteFile(tenantId, fileId) {
    try {
      const client = getApiClient();
      await client.delete(`/api/operations/gdrive/delete/${tenantId}/${fileId}`);
    } catch (err) {
      console.error("[GoogleDriveService] GDrive delete failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "GDrive delete failed");
    }
  }
  static async scanFolderMetadata(tenantId, folderId) {
    try {
      const client = getApiClient();
      const response = await client.get(`/api/operations/gdrive/folder/status/${tenantId}/${folderId}`);
      return response.data || [];
    } catch (err) {
      console.error("[GoogleDriveService] GDrive folder scan failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "GDrive folder scan failed");
    }
  }
};

// electron/services/SyncService.ts
var fs3 = __toESM(require("fs"), 1);
var path4 = __toESM(require("path"), 1);
var SyncService = class {
  // Recursively read local folder metadata
  static getLocalFiles(dirPath, rootDir) {
    const results = [];
    if (!fs3.existsSync(dirPath)) return [];
    const list = fs3.readdirSync(dirPath);
    for (const file of list) {
      if (file.startsWith(".")) continue;
      const filePath = path4.join(dirPath, file);
      const stat = fs3.statSync(filePath);
      if (stat.isDirectory()) {
        results.push(...this.getLocalFiles(filePath, rootDir));
      } else {
        const relativePath = path4.relative(rootDir, filePath).replace(/\\/g, "/");
        results.push({
          relativePath,
          size: stat.size,
          lastModified: stat.mtime.toISOString()
        });
      }
    }
    return results;
  }
  // Primary entrypoint to sync a single pipeline
  static async runSync(requestId) {
    console.log(`[SyncService] Starting synchronization pipeline: ${requestId}`);
    const db2 = getDb();
    db2.prepare("UPDATE sync_requests SET status = 'syncing' WHERE id = ?").run(requestId);
    try {
      const req = db2.prepare("SELECT * FROM sync_requests WHERE id = ?").get(requestId);
      if (!req) {
        throw new Error(`Sync request not found with id: ${requestId}`);
      }
      const { provider, localPath, remoteFolder, tenantId, bucketName, folderId } = req;
      if (!localPath || !fs3.existsSync(localPath)) {
        throw new Error(`Local directory does not exist: ${localPath}`);
      }
      if (!tenantId) {
        throw new Error("Tenant identification token is missing for this sync pipeline.");
      }
      const localFiles = this.getLocalFiles(localPath, localPath);
      let remoteFiles = [];
      if (provider === "aws-s3") {
        const prefix = remoteFolder ? remoteFolder.replace("s3://", "").split("/").slice(1).join("/") : "";
        remoteFiles = await AwsService.scanFolderMetadata(tenantId, bucketName || "", prefix);
      } else if (provider === "google-drive") {
        remoteFiles = await GoogleDriveService.scanFolderMetadata(tenantId, folderId || "");
      }
      console.log(`[SyncService] Scanned ${localFiles.length} local files & ${remoteFiles.length} remote files.`);
      const normalizedRemote = remoteFiles.map((f) => {
        let relPath = f.fileName;
        if (provider === "aws-s3") {
          const prefix = remoteFolder ? remoteFolder.replace("s3://", "").split("/").slice(1).join("/") : "";
          if (prefix && relPath.startsWith(prefix)) {
            relPath = relPath.substring(prefix.length).replace(/^\//, "");
          }
        }
        return {
          relativePath: relPath,
          size: f.size,
          lastModified: f.lastModified,
          // Custom identifier if Google Drive file
          fileId: f.fileId
        };
      });
      const localMap = new Map(localFiles.map((f) => [f.relativePath, f]));
      const remoteMap = new Map(normalizedRemote.map((f) => [f.relativePath, f]));
      let uploads = 0;
      let downloads = 0;
      let deletes = 0;
      for (const [relPath, localFile] of localMap.entries()) {
        const remoteFile = remoteMap.get(relPath);
        if (!remoteFile) {
          console.log(`[SyncService] Uploading new file: ${relPath}`);
          await this.executeUpload(req, localPath, relPath);
          uploads++;
        } else {
          const localTime = new Date(localFile.lastModified).getTime();
          const remoteTime = new Date(remoteFile.lastModified).getTime();
          const timeDiff = Math.abs(localTime - remoteTime);
          const isSizeDifferent = localFile.size !== remoteFile.size;
          if (isSizeDifferent || timeDiff > 2e3) {
            if (localTime > remoteTime) {
              console.log(`[SyncService] Local file is newer: ${relPath} (Local: ${localFile.lastModified}, Remote: ${remoteFile.lastModified})`);
              await this.executeUpload(req, localPath, relPath);
              uploads++;
            } else {
              console.log(`[SyncService] Remote file is newer: ${relPath} (Local: ${localFile.lastModified}, Remote: ${remoteFile.lastModified})`);
              await this.executeDownload(req, localPath, relPath, remoteFile.fileId);
              downloads++;
            }
          } else {
            console.log(`[SyncService] File is identical on both sides: ${relPath}`);
          }
        }
      }
      for (const [relPath, remoteFile] of remoteMap.entries()) {
        if (!localMap.has(relPath)) {
          console.log(`[SyncService] Remote file not found locally, downloading: ${relPath}`);
          await this.executeDownload(req, localPath, relPath, remoteFile.fileId);
          downloads++;
        }
      }
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
      db2.prepare("UPDATE sync_requests SET status = 'idle', lastSync = ? WHERE id = ?").run(timestamp, requestId);
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      db2.prepare(`
        INSERT INTO activity_log (id, sync_request_id, file_path, action, status, message, timestamp)
        VALUES (?, ?, 'Complete Sync', 'SYNC', 'SUCCESS', ?, ?)
      `).run(
        logId,
        requestId,
        `Pipeline complete. Sync summary: ${uploads} uploaded, ${downloads} downloaded, ${deletes} deleted.`,
        (/* @__PURE__ */ new Date()).toISOString()
      );
      return true;
    } catch (err) {
      console.error(`[SyncService] Sync failed for pipeline ${requestId}:`, err);
      db2.prepare("UPDATE sync_requests SET status = 'failed' WHERE id = ?").run(requestId);
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      db2.prepare(`
        INSERT INTO activity_log (id, sync_request_id, file_path, action, status, message, timestamp)
        VALUES (?, ?, 'Sync Job', 'SYNC', 'FAILED', ?, ?)
      `).run(
        logId,
        requestId,
        `Pipeline sync failed: ${err.message || err}`,
        (/* @__PURE__ */ new Date()).toISOString()
      );
      return false;
    }
  }
  // Preview changes without actually syncing (for GitHub Desktop-like view)
  static async previewChanges(requestId) {
    console.log(`[SyncService] Previewing changes for pipeline: ${requestId}`);
    const db2 = getDb();
    try {
      const req = db2.prepare("SELECT * FROM sync_requests WHERE id = ?").get(requestId);
      if (!req) {
        throw new Error(`Sync request not found with id: ${requestId}`);
      }
      const { provider, localPath, remoteFolder, tenantId, bucketName, folderId } = req;
      if (!localPath || !fs3.existsSync(localPath)) {
        throw new Error(`Local directory does not exist: ${localPath}`);
      }
      if (!tenantId) {
        throw new Error("Tenant identification token is missing for this sync pipeline.");
      }
      const localFiles = this.getLocalFiles(localPath, localPath);
      let remoteFiles = [];
      if (provider === "aws-s3") {
        const prefix = remoteFolder ? remoteFolder.replace("s3://", "").split("/").slice(1).join("/") : "";
        remoteFiles = await AwsService.scanFolderMetadata(tenantId, bucketName || "", prefix);
      } else if (provider === "google-drive") {
        remoteFiles = await GoogleDriveService.scanFolderMetadata(tenantId, folderId || "");
      }
      const normalizedRemote = remoteFiles.map((f) => {
        let relPath = f.fileName;
        if (provider === "aws-s3") {
          const prefix = remoteFolder ? remoteFolder.replace("s3://", "").split("/").slice(1).join("/") : "";
          if (prefix && relPath.startsWith(prefix)) {
            relPath = relPath.substring(prefix.length).replace(/^\//, "");
          }
        }
        return {
          relativePath: relPath,
          size: f.size,
          lastModified: f.lastModified,
          fileId: f.fileId
        };
      });
      const localMap = new Map(localFiles.map((f) => [f.relativePath, f]));
      const remoteMap = new Map(normalizedRemote.map((f) => [f.relativePath, f]));
      const changes = {
        uploads: [],
        downloads: [],
        identical: []
      };
      for (const [relPath, localFile] of localMap.entries()) {
        const remoteFile = remoteMap.get(relPath);
        if (!remoteFile) {
          changes.uploads.push({ path: relPath, type: "added" });
        } else {
          const localTime = new Date(localFile.lastModified).getTime();
          const remoteTime = new Date(remoteFile.lastModified).getTime();
          const timeDiff = Math.abs(localTime - remoteTime);
          const isSizeDifferent = localFile.size !== remoteFile.size;
          if (isSizeDifferent || timeDiff > 2e3) {
            if (localTime > remoteTime) {
              changes.uploads.push({ path: relPath, type: "modified" });
            } else {
              changes.downloads.push({ path: relPath, type: "modified" });
            }
          } else {
            changes.identical.push(relPath);
          }
        }
      }
      for (const [relPath, remoteFile] of remoteMap.entries()) {
        if (!localMap.has(relPath)) {
          changes.downloads.push({ path: relPath, type: "added" });
        }
      }
      return changes;
    } catch (err) {
      console.error(`[SyncService] Preview failed for pipeline ${requestId}:`, err);
      throw err;
    }
  }
  // Handle single upload to S3 or GDrive
  static async executeUpload(req, localPath, relativePath) {
    const fullPath = path4.join(localPath, relativePath);
    if (!fs3.existsSync(fullPath)) return;
    if (req.provider === "aws-s3") {
      const prefix = req.remoteFolder ? req.remoteFolder.replace("s3://", "").split("/").slice(1).join("/") : "";
      await AwsService.uploadFile(req.tenantId, req.bucketName || "", prefix, fullPath, relativePath);
    } else if (req.provider === "google-drive") {
      await GoogleDriveService.uploadFile(req.tenantId, req.folderId || "", fullPath);
    }
    const stat = fs3.statSync(fullPath);
    const db2 = getDb();
    db2.prepare(`
      INSERT OR REPLACE INTO file_metadata (sync_request_id, relative_path, size, last_modified, synced_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.id, relativePath, stat.size, stat.mtime.toISOString(), (/* @__PURE__ */ new Date()).toISOString());
  }
  // Handle single download from S3 or GDrive
  static async executeDownload(req, localPath, relativePath, remoteFileId) {
    const savePath = path4.join(localPath, relativePath);
    if (req.provider === "aws-s3") {
      const prefix = req.remoteFolder ? req.remoteFolder.replace("s3://", "").split("/").slice(1).join("/") : "";
      const folderPart = prefix ? path4.join(prefix, path4.dirname(relativePath)).replace(/\\/g, "/") : path4.dirname(relativePath).replace(/\\/g, "/");
      const baseName = path4.basename(relativePath);
      await AwsService.downloadFile(req.tenantId, req.bucketName || "", folderPart, baseName, savePath);
    } else if (req.provider === "google-drive") {
      if (!remoteFileId) {
        throw new Error(`Google Drive download requires fileId, none provided for file: ${relativePath}`);
      }
      await GoogleDriveService.downloadFile(req.tenantId, remoteFileId, savePath);
    }
    if (fs3.existsSync(savePath)) {
      const stat = fs3.statSync(savePath);
      const db2 = getDb();
      db2.prepare(`
        INSERT OR REPLACE INTO file_metadata (sync_request_id, relative_path, size, last_modified, synced_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(req.id, relativePath, stat.size, stat.mtime.toISOString(), (/* @__PURE__ */ new Date()).toISOString());
    }
  }
  // Handle real-time file updates queue processing (Delta Sync)
  static async processQueueForRequest(requestId) {
    const db2 = getDb();
    const pendingJobs = db2.prepare(`
      SELECT * FROM sync_queue 
      WHERE sync_request_id = ? AND status = 'PENDING' 
      ORDER BY created_at ASC
    `).all(requestId);
    if (pendingJobs.length === 0) return;
    console.log(`[SyncService] Processing ${pendingJobs.length} queued real-time changes for request: ${requestId}`);
    const req = db2.prepare("SELECT * FROM sync_requests WHERE id = ?").get(requestId);
    if (!req) return;
    for (const job of pendingJobs) {
      db2.prepare("UPDATE sync_queue SET status = ?, attempts = attempts + 1 WHERE id = ?").run("IN_PROGRESS", job.id);
      try {
        if (job.action === "CREATE" || job.action === "UPDATE") {
          await this.executeUpload(req, req.localPath, job.relative_path);
        } else if (job.action === "DELETE") {
          if (req.provider === "aws-s3") {
            const prefix = req.remoteFolder ? req.remoteFolder.replace("s3://", "").split("/").slice(1).join("/") : "";
            const folderPart = prefix ? path4.join(prefix, path4.dirname(job.relative_path)).replace(/\\/g, "/") : path4.dirname(job.relative_path).replace(/\\/g, "/");
            const baseName = path4.basename(job.relative_path);
            await AwsService.deleteFile(req.tenantId, req.bucketName || "", folderPart, baseName);
          } else if (req.provider === "google-drive") {
            const cache = db2.prepare("SELECT relative_path FROM file_metadata WHERE sync_request_id = ? AND relative_path = ?").get(req.id, job.relative_path);
            if (cache) {
              const remoteFiles = await GoogleDriveService.scanFolderMetadata(req.tenantId, req.folderId || "");
              const foundFile = remoteFiles.find((f) => f.fileName === job.relative_path);
              if (foundFile && foundFile.fileId) {
                await GoogleDriveService.deleteFile(req.tenantId, foundFile.fileId);
              }
            }
          }
          db2.prepare("DELETE FROM file_metadata WHERE sync_request_id = ? AND relative_path = ?").run(req.id, job.relative_path);
        }
        db2.prepare("UPDATE sync_queue SET status = ? WHERE id = ?").run("SUCCESS", job.id);
        db2.prepare(`
          UPDATE activity_log 
          SET status = 'SUCCESS', message = ? 
          WHERE sync_request_id = ? AND file_path = ? AND action = ? AND status = 'PENDING'
        `).run(
          `Successfully synchronized ${job.action.toLowerCase()} job to cloud.`,
          req.id,
          job.relative_path,
          job.action
        );
      } catch (err) {
        console.error(`[SyncService] Failed to process job ${job.id}:`, err);
        db2.prepare("UPDATE sync_queue SET status = ?, error = ? WHERE id = ?").run("FAILED", err.message || String(err), job.id);
        db2.prepare(`
          UPDATE activity_log 
          SET status = 'FAILED', message = ? 
          WHERE sync_request_id = ? AND file_path = ? AND action = ? AND status = 'PENDING'
        `).run(
          `Failed delta sync: ${err.message || err}`,
          req.id,
          job.relative_path,
          job.action
        );
      }
    }
  }
};

// electron/services/FolderWatcherService.ts
var chokidar = __toESM(require("chokidar"), 1);
var path5 = __toESM(require("path"), 1);
var fs4 = __toESM(require("fs"), 1);
var FolderWatcherService = class {
  static {
    this.watchers = /* @__PURE__ */ new Map();
  }
  static initWatchers() {
    console.log("[FolderWatcherService] Initializing folder watchers from active sync requests...");
    try {
      const db2 = getDb();
      const activeRequests = db2.prepare("SELECT * FROM sync_requests WHERE status IN ('syncing', 'idle')").all();
      this.stopAllWatchers();
      for (const req of activeRequests) {
        this.startWatcher(req);
      }
    } catch (err) {
      console.error("[FolderWatcherService] Failed to initialize watchers:", err);
    }
  }
  static startWatcher(req) {
    if (!req.localPath || !fs4.existsSync(req.localPath)) {
      console.warn(`[FolderWatcherService] Cannot watch path: ${req.localPath} (does not exist or is empty)`);
      return;
    }
    if (this.watchers.has(req.id)) {
      this.stopWatcher(req.id);
    }
    console.log(`[FolderWatcherService] Starting watcher for [${req.name}] at: ${req.localPath}`);
    const watcher = chokidar.watch(req.localPath, {
      ignored: /(^|[\/\\])\../,
      // ignore hidden files/directories (starting with dot)
      persistent: true,
      ignoreInitial: true,
      // ignore files detected during initialization (only detect real-time changes)
      awaitWriteFinish: {
        stabilityThreshold: 2e3,
        pollInterval: 100
      }
    });
    const queueJob = (action, filePath) => {
      const relativePath = path5.relative(req.localPath, filePath).replace(/\\/g, "/");
      console.log(`[FolderWatcherService] Change detected [${action}] for file: ${relativePath}`);
      try {
        const db2 = getDb();
        const jobId = `${req.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        db2.prepare(`
          INSERT INTO sync_queue (id, sync_request_id, relative_path, action, status, created_at)
          VALUES (?, ?, ?, ?, 'PENDING', ?)
        `).run(jobId, req.id, relativePath, action, (/* @__PURE__ */ new Date()).toISOString());
        const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        db2.prepare(`
          INSERT INTO activity_log (id, sync_request_id, file_path, action, status, message, timestamp)
          VALUES (?, ?, ?, ?, 'PENDING', ?, ?)
        `).run(
          logId,
          req.id,
          relativePath,
          action,
          `Queued ${action.toLowerCase()} job for synchronization.`,
          (/* @__PURE__ */ new Date()).toISOString()
        );
        SyncService.processQueueForRequest(req.id).catch(console.error);
      } catch (err) {
        console.error("[FolderWatcherService] Failed to queue sync job:", err);
      }
    };
    watcher.on("add", (filePath) => queueJob("CREATE", filePath)).on("change", (filePath) => queueJob("UPDATE", filePath)).on("unlink", (filePath) => queueJob("DELETE", filePath)).on("error", (error) => console.error(`[FolderWatcherService] Watcher error for [${req.name}]:`, error));
    this.watchers.set(req.id, watcher);
  }
  static stopWatcher(requestId) {
    const watcher = this.watchers.get(requestId);
    if (watcher) {
      watcher.close();
      this.watchers.delete(requestId);
      console.log(`[FolderWatcherService] Stopped watcher for sync request: ${requestId}`);
    }
  }
  static stopAllWatchers() {
    for (const [id, watcher] of this.watchers.entries()) {
      watcher.close();
    }
    this.watchers.clear();
    console.log("[FolderWatcherService] Stopped all folder watchers.");
  }
};

// electron/services/SyncSchedulerService.ts
var import_node_cron = __toESM(require("node-cron"), 1);
var SyncSchedulerService = class {
  static {
    this.scheduledJobs = /* @__PURE__ */ new Map();
  }
  static initSchedules() {
    console.log("[SyncSchedulerService] Initializing scheduled synchronization pipelines...");
    try {
      const db2 = getDb();
      const requests = db2.prepare("SELECT id, name, schedule, status FROM sync_requests").all();
      this.clearAllSchedules();
      for (const req of requests) {
        if (req.status !== "paused" && req.status !== "failed") {
          this.scheduleRequest(req);
        }
      }
    } catch (err) {
      console.error("[SyncSchedulerService] Failed to initialize schedules:", err);
    }
  }
  static scheduleRequest(req) {
    if (this.scheduledJobs.has(req.id)) {
      this.unscheduleRequest(req.id);
    }
    const cronExp = this.getCronExpression(req.schedule);
    if (!cronExp) {
      console.log(`[SyncSchedulerService] Request [${req.name}] has manual/no schedule configured: ${req.schedule}`);
      return;
    }
    console.log(`[SyncSchedulerService] Scheduling pipeline [${req.name}] with schedule: "${req.schedule}" (${cronExp})`);
    try {
      const job = import_node_cron.default.schedule(cronExp, async () => {
        console.log(`[SyncSchedulerService] Scheduled trigger fired for: [${req.name}]`);
        await SyncService.runSync(req.id);
      });
      this.scheduledJobs.set(req.id, job);
    } catch (err) {
      console.error(`[SyncSchedulerService] Failed to schedule pipeline [${req.name}]:`, err);
    }
  }
  static unscheduleRequest(requestId) {
    const job = this.scheduledJobs.get(requestId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(requestId);
      console.log(`[SyncSchedulerService] Cancelled scheduled job for pipeline: ${requestId}`);
    }
  }
  static clearAllSchedules() {
    for (const [id, job] of this.scheduledJobs.entries()) {
      job.stop();
    }
    this.scheduledJobs.clear();
    console.log("[SyncSchedulerService] Cleared all scheduled cron instances.");
  }
  // Convert human-readable client settings schedule into cron syntax
  static getCronExpression(scheduleStr) {
    if (!scheduleStr) return null;
    const lower = scheduleStr.toLowerCase();
    if (lower.includes("30 minutes")) {
      return "*/30 * * * *";
    }
    if (lower.includes("6 hours")) {
      return "0 */6 * * *";
    }
    if (lower.includes("12 hours")) {
      return "0 */12 * * *";
    }
    if (lower.includes("daily") && lower.includes("02:00 am")) {
      return "0 2 * * *";
    }
    if (lower.includes("weekly") || lower.includes("sunday")) {
      return "0 0 * * 0";
    }
    if (lower.includes("every hour")) {
      return "0 * * * *";
    }
    return null;
  }
};

// electron/main.ts
var envPath = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
import_dotenv.default.config({ path: path6.resolve(process.cwd(), envPath) });
import_dotenv.default.config();
import_electron2.app.name = "DevSync";
var actualDirName = __dirname;
var mainWindow = null;
var tray = null;
function createWindow() {
  const isDev = process.env.NODE_ENV !== "production";
  mainWindow = new import_electron2.BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    title: "DevSync",
    titleBarStyle: "hidden",
    titleBarOverlay: process.platform === "win32" ? {
      color: "#06070A",
      symbolColor: "#ffffff",
      height: 32
    } : false,
    webPreferences: {
      preload: path6.join(actualDirName, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile(path6.join(actualDirName, "../dist/index.html"));
  }
  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
function createTray() {
  const trayIcon = import_electron2.nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVR42mNkHPjfz4AEYGTYyYBMgK4eG6C7BhsgmgbYkB6NYEA0g6GBAV0uGMDmgg8AAPmDFXm0eC0YAAAAAElFTkSuQmCC"
  );
  tray = new import_electron2.Tray(trayIcon);
  const contextMenu = import_electron2.Menu.buildFromTemplate([
    {
      label: "Launch DevSync Control Dashboard",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      }
    },
    {
      label: "Trigger Sync on All Pipelines",
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send("sync-triggered", "all");
          new import_electron2.Notification({
            title: "DevSync Tray Action",
            body: "Manual synchronization request broadcasted to all active pipelines."
          }).show();
        }
      }
    },
    { type: "separator" },
    {
      label: "Exit Application",
      click: () => {
        import_electron2.app.quit();
      }
    }
  ]);
  tray.setToolTip("DevSync Background Daemon Active");
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
}
function setupIpcHandlers() {
  import_electron2.ipcMain.handle("select-directory", async () => {
    if (!mainWindow) return null;
    const result = await import_electron2.dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory", "createDirectory"],
      title: "Select Sync Folder Node"
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });
  import_electron2.ipcMain.on("show-notification", (_event, { title, message }) => {
    if (import_electron2.Notification.isSupported()) {
      new import_electron2.Notification({ title, body: message }).show();
    }
  });
  import_electron2.ipcMain.handle("get-auto-start", () => {
    return import_electron2.app.getLoginItemSettings().openAtLogin;
  });
  import_electron2.ipcMain.handle("set-auto-start", (_event, enabled) => {
    import_electron2.app.setLoginItemSettings({
      openAtLogin: enabled,
      path: process.execPath
    });
    return import_electron2.app.getLoginItemSettings().openAtLogin;
  });
  import_electron2.ipcMain.handle("auth:register", async (_event, { email, password }) => {
    return await AuthService.register(email, password);
  });
  import_electron2.ipcMain.handle("auth:login", async (_event, { email, password }) => {
    return await AuthService.login(email, password);
  });
  import_electron2.ipcMain.handle("auth:logout", async () => {
    await AuthService.logout();
    return true;
  });
  import_electron2.ipcMain.handle("auth:getSession", () => {
    return AuthService.getSession();
  });
  import_electron2.ipcMain.handle("connection:create", async (_event, { tenantName, provider }) => {
    return await TenantService.createTenant(tenantName, provider);
  });
  import_electron2.ipcMain.handle("connection:getActive", () => {
    return TenantService.getActiveTenant();
  });
  import_electron2.ipcMain.handle("connection:verifyAws", async (_event, { tenantId, accessKey, secretKey, region }) => {
    return await AwsService.verifyConnection(tenantId, accessKey, secretKey, region);
  });
  import_electron2.ipcMain.handle("operations:aws:listBuckets", async (_event, tenantId) => {
    return await AwsService.listBuckets(tenantId);
  });
  import_electron2.ipcMain.handle("operations:aws:createBucket", async (_event, { tenantId, bucketName }) => {
    await AwsService.createBucket(tenantId, bucketName);
    return true;
  });
  import_electron2.ipcMain.handle("connection:getGdriveAuthUrl", async (_event, tenantId) => {
    return await GoogleDriveService.getAuthUrl(tenantId);
  });
  import_electron2.ipcMain.handle("operations:gdrive:listFolders", async (_event, { tenantId, folderId }) => {
    return await GoogleDriveService.listFolders(tenantId, folderId);
  });
  import_electron2.ipcMain.handle("operations:gdrive:createFolder", async (_event, { tenantId, folderName, parentFolderId }) => {
    return await GoogleDriveService.createFolder(tenantId, folderName, parentFolderId);
  });
  import_electron2.ipcMain.handle("db-get-sync-requests", () => {
    const db2 = getDb();
    try {
      return db2.prepare("SELECT * FROM sync_requests").all();
    } catch (err) {
      console.error("db-get-sync-requests error:", err);
      return [];
    }
  });
  import_electron2.ipcMain.handle("db-save-sync-request", (_event, req) => {
    const db2 = getDb();
    try {
      const stmt = db2.prepare(`
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
        req.lastSync || "",
        req.schedule || "",
        req.description || "",
        req.tenantId || null,
        req.bucketName || null,
        req.folderId || null
      );
      FolderWatcherService.startWatcher(req);
      SyncSchedulerService.scheduleRequest(req);
      return true;
    } catch (err) {
      console.error("db-save-sync-request error:", err);
      return false;
    }
  });
  import_electron2.ipcMain.handle("db-delete-sync-request", (_event, id) => {
    const db2 = getDb();
    try {
      db2.prepare("DELETE FROM sync_requests WHERE id = ?").run(id);
      FolderWatcherService.stopWatcher(id);
      SyncSchedulerService.unscheduleRequest(id);
      return true;
    } catch (err) {
      console.error("db-delete-sync-request error:", err);
      return false;
    }
  });
  import_electron2.ipcMain.handle("db-update-sync-request-paths", (_event, { id, localPath, remoteFolder }) => {
    const db2 = getDb();
    try {
      db2.prepare("UPDATE sync_requests SET localPath = ?, remoteFolder = ? WHERE id = ?").run(localPath, remoteFolder, id);
      const req = db2.prepare("SELECT * FROM sync_requests WHERE id = ?").get(id);
      if (req) {
        FolderWatcherService.startWatcher(req);
      }
      return true;
    } catch (err) {
      console.error("db-update-sync-request-paths error:", err);
      return false;
    }
  });
  import_electron2.ipcMain.handle("db-update-sync-request-status", (_event, { id, status }) => {
    const db2 = getDb();
    try {
      db2.prepare("UPDATE sync_requests SET status = ? WHERE id = ?").run(status, id);
      const req = db2.prepare("SELECT * FROM sync_requests WHERE id = ?").get(id);
      if (req) {
        if (status === "paused") {
          FolderWatcherService.stopWatcher(id);
          SyncSchedulerService.unscheduleRequest(id);
        } else {
          FolderWatcherService.startWatcher(req);
          SyncSchedulerService.scheduleRequest(req);
        }
      }
      return true;
    } catch (err) {
      console.error("db-update-sync-request-status error:", err);
      return false;
    }
  });
  import_electron2.ipcMain.handle("sync:triggerSync", async (_event, requestId) => {
    return await SyncService.runSync(requestId);
  });
  import_electron2.ipcMain.handle("sync:previewChanges", async (_event, requestId) => {
    return await SyncService.previewChanges(requestId);
  });
  import_electron2.ipcMain.handle("sync:getQueue", (_event, requestId) => {
    const db2 = getDb();
    try {
      if (requestId) {
        return db2.prepare("SELECT * FROM sync_queue WHERE sync_request_id = ? ORDER BY created_at DESC").all(requestId);
      }
      return db2.prepare("SELECT * FROM sync_queue ORDER BY created_at DESC LIMIT 100").all();
    } catch (err) {
      console.error("sync:getQueue error:", err);
      return [];
    }
  });
  import_electron2.ipcMain.handle("sync:getActivityLog", (_event, requestId) => {
    const db2 = getDb();
    try {
      if (requestId) {
        return db2.prepare("SELECT * FROM activity_log WHERE sync_request_id = ? ORDER BY timestamp DESC").all(requestId);
      }
      return db2.prepare("SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 200").all();
    } catch (err) {
      console.error("sync:getActivityLog error:", err);
      return [];
    }
  });
  import_electron2.ipcMain.handle("settings:get", (_event, { key, defaultValue }) => {
    return getSetting(key, defaultValue);
  });
  import_electron2.ipcMain.handle("settings:set", (_event, { key, value }) => {
    setSetting(key, value);
    return true;
  });
}
import_electron2.app.whenReady().then(() => {
  initDatabase();
  setupIpcHandlers();
  FolderWatcherService.initWatchers();
  SyncSchedulerService.initSchedules();
  createWindow();
  try {
    createTray();
  } catch (err) {
    console.warn("System tray creation failed, running headless tray:", err);
  }
  import_electron2.app.on("activate", () => {
    if (import_electron2.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
import_electron2.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron2.app.quit();
  }
});
