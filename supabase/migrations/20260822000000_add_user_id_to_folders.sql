-- Add user_id column to folders table
ALTER TABLE folders
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL REFERENCES users(id)
