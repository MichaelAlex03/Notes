-- FUNCTION: has_permission(permission_name text) → boolean
-- Returns true if the current authenticated user has the given permission.
-- STABLE: result is cached per query (safe — role cannot change mid-tx).
-- Used in RLS policies on feature_flags and feature_flag_user.

CREATE OR REPLACE FUNCTION has_permission(permission_name text)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY INVOKER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE p.name = permission_name
    );
$$;
