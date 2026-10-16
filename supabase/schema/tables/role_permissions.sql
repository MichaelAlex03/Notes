-- TABLE: role_permissions
-- Junction table linking roles to permissions.
-- RLS: enabled — authenticated users can SELECT; mutations via service_role only.
--      DELETE is intentionally revoked from service_role (must go through postgres directly).

CREATE TABLE role_permissions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

CREATE INDEX indx_role_perms_lookup ON role_permissions (role_id);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_role_permissions ON role_permissions FOR SELECT TO authenticated USING (true);

REVOKE ALL ON role_permissions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON role_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON role_permissions TO service_role;

-- Seeded rows
-- admin → feature-flag.manage
-- admin → permissions.manage
