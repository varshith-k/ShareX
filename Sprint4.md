### Public Frontend Test Coverage

#### Unit Tests
The public-facing frontend flow is covered by unit tests for:
- successful metadata rendering
- no-expiration file state
- expired metadata state
- expired link error state
- revoked link error state
- invalid-link fallback state
- reusable file detail panel metadata rendering

Relevant files:
- `frontend/src/pages/DownloadPage.test.js`
- `frontend/src/components/FileDetailPanel.test.js`

#### Cypress Smoke Tests
Final Cypress smoke coverage validates key frontend routes and public flow behavior.

Relevant files:
- `frontend/cypress/e2e/download_page.cy.js`
- `frontend/cypress/e2e/upload_flow.cy.js`
- `frontend/cypress/e2e/upload.cy.js`

Cypress coverage includes:
- public download route loads successfully
- invalid public token route is handled gracefully
- unauthenticated upload access redirects to login
- public download route remains accessible without login

### Sprint 4 Public Flow Result
The public recipient experience is demo-ready, readable, and covered by both unit tests and Cypress smoke tests.