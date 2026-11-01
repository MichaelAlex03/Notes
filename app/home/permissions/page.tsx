
import { extractJwt } from '@/modules/shared/extract-jwt'
import { supabaseClient } from '@/supabase/client'
import { redirect } from 'next/navigation'



const page = async () => {

    const client = supabaseClient(await extractJwt())

    const { data: permissionCheck, error: permissionError } = await client.rpc('has_permission', {
        permission_name: 'permissions.manage'
    })

    if (!permissionCheck || permissionError){
        redirect('/home')
    }

  

    return (
        <div>page</div>
    )
}

export default page