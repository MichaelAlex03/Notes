-- FUNCTION: get_user_permissions() → text[]
-- Returns all permission names held by the current authenticated user.
-- Returns '{}' (empty array) if the user has no permissions.
-- SECURITY DEFINER so it can join across user_roles without RLS restrictions.

CREATE OR REPLACE FUNCTION get_user_permissions()
RETURNS text[]
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT coalesce(array_agg(p.name), '{}')
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid();
$$;
