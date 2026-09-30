import { supabaseClient } from "@/supabase/client"
import { cookies } from "next/headers"

export const adminGuard = async () => {
    const cookieStore = await cookies()
    const jwt = cookieStore.get('access_token')?.value
    const client = supabaseClient(jwt)
    const isAdmin = client.rpc('has_role', {
        p_role_name: 'admin'
    })

    return isAdmin;
}