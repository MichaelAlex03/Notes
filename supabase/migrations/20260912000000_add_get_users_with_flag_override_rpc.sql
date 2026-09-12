-- RPC: get_users_with_flag_override
-- Returns a paginated list of all users with their override status for a given feature flag.
-- Users without a row in feature_flag_user are treated as enabled=false via COALESCE.
-- Supports optional name search (ILIKE on first_name/last_name); pass NULL to skip filtering.
-- Returns limit+1 rows so the caller can detect whether more pages exist.
-- Requires SECURITY DEFINER because feature_flag_user RLS only allows users to see their own row.

CREATE OR REPLACE FUNCTION get_users_with_flag_override(
    p_flag_id UUID,
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0,
    p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    enabled BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT u.id, u.first_name, u.last_name, COALESCE(uf.enabled, false)
    FROM users u
    LEFT JOIN feature_flag_user uf
    ON u.id = uf.user_id
    AND uf.flag_id = p_flag_id
    WHERE (p_search IS NULL OR u.first_name ILIKE '%' || p_search || '%' OR u.last_name ILIKE '%' || p_search || '%')
    LIMIT p_limit + 1
    OFFSET p_offset;
$$;
