-- RPC function rather than a plain SELECT + UPDATE from the application layer to
-- eliminate the TOCTOU race condition. Doing a read then write in two separate
-- statements leaves a window where concurrent requests can both read the same count,
-- both pass the threshold check, and both increment — letting more requests through
-- than the limit allows. The FOR UPDATE inside this function locks the row so any
-- concurrent requests on the same identifier are queued until the current transaction
-- commits, guaranteeing the check and increment are atomic.
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_event_type TEXT,
    p_window_size_ms BIGINT,
    p_threshold INT
)
RETURNS TABLE (allowed BOOLEAN, attempts INT, windowEnd TIMESTAMPTZ)
SECURITY DEFINER 
AS $$
DECLARE 
    v_attempts INT DEFAULT 0;
    v_id UUID;
    v_window_start TIMESTAMPTZ;
    v_window_end TIMESTAMPTZ;
BEGIN
    SELECT attempts, id, window_start INTO v_attempts, v_id, v_window_start
    FROM rate_limits r
    WHERE event_type = p_event_type
    AND identifier = p_identifier
    AND window_start > now() - (p_window_size_ms * interval '1 millisecond')
    LIMIT 1
    FOR UPDATE; -- locks the row so concurrent requests for the same identifier queue here rather than racing

    v_window_end := v_window_start + (p_window_size_ms * interval '1 millisecond');

    IF v_attempts > p_threshold THEN
        RETURN QUERY SELECT false, v_attempts, v_window_end;
        RETURN;
    END IF;

    IF v_attempts = 0 THEN
        INSERT INTO rate_limits (event_type, identifier, window_start, attempts)
        VALUES (p_event_type, p_identifier, now(), 1);
    ELSE
        UPDATE rate_limits rl
        SET attempts = attempts + 1
        WHERE id = v_id;
    END IF;

    RETURN QUERY SELECT true, v_attempts + 1, null::TIMESTAMPTZ;
END;
$$ LANGUAGE plpgsql;
