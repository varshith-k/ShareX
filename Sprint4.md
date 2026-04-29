## Backend Test Summary (Sprint 4)

This section summarizes the backend unit tests implemented and extended as part of the final sprint.

---

### Test Files

- `upload_handler_test.go`
- (existing test files from previous sprints, if any)

---

### Test Coverage Overview

The backend tests cover the following key areas:

#### 1. Upload Handler

- Missing file validation
- Empty file validation
- Valid file upload flow
- Authenticated upload (owner ID assignment)
- Invalid HTTP method handling
- Invalid Content-Type handling

---

#### 2. Authentication & Authorization

- Protected route access validation
- Unauthorized request handling

---

#### 3. Request Validation

- Content-Type validation
- Multipart form validation
- File size and format validation

---

#### 4. File Handling

- File persistence verification
- Metadata storage validation
- Token-based file retrieval validation

---

### Test Execution

To run backend tests:

```bash
cd backend
go test ./...


---

## Backend Demo Script (Sprint 4)

This section explains how the backend APIs will be demonstrated in the final project video.

### Demo Order

1. Start the backend server
2. Verify backend availability using `GET /health`
3. Register a new user using `POST /auth/register`
4. Log in using `POST /auth/login`
5. Copy the returned JWT token
6. Upload a file using `POST /upload`
7. Retrieve file metadata using `GET /file/{token}`
8. Download the file using `GET /download/{token}`
9. Show protected owner routes using:
   - `GET /me`
   - `GET /me/files`
   - `PATCH /me/files/revoke/{token}`
   - `DELETE /me/files/{token}`

### Expected Responses

- `/health` should return backend status
- Auth routes should return successful registration/login responses
- Login should return a JWT token
- Upload should return a file token and download URL
- Metadata route should return file information
- Download route should return the uploaded file
- Protected routes should require `Authorization: Bearer <jwt-token>`

### Narration Support

The backend demo shows that ShareX supports authenticated users, secure uploads, token-based sharing, metadata lookup, file downloads, and owner-managed file actions.