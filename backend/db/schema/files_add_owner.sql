-- Add optional owner reference for file uploads
ALTER TABLE files
ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL;