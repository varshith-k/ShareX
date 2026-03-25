## Backend API Documentation

### 1. Health Check

Endpoint:
GET /health

Description:
Checks if the backend server is running.

Response:
{
  "status": "ok"
}

---

### 2. Upload File

Endpoint:
POST /upload

Description:
Uploads a file to the server and returns a token.

Request:
- Content-Type: multipart/form-data
- Field: file

Response:
{
  "message": "File uploaded successfully",
  "token": "abc123",
  "downloadUrl": "/download/abc123"
}

Error Response:
{
  "error": "File not found in request"
}

---

### 3. Download File

Endpoint:
GET /download/{token}

Description:
Downloads the file associated with the token.

Response:
- Returns file as attachment

Error Response:
{
  "error": "File not found"
}

---

### 4. Get File Metadata

Endpoint:
GET /file/{token}

Description:
Fetches file metadata without downloading it.

Response:
{
  "filename": "example.txt",
  "size": 1024,
  "token": "abc123",
  "createdAt": "2026-03-25T00:00:00Z"
}

Error Response:
{
  "error": "File not found"
}

---

## Backend Testing Summary

In Sprint 2, multiple unit tests were added to improve backend reliability and ensure correctness of core functionalities.

Health Endpoint Test:
- Verifies that the /health endpoint returns status 200
- Ensures correct JSON response format

Repository Tests:

GetByToken (Invalid Token):
- Confirms that invalid tokens return an error
- Ensures no file is returned for non-existent tokens

GetByToken (Valid Token):
- Tests retrieval of file metadata using a valid token
- Skips execution if database is not initialized

Metadata Handler Tests:

Success Case:
- Tests /file/{token} endpoint
- Validates response status and non-empty response body
- Handles both 200 and 404 scenarios depending on DB state

Invalid Token Case:
- Ensures API returns 404 for invalid tokens
- Confirms proper error response

Test Utilities:
- Introduced reusable helper functions:
  - CreateTestRequest
  - CreateTestRecorder
- Reduced duplication and improved readability of test code

Notes:
- Database-dependent tests are safely skipped when DB is not initialized
- Ensures stable test execution without runtime crashes