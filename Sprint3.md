# Sprint 3

## Sprint 3 Work Completed

Sprint 3 focused on extending the Sprint 2 integrated upload/download model into an authenticated file-sharing platform with ownership-aware actions and stronger frontend/backend integration.

### Team Progress

- Continued work on incomplete Sprint 2 integration tasks
- Added tests for new Sprint 3 functionality
- Updated backend API documentation for authentication and file ownership flows
- Verified integrated frontend and backend behavior locally

### Backend Work Completed

- Added user registration endpoint with validation
- Added user login endpoint with JWT token generation
- Added authenticated current-user profile endpoint
- Added owned-files listing endpoint for authenticated users
- Added revoke endpoint for owner-controlled link invalidation
- Added delete endpoint for owner-controlled file deletion
- Preserved protected upload flow using bearer token authorization
- Added support for user-aware ownership rules in backend logic
- Continued support for PostgreSQL-backed runtime with in-memory fallback for local development
- Fixed live authentication verification so valid registered users can log in successfully

### Frontend Work Completed

- Added authentication context for token and user session state
- Added register page
- Added login page
- Added protected route behavior
- Added authenticated dashboard page
- Connected upload form to authenticated backend requests
- Added owned-files dashboard view
- Added revoke and delete UI actions in the dashboard
- Updated home page and app routing for Sprint 3 authenticated flow
- Preserved public download page flow with metadata-driven rendering

## Frontend Unit Tests

Frontend tests were run from:

```bash
cd /Users/varshith/Downloads/ShareX/frontend
npm test -- --watch=false
```

### Frontend test files

- `src/App.test.js`
- `src/pages/Upload.test.js`
- `src/pages/Login.test.js`
- `src/pages/Dashboard.test.js`
- `src/pages/DownloadPage.test.js`

### Frontend test coverage summary

- `App.test.js`
  - verifies Sprint 3 home page content renders
  - verifies auth navigation links render

- `Upload.test.js`
  - verifies upload validation message when no file is selected
  - verifies successful upload flow renders returned token/download link

- `Login.test.js`
  - verifies login form fields render
  - verifies missing-field validation behavior

- `Dashboard.test.js`
  - verifies authenticated dashboard shell renders
  - verifies empty state messaging for owned files

- `DownloadPage.test.js`
  - verifies invalid token path is handled in the download page

## Backend Unit Tests

Backend tests were run from:

```bash
cd /Users/varshith/Downloads/ShareX/backend
go test ./...
```

### Backend test files

- `internal/handlers/health_test.go`
- `internal/handlers/upload_handler_test.go`
- `internal/handlers/upload_invalid_test.go`
- `internal/handlers/download_handler_test.go`
- `internal/handlers/download_missing_test.go`
- `internal/handlers/metadata_test.go`
- `internal/handlers/auth_handler_test.go`
- `internal/middleware/auth_middleware_test.go`
- `internal/repository/file_repository_test.go`

### Backend test coverage summary

- `health_test.go`
  - verifies `/health` returns success response

- `upload_handler_test.go`
  - verifies successful authenticated upload behavior

- `upload_invalid_test.go`
  - verifies invalid upload request handling
  - verifies validation and error responses

- `download_handler_test.go`
  - verifies valid token download flow

- `download_missing_test.go`
  - verifies missing physical file behavior

- `metadata_test.go`
  - verifies metadata endpoint returns expected data
  - verifies invalid token handling

- `auth_handler_test.go`
  - verifies registration success
  - verifies duplicate-email rejection
  - verifies login success and JWT issuance
  - verifies invalid credential handling
  - verifies authenticated profile lookup
  - verifies authenticated owned-files listing behavior
  - verifies ownership-protected revoke and delete behavior

- `auth_middleware_test.go`
  - verifies JWT middleware protects private routes correctly

- `file_repository_test.go`
  - verifies repository token lookup, storage, and ownership-related file behavior

## Updated Backend API Documentation

### Authentication Flow

1. Register a new user using `POST /auth/register`
2. Log in using `POST /auth/login`
3. Receive a JWT token
4. Send that token in the `Authorization` header for protected routes

Protected header format:

```text
Authorization: Bearer <jwt-token>
```

### Public Endpoints

#### `GET /health`

Purpose:
- Confirms backend service is running

Success response:

```json
{
  "status": "ok"
}
```

#### `POST /auth/register`

Purpose:
- Creates a new user account

Request body:

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "demo123"
}
```

Success `201 Created`:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Demo User",
    "email": "demo@example.com",
    "createdAt": "2026-04-12T00:00:00Z"
  }
}
```

Error cases:

- `400 Bad Request` for missing required fields
- `409 Conflict` for duplicate email

#### `POST /auth/login`

Purpose:
- Validates credentials and returns a signed JWT

Request body:

```json
{
  "email": "demo@example.com",
  "password": "demo123"
}
```

Success `200 OK`:

