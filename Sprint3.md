# Sprint 3 - Backend Auth and File Ownership Documentation

## Scope

Sprint 3 backend work added account authentication, ownership-aware file APIs, and owner-controlled sharing safeguards.

## Authentication Flow

1. Register a new user with `POST /auth/register`.
2. Login with `POST /auth/login`.
3. Receive a signed JWT token in login response.
4. Call protected APIs using `Authorization: Bearer <token>`.

## Auth Endpoints

### POST /auth/register

Purpose:
- Create a new account.

Request body:

```json
{
  "name": "Varshith",
  "email": "varshith@example.com",
  "password": "strong-password"
}
```

Validation:
- Requires `name`, `email`, and `password`.
- Duplicate email is rejected.
- Password is stored as bcrypt hash.

### POST /auth/login

Purpose:
- Validate credentials and issue JWT.

Request body:

```json
{
  "email": "varshith@example.com",
  "password": "strong-password"
}
```

Success response:

```json
{
  "message": "Login successful",
  "token": "<signed-jwt>",
  "user": {
    "id": 1,
    "name": "Varshith",
    "email": "varshith@example.com"
  }
}
```

Invalid credentials response:

```json
{
  "error": "Invalid email or password"
}
```

## Protected Routes

All routes below require a valid JWT:

1. `POST /upload`
2. `GET /me`
3. `GET /me/files`
4. `PATCH /me/files/revoke/{token}`
5. `DELETE /me/files/{token}`

Invalid or missing token behavior:
- Return `401 Unauthorized`.

## Ownership Rules

1. Every uploaded file is linked to an owner through `files.owner_id`.
2. Only owners can revoke links for their files.
3. Only owners can delete their files.
4. Non-owner revoke/delete actions return `403 Forbidden`.
5. Revoked files stay in metadata with `is_active = false`.
6. Revoked files cannot be downloaded and return `404 Not Found` from download API.

## Ownership API Examples

### GET /me

```http
GET /me
Authorization: Bearer <signed-jwt>
```

### GET /me/files

```http
GET /me/files
Authorization: Bearer <signed-jwt>
```

### PATCH /me/files/revoke/{token}

```http
PATCH /me/files/revoke/abc123token
Authorization: Bearer <signed-jwt>
```

### DELETE /me/files/{token}

```http
DELETE /me/files/abc123token
Authorization: Bearer <signed-jwt>
```

## Frontend Work Completed

### FE3-03: Frontend auth API service
- Created `frontend/src/services/auth.js`
- Added reusable auth service methods:
  - `registerUser()`
  - `loginUser()`
  - `getCurrentUser()`
- Added shared auth header and response parsing helpers

### FE3-04: Auth context/provider
- Created `frontend/src/context/AuthContext.js`
- Added token and current user state
- Added `login`, `register`, and `logout` actions
- Added localStorage token persistence
- Added current user loading flow and derived auth state

### FE3-05: Protected route wrapper
- Created `frontend/src/components/ProtectedRoute.js`
- Added redirect to `/login` for unauthenticated users
- Added loading state handling while auth state is restoring

### FE3-06: Dashboard page shell
- Created `frontend/src/pages/Dashboard.js`
- Added dashboard heading, layout structure, and placeholder sections
- Added `/dashboard` route

### FE3-07: Dashboard file list integration
- Created `frontend/src/services/files.js`
- Added `getMyFiles()` for `GET /me/files`
- Connected dashboard file list to API
- Added loading, error, empty, and metadata display states

### FE3-08: Dashboard upload panel
- Created `frontend/src/components/DashboardUploadPanel.js`
- Added file input and upload button UI
- Integrated upload panel into dashboard
- Added selected file state and feedback messages

## Frontend Unit Tests

Added frontend unit tests for:
- `frontend/src/components/ProtectedRoute.test.js`
- `frontend/src/components/DashboardUploadPanel.test.js`
- `frontend/src/pages/Home.test.js`

These tests cover:
- Protected route authenticated rendering
- Protected route loading state
- Upload panel rendering and file selection behavior
- Upload panel validation message when no file is selected
- Home page content rendering

## Frontend Notes

The frontend Sprint 3 work introduced the authentication foundation and dashboard workspace structure required for owner-only file management. The API service layer, auth context, protected routes, dashboard file listing, upload panel, and related tests were added as modular pieces so they can be integrated cleanly as the sprint branches merge.

## Frontend Auth and Dashboard Flow Summary

### Auth flow
1. Registration requests are sent through `frontend/src/services/auth.js`
2. Login requests are sent through `frontend/src/services/auth.js`
3. JWT tokens are stored in `localStorage` under `authToken`
4. `AuthProvider` restores the token and attempts to load the current user
5. `ProtectedRoute` blocks unauthenticated access and redirects to `/login`

### Dashboard flow
1. The dashboard route is exposed at `/dashboard`
2. File list data is requested from `GET /me/files`
3. File list renders filename, size, and created date
4. Loading, empty, and error states are handled in the dashboard UI
5. The upload panel supports file selection and upload feedback messaging

### Frontend Files Added
- `frontend/src/services/auth.js`
- `frontend/src/services/files.js`
- `frontend/src/context/AuthContext.js`
- `frontend/src/components/ProtectedRoute.js`
- `frontend/src/components/DashboardUploadPanel.js`
- `frontend/src/pages/Dashboard.js`