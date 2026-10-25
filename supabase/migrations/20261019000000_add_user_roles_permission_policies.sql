-- Policies for user roles so service role is no longer needed
create policy elevated_view_privelages 
on public.user_roles
for select
to authenticated
using (has_permission('permissions.manage'));

create policy elevated_update_privelages
on public.user_roles
for update
to authenticated
using (has_permission('permissions.manage'))
with check (has_permission('permissions.manage'));

-- Service role only ever needs to insert on sign up 
revoke all on public.user_roles from service_role;
grant insert on public.user_roles to service_role;
