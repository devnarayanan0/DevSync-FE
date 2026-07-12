# DevSync: Architecture & Backend API Endpoints Guide

This document explains the onboarding UI behavior of the DevSync application and provides a comprehensive mapping of every UI action/button, its Electron IPC invocation, internal service routing, and the corresponding Spring Boot REST API endpoints called.

---

## 1. Why is the UI directly going to the "Create Your First Sync Request" wizard?

In the application's root component (`src/App.tsx`), state-based routing is used to determine which view is rendered. The specific check happens right after checking the user's login state:

```typescript
// Located in src/App.tsx (Lines 508-517)
if (syncRequests.length === 0) {
  return (
    <FirstSyncWizard
      theme={theme}
      onThemeToggle={handleToggleTheme}
      onWizardComplete={handleWizardComplete}
      userEmail={userProfile.email}
    />
  );
}
```

### Root Cause & Flow:
1. **Onboarding Constraint**: If there are zero configured sync pipelines (`syncRequests.length === 0`), the application forces the onboarding/setup wizard (`FirstSyncWizard`) so that a new user isn't shown an empty or inactive dashboard.
2. **Local DB & Cache Initialization**: Upon the very first boot, or after selecting the **"Hard-Reset System"** action in Settings, the local SQLite database table (`sync_requests`) and `localStorage` cache are completely empty.
3. **Transition to Desktop View**: As soon as the wizard is completed and a sync request is successfully registered, `syncRequests` is populated with at least one configuration. This passes the guard condition and displays the primary full-screen Desktop Dashboard layout.

---

## 2. Global Integration & Endpoints Mapping

The DevSync desktop application utilizes a split-architecture:
- **Frontend Renderer**: A highly responsive React SPA running inside Vite.
- **Electron Main Process**: A Node.js backend acting as a secure wrapper. It manages a local SQLite instance for configuration tracking, directory file-system watching, and issues network requests to the gateway.
- **Spring Boot Gateway**: Located at `http://localhost:8080` (or `SPRING_BOOT_API_URL`), handling heavy-lifting cloud SDK operations for AWS S3 and Google Workspace.

---

### I. User Session & Authentication Management

Managed by `AuthService` (`/electron/services/AuthService.ts`) and triggered via `src/components/LoginPage.tsx`.

| UI Button / Action | Electron Wrapper Function | Electron IPC Channel | Service Routing & Logic | Spring Boot REST Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **"Create Account" (Register)** | `authRegister(email, password)` | `auth:register` | `AuthService.register()` | `POST /api/auth/register` <br> *Payload: `{ "email": "...", "password": "..." }`* |
| **"Access Environment" (Login)** | `authLogin(email, password)` | `auth:login` | `AuthService.login()` | `POST /api/auth/login` <br> *Payload: `{ "email": "...", "password": "..." }`* |
| **"Terminate Session" (Logout)** | `authLogout()` | `auth:logout` | `AuthService.logout()` | *No backend endpoint.* Clears the JWT session token and tenant settings from the local SQLite settings. |

---

### II. Onboarding & Connection Setup

Managed by `TenantService` (`/electron/services/TenantService.ts`) during initial cloud gateway attachment.

| UI Button / Action | Electron Wrapper Function | Electron IPC Channel | Service Routing & Logic | Spring Boot REST Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **"Establish Connection" (Choose S3/GDrive)** | `tenantCreate(name, provider)` | `tenant:create` | `TenantService.createTenant()` | `POST /api/connection/create` <br> *Payload: `{ "tenantName": "...", "provider": "..." }`* |

---

### III. AWS S3 Storage Pipeline Operations

Managed by `AwsService` (`/electron/services/AwsService.ts`) for managing S3 buckets and credentials.

| UI Button / Action | Electron Wrapper Function | Electron IPC Channel | Service Routing & Logic | Spring Boot REST Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **"Verify Credentials"** | `awsVerify(...)` | `aws:verify` | `AwsService.verifyConnection()` | `POST /api/connection/aws/{tenantId}/verify` <br> *Payload: `{ "accessKey": "...", "secretKey": "...", "region": "..." }`* |
| **S3 Buckets List Query** | `awsListBuckets(tenantId)` | `aws:listBuckets` | `AwsService.listBuckets()` | `GET /api/operations/aws/buckets/{tenantId}` |
| **"Create S3 Bucket" (Modal)** | `awsCreateBucket(...)` | `aws:createBucket` | `AwsService.createBucket()` | `POST /api/operations/aws/buckets/createB` <br> *Payload: `{ "tenantId": "...", "bucketName": "..." }`* |

---

### IV. Google Drive Storage Pipeline Operations

Managed by `GoogleDriveService` (`/electron/services/GoogleDriveService.ts`) for Google Workspace OAuth and folder structures.

