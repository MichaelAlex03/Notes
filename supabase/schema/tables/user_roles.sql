-- TABLE: user_roles
-- Links users to roles.
-- RLS: enabled — users can see their own rows; elevated access via hierarchy-aware function.
--      service_role: INSERT only (used during sign-up). DELETE revoked (must go through postgres directly).
--      authenticated: SELECT and UPDATE only (no INSERT — sign-up handled by service_role).

CREATE TABLE user_roles (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_role UNIQUE (user_id)
);

CREATE INDEX indx_user_roles_lookup ON user_roles (user_id);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_own_roles ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY elevated_view_access ON user_roles FOR SELECT TO authenticated USING (has_permission('permissions.manage'));
CREATE POLICY elevated_update_access ON user_roles FOR UPDATE TO authenticated
    USING (is_allowed_to_update_user(role_id))
    WITH CHECK (is_allowed_to_update_user(role_id));

REVOKE ALL ON user_roles FROM PUBLIC, anon, authenticated;
GRANT SELECT, UPDATE ON user_roles TO authenticated;
GRANT INSERT ON user_roles TO service_role;
