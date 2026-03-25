# Sprint 2

## Team Progress

Sprint 2 focused on turning the Sprint 1 prototype into a more reliable integrated working model. The frontend and backend now communicate through the same upload, metadata, and download flow, and both layers include automated test coverage.

### Completed in Sprint 2

- Finished pending cleanup from Sprint 1 by standardizing the upload, metadata lookup, and download flow.
- Integrated the React frontend with the Go backend using shared API endpoints.
- Added frontend unit tests for the main app shell, upload validation, upload success state, and download-page error state.
- Added a Cypress smoke test for the frontend upload workflow.
- Expanded backend unit tests for health, upload, metadata, download, and repository behavior.
- Added backend API documentation for the endpoints used by the frontend.
- Added an in-memory metadata fallback so the backend can still run locally when PostgreSQL is not configured.

## Backend API Documentation

### Base URL

- Local backend: `http://localhost:8080`

### 1. Health Check

- Method: `GET`
- Endpoint: `/health`
- Purpose: confirms that the backend server is running

Success response:

```json
{
  "status": "ok"
}
```

### 2. Upload File

- Method: `POST`
- Endpoint: `/upload`
- Content type: `multipart/form-data`
- Required field: `file`
- Purpose: uploads a file, stores metadata, and returns a share token

Success response `200 OK`:

```json
{
  "message": "File uploaded successfully",
  "token": "abc123token",
  "downloadUrl": "/download/abc123token"
}
```

Error responses:

```json
{
  "error": "Method not allowed"
}
```

```json
{
  "error": "File not found in request"
}
```

```json
{
  "error": "File is empty"
}
```

```json
{
  "error": "File exceeds maximum allowed size of 10MB"
}
```

### 3. Get File Metadata

- Method: `GET`
- Endpoint: `/file/{token}`
- Purpose: returns file metadata without downloading the file

Success response `200 OK`:

```json
{
  "filename": "example.txt",
  "size": 1024,
  "token": "abc123token",
  "createdAt": "2026-03-25T15:30:00Z"
}
```

Error responses:

```json
{
  "error": "Invalid token"
}
```

```json
{
  "error": "File not found"
}
```

### 4. Download File

- Method: `GET`
- Endpoint: `/download/{token}`
- Purpose: downloads the stored file using the token

Success behavior:

- Returns the file as an attachment
- Uses the original filename in the `Content-Disposition` header

Error responses:

```json
{
  "error": "Invalid token"
}
```

```json
{
  "error": "File not found"
}
```

```json
{
  "error": "File missing on server"
}
```

## Frontend Work Completed

### Frontend and Backend Integration

- Replaced placeholder frontend calls with one shared API service in `frontend/src/services/api.js`.
- Wired the upload page to `POST /upload`.
- Wired the file lookup flow to `GET /file/{token}`.
- Wired the download page to `GET /download/{token}`.
- Added share-link generation after a successful upload.

### Frontend Unit Tests

- `frontend/src/App.test.js`
  - verifies the Sprint 2 home content and navigation links render
- `frontend/src/pages/Upload.test.js`
  - verifies upload validation when no file is selected
  - verifies a successful upload shows the returned token
- `frontend/src/pages/DownloadPage.test.js`
  - verifies the invalid-token error state and home navigation link

### Cypress Test

- `frontend/cypress/e2e/download_page.cy.js`
  - visits the upload page
  - clicks the upload button without choosing a file
  - confirms the validation message is shown

## Backend Unit Tests

- `backend/internal/handlers/health_test.go`
  - verifies the health endpoint returns `200 OK`
- `backend/internal/handlers/upload_handler_test.go`
  - verifies missing-file validation
  - verifies empty-file validation
  - verifies successful upload stores metadata and file output
- `backend/internal/handlers/upload_invalid_test.go`
  - verifies invalid HTTP method handling
  - verifies malformed multipart handling
  - verifies missing file field handling
- `backend/internal/handlers/metadata_test.go`
  - verifies invalid token handling
  - verifies metadata success response
- `backend/internal/handlers/download_handler_test.go`
  - verifies missing token handling
  - verifies invalid token handling
  - verifies token-with-slash validation
  - verifies successful file download
- `backend/internal/handlers/download_missing_test.go`
  - verifies empty token handling
  - verifies missing token lookup handling
- `backend/internal/repository/file_repository_test.go`
  - verifies repository lookup for valid and invalid tokens

## Test Results

The following commands were run for Sprint 2 verification:

- `cd backend && go test ./...`
- `cd frontend && npm test -- --watch=false`
- `cd frontend && npm run build`
- `cd frontend && npm run cypress:run`

Results:

- Backend unit tests: passed with `go test ./...`
- Frontend unit tests: passed with `npm test`
- Frontend production build: passed with `npm run build`
- Frontend Cypress smoke test: passed with `npm run cypress:run`
- Backend server startup: verified with `go run ./cmd/server`
- Frontend server startup: verified with `npm start`

Observed final verification summary:

- Backend test status: `ok   sharex-backend/internal/handlers`
- Backend test status: `ok   sharex-backend/internal/repository`
- Frontend unit test summary: `3 passed, 3 total`
- Frontend unit test count: `4 passed, 4 total`
- Cypress summary: `1 passing`