```json
{
  "message": "Login successful",
  "token": "<signed-jwt>",
  "user": {
    "id": 1,
    "name": "Demo User",
    "email": "demo@example.com"
  }
}
```

Error cases:

- `400 Bad Request` for invalid request body
- `401 Unauthorized` for invalid credentials

#### `GET /file/{token}`

Purpose:
- Returns metadata for a file token without downloading the file

Success `200 OK`:

```json
{
  "filename": "notes.txt",
  "size": 512,
  "token": "abc123",
  "createdAt": "2026-04-12T00:00:00Z"
}
```

Error cases:

- `404 Not Found` for invalid or revoked token

#### `GET /download/{token}`

Purpose:
- Downloads the file associated with a valid active token

Behavior:

- returns file stream for valid token
- preserves original filename in response headers
- returns `404 Not Found` for invalid, revoked, or missing files

### Protected Endpoints

#### `POST /upload`

Purpose:
- Uploads a file for the authenticated user

Requirements:

- valid bearer token
- multipart form request with file field

Success `200 OK`:

```json
{
  "message": "File uploaded successfully",
  "token": "generated-token",
  "downloadUrl": "http://localhost:8080/download/generated-token"
}
```

Error cases:

- `400 Bad Request` for missing file
- `400 Bad Request` for empty file
- `400 Bad Request` for oversized file
- `401 Unauthorized` for missing or invalid token

#### `GET /me`

Purpose:
- Returns the authenticated user profile

Success `200 OK`:

```json
{
  "user": {
    "id": 1,
    "name": "Demo User",
    "email": "demo@example.com"
  }
}
```

#### `GET /me/files`

Purpose:
- Returns files owned by the authenticated user

Success `200 OK`:

```json
{
  "files": [
    {
      "id": 1,
      "filename": "notes.txt",
      "token": "abc123",
      "size": 512,
      "isActive": true,
      "createdAt": "2026-04-12T00:00:00Z"
    }
  ]
}
```

#### `PATCH /me/files/revoke/{token}`

Purpose:
- Revokes an owned file link without deleting metadata

Success `200 OK`:

```json
{
  "message": "File link revoked"
}
```

Error cases:

- `401 Unauthorized` for missing or invalid token
- `403 Forbidden` for non-owner access
- `404 Not Found` for invalid file token

#### `DELETE /me/files/{token}`

Purpose:
- Deletes an owned file and its stored asset

Success `200 OK`:

```json
{
  "message": "File deleted successfully"
}
```

Error cases:

- `401 Unauthorized` for missing or invalid token
- `403 Forbidden` for non-owner access
- `404 Not Found` for invalid token or missing file

## FE3-20: Public Share and Download Flow Summary

### Overview
The Sprint 3 recipient flow focuses on improving the public file sharing and download experience. The flow supports successful file access, clearer metadata presentation, and stronger handling of expired, revoked, and invalid links.

### Public Routes
- `/download`
  - Lookup page where a user can enter a file token and preview metadata before opening the public download page.
- `/download/:token`
  - Public recipient page for a shared file.
  - Displays file details and allows download when the link is active.

### Recipient Flow
1. A user uploads a file.
2. The frontend generates a shareable public link using the file token.
3. A recipient opens `/download/:token`.
4. The frontend fetches metadata for the shared token.
5. If the file is available:
   - filename is shown
   - size is shown
   - uploaded time is shown
   - expiration information is shown when available
   - download action is displayed
6. If the link is invalid, expired, or revoked:
   - a dedicated public error state is shown
   - the user is guided back to the lookup page or home page

### Expired and Revoked Link Handling
Sprint 3 added stronger recipient-facing handling for non-active links.

- **Expired link**
  - shows a dedicated expired state
  - explains that the share window has ended
  - disables download access

- **Revoked link**
  - shows a dedicated revoked state
  - explains that the owner disabled the share link

- **Invalid or unknown link**
  - shows a generic fallback error state
  - preserves a consistent user experience

### UI/UX Enhancements
Sprint 3 recipient-flow improvements include:
- redesigned public download page
- clearer file metadata presentation
- visible expiration banner
- reusable file detail panel
- share-link panel after upload
- improved empty, loading, and error states
- polished public error pages
- responsive layout for public pages

### Tests Added

#### Unit Tests
- `src/pages/DownloadPage.test.js`
  - success metadata render
  - expired state render
  - revoked state render
  - generic invalid-link fallback render

#### Cypress Smoke Test
- `cypress/e2e/download_page.cy.js`
  - public download route opens
  - success state renders
  - expired error path renders

### Sprint 3 Result
The recipient-facing public sharing experience is now more reliable, more user-friendly, and better tested across both success and failure states.

## Summary

Sprint 3 completed the transition from a basic integrated file-sharing model into an authenticated ownership-aware application. The sprint deliverables include new frontend functionality, new backend functionality, updated tests, improved public share/download UX, and updated backend API documentation suitable for submission.
