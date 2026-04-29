# Sprint 4

Sprint 4 completed the final project polish for ShareX. The work focused on deployment readiness, final documentation, API clarity, test coverage, and a demo-ready full-stack application.

## Work Completed In Sprint 4

### Team Progress

- Completed remaining Sprint 3 cleanup and final integration fixes
- Finalized the authenticated upload and owner dashboard flow
- Finalized the public share/download flow
- Added production-style Docker configuration
- Added full-stack Docker Compose configuration
- Updated the front-page README with run, use, test, and deployment instructions
- Updated backend API documentation to reflect the final implemented project
- Verified backend tests, frontend tests, frontend build, and container configuration

### Varshith

- Added and verified backend Docker deployment support
- Added and verified full-stack Docker Compose configuration
- Added production environment configuration support
- Updated README deployment and architecture sections
- Added final backend release verification checklist
- Verified final backend compatibility after Sprint 4 upload validation changes
- Added PostgreSQL-backed persistence support and schema readiness checks

### Rohit

- Finalized backend API documentation coverage
- Added backend error-case documentation
- Documented health and diagnostics endpoint behavior
- Summarized backend test coverage for final submission

### Bhoomika

- Polished authenticated dashboard and upload flow
- Preserved clear upload loading, success, and error states
- Added upload UI coverage for expiration and protection flows
- Contributed frontend run and use documentation

### Harshini

- Finalized public download and recipient flow
- Maintained public download page unit and Cypress coverage
- Documented public/demo frontend flow
- Supported final project pitch and demo walkthrough polish

## Frontend Functionality

Final frontend pages and flows:

- `/` home page
- `/register` user registration
- `/login` user login
- `/dashboard` protected authenticated user dashboard
- `/upload` protected authenticated upload page
- `/download` public token lookup page
- `/download/:token` public file detail and download page

Frontend behavior completed:

- Authenticated users can access dashboard
- Unauthenticated users are redirected away from protected routes
- Users can upload files through the protected upload flow
- Upload success displays token/share information
- Dashboard lists owned files
- Dashboard supports revoke and delete actions
- Upload flow supports expiration settings and optional file passwords
- Public download page displays metadata and file states
- Invalid, expired, revoked, and protected links show user-friendly states

## Backend Functionality

Final backend endpoints:

- `GET /`
- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /me`
- `GET /me/files`
- `POST /upload`
- `GET /file/{token}`
- `GET /download/{token}`
- `PATCH /me/files/revoke/{token}`
- `DELETE /me/files/{token}`

Backend behavior completed:

- JWT authentication
- bcrypt password hashing
- protected route middleware
- owner-aware file metadata
- upload validation
- file type validation
- max upload size configuration
- original filename preservation during download
- revoked and expired link handling
- optional password-protected file sharing
- PostgreSQL support with in-memory fallback for local development
- environment-based config for CORS, upload directory, JWT expiry, and max upload size

## Frontend Unit Tests

Run command:

```bash
cd /Users/varshith/Downloads/ShareX/frontend
CI=true npm test -- --watchAll=false
```

Frontend test files:

- `src/App.test.js`
- `src/pages/Login.test.js`
- `src/pages/Dashboard.test.js`
- `src/pages/Upload.test.js`
- `src/pages/DownloadPage.test.js`

Frontend test summary:

- App renders final navigation and auth links
- Login page renders fields and validation
- Dashboard renders authenticated shell and owned file states
- Upload page validates missing file, renders success/share state, and supports expiration/password behaviors
- Download page renders metadata success, invalid, expired, revoked, and protected-file states

## FE4-05: Frontend Test Summary and Upload Flow Contributions

### Frontend contributions by Bhoomika

Implemented Sprint 4 frontend improvements for the authenticated upload workflow.

### Features completed

- Improved upload status messages with success and error styling
- Added empty file validation with UI reset behavior
- Added file size validation with a 5MB upload limit
- Improved backend connection error handling with a clearer user-facing message
- Added expiration selector behavior and helper text
- Added optional file password support in the upload experience

### Unit tests covered

Frontend unit tests were added or updated for:

- Empty file validation
- Successful file upload and share link generation
- File size validation
- Backend upload error handling
- Expiration helper text and protected-link UI behavior

### Test command

```bash
cd /Users/varshith/Downloads/ShareX/frontend
npm test
```

### Test result

All upload page unit tests passed successfully.

## Cypress Tests

Run command:

```bash
cd /Users/varshith/Downloads/ShareX/frontend
npm run cypress:run
```

Cypress test files:

- `cypress/e2e/upload.cy.js`
- `cypress/e2e/download_page.cy.js`

Cypress coverage summary:

- Protected upload page smoke flow using mocked auth/API responses
- Upload success and generated token display
- Public download page metadata success state
- Public download page expired-link error state

## Backend Unit Tests

Run command:

```bash
cd /Users/varshith/Downloads/ShareX/backend
go test ./...
```

Backend test files:

- `internal/handlers/health_test.go`
- `internal/handlers/auth_handler_test.go`
- `internal/handlers/upload_handler_test.go`
- `internal/handlers/upload_invalid_test.go`
- `internal/handlers/metadata_test.go`
- `internal/handlers/download_handler_test.go`
- `internal/handlers/download_missing_test.go`
- `internal/middleware/auth_middleware_test.go`
- `internal/repository/file_repository_test.go`

Backend test summary:

- health endpoint response
- register success and duplicate-email handling
- login success, invalid credentials, and JWT generation
- protected `/me` and `/me/files` behavior
- upload success, owner assignment, invalid request handling, and validation paths
- metadata success and invalid token behavior
- download success, invalid token, missing file, revoked link, expired link, and password-protected access behavior
- auth middleware valid and invalid token handling
- repository token lookup, ownership, revoke, and delete behavior

## Updated Backend API Documentation

### Response Format

Successful API responses return JSON unless the endpoint streams a file.

Common error format:

```json
{
  "error": "Error message"
}
```

### `GET /health`

Purpose:

- Confirms backend service is running
- Provides timestamp and uptime for demo/deployment verification

Success `200 OK`:

```json
{
  "status": "ok",
  "timestamp": "2026-04-25T12:00:00Z",
  "uptime": "1m30s"
}
```

### `POST /auth/register`

Purpose:

- Creates a user account

Request:

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
    "createdAt": "2026-04-25T12:00:00Z"
  }
}
```

Errors:

- `400 Bad Request` for invalid or missing fields
- `409 Conflict` for duplicate email

### `POST /auth/login`

Purpose:

- Authenticates a user and returns a JWT

