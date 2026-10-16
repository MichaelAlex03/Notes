-- TABLE: folders
-- RLS: enabled — users can only access their own rows.

CREATE TABLE folders (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_name TEXT        NOT NULL,
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX dx_folder_user_lookup ON folders (user_id);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON folders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY users_insert_own ON folders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY users_update_own ON folders FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY users_delete_own ON folders FOR DELETE TO authenticated USING (user_id = auth.uid());
