-- FUNCTION: has_role(p_role_name text) → boolean
-- Returns true if the current authenticated user has the given role.
-- STABLE + SECURITY INVOKER: result is cached per query (safe — role cannot change mid-tx).
-- Used in application-layer admin checks (server actions).

CREATE OR REPLACE FUNCTION has_role(p_role_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY INVOKER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE r.name = p_role_name
        AND ur.user_id = auth.uid()
    );
$$;
