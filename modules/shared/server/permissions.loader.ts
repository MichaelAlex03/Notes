import { supabaseClient } from "@/supabase/client"
import { extractJwt } from "../extract-jwt"
import type { Permission } from "../types/types"


export const fetchUserPermissions = async (): Promise<Permission[]> => {

    const client = supabaseClient(await extractJwt())

    const { data: userPermissions, error: permError } = await client.rpc('get_user_permissions')

    if (permError){
        throw permError
    }

    return userPermissions as Permission[]

}