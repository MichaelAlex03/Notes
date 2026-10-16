-- TABLE: feature_flags
-- RLS: enabled — all authenticated users can SELECT; INSERT/UPDATE/DELETE require feature-flag.manage permission.

CREATE TABLE feature_flags (
    id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT    NOT NULL,
    global_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_feature_name UNIQUE (name)
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY authenticated_can_view      ON feature_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY admin_insert_feature_flags  ON feature_flags FOR INSERT TO authenticated WITH CHECK (has_permission('feature-flag.manage'));
CREATE POLICY admin_update_feature_flags  ON feature_flags FOR UPDATE TO authenticated USING (has_permission('feature-flag.manage')) WITH CHECK (has_permission('feature-flag.manage'));
CREATE POLICY admin_delete_feature_flags  ON feature_flags FOR DELETE TO authenticated USING (has_permission('feature-flag.manage'));

REVOKE ALL ON feature_flags FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON feature_flags TO authenticated;
GRANT SELECT, INSERT, UPDATE ON feature_flags TO service_role;
