create or replace function get_user_permissions()
returns text[]
language sql
security definer
as $$
    select coalesce(array_agg(p.name), '{}')
    from public.user_roles ur
    join role_permissions rp on rp.role_id = ur.role_id
    join permissions p on rp.permission_id = p.id
    where ur.user_id = auth.uid()
$$;
