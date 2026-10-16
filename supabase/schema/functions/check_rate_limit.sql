-- FUNCTION: check_rate_limit(identifier, event_type, window_size_ms, threshold) → table
-- Atomically checks and increments a rate limit counter.
-- FOR UPDATE locks the row so concurrent requests for the same identifier queue
-- rather than race, preventing TOCTOU over-counting.
-- Returns (allowed, attempts, windowEnd).
-- Callable by service_role only.

CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier    TEXT,
    p_event_type    TEXT,
    p_window_size_ms BIGINT,
    p_threshold     INT
)
RETURNS TABLE (allowed BOOLEAN, attempts INT, windowEnd TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempts     INT DEFAULT 0;
    v_id           UUID;
    v_window_start TIMESTAMPTZ;
    v_window_end   TIMESTAMPTZ;
BEGIN
    SELECT r.attempts, r.id, r.window_start
    INTO v_attempts, v_id, v_window_start
    FROM rate_limits r
    WHERE event_type  = p_event_type
    AND   identifier  = p_identifier
    AND   window_start > now() - (p_window_size_ms * interval '1 millisecond')
    LIMIT 1
    FOR UPDATE;

    v_window_end := v_window_start + (p_window_size_ms * interval '1 millisecond');

    IF v_attempts >= p_threshold THEN
        RETURN QUERY SELECT false, v_attempts, v_window_end;
        RETURN;
    END IF;

    IF v_attempts = 0 THEN
        INSERT INTO rate_limits (event_type, identifier, window_start, attempts)
        VALUES (p_event_type, p_identifier, now(), 1);
    ELSE
        UPDATE rate_limits SET attempts = v_attempts + 1 WHERE id = v_id;
    END IF;

    RETURN QUERY SELECT true, v_attempts + 1, null::TIMESTAMPTZ;
END;
$$;

REVOKE EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, BIGINT, INT) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, BIGINT, INT) TO service_role;
