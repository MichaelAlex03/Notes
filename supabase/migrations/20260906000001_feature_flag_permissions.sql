-- feature_flags
REVOKE ALL ON feature_flags FROM PUBLIC;
REVOKE ALL ON feature_flags FROM anon;
REVOKE ALL ON feature_flags FROM authenticated;
GRANT SELECT ON feature_flags TO authenticated;
GRANT SELECT, INSERT, UPDATE ON feature_flags TO service_role;

-- feature_flag_user
REVOKE ALL ON feature_flag_user FROM PUBLIC;
REVOKE ALL ON feature_flag_user FROM anon;
REVOKE ALL ON feature_flag_user FROM authenticated;
GRANT SELECT ON feature_flag_user TO authenticated;
GRANT SELECT, INSERT, UPDATE ON feature_flag_user TO service_role;

