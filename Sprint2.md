## Backend Testing Summary

In Sprint 2, multiple unit tests were added to improve backend reliability and ensure correctness of core functionalities.

### Health Endpoint Test
- Verifies that the `/health` endpoint returns status 200
- Ensures correct JSON response format

### Repository Tests
- `GetByToken (Invalid Token)`:
  - Confirms that invalid tokens return an error
  - Ensures no file is returned for non-existent tokens

- `GetByToken (Valid Token)`:
  - Tests retrieval of file metadata using a valid token
  - Skips execution if database is not initialized

### Metadata Handler Tests
- Success Case:
  - Tests `/file/{token}` endpoint
  - Validates response status and non-empty response body
  - Handles both 200 and 404 scenarios depending on DB state

- Invalid Token Case:
  - Ensures API returns 404 for invalid tokens
  - Confirms proper error response

### Test Utilities
- Introduced reusable helper functions:
  - `CreateTestRequest`
  - `CreateTestRecorder`
- Reduced duplication and improved readability of test code

### Notes
- Database-dependent tests are safely skipped when DB is not initialized
- Ensures stable test execution without runtime crashes