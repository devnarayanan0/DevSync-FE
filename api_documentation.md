# DevSync: Full-Stack Architecture, Endpoints & DTO Specification Manual

This manual serves as the master specification for the **DevSync Desktop Synchronization Ecosystem**. It maps the **React SPA Frontend Interface**, the **Electron Native Backend Host**, the local **SQLite Database Pipeline State**, and the **Spring Boot Cloud Gateway REST API** together with exact **Data Transfer Objects (DTOs)**.

---

## 1. Onboarding Flow & Component Routing Guide

### Why does the UI boot directly to the "Create Your First Sync Request" Wizard?

When the application launches, the root component (`/src/App.tsx`) evaluates the user session and local configuration cache. It employs a **strict guard condition** to prevent an empty, inactive dashboard from confusing new users.

```typescript
// Location: /src/App.tsx
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

#### Detailed Startup Execution Flow:
1. **Session Authorization Check**: The system queries `authGetSession()` to check if a JWT is present in local cache or native secure storage.
2. **Metadata Recovery**: If authenticated, it fires `getSyncRequests()` to load configured active synchronization pipelines from the local database.
3. **Wizard Interception**: If the SQLite `sync_requests` table returns **zero records** (which occurs on initial install, new accounts, or after choosing **"Hard-Reset System"** in Settings), the guard is triggered. The user is redirected to the `/src/components/FirstSyncWizard.tsx` component.
4. **Dashboard Transition**: Once the user completes the stepper and registers at least one sync request, the `syncRequests` state is updated (`length > 0`). The guard passes, immediately displaying the full **Desktop Dashboard** with active grid widgets, queue visualizations, and telemetry monitors.

---

## 2. Integrated Endpoint & DTO Directory

This section contains the comprehensive data dictionary and connection matrix for every Spring Boot REST endpoint consumed by the DevSync Electron wrapper. 

*All requests targeting protected endpoints (`Access: Protected`) must include a signed JSON Web Token (JWT) in the standard HTTP request headers:*
```http
Authorization: Bearer <token-string>
```

---

### I. User Session & Authentication Management (`/api/auth/*`)

These endpoints handle secure user signup, verify credential matching, and issue signed authentication tokens.

#### 1.1 Account Registration
* **Endpoint:** `/api/auth/register`
* **Method:** `POST`
* **Access:** Public
* **Request Content-Type:** `application/json`
* **Electron Wrapper Function:** `authRegister(email, password)` in `/src/lib/electron.ts`
* **Electron Service Route:** `AuthService.register(email, password)` in `/electron/services/AuthService.ts`

##### Request JSON Schema
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
| Field Name | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | **Yes** | The user's primary email address (must be format-valid). |
| `password` | `string` | **Yes** | Clear-text password string. Minimum length of 8 characters. |

##### Response JSON Schema (HTTP 200 OK / 201 Created)
```json
true
```

---

#### 1.2 Account Login
* **Endpoint:** `/api/auth/login`
* **Method:** `POST`
* **Access:** Public
* **Request Content-Type:** `application/json`
* **Electron Wrapper Function:** `authLogin(email, password)` in `/src/lib/electron.ts`
* **Electron Service Route:** `AuthService.login(email, password)` in `/electron/services/AuthService.ts`

##### Request DTO Schema (`LoginRequestDTO`)
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
| Field Name | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | **Yes** | Registered email address. |
| `password` | `string` | **Yes** | Account password. |

##### Response DTO Schema (`LoginResponseDTO` - HTTP 200 OK)
```json
{
  "id": "e4a2c510-72bd-419b-a010-8bda9f87de92",
  "email": "user@example.com",
  "role": "ROLE_TENANT_ADMIN",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOi..."
}
```
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` (UUID) | The unique database account identifier assigned to the user. |
| `email` | `string` | Echoed user email address. |
| `role` | `string` | System privilege level (e.g. `"ROLE_TENANT_ADMIN"` or `"ROLE_USER"`). |
| `token` | `string` (JWT) | Crytographically signed security token to be included in subsequent Bearer requests. |

---

### II. Connection & Multi-Tenant Administration (`/api/connection/*`)

Manages client onboarding connections, mapping localized setups into multi-tenant gateway divisions.

#### 2.1 Create Cloud Connection (Tenant)
* **Endpoint:** `/api/connection/create`
* **Method:** `POST`
* **Access:** Protected (JWT Required)
* **Request Content-Type:** `application/json`
* **Electron Wrapper Function:** `tenantCreate(tenantName, provider)` in `/src/lib/electron.ts`
* **Electron Service Route:** `TenantService.createTenant(tenantName, provider)` in `/electron/services/TenantService.ts`

##### Request DTO Schema (`TenantRequestDTO`)
```json
{
  "tenantName": "Engineering Backup Group",
  "provider": "AWS"
}
```
| Field Name | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `tenantName` | `string` | **Yes** | Logical, user-facing label for the tenant connection group. |
| `provider` | `string` | **Yes** | Target cloud platform. Supported values: `"AWS"` or `"GDRIVE"`. |

##### Response DTO Schema (`TenantResponseDTO` - HTTP 201 Created)
```json
{
  "tenantId": "c0fb298a-bd17-48f1-a18a-928abf1092a7",
  "tenantName": "Engineering Backup Group",
  "provider": "AWS",
  "status": "INITIALIZED"
}
```
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` (UUID) | Unique multi-tenant key mapped on the cloud gateway database. |
| `tenantName` | `string` | Mapped tenant group name. |
| `provider` | `string` | Mapped backing cloud provider. |
| `status` | `string` | Initialization state descriptor (e.g., `"INITIALIZED"`). |

---

#### 2.2 Verify AWS Connection Keys
* **Endpoint:** `/api/connection/aws/{tenantId}/verify`
* **Method:** `POST`
* **Access:** Protected (JWT Required)
* **Path Parameters:**
  * `tenantId` (UUID) - Target AWS tenant node.
* **Request Content-Type:** `application/json`
* **Electron Wrapper Function:** `awsVerify(tenantId, accessKey, secretKey, region)` in `/src/lib/electron.ts`
* **Electron Service Route:** `AwsService.verifyConnection(tenantId, accessKey, secretKey, region)` in `/electron/services/AwsService.ts`

##### Request DTO Schema (`VerifyAWSRequestDTO`)
```json
{
  "accessKey": "AKIAIOSFODNN7EXAMPLE",
  "secretKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "region": "us-east-1"
}
```
| Field Name | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `accessKey` | `string` | **Yes** | AWS S3 programmatic Access Key ID. |
| `secretKey` | `string` | **Yes** | AWS S3 programmatic Secret Access Key. |
| `region` | `string` | **Yes** | Mapped S3 bucket region (e.g. `"us-east-1"`, `"ap-southeast-1"`). |

##### Response DTO Schema (`VerifyAWSResponseDTO` - HTTP 200 OK)
```json
{
  "tenantId": "c0fb298a-bd17-48f1-a18a-928abf1092a7",
  "status": "VERIFIED",
  "accountId": "123456789012",
  "identityName": "DevSyncAgentNode",
  "iamArn": "arn:aws:iam::123456789012:user/DevSyncAgentNode",
  "buckets": [
    "devsync-cold-storage",
    "assets-bucket-prod"
  ]
}
```
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `tenantId` | `string` (UUID) |Mating ID matching the target tenant path node. |
| `status` | `string` | Verification code (e.g. `"VERIFIED"` or `"FAILED"`). |
| `accountId` | `string` | 12-digit AWS numeric account owner indicator. |
| `identityName` | `string` | Derived S3 programmatic user identity descriptor. |
| `iamArn` | `string` | Verified Amazon Resource Name (ARN) of the caller identity. |
| `buckets` | `array of strings` | List of S3 Bucket names active and reachable under these keys. |

---

#### 2.3 Get Google Drive OAuth Authorization URL
* **Endpoint:** `/api/connection/gcp/{tenantId}/auth`
* **Method:** `GET`
* **Access:** Protected (JWT Required)
* **Path Parameters:**
  * `tenantId` (UUID) - Target GCP-connected tenant node.
* **Electron Wrapper Function:** `gdriveGetAuthUrl(tenantId)` in `/src/lib/electron.ts`
* **Electron Service Route:** `GoogleDriveService.getAuthUrl(tenantId)` in `/electron/services/GoogleDriveService.ts`

##### Request JSON Schema
None (HTTP GET request)

##### Response DTO Schema (`GDriveAuthResponseDTO` - HTTP 200 OK)
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
}
```
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `authUrl` | `string` | Google OAuth consent link for authorization code generation. |

---

### III. AWS S3 Storage Pipeline Operations (`/api/operations/aws/*`)

Secure operations proxying files and bucket actions directly to Amazon Web Services.

#### 3.1 List AWS Buckets
* **Endpoint:** `/api/operations/aws/buckets/{tenantId}`
* **Method:** `GET`
* **Access:** Protected (JWT Required)
* **Path Parameters:**
  * `tenantId` (UUID) - Target AWS tenant node.
* **Electron Wrapper Function:** `awsListBuckets(tenantId)` in `/src/lib/electron.ts`
* **Electron Service Route:** `AwsService.listBuckets(tenantId)` in `/electron/services/AwsService.ts`

##### Response DTO Schema (`AWSBucketsResponseDTO[]` - HTTP 200 OK)
```json
[
  {
    "bucketName": "devsync-cold-storage",
    "creationDate": "2026-06-22T14:10:00Z"
  }
]
```
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `bucketName` | `string` | Global S3 bucket name. |
| `creationDate` | `string` | ISO 8601 UTC creation date. |

---

#### 3.2 Create AWS Bucket
* **Endpoint:** `/api/operations/aws/buckets/createB`
* **Method:** `POST`
* **Access:** Protected (JWT Required)
* **Request Content-Type:** `application/json`
* **Electron Wrapper Function:** `awsCreateBucket(tenantId, bucketName)` in `/src/lib/electron.ts`
* **Electron Service Route:** `AwsService.createBucket(tenantId, bucketName)` in `/electron/services/AwsService.ts`

##### Request JSON Schema
```json
{
  "tenantId": "c0fb298a-bd17-48f1-a18a-928abf1092a7",
  "bucketName": "new-engineering-data-bucket"
}
```
| Field Name | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `tenantId` | `string` | **Yes** | AWS tenant UUID mapping. |
| `bucketName` | `string` | **Yes** | Globally unique new bucket name compliant with S3 standards. |

##### Response Schema (HTTP 204 No Content / 200 OK)
Empty body represents a successful bucket build.

---

#### 3.3 Upload File to AWS S3
* **Endpoint:** `/api/operations/aws/upload`
* **Method:** `POST`
* **Access:** Protected (JWT Required)
* **Request Content-Type:** `multipart/form-data`
* **Invoked By:** `SyncService.runSync()` during binary uploads when a local asset is newer or missing remotely.

##### Multipart/Form Data Payload Specs
* `tenantId`: `"c0fb298a-bd17-48f1-a18a-928abf1092a7"` (string)
* `bucketName`: `"devsync-cold-storage"` (string)
* `folderName`: `"backups/engineering"` (string, virtual path mapping prefix)
* `file`: (Binary multi-part stream representing the payload)

##### Response DTO Schema (`AWSUploadResponseDTO` - HTTP 200 OK)
```json
{
  "fileName": "annual_summary.pdf",
  "status": "SUCCESS",
  "message": "Successfully uploaded to S3 bucket backups/engineering/annual_summary.pdf"
}
```
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `fileName` | `string` | File item uploaded. |
| `status` | `string` | Upload status (`"SUCCESS"` or `"FAILED"`). |
| `message` | `string` | Cloud response log message. |

---

#### 3.4 Download File from AWS S3
* **Endpoint:** `/api/operations/aws/download`
* **Method:** `POST`
* **Access:** Protected (JWT Required)
* **Request Content-Type:** `application/json`
* **Invoked By:** `SyncService.runSync()` when a remote asset is newer or missing locally.

##### Request JSON Schema
```json
{
  "tenantId": "c0fb298a-bd17-48f1-a18a-928abf1092a7",
  "bucketName": "devsync-cold-storage",
  "folderName": "backups/engineering",
  "fileName": "annual_summary.pdf"
}
```
| Field Name | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `tenantId` | `string` | **Yes** | Target AWS Tenant UUID. |
| `bucketName` | `string` | **Yes** | Source bucket container. |
| `folderName` | `string` | **Yes** | Bucket relative prefix structure. |
| `fileName` | `string` | **Yes** | Mapped object name. |

##### Response Payload (HTTP 200 OK)
`application/octet-stream` - Mapped direct binary data write stream to write on local workspace storage.

---

#### 3.5 Delete File from AWS S3
* **Endpoint:** `/api/operations/aws/delete`
* **Method:** `DELETE`
* **Access:** Protected (JWT Required)
* **Request Content-Type:** `application/json`
* **Invoked By:** `SyncService.runSync()` when performing bilateral pruning of files.

##### Request DTO Schema (`AWSDeleteRequestDTO`)
```json
{
  "tenantId": "c0fb298a-bd17-48f1-a18a-928abf1092a7",
  "bucketName": "devsync-cold-storage",
  "folderName": "backups/engineering",
  "fileName": "annual_summary.pdf"
}
```
| Field Name | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `tenantId` | `string` | **Yes** | Target AWS Tenant UUID. |
| `bucketName` | `string` | **Yes** | Target S3 bucket context. |
| `folderName` | `string` | **Yes** | Target S3 folder key context. |
| `fileName` | `string` | **Yes** | Object key file to delete. |

##### Response Payload (HTTP 204 No Content)
Empty body represents a successful bucket deletion.

---

#### 3.6 Scan AWS Folder Metadata
* **Endpoint:** `/api/operations/aws/statusF`
* **Method:** `POST`
* **Access:** Protected (JWT Required)
* **Request Content-Type:** `application/json`
* **Invoked By:** `SyncService.runSync()` to index files residing under S3 folder paths.

##### Request JSON Schema
```json
{
  "tenantId": "c0fb298a-bd17-48f1-a18a-928abf1092a7",
  "bucketName": "devsync-cold-storage",
  "folderName": "backups/engineering"
}
```

##### Response JSON Schema (HTTP 200 OK)
An array of nested object descriptors of file structures:
```json
[
  {
    "fileName": "docs/annual_summary.pdf",
    "size": 1576960,
    "lastModified": "2026-06-22T14:10:00.000Z"
  }
]
```
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `fileName` | `string` | S3 path relative to virtual directory requested. |
| `size` | `number` | File size (Bytes). |
| `lastModified` | `string` | ISO 8601 UTC timestamp of S3 storage insertion. |

---

### IV. Google Drive Operations APIs (`/api/operations/gdrive/*`)

Secure operations proxying directory listings, creations, and file updates to Google Drive folders.

#### 4.1 List Google Drive Directories
* **Endpoint:** `/api/operations/gdrive/folder/{tenantId}` or `/api/operations/gdrive/folder/{tenantId}/{folderId}`
* **Method:** `GET`
* **Access:** Protected (JWT Required)
* **Path Parameters:**
  * `tenantId` (UUID) - Mapped GDrive tenant.
  * `folderId` (Optional string) - Target parent folder. Default value of Root directory occurs if omitted.
* **Electron Wrapper Function:** `gdriveListFolders(tenantId, folderId?)` in `/src/lib/electron.ts`
* **Electron Service Route:** `GoogleDriveService.listFolders(tenantId, folderId?)` in `/electron/services/GoogleDriveService.ts`

##### Response DTO Schema (`GDriveFolderDTO[]` - HTTP 200 OK)
```json
[
  {
    "folderId": "0B981fca_engineering_11b",
    "folderName": "Engineering Docs"
  }
]
```
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `folderId` | `string` | Google-assigned unique folder identifier. |
| `folderName` | `string` | Mapped directory folder name on Google Drive. |

---

#### 4.2 Create Google Drive Folder
* **Endpoint:** `/api/operations/gdrive/folder/create`
* **Method:** `POST`
* **Access:** Protected (JWT Required)
* **Request Content-Type:** `application/json`
* **Electron Wrapper Function:** `gdriveCreateFolder(tenantId, folderName, parentFolderId?)` in `/src/lib/electron.ts`
* **Electron Service Route:** `GoogleDriveService.createFolder(tenantId, folderName, parentFolderId?)` in `/electron/services/GoogleDriveService.ts`

##### Request DTO Schema (`GDriveFolderCreateDTO`)
```json
{
  "tenantId": "c0fb298a-bd17-48f1-a18a-928abf1092a7",
  "parentFolderId": "0B981fca_engineering_11b",
  "folderName": "Development Sync Folder"
}
```
| Field Name | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `tenantId` | `string` | **Yes** | Target GDrive tenant UUID. |
| `parentFolderId` | `string` | **Yes** | Parent folder inside Google Drive where insertion occurs. |
| `folderName` | `string` | **Yes** | Human-readable name of the folder. |

##### Response DTO Schema (`GDriveFolderDTO` - HTTP 200 OK)
```json
{
  "folderId": "gdr_fol_881920ac3",
  "folderName": "Development Sync Folder"
}
```

---

#### 4.3 Upload File to Google Drive
* **Endpoint:** `/api/operations/gdrive/upload`
* **Method:** `POST`
* **Access:** Protected (JWT Required)
* **Request Content-Type:** `multipart/form-data`
* **Invoked By:** `SyncService.runSync()` during Google Drive upload triggers.

##### Multipart/Form Data Payload Specs
* `tenantId`: `"c0fb298a-bd17-48f1-a18a-928abf1092a7"` (string)
* `folderId`: `"gdr_fol_881920ac3"` (string, target destination ID)
* `file`: (Binary stream of the file being sent)

##### Response JSON Schema (HTTP 200 OK)
```json
{
  "fileId": "gdr_item_9a8716bbf",
  "fileName": "annual_summary.pdf",
  "status": "SUCCESS"
}
```
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `fileId` | `string` | Unique asset ID in Google's ecosystem. |
| `fileName` | `string` | Uploaded file name. |
| `status` | `string` | Upload status (`"SUCCESS"` or `"FAILED"`). |

---

#### 4.4 Download File from Google Drive
* **Endpoint:** `/api/operations/gdrive/download/{tenantId}/{fileId}`
* **Method:** `GET`
* **Access:** Protected (JWT Required)
* **Path Parameters:**
  * `tenantId` (UUID) - Target GDrive tenant.
  * `fileId` (string) - Unique Google Drive file identifier.
* **Invoked By:** `SyncService.runSync()` for remote-to-local synchronization.

##### Response Payload (HTTP 200 OK)
`application/octet-stream` - Direct stream written directly into target path on local disk.

---

#### 4.5 Delete File from Google Drive
* **Endpoint:** `/api/operations/gdrive/delete/{tenantId}/{fileId}`
* **Method:** `DELETE`
* **Access:** Protected (JWT Required)
* **Path Parameters:**
  * `tenantId` (UUID) - Target GDrive tenant.
  * `fileId` (string) - Unique Google Drive file identifier.
* **Invoked By:** `SyncService.runSync()` to delete files during cleanup cycles.

##### Response Payload (HTTP 204 No Content)
Empty body represents a successful file deletion.

---

#### 4.6 Scan Google Drive Folder Metadata
* **Endpoint:** `/api/operations/gdrive/folder/status/{tenantId}/{folderId}`
* **Method:** `GET`
* **Access:** Protected (JWT Required)
* **Path Parameters:**
  * `tenantId` (UUID) - Target GDrive tenant.
  * `folderId` (string) - Directory ID from which recursive tracking checks are performed.
* **Invoked By:** `SyncService.runSync()` to map and index GDrive folder states.

##### Response DTO Schema (`GDriveFolderStatusDTO[]` - HTTP 200 OK)
```json
[
  {
    "fileId": "gdr_item_9a8716bbf",
    "fileName": "docs/annual_summary.pdf",
    "size": 1576960,
    "lastModified": "2026-06-22T14:10:00.000Z"
  }
]
```
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `fileId` | `string` | Google-assigned unique file identifier. |
| `fileName` | `string` | Path of file asset relative to mapped sync root. |
| `size` | `number` | Target file size in bytes. |
| `lastModified` | `string` | ISO 8601 UTC timestamp of last Google Drive update. |

---

## 3. Bilateral Synchronization State Machine Trace

When a synchronization is triggered (manually via the **"Sync Now"** button or programmatically via a Chronos schedule), the Electron main process invokes the **Bilateral State Machine Pipeline**.

```
   [Click "Sync Now" Button]
              |
              v
     (syncTriggerNow)
              |
              v
   ipcRenderer.invoke('sync:triggerSync')
              |
              v
   [SyncService.runSync(requestId)]
              |
              +----> 1. Query local SQLite for metadata config (`getDb()`)
              |
              +----> 2. Scan Local Workspace files (`getLocalFiles()`)
              |
              +----> 3. Query Cloud Gateway Remote Index (`statusF` / `folder/status`)
              |
              +----> 4. Compare Meta Matrix (Local Timestamp vs Remote Timestamp)
              |
              +----> 5. Mapped Action Routing:
                         |
                         +---> Local is Newer  => Spring Boot Upload REST endpoint
                         |
                         +---> Remote is Newer => Spring Boot Download REST endpoint
                         |
                         +---> Delete Mismatch => Spring Boot Delete REST endpoint
```

### Local Database Schema & State Operations (SQLite)

These persistent actions operate on the native workspace database (`devsync.db`) using the local database connector and do not make network calls to the cloud gateway.

| Action Triggered | Electron Wrapper Function | Electron IPC Channel | SQLite Schema Operation |
| :--- | :--- | :--- | :--- |
| **Load Sync Pipelines** | `getSyncRequests()` | `db:getSyncRequests` | `SELECT * FROM sync_requests WHERE tenant_id = ?` |
| **Register Sync Pipeline** | `saveSyncRequest(request)` | `db:saveSyncRequest` | `INSERT OR REPLACE INTO sync_requests (id, name, provider, status, local_path, remote_folder, bucket_name, folder_id, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` |
| **Delete Sync Pipeline** | `deleteSyncRequest(id)` | `db:deleteSyncRequest` | `DELETE FROM sync_requests WHERE id = ?` |
| **Modify Active Paths** | `updateSyncRequestPaths(...)` | `db:updateSyncRequestPaths`| `UPDATE sync_requests SET local_path = ?, remote_folder = ? WHERE id = ?` |
| **Modify Queue Status** | `updateSyncRequestStatus(...)`| `db:updateSyncRequestStatus`| `UPDATE sync_requests SET status = ? WHERE id = ?` |
| **Poll Queue Progress** | `syncGetQueue(requestId?)` | `sync:getQueue` | `SELECT * FROM sync_queue WHERE sync_request_id = ? ORDER BY created_at DESC` |
| **Query Activity History**| `syncGetActivityLog(id?)` | `sync:getActivityLog` | `SELECT * FROM activity_log WHERE sync_request_id = ? ORDER BY timestamp DESC` |

---

## 4. Complete User Flow Mapping (Mandatory UI Behavior)

The Electron desktop application behaves exactly as mapped out below. This mapping ensures that the real Spring Boot REST API endpoints, SQLite queries, and front-end state interactions align perfectly with no placeholders or mock behavior.

### 4.1 Application Startup
1. **Launch Application**: The system executes `src/main.tsx` and loads `/src/App.tsx`.
2. **Retrieve Local Token Session**: Evaluates if a JWT session exists by reading from SQLite:
   * **SQL Query**: `SELECT value FROM settings WHERE key = 'auth_token'` via `DatabaseService.ts`.
3. **Condition A: No Session Exist**:
   * If the query returns empty or undefined, the user is redirected to `/src/components/LoginPage.tsx` (Login / Register view).
4. **Condition B: Valid Session Exists**:
   * If a JWT is recovered, the client updates the authorization header in `getApiClient()` to `Bearer <token>` and loads all sync requests from SQLite:
   * **SQL Query**: `SELECT * FROM sync_requests` via `DatabaseService.ts` / `getSyncRequests()`.
5. **Onboarding Intersection**:
   * If the list of sync requests returned is empty (`syncRequests.length === 0`), the UI renders `/src/components/FirstSyncWizard.tsx` (First Sync Wizard).
6. **Dashboard Access**:
   * If at least one active sync request is registered (`syncRequests.length > 0`), the client is routed to the primary main **Dashboard** view.

---

### 4.2 User Authentication Flow (Login & Register)

#### A. Login Flow
* **Inputs**: Email, Password (Plain text).
* **UI Action**: Click "Access Environment" / "Login" button.
* **Electron Wrapper / Handler**: `authLogin(email, password)` maps to IPC `auth:login` calling `AuthService.login(email, password)`.
* **Spring Boot REST Endpoint Call**:
  * **Endpoint**: `POST /api/auth/login`
  * **Payload**: `{ "email": "...", "password": "..." }`
* **On Success**: The Gateway returns a `LoginResponseDTO`.
* **State Updates**: Stores variables in local SQLite database settings table:
  * **Auth Token**: `INSERT OR REPLACE INTO settings (key, value) VALUES ('auth_token', '<JWT_Token>')`
  * **User ID**: `INSERT OR REPLACE INTO settings (key, value) VALUES ('user_id', '<User_ID>')`
  * **Email**: `INSERT OR REPLACE INTO settings (key, value) VALUES ('user_email', '<Email>')`
  * **Role**: `INSERT OR REPLACE INTO settings (key, value) VALUES ('user_role', '<Role>')`
* **Navigation**: Instantly routes user to Desktop Dashboard.

#### B. Register Flow
* **Inputs**: Email, Password (Plain text).
* **UI Action**: Click "Create Account" / "Register" button.
* **Electron Wrapper / Handler**: `authRegister(email, password)` maps to IPC `auth:register` calling `AuthService.register(email, password)`.
* **Spring Boot REST Endpoint Call**:
  * **Endpoint**: `POST /api/auth/register`
  * **Payload**: `{ "email": "...", "password": "..." }`
* **On Success**: Gateway returns `true`.
* **Navigation**: Automatically navigates back to the Login Page view. The user must explicitly login using their credentials; they are **not** automatically authenticated unless a valid JWT is returned in the response.

---

### 4.3 Connection & Pipeline Creation Wizard

#### A. Step 1: Create First Connection
* **Inputs**: Connection/Tenant Name, Cloud Storage Provider selection (`AWS` or `Google Drive`).
* **UI Action**: Click "Establish Connection" or "Continue".
* **Electron Wrapper / Handler**: `tenantCreate(tenantName, provider)` maps to IPC `tenant:create` calling `TenantService.createTenant(tenantName, provider)`.
* **Spring Boot REST Endpoint Call**:
  * **Endpoint**: `POST /api/connection/create`
  * **Payload**: `{ "tenantName": "...", "provider": "..." }`
* **Local Storage**: The returned `tenantId` (UUID) from the Spring Boot response is stored locally in the state and SQLite table.

---

#### B. Step 2a: AWS Credentials Connection Flow
* **Inputs**: Access Key, Secret Key, Target S3 Region.
* **UI Action**: Click "Verify Credentials".
* **Electron Wrapper / Handler**: `awsVerify(...)` maps to IPC `aws:verify` calling `AwsService.verifyConnection(...)`.
* **Spring Boot REST Endpoint Call**:
  * **Endpoint**: `POST /api/connection/aws/{tenantId}/verify`
  * **Payload**: `{ "accessKey": "...", "secretKey": "...", "region": "..." }`
* **On Success**:
  * Displays: AWS Account ID, IAM User / Identity Name, and AWS Bucket List.
  * Allows user to:
    * **Select Existing S3 Bucket**: Chosen from the returned list array.
    * **Create New S3 Bucket**: User enters a bucket name, clicking "Create S3 Bucket".
      * **Gateway Call**: `POST /api/operations/aws/buckets/createB`
      * **Payload**: `{ "tenantId": "...", "bucketName": "..." }`
      * **Post-Creation Refresh**: Calls `GET /api/operations/aws/buckets/{tenantId}` to refresh the dropdown buckets list.

---

#### C. Step 2b: Google Drive OAuth & Folder Connection Flow
* **Action**: Connect Google Account.
* **Electron Wrapper / Handler**: `gdriveGetAuthUrl(tenantId)` maps to IPC `gdrive:getAuthUrl` calling `GoogleDriveService.getAuthUrl(...)`.
* **Spring Boot REST Endpoint Call**:
  * **Endpoint**: `GET /api/connection/gcp/{tenantId}/auth`
* **OAuth Processing**:
  * Electron receives the `authUrl` and opens it automatically in the host operating system's default browser.
  * The user authenticates inside the browser.
  * The cloud gateway receives the authentication response on `GET /api/connection/gcp/callback` and exchanges authorization codes for long-lived refresh tokens. No complex Electron main logic is required for OAuth callback parsing.
* **On Success / Reload**:
  * Electron queries directories matching the Google Drive account:
    * **Gateway Call**: `GET /api/operations/gdrive/folder/{tenantId}`
  * Displays the directory tree structure.
  * Allows the user to:
    * **Select Existing Folder**: Chosen from the directory tree hierarchy.
    * **Create New Folder**: User inputs folder name.
      * **Gateway Call**: `POST /api/operations/gdrive/folder/create`
      * **Payload**: `{ "tenantId": "...", "parentFolderId": "...", "folderName": "..." }`
      * **Refresh**: Re-scans folders to update list values.

---

#### D. Step 3: Select Local Folder
* **Action**: User browses the local operating system directory structure via a file system picker dialog.
* **Local Storage**: The selected directory path is saved in local state and eventually inserted into SQLite `sync_requests`.
* **Constraint**: The local computer's directory path string is private to the node and **must never** be transmitted to the Spring Boot REST API.

---

#### E. Step 4: Save & Register Sync Request Pipeline
* **Action**: Review and click "Finish" / "Save".
* **Electron Wrapper / Handler**: `saveSyncRequest(...)` maps to IPC `db:saveSyncRequest`.
* **SQLite Storage**: Inserts a new pipeline row inside the `sync_requests` table on the local machine database:
  * **SQL Query**: `INSERT OR REPLACE INTO sync_requests (id, name, provider, status, local_path, remote_folder, bucket_name, folder_id, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
* **Constraint**: No Spring Boot Gateway endpoints are hit during final configuration creation.

---

### 4.4 Dashboard Management View
For active pipelines, the main workspace displays configured sync request cards and telemetry summaries.

Each **Sync Request card** binds to the SQLite dataset and shows:
* **Provider**: AWS S3 icon or Google Drive logo.
* **Local Folder**: Local absolute disk directory path.
* **Remote Bucket / Folder**: AWS Bucket Name / Google Drive Folder Name.
* **Last Sync Time**: Timestamp of the latest completed state pipeline.
* **Current Status**: Dynamic state indicators (`"IDLE"`, `"SYNCING"`, `"FAILED"`, `"PAUSED"`).

**Control UI Actions**:
1. **Sync Now**: Triggers instantaneous bidirectional comparison and sync.
2. **Edit**: Modifies pipeline directories and schedules.
3. **Delete**: Deletes the pipeline from SQLite (`DELETE FROM sync_requests WHERE id = ?`).
4. **Refresh**: Performs remote-only scan of the cloud target files.

---

### 4.5 Execution Triggers & Operations

#### A. "Sync Now" Execution Flow
Bilateral state validation runs upon clicks or scheduled triggers.
1. **Local scan**: Recursively scans local metadata (`SyncService.getLocalFiles()`).
2. **Remote scan**: Queries Gateway to fetch target metadata:
   * **AWS S3**: `POST /api/operations/aws/statusF`
   * **Google Drive**: `GET /api/operations/gdrive/folder/status/{tenantId}/{folderId}`
3. **Bilateral Evaluation**:
   * Evaluates comparison maps. The **latest modified file wins**.
   * **Upload Routine (Local is newer or remote missing)**:
     * **AWS**: `POST /api/operations/aws/upload`
     * **Google**: `POST /api/operations/gdrive/upload`
   * **Download Routine (Remote is newer or local missing)**:
     * **AWS**: `POST /api/operations/aws/download`
     * **Google**: `GET /api/operations/gdrive/download/{tenantId}/{fileId}`
   * **Delete / Pruning Routine**:
     * **AWS**: `DELETE /api/operations/aws/delete`
     * **Google**: `DELETE /api/operations/gdrive/delete/{tenantId}/{fileId}`

#### B. Manual Upload
* **Action**: User drags and drops or select upload for a file item.
* **S3 Endpoint**: `POST /api/operations/aws/upload` (as `multipart/form-data`)
* **Google Drive Endpoint**: `POST /api/operations/gdrive/upload` (as `multipart/form-data`)

#### C. Manual Download
* **Action**: User chooses local down-arrow on a remote file row.
* **S3 Endpoint**: `POST /api/operations/aws/download` (Request body payload returns an ArrayBuffer)
* **Google Drive Endpoint**: `GET /api/operations/gdrive/download/{tenantId}/{fileId}` (Path parameters return stream)

#### D. Manual Delete
* **Action**: User clicks the trash icon on a file row.
* **S3 Endpoint**: `DELETE /api/operations/aws/delete`
* **Google Drive Endpoint**: `DELETE /api/operations/gdrive/delete/{tenantId}/{fileId}`

#### E. Refresh Remote Folder
* **Action**: Reload remote metadata listing.
* **S3 Endpoint**: `POST /api/operations/aws/statusF`
* **Google Drive Endpoint**: `GET /api/operations/gdrive/folder/status/{tenantId}/{folderId}`
* **Constraint**: This action is list-only; no background synchronization transfers or system write actions are performed.

---

### 4.6 Background Services & Daemon Services

#### A. Folder Watcher Service
* **Behavior**: Uses node filesystem events (`chokidar` wrapper in `/electron/services/FolderWatcherService.ts`) to monitor registered local paths.
* **Triggering**: Upon identifying file mutations (creates, modifications), triggers `SyncService.runSync()` automatically.
* **Logic**: Evaluates change states; uploads local file copies to AWS S3 or Google Drive only if the local file is newer.

#### B. Chronos Scheduler Service
* **Behavior**: Triggers automated chronos sync loops using `node-cron` schedules.
* **Triggering**: Periodically wakes up to call `SyncService.runSync(requestId)`.
* **Constraint**: The cron daemon strictly schedules Electron native tasks; it never initiates direct calls to Spring Boot outside of the target sync action.

---

### 4.7 Session Logout Flow
* **UI Action**: Click "Log Out" / "Terminate Session" button.
* **Local Operations**:
  * Clears cached session variables and authorization tokens from the SQLite table:
    * **SQL Query**: `DELETE FROM settings WHERE key = 'auth_token'`
  * Resets internal application states.
* **Navigation**: Immediately returns the application context to the Login Screen.
* **Constraint**: No Gateway backend endpoint is called as there is no stateful HTTP session logout on JWT backends.

---

### 4.8 Architectural Design & Implementation Constraints
* **No Pseudo/Mock Components**: Developers are strictly forbidden from generating mock, placeholder, educational, or simulator pages. This includes simulated SQLite viewers, fake API sandboxes, simulated progress indicators, or developer consoles.
* **True Gateway Target**: All network calls must hook directly to the real, active Spring Boot gateway service running on `localhost:8080` (or `SPRING_BOOT_API_URL`).
* **Clean Single-page Dashboard**: Desktop view remains clean and production-focused. Keep margin lines, navigation systems, and components dedicated solely to file tracking and synchronizations.