Request:

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
  "token": "<jwt-token>",
  "user": {
    "id": 1,
    "name": "Demo User",
    "email": "demo@example.com"
  }
}
```

Errors:

- `400 Bad Request` for invalid request body
- `401 Unauthorized` for invalid credentials

### Protected Routes

Protected routes require:

```text
Authorization: Bearer <jwt-token>
```

Missing or invalid tokens return `401 Unauthorized`.

### `GET /me`

Purpose:

- Returns current authenticated user

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

### `GET /me/files`

Purpose:

- Lists files owned by authenticated user

Success `200 OK`:

```json
{
  "files": [
    {
      "id": 1,
      "filename": "demo.pdf",
      "token": "abc123",
      "size": 2048,
      "isActive": true,
      "isExpired": false,
      "createdAt": "2026-04-25T12:00:00Z",
      "expiresAt": null,
      "requiresPassword": false
    }
  ]
}
```

### `POST /upload`

Purpose:

- Uploads a file for authenticated user

Request:

- multipart form data
- field name: `file`
- optional field: `expiresInHours`
- optional field: `password`

Success `200 OK`:

```json
{
  "message": "File uploaded successfully",
  "token": "abc123",
  "downloadUrl": "/download/abc123",
  "expiresAt": null,
  "requiresPassword": false
}
```

Errors:

- `400 Bad Request` for missing content type
- `400 Bad Request` for non-multipart request
- `400 Bad Request` for missing file field
- `400 Bad Request` for empty file
- `400 Bad Request` for oversized file
- `400 Bad Request` for unsupported file type
- `400 Bad Request` for invalid expiration selection
- `401 Unauthorized` for missing or invalid token

### `GET /file/{token}`

Purpose:

- Returns metadata for a shared file token

Success `200 OK`:

```json
{
  "filename": "demo.pdf",
  "size": 2048,
  "token": "abc123",
  "createdAt": "2026-04-25T12:00:00Z",
  "expiresAt": null,
  "isActive": true,
  "isExpired": false,
  "requiresPassword": false
}
```

Errors:

- `400 Bad Request` for invalid token format
- `401 Unauthorized` for password-protected file without valid password
- `403 Forbidden` for revoked link
- `404 Not Found` for unknown token
- `410 Gone` for expired link

### `GET /download/{token}`

Purpose:

- Streams the file for a valid active token

Success:

- `200 OK`
- file stream
- original filename in `Content-Disposition`

Errors:

- `400 Bad Request` for missing or invalid token
- `401 Unauthorized` for password-protected file without valid password
- `403 Forbidden` for revoked link
- `404 Not Found` for missing token or file
- `410 Gone` for expired link

### `PATCH /me/files/revoke/{token}`

Purpose:

- Revokes an owned file link

Success `200 OK`:

```json
{
  "message": "File link revoked"
}
```

Errors:

- `400 Bad Request` for invalid token
- `401 Unauthorized` for missing or invalid JWT
- `403 Forbidden` for non-owner
- `404 Not Found` for unknown token

### `DELETE /me/files/{token}`

Purpose:

- Deletes an owned file and metadata

Success `200 OK`:

```json
{
  "message": "File deleted successfully"
}
```

Errors:

- `400 Bad Request` for invalid token
- `401 Unauthorized` for missing or invalid JWT
- `403 Forbidden` for non-owner
- `404 Not Found` for unknown token or missing physical file

## BE4-05: Final Backend Release Verification Checklist

Use this checklist before final backend release or deployment promotion.

### Configuration

- [x] `PORT` is set correctly for target environment
- [x] `DATABASE_URL` points to reachable PostgreSQL instance
- [x] `JWT_SECRET` is non-default and stored securely
- [x] `JWT_EXPIRY_HOURS` is set to desired token lifetime
- [x] `CORS_ALLOWED_ORIGINS` includes deployed frontend origin
- [x] `UPLOAD_DIR` is writable in deployment runtime
- [x] `MAX_UPLOAD_SIZE_MB` matches product requirements

### Build and tests

- [x] `cd backend && go test ./...` passes
- [x] Docker image build succeeds from `backend/Dockerfile`
- [x] Runtime starts successfully with expected environment variables

### API and behavior

- [x] `GET /health` returns `status: ok`
- [x] `POST /auth/register` creates new users
- [x] `POST /auth/login` returns valid JWT
- [x] Protected routes reject missing or invalid tokens
- [x] `POST /upload` accepts valid files and rejects invalid payloads
- [x] `GET /file/{token}` returns metadata for active tokens
- [x] `GET /download/{token}` downloads active files
- [x] Revoked, expired, and password-protected links return expected responses

### Data and operational checks

- [x] Upload directory persistence verified across restarts
- [x] Database schema is initialized and migration SQL has run
- [x] Logs are monitored for startup and runtime errors
- [x] Rollback path is documented through Git history and branch workflow

## Deployment And Production Readiness

### Local full-stack development

Backend:

```bash
cd /Users/varshith/Downloads/ShareX/backend
go run ./cmd/server
```

Frontend:

```bash
cd /Users/varshith/Downloads/ShareX/frontend
BROWSER=none npm start
```

### Docker Compose production-style run

From repository root:

```bash
cd /Users/varshith/Downloads/ShareX
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PostgreSQL: internal `postgres:5432`

### Environment Variables

