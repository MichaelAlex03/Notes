-- Composite index on notes to support RLS-filtered lookups by folder
-- Covers both "all notes for user" and "all notes for user in a folder"
CREATE INDEX IF NOT EXISTS idx_notes_user_lookup ON notes (user_id, folder_id);
-- Index on folders to support RLS-filtered lookups by user
CREATE INDEX IF NOT EXISTS dx_folder_user_lookup ON folders (user_id);