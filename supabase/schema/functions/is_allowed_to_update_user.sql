-- FUNCTION: is_allowed_to_update_user(p_target_role_id uuid) → boolean
-- Returns true if the current user has permissions.manage AND their hierarchy level
-- is strictly greater than the target role's hierarchy level.
-- Used in RLS policies on user_roles to guard UPDATE operations.

CREATE OR REPLACE FUNCTION is_allowed_to_update_user(p_target_role_id uuid)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY INVOKER
AS $$
DECLARE
    has_perm                    BOOLEAN;
    actor_hierarchy_level       INT;
    target_role_hierarchy_level INT;
BEGIN
    SELECT has_permission('permissions.manage') INTO has_perm;

    SELECT r.hierarchy_level INTO actor_hierarchy_level
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid();

    SELECT r.hierarchy_level INTO target_role_hierarchy_level
    FROM roles r
    WHERE r.id = p_target_role_id;

    RETURN has_perm AND (actor_hierarchy_level > target_role_hierarchy_level);
END;
$$;
