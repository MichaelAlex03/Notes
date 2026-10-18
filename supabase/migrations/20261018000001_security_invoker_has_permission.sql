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
