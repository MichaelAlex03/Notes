-- Migration: init
-- Created: 2026-06-26 (UTC)

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_password TEXT NOT NULL,
    authenticated BOOLEAN DEFAULT FALSE,
    email_code INT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS user_email_lower_key ON users(lower(user_email));

-- Enable RLS with no policies: this locks the table to all client requests
-- (anon + authenticated via the publishable key). We intentionally add no
-- policies because this table holds password hashes that should never reach
-- the client. Auth (login/signup) runs server-side with the secret key, which
-- bypasses RLS — so service_role still has full access without any policy.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
