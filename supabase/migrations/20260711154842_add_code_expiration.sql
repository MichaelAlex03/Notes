-- Add expiration for the code and Refresh Token

ALTER TABLE public.users
ADD COLUMN email_expiration TIMESTAMPTZ,
ADD COLUMN refresh_token TEXT;
