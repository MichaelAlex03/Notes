-- Create feature_flags table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    global_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_feature_name UNIQUE (name)
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY authenticated_can_view 
ON feature_flags
FOR SELECT
TO authenticated
USING (true);

-- Create feature_flag_user table
CREATE TABLE IF NOT EXISTS feature_flag_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    flag_id UUID NOT NULL REFERENCES feature_flags (id),
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_user_flag UNIQUE (user_id, flag_id)
);

-- Composite index: flag_id first (join column), user_id second to pin to a specific user.
-- Covers the LEFT JOIN from feature_flags → feature_flag_user used in the RPC.
-- A missing row means no override — treated as false via COALESCE in the query.
CREATE INDEX IF NOT EXISTS idx_lookup_flag ON feature_flag_user (flag_id, user_id);

ALTER TABLE feature_flag_user ENABLE ROW LEVEL SECURITY;

CREATE POLICY can_view_own_feature
ON feature_flag_user
FOR SELECT
TO authenticated
USING (user_id = auth.uid());


-- COALESCE(uf.enabled, false): users without an override row produce a null from the LEFT JOIN.
-- Without COALESCE, null OR true = true which is fine, but null OR false = null, not false —
-- which could accidentally enable the feature for users who have no row at all.
CREATE OR REPLACE FUNCTION is_feature_enabled(
    p_flag_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE 
    v_global_enabled BOOLEAN := FALSE;
    v_user_enabled BOOLEAN := FALSE;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();

    SELECT f.global_enabled, COALESCE(uf.enabled, false) INTO v_global_enabled, v_user_enabled
    FROM feature_flags f
    LEFT JOIN feature_flag_user uf
    ON uf.flag_id = f.id
    AND uf.user_id = v_user_id
    WHERE f.name = p_flag_name;

    RETURN v_global_enabled OR v_user_enabled;

END;
$$;
