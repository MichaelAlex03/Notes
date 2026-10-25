-- Migration: Revoke service_role access on seed-only tables, update authenticated grants and policies
-- Tables affected: permissions, roles, user_roles

-- ============================================================
-- REVOKE mutation operations for service_role on seed-only tables
-- (permissions, roles, user_roles are seeded only — no runtime service_role access needed)
-- ============================================================
revoke insert, update, delete on permissions from service_role;
revoke insert, update, delete on roles from service_role;

-- ============================================================
-- GRANTS to authenticated on user_roles
-- ============================================================
grant update on user_roles to authenticated;

-- =======================================================================
-- NEW FUNCTIONS for checking if a user can make a change to user_roles
-- =======================================================================

-- Need to check if the user has the correct permissions and the role is under their hierarchy level
create or replace function is_allowed_to_update_user(
    p_target_role_id uuid
)
returns boolean
language plpgsql
security invoker
as $$
declare 
    has_perm boolean;
    actor_hierarchy_level int;
    target_role_hierarchy_level int;
begin
    select has_permission('permissions.manage') into has_perm;

    select r.hierarchy_level into actor_hierarchy_level
    from user_roles ur
    join roles r on ur.role_id = r.id
    where ur.user = auth.uid();

    select hierarchy_level into target_role_hierarchy_level
    from roles r
    where role_id = p_target_role_id;

    return has_perm and (actor_hierarchy_level > target_role_hierarchy_level);
end;
$$;



-- ============================================================
-- NEW POLICIES on user_roles
-- ============================================================

create policy elevated_view_access 
on user_roles
for select
to authenticated
using (has_permission('permissions.manage'));


create policy elevated_update_access
on user_roles
for update
to authenticated
using ( is_allowed_to_update_user(role_id) )
with check ( is_allowed_to_update_user(role_id) );