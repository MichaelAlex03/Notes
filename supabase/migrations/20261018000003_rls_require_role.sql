-- folders: require an active role on all operations
DROP POLICY users_select_own ON folders;
DROP POLICY users_insert_own ON folders;
DROP POLICY users_update_own ON folders;
DROP POLICY users_delete_own ON folders;

CREATE POLICY users_select_own ON folders FOR SELECT TO authenticated USING (user_id = auth.uid() AND has_role());
CREATE POLICY users_insert_own ON folders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND has_role());
CREATE POLICY users_update_own ON folders FOR UPDATE TO authenticated USING (user_id = auth.uid() AND has_role()) WITH CHECK (user_id = auth.uid() AND has_role());
CREATE POLICY users_delete_own ON folders FOR DELETE TO authenticated USING (user_id = auth.uid() AND has_role());

-- notes: require an active role on all operations
DROP POLICY users_select_own ON notes;
DROP POLICY users_insert_own ON notes;
DROP POLICY users_update_own ON notes;
DROP POLICY users_delete_own ON notes;

CREATE POLICY users_select_own ON notes FOR SELECT TO authenticated USING (user_id = auth.uid() AND has_role());
CREATE POLICY users_insert_own ON notes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND has_role());
CREATE POLICY users_update_own ON notes FOR UPDATE TO authenticated USING (user_id = auth.uid() AND has_role()) WITH CHECK (user_id = auth.uid() AND has_role());
CREATE POLICY users_delete_own ON notes FOR DELETE TO authenticated USING (user_id = auth.uid() AND has_role());

-- reference tables: revoked users cannot read role/permission data
DROP POLICY view_permissions ON permissions;
CREATE POLICY view_permissions ON permissions FOR SELECT TO authenticated USING (has_role());

DROP POLICY view_roles ON roles;
CREATE POLICY view_roles ON roles FOR SELECT TO authenticated USING (has_role());

DROP POLICY view_role_permissions ON role_permissions;
CREATE POLICY view_role_permissions ON role_permissions FOR SELECT TO authenticated USING (has_role());
