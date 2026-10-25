-- DEFAULT 0 is required so existing rows (user, admin) don't violate NOT NULL during the alter.
-- The UPDATE below sets the correct values immediately after.
alter table if exists public.roles
add column hierarchy_level int not null default 0;

insert into public.roles (name) values
    ('superadmin')
on conflict (name) do nothing;

-- Cross join: pairs every row from roles with every row from permissions.
-- The WHERE filters to superadmin rows only, giving superadmin all permissions.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from roles r, permissions p
where r.name = 'superadmin'
on conflict (role_id, permission_id) do nothing;

-- CASE is SQL's if/else: each WHEN checks a condition and returns the THEN value.
update public.roles
set hierarchy_level = case name
    when 'user'       then 1
    when 'admin'      then 2
    when 'superadmin' then 3
end;

-- ON CONFLICT must match the index definition exactly (lower(user_email)), not the raw column.
insert into public.users (first_name, last_name, user_email, user_password)
values ('super', 'admin', 'michaelalex03@outlook.com', '$2b$12$xQNej4k4ug67rI5t0ysdH.v1SXhYkNUwUlzlCutmJduHTuTTdDTUq')
on conflict (lower(user_email)) do nothing;

-- Cross join filtered to one user + one role, giving the superadmin user their role.
insert into public.user_roles (user_id, role_id)
select u.id, r.id
from users u, roles r
where u.user_email = 'michaelalex03@outlook.com'
and r.name = 'superadmin'
on conflict (user_id) do nothing;
