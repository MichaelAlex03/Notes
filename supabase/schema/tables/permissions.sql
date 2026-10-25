-- TABLE: permissions
-- RLS: enabled — authenticated users can SELECT; seed-only (no runtime mutations via service_role).
--      All mutations are intentionally revoked from service_role (must go through postgres directly).

CREATE TABLE permissions (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    CONSTRAINT uq_permission UNIQUE (name)
);

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_permissions ON permissions FOR SELECT TO authenticated USING (has_role());

REVOKE ALL ON permissions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON permissions TO service_role;

-- Seeded rows
-- ('feature-flag.manage') → admin
-- ('permissions.manage')  → admin
