# ShareX

ShareX is a full-stack file sharing application built for a 4-sprint software engineering project. By the end of Sprint 3, the project supports authenticated file uploads, token-based downloads, file metadata lookup, and owner-managed file actions through an integrated React frontend and Go backend.

## Team

- Varshith Kaki: Backend integration, validation, Sprint integration, final submission
- Rohit Reddy: Backend API documentation, metadata/auth backend coverage
- Bhoomika Mudi: Frontend upload flow, auth UI, frontend tests
- Harshini Sangem: Frontend download flow, dashboard/download experience, frontend tests

## Agile Development Plan

The project is being developed across 4 sprints.

### Sprint 1 - Foundation and MVP

Completed:

- Backend project setup
- Core file upload endpoint
- File token generation
- Metadata handling
- File download endpoint
- Basic frontend flow for upload and download

Status:

- Sprint 1 completed

### Sprint 2 - Integration and Testing

Completed:

- Frontend and backend integration
- Upload validation improvements
- Metadata endpoint integration
- Basic Cypress coverage
- Frontend unit tests
- Backend unit tests
- Backend API documentation in Sprint 2 deliverables

Status:

- Sprint 2 completed

### Sprint 3 - Authentication and Ownership Features

Completed:

- User registration
- User login with JWT
- Protected routes for authenticated actions
- Authenticated upload flow
- User dashboard for owned files
- Revoke and delete actions for owned files
- Updated frontend and backend unit tests
- Updated backend API documentation in Sprint 3 submission
- Improved public download/share flow

Status:

- Sprint 3 completed

### Sprint 4 - Remaining Work

Planned / left to complete:

- Deployment of frontend and backend to a live environment
- Production-ready environment configuration
- README updates for final project usage and deployment
- Final Cypress expansion and full regression checks
- Final backend API documentation cleanup
- Live user testing and feedback collection
- Final project demo/pitch preparation
- Sprint 4 submission documentation and closing polish

## Tech Stack

- Frontend: React, React Router, Testing Library, Cypress
- Backend: Go, net/http, pgx, JWT, bcrypt
- Database: PostgreSQL when `DATABASE_URL` is configured
- Local fallback: in-memory metadata/user storage when `DATABASE_URL` is not configured

## Final Project Architecture Summary

ShareX follows a layered full-stack architecture with independent deployable services.

### Architecture layers

- Presentation layer: React frontend served as static assets (or dev server in local mode)
- API layer: Go backend (`net/http`) exposing auth, upload, metadata, and download endpoints
- Data layer: PostgreSQL for persistent users/file metadata with in-memory fallback for local-only runtime
- Storage layer: filesystem-backed upload storage mounted to backend runtime

### Request/data flow

1. User interacts with React UI (`/register`, `/login`, `/dashboard`, `/download/:token`).
2. Frontend calls backend APIs via `REACT_APP_API_URL`.
3. Backend validates auth tokens for protected routes and enforces ownership rules.
4. File binaries are written/read from upload storage.
5. Metadata and user records are read/written to PostgreSQL when configured.
6. Public token routes serve metadata/download while respecting active/revoked/expired state.

### Deployment topology

- `frontend` container: serves production React build
- `backend` container: runs Go API service
- `postgres` container: stores persistent data
- Shared volume mounts:
  - backend upload persistence (`./backend/uploads`)
  - postgres data persistence (`postgres-data`)

## Repository Structure

```text
ShareX/
├── frontend/      React application
├── backend/       Go backend API
├── Sprint2.md     Sprint 2 submission documentation
├── Sprint3.md     Sprint 3 submission documentation
└── README.md
```

## Core Features

### Frontend

- Home page with Sprint 3 overview
- Register page
- Login page
- Protected dashboard
- Authenticated upload form
- Upload success and validation feedback
- Download page with metadata lookup

### Backend

- `POST /auth/register`
- `POST /auth/login`
- `GET /health`
- `POST /upload`
- `GET /file/{token}`
- `GET /download/{token}`
- `GET /me`
- `GET /me/files`
- `PATCH /me/files/revoke/{token}`
- `DELETE /me/files/{token}`

## Running the Project

