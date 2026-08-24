-- Enable RLS for folders and notes tables
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Allow users to select only their own folders
CREATE POLICY users_select_own
ON folders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to insert folders only for themselves
CREATE POLICY users_insert_own
ON folders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to update only their own folders
CREATE POLICY users_update_own
ON folders
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow users to delete only their own folders
CREATE POLICY users_delete_own
ON folders
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Allow users to select only their own notes
CREATE POLICY users_select_own
ON notes
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to insert notes only for themselves
CREATE POLICY users_insert_own
ON notes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to update only their own notes
CREATE POLICY users_update_own
ON notes
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow users to delete only their own notes
CREATE POLICY users_delete_own
ON notes
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
