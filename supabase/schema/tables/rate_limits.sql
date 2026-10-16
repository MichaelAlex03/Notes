-- TABLE: rate_limits
-- RLS: enabled — no policies; all client requests blocked.
--      service_role bypasses RLS and has full access.

CREATE TABLE rate_limits (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier   TEXT        NOT NULL,
    event_type   TEXT        NOT NULL,
    attempts     INT         NOT NULL,
    window_start TIMESTAMPTZ NOT NULL
);

-- Supports the check_rate_limit lookup: narrows by event_type + identifier,
-- then scans window_start newest-first.
CREATE INDEX idx_rate_limits_lookup ON rate_limits (event_type, identifier, window_start DESC);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
