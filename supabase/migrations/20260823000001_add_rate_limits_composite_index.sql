-- Drop the identifier-only index in favour of the composite index below
DROP INDEX IF EXISTS rate_limit_identifier;

-- Composite index to support the check_rate_limit lookup:
-- narrows by event_type, then identifier, then scans window_start newest-first
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
ON rate_limits (event_type, identifier, window_start DESC);
