-- Checks if the current authenticated user has a given role.
-- STABLE: result is cached per query since a user's role cannot change mid-transaction.
CREATE OR REPLACE FUNCTION has_role(p_role_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY INVOKER
AS $$
    SELECT EXISTS(
        SELECT 1  FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE r.name = p_role_name
        AND ur.user_id = auth.uid()
    )
$$;


CREATE POLICY view_own_roles
ON user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY view_roles
ON roles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY view_permissions
ON permissions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY view_role_permissions
ON role_permissions
FOR SELECT
TO authenticated
USING (true);

-- Strip all default privileges from PUBLIC, anon, and authenticated on RBAC tables
REVOKE ALL ON roles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON permissions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON role_permissions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON user_roles FROM PUBLIC, anon, authenticated;

-- authenticated: SELECT only — mutations go through service_role
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;
GRANT SELECT ON user_roles TO authenticated;

-- service_role: full CRUD except DELETE — deletions must go through postgres directly
REVOKE DELETE ON roles FROM service_role;
REVOKE DELETE ON permissions FROM service_role;
REVOKE DELETE ON role_permissions FROM service_role;
REVOKE DELETE ON user_roles FROM service_role;
GRANT SELECT, INSERT, UPDATE ON roles TO service_role;
GRANT SELECT, INSERT, UPDATE ON permissions TO service_role;
GRANT SELECT, INSERT, UPDATE ON role_permissions TO service_role;
GRANT SELECT, INSERT, UPDATE ON user_roles TO service_role;
