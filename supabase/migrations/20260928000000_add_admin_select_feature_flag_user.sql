-- Allow admins to read all rows in feature_flag_user.
-- The existing can_view_own_feature policy already covers regular users (user_id = auth.uid()).
-- Postgres ORs multiple SELECT policies, so either condition grants access.
CREATE POLICY admin_select_feature_flag_user
ON feature_flag_user
FOR SELECT
TO authenticated
USING (has_role('admin'));
