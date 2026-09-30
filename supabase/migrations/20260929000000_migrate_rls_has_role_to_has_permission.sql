-- Migrate RLS policies from has_role() to has_permission() to decouple policies from roles.
-- Drops and recreates each policy that previously checked has_role('admin').
--
-- Affected tables / policies:
--   feature_flags:      admin_insert_feature_flags, admin_update_feature_flags, admin_delete_feature_flags
--   feature_flag_user:  admin_insert_feature_flag_user, admin_update_feature_flag_user,
--                       admin_delete_feature_flag_user, admin_select_feature_flag_user

-- feature_flags ---------------------------------------------------------------

DROP POLICY IF EXISTS admin_insert_feature_flags ON feature_flags;

CREATE POLICY admin_insert_feature_flags
ON feature_flags
FOR INSERT
TO authenticated
WITH CHECK (has_permission('feature-flag.manage'));

DROP POLICY IF EXISTS admin_update_feature_flags ON feature_flags;

CREATE POLICY admin_update_feature_flags
ON feature_flags
FOR UPDATE
TO authenticated
USING (has_permission('feature-flag.manage'))
WITH CHECK (has_permission('feature-flag.manage'));

DROP POLICY IF EXISTS admin_delete_feature_flags ON feature_flags;

CREATE POLICY admin_delete_feature_flags
ON feature_flags
FOR DELETE
TO authenticated
USING (has_permission('feature-flag.manage'));

-- feature_flag_user -----------------------------------------------------------

DROP POLICY IF EXISTS admin_insert_feature_flag_user ON feature_flag_user;

CREATE POLICY admin_insert_feature_flag_user
ON feature_flag_user
FOR INSERT
TO authenticated
WITH CHECK (has_permission('feature-flag.manage'));

DROP POLICY IF EXISTS admin_update_feature_flag_user ON feature_flag_user;

CREATE POLICY admin_update_feature_flag_user
ON feature_flag_user
FOR UPDATE
TO authenticated
USING (has_permission('feature-flag.manage'))
WITH CHECK (has_permission('feature-flag.manage'));

DROP POLICY IF EXISTS admin_delete_feature_flag_user ON feature_flag_user;

CREATE POLICY admin_delete_feature_flag_user
ON feature_flag_user
FOR DELETE
TO authenticated
USING (has_permission('feature-flag.manage'));

DROP POLICY IF EXISTS admin_select_feature_flag_user ON feature_flag_user;

CREATE POLICY admin_select_feature_flag_user
ON feature_flag_user
FOR SELECT
TO authenticated
USING (has_permission('feature-flag.manage'));
