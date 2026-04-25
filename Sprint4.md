# Sprint 4

## BE4-05: Final Backend Release Verification Checklist

Use this checklist before final backend release or deployment promotion.

### Configuration

- [ ] `PORT` is set correctly for target environment
- [ ] `DATABASE_URL` points to reachable PostgreSQL instance
- [ ] `JWT_SECRET` is non-default and stored securely
- [ ] `JWT_EXPIRY_HOURS` is set to desired token lifetime
- [ ] `CORS_ALLOWED_ORIGINS` includes deployed frontend origin
- [ ] `UPLOAD_DIR` is writable in deployment runtime
- [ ] `MAX_UPLOAD_SIZE_MB` matches product requirements

### Build and tests

- [ ] `cd backend && go test ./...` passes
- [ ] Docker image build succeeds from `backend/Dockerfile`
- [ ] Runtime starts successfully with expected environment variables

### API and behavior

- [ ] `GET /health` returns `status: ok`
- [ ] `POST /auth/register` creates new users
- [ ] `POST /auth/login` returns valid JWT
- [ ] Protected routes reject missing/invalid tokens
- [ ] `POST /upload` accepts valid files and rejects invalid payloads
- [ ] `GET /file/{token}` returns metadata for active tokens
- [ ] `GET /download/{token}` downloads active files
- [ ] Revoked/expired links return expected error responses

### Data and operational checks

- [ ] Upload directory persistence verified across restarts
- [ ] Database schema is initialized and migration SQL has run
- [ ] Logs are monitored for startup/runtime errors
- [ ] Rollback plan is documented

## TEAM4-01: Final Deployment Demo Walkthrough

This walkthrough is the final Sprint 4 demo script for presenting end-to-end deployment.

### 1. Prepare and start the stack

From repository root:

```bash
docker compose up --build
```

Expected startup:

- Postgres healthcheck becomes healthy
- Backend starts on `http://localhost:8080`
- Frontend starts on `http://localhost:3000`

### 2. Validate service health

Open or call:

- `GET http://localhost:8080/health`

Expected result: JSON response with `status: ok`.

### 3. Demo authentication flow

In frontend:

1. Register a new account on the register page.
2. Log in with newly created credentials.
3. Confirm dashboard and protected UI access are visible.

### 4. Demo upload and sharing flow

In authenticated dashboard:

1. Upload a valid file.
2. Capture generated token/share link.
3. Open download route and confirm metadata is shown.
4. Download file successfully.

### 5. Demo owner actions

In dashboard file list:

1. Revoke uploaded file link.
2. Verify revoked link returns error state on download page.
3. Delete file and verify it disappears from owner list.

### 6. Demo completion checkpoints

- Frontend, backend, and database are all running in containers.
- Public routes and authenticated routes behave as expected.
- Upload/download and ownership controls are validated live.

## TEAM4-02: Final Full-Stack Integration Verification (Production Setup)

Verification was run against production-oriented configuration in this repository.

### Verification commands

```bash
cd /Users/varshith/Downloads/ShareX
docker compose config -q

cd backend
go test ./...

cd ../frontend
npm run build
```

### Verification results

- Docker Compose configuration validation: PASS
- Backend unit/integration-level package tests: PASS
- Frontend production build compilation: PASS

### Integrated readiness conclusion

- Full-stack container configuration is valid.
- Backend and frontend pass release-blocking quality checks.
- Project is ready for final deployment/demo execution using Docker Compose.
