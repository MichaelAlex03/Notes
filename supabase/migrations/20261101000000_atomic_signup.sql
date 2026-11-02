-- Migration: Atomic signup — mark user authenticated and assign default role in a single transaction

create or replace function atomic_sign_up(
    p_email text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid;
    v_role_id uuid;
begin

    select id into v_user_id 
    from public.users u
    where u.user_email = p_email;

    if v_user_id is null then
        raise exception 'user not found';
    end if;

    select id into v_role_id
    from public.roles r
    where r.hierarchy_level = 1;

    if v_role_id is null then
        raise exception 'role not found';
    end if;

    update public.users u
    set authenticated = true, email_code = null
    where u.user_email = p_email;

    insert into user_roles (user_id, role_id)
    values (v_user_id, v_role_id);

end;
$$;
