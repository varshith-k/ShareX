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