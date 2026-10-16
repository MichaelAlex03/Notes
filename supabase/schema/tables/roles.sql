-- TABLE: roles
-- RLS: enabled — authenticated users can SELECT; mutations via service_role only.
--      DELETE is intentionally revoked from service_role (must go through postgres directly).

CREATE TABLE roles (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    CONSTRAINT uq_role UNIQUE (name)
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_roles ON roles FOR SELECT TO authenticated USING (true);

REVOKE ALL ON roles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON roles TO service_role;