### 1. Backend

From the project root:

```bash
cd /Users/varshith/Downloads/ShareX/backend
go run ./cmd/server
```

Default backend URL:

```text
http://localhost:8080
```

Docker (production-style image):

```bash
cd /Users/varshith/Downloads/ShareX/backend
docker build -t sharex-backend:latest .
docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  -e JWT_SECRET=change-this-secret \
  -e DATABASE_URL=postgres://username:password@host:5432/sharex \
  -v /Users/varshith/Downloads/ShareX/backend/uploads:/app/uploads \
  sharex-backend:latest
```

Notes:

- If `DATABASE_URL` is not set, the backend falls back to in-memory storage
- Uploaded files are stored in `backend/uploads/`
- The backend auto-creates the uploads directory if it does not exist

### 2. Frontend

From the project root:

```bash
cd /Users/varshith/Downloads/ShareX/frontend
BROWSER=none npm start
```

Default frontend URL:

```text
http://localhost:3000
```

### 3. Optional Environment Variables

Backend:

```bash
PORT=8080
DATABASE_URL=postgres://username:password@localhost:5432/sharex
JWT_SECRET=change-this-secret
```

Frontend:

```bash
REACT_APP_API_URL=http://localhost:8080
```

## Testing

### Backend unit tests

```bash
cd /Users/varshith/Downloads/ShareX/backend
go test ./...
```

### Frontend unit tests

```bash
cd /Users/varshith/Downloads/ShareX/frontend
npm test -- --watch=false
```

### Frontend production build

```bash
cd /Users/varshith/Downloads/ShareX/frontend
npm run build
```

### Cypress

```bash
cd /Users/varshith/Downloads/ShareX/frontend
npm run cypress:run
```

## Deployment Readiness

This repository now includes production-style deployment configuration for backend and full-stack startup.

### Environment readiness

Backend environment template:

```bash
cp backend/.env.example backend/.env
```

Frontend environment template (used for local/dev builds):

```bash
cp frontend/.env.example frontend/.env
```

Important backend variables:

- `PORT`: backend listen port
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: signing key for auth tokens
- `JWT_EXPIRY_HOURS`: token lifetime in hours
- `CORS_ALLOWED_ORIGINS`: comma-separated allowed web origins
- `UPLOAD_DIR`: upload directory path
- `MAX_UPLOAD_SIZE_MB`: max upload size limit

### Containerized startup

Run all services with Docker Compose:

```bash
cd /Users/varshith/Downloads/ShareX
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Postgres: internal service `postgres:5432`

### Minimum release readiness checks

- Backend unit tests pass: `cd backend && go test ./...`
- Frontend production build passes: `cd frontend && npm run build`
- Core health route responds: `GET /health`
- Upload/download flow works end-to-end
- Auth flow works (`/auth/register`, `/auth/login`, protected routes)

## Sprint 3 API Summary

### Public routes

- `GET /health`
- `GET /file/{token}`
- `GET /download/{token}`
- `POST /auth/register`
- `POST /auth/login`

### Protected routes

Protected routes require:

```text
Authorization: Bearer <jwt-token>
```

- `POST /upload`
- `GET /me`
- `GET /me/files`
- `PATCH /me/files/revoke/{token}`
- `DELETE /me/files/{token}`

## Example API Flow

### Register

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "demo123"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "demo@example.com",
  "password": "demo123"
}
```

### Upload

```http
POST /upload
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

Success response:

```json
{
  "message": "File uploaded successfully",
  "token": "generated-token",
  "downloadUrl": "http://localhost:8080/download/generated-token"
}
```

### File metadata

```http
GET /file/generated-token
```

### Owned files

```http
GET /me/files
Authorization: Bearer <jwt-token>
```

## Current Status

The repository on `main` now reflects the final Sprint 3 submission state. The application supports authenticated uploads, protected user file management, and public token-based downloads with frontend and backend test coverage.

## Submission Notes

For Sprint 3 submission materials, see:

- [Sprint3.md](./Sprint3.md)

That document includes:

- Work completed in Sprint 3
- Frontend unit test list
- Backend unit test list
- Updated backend API documentation
