-- FUNCTION: has_role() → boolean
-- Returns true if the current authenticated user has any role (i.e. is not revoked).
-- STABLE + SECURITY INVOKER: result is cached per query (safe — role cannot change mid-tx).
-- Used in RLS policies to block revoked accounts from accessing data.

-- user_roles RLS filters to the current user's rows, so EXISTS returns true only if this user has a role.
CREATE OR REPLACE FUNCTION has_role()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY INVOKER
AS $$
    SELECT EXISTS (SELECT 1 FROM user_roles);
$$;
