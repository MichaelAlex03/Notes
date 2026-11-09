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
    v_attempts     INT;
    v_new_attempts INT;
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


    IF NOT FOUND THEN
        -- No live window. Either no row exists (insert), an expired row exists (reset it),
        -- or a concurrent request just created one (increment it).
        INSERT INTO rate_limits AS rl (event_type, identifier, window_start, attempts)
        VALUES (p_event_type, p_identifier, now(), 1)
        ON CONFLICT (event_type, identifier) DO UPDATE
        -- rl = the existing row, EXCLUDED = the row we tried to insert.
        -- Existing window already ended by the time of the new row -> start over;
        -- otherwise keep the existing window_start and only bump attempts.
        SET window_start = CASE
                WHEN rl.window_start + (p_window_size_ms * interval '1 millisecond') < EXCLUDED.window_start
                THEN EXCLUDED.window_start ELSE rl.window_start END,
            attempts = CASE
                WHEN rl.window_start + (p_window_size_ms * interval '1 millisecond') < EXCLUDED.window_start
                THEN EXCLUDED.attempts ELSE rl.attempts + 1 END
        RETURNING rl.attempts, rl.window_start INTO v_new_attempts, v_window_start;

        -- Concurrent first requests can both land here (FOR UPDATE locks nothing when
        -- there is no row), so the threshold must be re-checked against the count the
        -- upsert produced. v_new_attempts already includes this attempt, hence `>`.
        IF v_new_attempts > p_threshold THEN
            v_window_end := v_window_start + (p_window_size_ms * interval '1 millisecond');
            RETURN QUERY SELECT false, v_new_attempts, v_window_end;
            RETURN;
        END IF;

        RETURN QUERY SELECT true, v_new_attempts, null::TIMESTAMPTZ;
        RETURN;
    END IF;

    IF v_attempts >= p_threshold THEN
        v_window_end := v_window_start + (p_window_size_ms * interval '1 millisecond');
        RETURN QUERY SELECT false, v_attempts, v_window_end;
        RETURN;
    END IF;

    UPDATE rate_limits SET attempts = v_attempts + 1 WHERE id = v_id;

    RETURN QUERY SELECT true, v_attempts + 1, null::TIMESTAMPTZ;
END;
$$;

REVOKE EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, BIGINT, INT) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, BIGINT, INT) TO service_role;
