-- TABLE: notes
-- RLS: enabled — users can only access their own rows.

CREATE TABLE notes (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    notes_content TEXT        NOT NULL,
    user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id     UUID        NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Covers both "all notes for user" and "all notes for user in a folder".
CREATE INDEX idx_notes_user_lookup ON notes (user_id, folder_id);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON notes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY users_insert_own ON notes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY users_update_own ON notes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY users_delete_own ON notes FOR DELETE TO authenticated USING (user_id = auth.uid());
