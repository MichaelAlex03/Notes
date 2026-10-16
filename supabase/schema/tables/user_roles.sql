-- TABLE: user_roles
-- Links users to roles.
-- RLS: enabled — users can only see their own rows; mutations via service_role only.
--      DELETE is intentionally revoked from service_role (must go through postgres directly).

CREATE TABLE user_roles (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

CREATE INDEX indx_user_roles_lookup ON user_roles (user_id);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_own_roles ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

REVOKE ALL ON user_roles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_roles TO service_role;