Backend:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRY_HOURS`
- `CORS_ALLOWED_ORIGINS`
- `UPLOAD_DIR`
- `MAX_UPLOAD_SIZE_MB`

Frontend:

- `REACT_APP_API_URL`

## TEAM4-01: Final Deployment Demo Walkthrough

### 1. Prepare and start the stack

```bash
cd /Users/varshith/Downloads/ShareX
docker compose up --build
```

Expected startup:

- Postgres healthcheck becomes healthy
- Backend starts on `http://localhost:8080`
- Frontend starts on `http://localhost:3000`

### 2. Validate service health

Open or call:

- `GET http://localhost:8080/health`

Expected result: JSON response with `status: ok`.

### 3. Demo authentication flow

In frontend:

1. Register a new account on the register page
2. Log in with the new credentials
3. Confirm dashboard and protected UI access are visible

### 4. Demo upload and sharing flow

In authenticated dashboard:

1. Upload a valid file
2. Capture the generated token and share link
3. Open the download route and confirm metadata is shown
4. Download the file successfully

### 5. Demo owner actions

In dashboard file list:

1. Revoke uploaded file link
2. Verify revoked link returns error state on the download page
3. Delete file and verify it disappears from the owner list

### 6. Demo completion checkpoints

- Frontend, backend, and database are all running in containers
- Public routes and authenticated routes behave as expected
- Upload, download, and ownership controls are validated live

## TEAM4-02: Final Full-Stack Integration Verification

Verification was run against the production-oriented configuration in this repository.

### Verification commands

```bash
cd /Users/varshith/Downloads/ShareX
docker compose config -q

cd backend
go test ./...

cd ../frontend
npm run build
```

### Verification results

- Docker Compose configuration validation: PASS
- Backend unit and integration-level package tests: PASS
- Frontend production build compilation: PASS

### Integrated readiness conclusion

- Full-stack container configuration is valid
- Backend and frontend pass release-blocking quality checks
- Project is ready for final deployment and demo execution using Docker Compose

## Final Demo Walkthrough

1. Show README run instructions and architecture summary
2. Run backend unit tests
3. Run frontend unit tests or show prior test result
4. Start backend and frontend locally, or start Docker Compose
5. Register a user
6. Log in and show JWT-backed dashboard access
7. Upload a file
8. Show the owned file in the dashboard
9. Open the public download link and show metadata
10. Demonstrate password-protected access if enabled
11. Download file
12. Revoke or delete file from dashboard
13. Show backend API documentation section in this file

## Final Project Pitch Summary

### Project Overview

ShareX is a modern secure file-sharing platform designed to make authenticated uploads and public file sharing simple, fast, and user-friendly.

The system allows users to upload files, generate shareable token-based links, and let recipients access file details before downloading. It also supports protected dashboards, file expiration, optional file passwords, and persistent backend storage.

### Key Features Delivered

#### Authenticated User Features

- user registration and login
- protected dashboard workflow
- share-link generation
- upload expiration controls
- optional file password protection
- revoke and delete owner actions

#### Public Recipient Features

- token-based public download routes
- readable file metadata before download
- password-protected file access
- revoked and expired link handling
- presentation-ready public flow

#### Frontend Quality Improvements

- reusable React components
- polished route navigation
- responsive UI improvements
- loading and error state handling

#### Backend Quality Improvements

- documented Go REST API
- JWT authentication
- PostgreSQL-backed persistence
- upload validation and ownership control
- production-oriented environment configuration

#### Testing Coverage

- React unit tests for key components and pages
- Go backend unit tests for auth, upload, metadata, and download behavior
- Cypress smoke tests for core routes
- presentation-ready automated test output

### Final Result

ShareX evolved into a complete full-stack collaborative project demonstrating frontend engineering, backend integration, persistence, testing, documentation, and final product presentation readiness.

### Final Pitch Statement

ShareX showcases how a student team can build a real-world product that combines usability, secure file-sharing workflows, persistent backend architecture, quality testing, and collaborative software engineering practices.
