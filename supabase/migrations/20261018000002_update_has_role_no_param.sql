DROP FUNCTION IF EXISTS has_role(TEXT);

-- user_roles RLS filters to the current user's rows, so EXISTS returns true only if this user has a role.
CREATE OR REPLACE FUNCTION has_role()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY INVOKER
AS $$
    SELECT EXISTS (SELECT 1 FROM user_roles);
$$;
