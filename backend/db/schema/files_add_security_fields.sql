-- Add expiration timestamp and optional password protection to file shares
ALTER TABLE files
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL;

ALTER TABLE files
ADD COLUMN IF NOT EXISTS password_hash TEXT NULL;
