-- TABLE: feature_flag_user
-- Per-user feature flag overrides.
-- RLS: enabled — users can SELECT their own row; admins (feature-flag.manage) can SELECT all and mutate.

CREATE TABLE feature_flag_user (
    id      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flag_id UUID    NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_user_flag UNIQUE (user_id, flag_id)
);

-- flag_id first (join column in the RPC), user_id second to pin to a specific user.
CREATE INDEX idx_lookup_flag ON feature_flag_user (flag_id, user_id);

ALTER TABLE feature_flag_user ENABLE ROW LEVEL SECURITY;

CREATE POLICY can_view_own_feature          ON feature_flag_user FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY admin_select_feature_flag_user ON feature_flag_user FOR SELECT TO authenticated USING (has_permission('feature-flag.manage'));
CREATE POLICY admin_insert_feature_flag_user ON feature_flag_user FOR INSERT TO authenticated WITH CHECK (has_permission('feature-flag.manage'));
CREATE POLICY admin_update_feature_flag_user ON feature_flag_user FOR UPDATE TO authenticated USING (has_permission('feature-flag.manage')) WITH CHECK (has_permission('feature-flag.manage'));
CREATE POLICY admin_delete_feature_flag_user ON feature_flag_user FOR DELETE TO authenticated USING (has_permission('feature-flag.manage'));

REVOKE ALL ON feature_flag_user FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON feature_flag_user TO authenticated;
GRANT SELECT, INSERT, UPDATE ON feature_flag_user TO service_role;
