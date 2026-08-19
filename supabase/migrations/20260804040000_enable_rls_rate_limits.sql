-- Enable RLS with no policies on rate_limits.
-- anon + authenticated clients (publishable key) are fully blocked.
-- service_role (supabaseAdmin) bypasses RLS and retains full access.
ALTER TABLE IF EXISTS rate_limits ENABLE ROW LEVEL SECURITY;
