-- Grant full CRUD on public.users to the service_role so server-side admin
-- clients (supabaseAdmin) can read and write user rows without RLS restrictions.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO service_role;