| UI Button / Action | Electron Wrapper Function | Electron IPC Channel | Service Routing & Logic | Spring Boot REST Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **"Connect with Google" (OAuth URL)** | `gdriveGetAuthUrl(tenantId)` | `gdrive:getAuthUrl` | `GoogleDriveService.getAuthUrl()` | `GET /api/connection/gcp/{tenantId}/auth` |
| **Retrieve Google Drive Folders** | `gdriveListFolders(...)` | `gdrive:listFolders` | `GoogleDriveService.listFolders()` | `GET /api/operations/gdrive/folder/{tenantId}/{folderId?}` |
| **"Create New Folder" (Dialog)** | `gdriveCreateFolder(...)` | `gdrive:createFolder` | `GoogleDriveService.createFolder()` | `POST /api/operations/gdrive/folder/create` <br> *Payload: `{ "tenantId": "...", "folderName": "...", "parentFolderId": "..." }`* |

---

### V. Bilateral Sync Execution ("Sync Request Now" Pipeline State)

When a user clicks the **"Sync Now"** button (or when an automated chronos schedule triggers), the app calls `syncTriggerNow(requestId)` (`src/lib/electron.ts`).

- **Electron IPC Invocation**: `ipcRenderer.invoke('sync:triggerSync', requestId)`
- **Electron Main Handler**: Triggers `SyncService.runSync(requestId)` in `/electron/services/SyncService.ts`.

#### Step-by-Step Execution Flow & REST Endpoints:

1. **Remote Directory Metadata Gathering**  
   To evaluate what needs uploading/downloading, the service scans the remote target:
   * **For AWS S3 Pipelines**: Calls `AwsService.scanFolderMetadata(...)`  
     * **REST Endpoint**: `POST /api/operations/aws/statusF`  
     * *Payload: `{ "tenantId": "...", "bucketName": "...", "folderName": "..." }`*
   * **For Google Drive Pipelines**: Calls `GoogleDriveService.scanFolderMetadata(...)`  
     * **REST Endpoint**: `GET /api/operations/gdrive/folder/status/{tenantId}/{folderId}`

2. **File Synchronization Comparison (Latest Modified Wins)**  
   The synchronization engine compares local and remote file metadata, deciding on the action:
   
   * **A. Execute Upload (Local file is newer, or remote file is missing)**
     * **S3 Endpoints**: `POST /api/operations/aws/upload` (Multipart Form Payload containing target file buffer, `tenantId`, `bucketName`, and target normalized `folderName`)
     * **GDrive Endpoints**: `POST /api/operations/gdrive/upload` (Multipart Form Payload containing target file buffer, `tenantId`, and target `folderId`)
     
   * **B. Execute Download (Remote file is newer, or local file is missing)**
     * **S3 Endpoints**: `POST /api/operations/aws/download`  
       * *Payload: `{ "tenantId": "...", "bucketName": "...", "folderName": "...", "fileName": "..." }`*
       * *Response: ArrayBuffer written directly to local file system.*
     * **GDrive Endpoints**: `GET /api/operations/gdrive/download/{tenantId}/{fileId}`  
       * *Response: Stream written directly to local file system.*

   * **C. Execute Deletion (Pruning mismatch or deleted files)**
     * **S3 Endpoints**: `DELETE /api/operations/aws/delete`  
       * *Payload: `{ "tenantId": "...", "bucketName": "...", "folderName": "...", "fileName": "..." }`*
     * **GDrive Endpoints**: `DELETE /api/operations/gdrive/delete/{tenantId}/{fileId}`

---

### VI. Local Database Storage Operations

These actions manage persistent pipeline state in the **local SQLite DB** on the desktop, not hitting the Spring Boot backend directly.

| Action Triggered | Electron Wrapper Function | Electron IPC Channel | Local Database Behavior |
| :--- | :--- | :--- | :--- |
| **Load Sync Pipelines** | `getSyncRequests()` | `db:getSyncRequests` | `SELECT * FROM sync_requests` |
| **Save/Register Pipeline** | `saveSyncRequest(request)` | `db:saveSyncRequest` | `INSERT OR REPLACE INTO sync_requests ...` |
| **Delete Pipeline** | `deleteSyncRequest(id)` | `db:deleteSyncRequest` | `DELETE FROM sync_requests WHERE id = ?` |
| **Update Local/Remote Paths** | `updateSyncRequestPaths(...)` | `db:updateSyncRequestPaths` | `UPDATE sync_requests SET localPath = ?, remoteFolder = ?` |
| **Update Current Status** | `updateSyncRequestStatus(...)` | `db:updateSyncRequestStatus` | `UPDATE sync_requests SET status = ?` |
| **Query Sync Queue** | `syncGetQueue(requestId?)` | `sync:getQueue` | `SELECT * FROM sync_queue WHERE sync_request_id = ?` |
| **Query Activity Logs** | `syncGetActivityLog(requestId?)` | `sync:getActivityLog` | `SELECT * FROM activity_log WHERE sync_request_id = ?` |
