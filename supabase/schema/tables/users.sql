-- TABLE: users
-- RLS: enabled — no policies; all client requests blocked.
--      service_role bypasses RLS and has full CRUD.

CREATE TABLE users (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name       TEXT        NOT NULL,
    last_name        TEXT        NOT NULL,
    user_email       TEXT        NOT NULL,
    user_password    TEXT        NOT NULL,
    authenticated    BOOLEAN     DEFAULT FALSE,
    email_code       INT         DEFAULT NULL,
    email_expiration TIMESTAMPTZ DEFAULT NULL,
    refresh_token    TEXT        DEFAULT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX user_email_lower_key ON users (lower(user_email));

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO service_role;
