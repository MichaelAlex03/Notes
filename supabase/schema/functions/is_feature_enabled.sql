-- FUNCTION: is_feature_enabled(p_flag_name text) → boolean
-- Returns true if the feature flag is on for the current user —
-- either because global_enabled is true OR the user has a personal override row with enabled=true.
-- COALESCE(uf.enabled, false): users with no override row produce null from LEFT JOIN;
-- without COALESCE, null OR false = null (not false), which would accidentally enable the flag.

CREATE OR REPLACE FUNCTION is_feature_enabled(p_flag_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_global_enabled BOOLEAN := FALSE;
    v_user_enabled   BOOLEAN := FALSE;
    v_user_id        UUID;
BEGIN
    v_user_id := auth.uid();

    SELECT f.global_enabled, COALESCE(uf.enabled, false)
    INTO v_global_enabled, v_user_enabled
    FROM feature_flags f
    LEFT JOIN feature_flag_user uf
        ON uf.flag_id = f.id AND uf.user_id = v_user_id
    WHERE f.name = p_flag_name;

    RETURN v_global_enabled OR v_user_enabled;
END;
$$;
