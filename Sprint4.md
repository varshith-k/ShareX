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
