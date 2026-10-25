-- TABLE: roles
-- RLS: enabled — authenticated users can SELECT; seed-only (no runtime mutations via service_role).
--      All mutations are intentionally revoked from service_role (must go through postgres directly).

CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    hierarchy_level INT  NOT NULL DEFAULT 0,
    CONSTRAINT uq_role UNIQUE (name)
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_roles ON roles FOR SELECT TO authenticated USING (has_role());

REVOKE ALL ON roles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON roles TO service_role;
