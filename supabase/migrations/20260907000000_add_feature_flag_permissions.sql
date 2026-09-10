-- Grant authenticated full CRUD on feature flag tables
-- RLS policies below restrict CUD to admin role only via has_role()
GRANT INSERT, UPDATE, DELETE ON feature_flags TO authenticated;
GRANT INSERT, UPDATE, DELETE ON feature_flag_user TO authenticated;

-- feature_flags: all authenticated users can read, only admins can mutate
CREATE POLICY admin_insert_feature_flags
ON feature_flags
FOR INSERT
TO authenticated
WITH CHECK (has_role('admin'));

CREATE POLICY admin_update_feature_flags
ON feature_flags
FOR UPDATE
TO authenticated
USING (has_role('admin'))
WITH CHECK (has_role('admin'));

CREATE POLICY admin_delete_feature_flags
ON feature_flags
FOR DELETE
TO authenticated
USING (has_role('admin'));

-- feature_flag_user: users can read their own rows, only admins can mutate
CREATE POLICY admin_insert_feature_flag_user
ON feature_flag_user
FOR INSERT
TO authenticated
WITH CHECK (has_role('admin'));

CREATE POLICY admin_update_feature_flag_user
ON feature_flag_user
FOR UPDATE
TO authenticated
USING (has_role('admin'))
WITH CHECK (has_role('admin'));

CREATE POLICY admin_delete_feature_flag_user
ON feature_flag_user
FOR DELETE
TO authenticated
USING (has_role('admin'));
