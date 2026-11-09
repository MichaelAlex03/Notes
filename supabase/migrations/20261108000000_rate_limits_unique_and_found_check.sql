-- Migration: one rate_limits row per (event_type, identifier), and fix check_rate_limit
-- so the first attempt actually creates a row.
--
-- Bug: SELECT ... INTO sets the targets to NULL when no row matches, which overwrote
-- the `DEFAULT 0` on v_attempts. `v_attempts = 0` was then NULL (falsy), so the insert
-- branch never ran and the limiter never started counting. The function now branches
-- on FOUND instead.
--
-- Because of the unique constraint, an expired window can no longer be left behind
-- while a new row is inserted for the same pair. The insert uses ON CONFLICT to reset
-- an expired row in place (or increment a live one, if a concurrent request created it
-- first), which also closes the first-attempt race that FOR UPDATE can't (it locks
-- nothing when there are no rows).

-- 1. Enforce one row per pair.
ALTER TABLE rate_limits
    ADD CONSTRAINT rate_limits_event_type_identifier_key UNIQUE (event_type, identifier);

-- 2. Replace the function.
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier     TEXT,
    p_event_type     TEXT,
    p_window_size_ms BIGINT,
    p_threshold      INT
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
