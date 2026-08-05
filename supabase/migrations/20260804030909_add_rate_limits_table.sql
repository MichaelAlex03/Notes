CREATE TABLE rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    event_type TEXT NOT NULL,
    attempts INT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL
);

CREATE INDEX rate_limit_identifier ON rate_limits (identifier)
