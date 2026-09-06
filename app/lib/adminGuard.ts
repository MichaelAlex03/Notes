import { supabaseClient } from "@/supabase/client"

export const adminGuard = async () => {
    const client = supabaseClient()
    const isAdmin = client.rpc('has_role', {
        p_role_name: 'admin'
    })

    return isAdmin;
}