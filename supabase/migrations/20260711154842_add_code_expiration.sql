-- Add expiration for the code and Refresh Token

ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS email_expiration TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refresh_token TEXT DEFAULT NULL;
