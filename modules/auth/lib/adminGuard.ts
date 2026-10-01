import { supabaseClient } from "@/supabase/client"
import { extractJwt } from "@/modules/shared/extract-jwt"

export const adminGuard = async () => {
    const client = supabaseClient(await extractJwt())
    const isAdmin = client.rpc('has_role', {
        p_role_name: 'admin'
    })

    return isAdmin;
}