# ShareX

ShareX is a full-stack file sharing application built for a 4-sprint software engineering project. By the end of Sprint 3, the project supports authenticated file uploads, token-based downloads, file metadata lookup, and owner-managed file actions through an integrated React frontend and Go backend.

## Team

- Varshith Kaki: Backend integration, validation, Sprint integration, final submission
- Rohit Reddy: Backend API documentation, metadata/auth backend coverage
- Bhoomika Mudi: Frontend upload flow, auth UI, frontend tests
- Harshini Sangem: Frontend download flow, dashboard/download experience, frontend tests

## Sprint 3 Status

Sprint 3 extends the Sprint 2 working model into an authenticated application:

- Users can register and log in
- Authenticated users can upload files
- Upload responses return a token and download URL
- Users can view their owned files in a dashboard
- Users can revoke or delete files they own
- Public download pages can fetch metadata and download active files
- Frontend and backend both include unit tests

## Tech Stack

- Frontend: React, React Router, Testing Library, Cypress
- Backend: Go, net/http, pgx, JWT, bcrypt
- Database: PostgreSQL when `DATABASE_URL` is configured
- Local fallback: in-memory metadata/user storage when `DATABASE_URL` is not configured

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

## Submission Notes

For Sprint 3 submission materials, see:

- [Sprint3.md](/Users/varshith/Downloads/ShareX/Sprint3.md)

That document includes:

- Work completed in Sprint 3
- Frontend unit test list
- Backend unit test list
- Updated backend API documentation
