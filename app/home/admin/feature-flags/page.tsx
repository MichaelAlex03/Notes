
import { redirect } from 'next/navigation'
import { FeatureFlagHome, getFeatureFlags, getUsers } from '@/modules/feature-flags'
import { supabaseClient } from '@/supabase/client';
import { extractJwt } from '@/modules/shared/extract-jwt';

interface FeatureFlagsProps {
    params: Promise<{ page: string | undefined, flagId: string | undefined, searchQuery: string | undefined }>;
}

const page = async ({ params }: FeatureFlagsProps) => {
    
    const client = supabaseClient(await extractJwt())

    const { data: permissionCheck, error: permissionError } = await client.rpc('has_permission', {
        permission_name: 'feature-flag.manage'
    })


    if (permissionError || !permissionCheck){
        redirect('/home/admin')
    }

    const { page, flagId, searchQuery } = await params
    let parsedPage = 1;
    let validFlagId = ''

    if (!Number.isInteger(page) || Number(page) < 1) {
        parsedPage = 1
    } else {
        parsedPage = Number(page)
    }

    const featureFlags = await getFeatureFlags()
    const validFlag = featureFlags.some((f) => f.id === (flagId ?? null))

    if (!validFlag){
        validFlagId = featureFlags[0].id
        parsedPage = 1
    }

    const users = await getUsers({ page: parsedPage, flagId: validFlagId, searchQuery: searchQuery ?? '' })

    return (
        <FeatureFlagHome
            featureFlags={featureFlags}
            users={users.users}
            moreData={users.moreData}
            page={parsedPage}
            currentFlagId={validFlagId}
            searchQuery={searchQuery}
        />
    )
}

export default page