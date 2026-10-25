-- Service role only ever needs to insert on sign up 
-- Cant give to authenticated because user is not authenticated at the time
revoke all on public.user_roles from service_role;
grant insert on public.user_roles to service_role;
