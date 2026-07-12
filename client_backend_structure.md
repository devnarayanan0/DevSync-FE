# DevSync Client Backend Architecture

This document describes the end-to-end structure of the **DevSync Client Backend** (running inside Electron) and how it handles everything from UI interactions to synchronization pipelines, local database management, and remote API calls.

## Overview of the Client Architecture

The DevSync client is not just a thin UI. It acts as an autonomous agent running on the user's local machine, responsible for indexing files, scheduling syncs, and communicating with the centralized Spring Boot API Gateway.

The backend consists of **4 main layers**:
1. **React Renderer (UI)**: The visual dashboard in the browser/Electron window.
2. **Preload Script (`electron/preload.ts`)**: The secure IPC bridge connecting the React frontend to the Node.js backend.
3. **Electron Main Process (`electron/main.ts`)**: The orchestrator that registers IPC handlers and routes commands to services.
4. **Service Engine (`electron/services/`)**: The core business logic modules (Syncing, DB, Networking, Watchers).

---

## 1. Local Database Structure (SQLite)

The client maintains an embedded SQLite database (`devsync.db`) stored in the application's `userData` folder. This ensures the app can queue changes, track file metadata, and operate offline or between sessions.

The database is initialized by **`DatabaseService.ts`** and contains the following tables:

*   **`sync_requests`**: Stores all the user's sync pipelines.
    *   *Columns*: `id`, `name`, `provider` (AWS/GDRIVE), `status`, `localPath`, `remoteFolder`, `tenantId`, `bucketName`, `folderId`, `schedule`, `lastSync`, `description`.
*   **`file_metadata`**: A local cache of remote file states. Used to quickly compare local file modification times against the remote server to determine if an upload/download is needed without always querying the remote API.
    *   *Columns*: `sync_request_id`, `relative_path`, `size`, `last_modified`, `synced_at`.
*   **`sync_queue`**: Stores the queue of individual file operations (CREATE, UPDATE, DELETE). This allows the engine to retry failed uploads/downloads seamlessly.
    *   *Columns*: `id`, `sync_request_id`, `relative_path`, `action`, `status`, `attempts`, `error`, `created_at`.
*   **`activity_log`**: Records granular historical logs (e.g., "Uploaded file.txt", "Download failed").
    *   *Columns*: `id`, `sync_request_id`, `file_path`, `action`, `status`, `message`, `timestamp`.
*   **`settings`**: A generic key-value store for user preferences and internal config.

---

## 2. End-to-End Flow: Creating and Running a Sync Request

Here is the exact lifecycle of a Sync Request through the Client Backend layers.

### Step 1: React Initiates Creation
The user fills out the "Create Sync Request" wizard in React.
React calls a function in `src/lib/electron.ts`, which invokes the IPC bridge:
```typescript
window.electronAPI.dbSaveSyncRequest(req);
```

### Step 2: Preload Script Bridges the Gap
`electron/preload.ts` forwards the request securely to the Main process:
```typescript
dbSaveSyncRequest: (request: any) => ipcRenderer.invoke('db-save-sync-request', request),
```

### Step 3: Main Process Handles the IPC Call
`electron/main.ts` listens for the channel, extracts the data, and interacts with SQLite:
```typescript
ipcMain.handle('db-save-sync-request', (_event, request) => {
  const db = getDb(); // from DatabaseService
  // SQL INSERT INTO sync_requests ...
});
```

### Step 4: React Triggers the Sync
The user clicks "Sync Now". React calls `window.electronAPI.syncTriggerNow(req.id)`.

### Step 5: `SyncService` Executes the Engine Workflow
The Main process passes the ID to `SyncService.runSync(requestId)`. `SyncService` performs the following heavy lifting:

1.  **Read Config**: Pulls the sync request config (`localPath`, `tenantId`, `provider`) from SQLite.
2.  **Local Scan**: Scans the user's local directory using Node.js `fs` module to build a map of local files.
3.  **Remote Scan**: Calls `AwsService` or `GoogleDriveService`, which use `ApiClient.ts` (Axios) to make REST HTTP requests to the centralized Spring Boot API to fetch the remote file tree.
4.  **Compare**: Compares local file timestamps/sizes with remote timestamps to determine `uploads`, `downloads`, and `deletions`.
5.  **Execute (Upload/Download)**:
    *   *Uploads*: Uses `fs.createReadStream()` to stream the file to the Spring Boot REST API (`ApiClient.uploadFile`).
    *   *Downloads*: Uses `ApiClient.downloadFile` to fetch the file buffer from Spring Boot and writes it to the local disk using `fs.promises.writeFile()`.
6.  **Log & Update**: Writes success/failure to the local `activity_log` SQLite table and updates the `sync_requests` last sync time.

---

## 3. The Services Layer (`electron/services/`)

The backend is modularized into specialized services.

*   **`SyncService.ts`**: The brain of the operation. Handles the local-to-remote comparison logic, orchestrates uploads/downloads, and manages the sync request lifecycle. Also provides a `previewChanges` method (like GitHub Desktop) to show users what will change before they sync.
*   **`FolderWatcherService.ts`**: Uses `chokidar` (or Node `fs.watch`) to actively monitor local directories defined in the sync requests for real-time changes (auto-sync).
*   **`SyncSchedulerService.ts`**: A background cron-like service that wakes up periodically (e.g., every hour) to trigger `SyncService.runSync` for pipelines that have automatic scheduling enabled.
*   **`ApiClient.ts`**: A standardized Axios instance configured to point to the Spring Boot API (`API_BASE_URL`). It automatically injects the JWT auth token (read from SQLite settings) into all outgoing HTTP requests.
*   **`AwsService.ts` & `GoogleDriveService.ts`**: Provider-specific wrappers around `ApiClient`. They format the HTTP calls required to list buckets/folders, upload, and download from the respective Spring Boot proxy endpoints.
*   **`AuthService.ts` & `TenantService.ts`**: Manage login, registration, tenant creation, and secure JWT storage in the local SQLite database.

## 4. Why this Architecture?

1.  **Offline Capability**: By storing the queue and metadata in SQLite, the client can queue uploads while offline and execute them when the network returns.
2.  **Security**: The Electron Node.js backend handles all direct file system access and HTTP networking. The React frontend is completely isolated and cannot touch the local disk directly, preventing XSS attacks from compromising local files.
3.  **Performance**: Scanning thousands of local files and generating metadata hashes is CPU-intensive. Moving this to the Electron Main process (and potentially child worker threads) keeps the React UI smooth and responsive.
