import { extractJwt } from "@/modules/shared/extract-jwt"
import { supabaseClient } from "@/supabase/client"
import { LoadRolesResults, UserRolesResults } from "../types/types"
import { supabaseAdmin } from "@/supabase/adminClient"

export const loadPermissionsByRole = async (): Promise<Map<string, string[]>> => {

    const client = supabaseClient(await extractJwt())
    const { data: roleData, error: rolesErrors } = await client
        .from('roles')
        .select('name, id')

    if (!roleData || rolesErrors) {
        throw new Error('Unable to fetch roles')
    }


    const { data: rolePerms, error: rolePermErrors } = await client
        .from('role_permissions')
        .select('role_id, permissions(name)')

    if (rolePermErrors) {
        throw new Error('Unable to fetch permissions')
    }

    const permissions = new Map<string, string[]>();
    for (const perm of rolePerms) {
        const existing = permissions.get(perm.role_id) ?? []
        permissions.set(perm.role_id, [...existing, perm.permissions.name])
    }

    const rolePermsissions = new Map<string, string[]>()

    for (const roles of roleData) {
        rolePermsissions.set(roles.name, permissions.get(roles.id) ?? [])
    }

    return rolePermsissions;
}


export const loadRoles = async (): Promise<LoadRolesResults[]> => {

    const client = supabaseClient(await extractJwt())

    // Query users role
    const { data: userRole, error: userRoleError } = await client
        .from('user_roles')
        .select('roles(name, hierarchy_level)')
        .single()

    if (!userRole || userRoleError){
        throw new Error ('Unable to fetch users role')
    }

    // Given users role only get the roles that below its role level
    const { data: roles, error: rolesError } = await client
        .from('roles')
        .select('name, id')
        .lt('hierarchy_level', userRole.roles.hierarchy_level)

    // !roles check is fine since the only people that can access page is admin (hierarchy_level 2) and above
    if (!roles || rolesError){
        throw new Error ('Unable to fetch roles')
    }

    return roles
}


export const getUsersRoles = async (): Promise<UserRolesResults[]> => {
    
    const client = supabaseClient(await extractJwt())

    const { data: userRoles, error: userRolesError } = await client
        .from('user_roles')
        .select('id, users(first_name, last_name), roles (name)')

    if (userRolesError || !userRoles) {
        throw new Error ('Unable to fetch user roles')
    }

    return userRoles.map((u) => ({
        id: u.id,
        first_name: u.users.first_name,
        last_name: u.users.last_name,
        role_name: u.roles.name
    }))
}

