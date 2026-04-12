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
