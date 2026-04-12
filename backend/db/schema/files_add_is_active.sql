-- Add active flag so links can be revoked without deleting records
ALTER TABLE files
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;