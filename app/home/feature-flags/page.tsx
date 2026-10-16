
import { redirect } from 'next/navigation'
import { FeatureFlagHome, getFeatureFlags, getUsers, UserResults } from '@/modules/feature-flags'
import { supabaseClient } from '@/supabase/client';
import { extractJwt } from '@/modules/shared/extract-jwt';
import { FeatureFlagResults } from '@/modules/feature-flags/schemas/schemas';

interface FeatureFlagsProps {
    searchParams: Promise<{ page: string | undefined, flagId: string | undefined, searchQuery: string | undefined }>;
}

const page = async ({ searchParams }: FeatureFlagsProps) => {

    const client = supabaseClient(await extractJwt())

    const { data: permissionCheck, error: permissionError } = await client.rpc('has_permission', {
        permission_name: 'feature-flag.manage'
    })


    if (permissionError || !permissionCheck) {
        redirect('/home')
    }

    let featureFlags: FeatureFlagResults[] | undefined;
    try {
        featureFlags = await getFeatureFlags();
    } catch {
        redirect('/home')
    }

    let parsedPage: number | undefined;
    let validFlagId: string | undefined;
    let search: string | undefined;
    let users: UserResults | undefined;

    if (featureFlags && featureFlags.length > 0) {

        const { page, flagId, searchQuery } = await searchParams
        search = searchQuery ?? ''


        const parsed: number = Number(page)
        if (!Number.isInteger(parsed) || Number(parsed) < 1) {
            parsedPage = 1
        } else {
            parsedPage = parsed
        }

        const validFlag = featureFlags.some((f) => f.id === (flagId ?? null))

        if (!validFlag) {
            validFlagId = featureFlags[0].id
            parsedPage = 1
            search = ''
        } else {
            validFlagId = flagId;
        }


        users = await getUsers({ page: parsedPage, flagId: validFlagId ?? '', searchQuery: search })
    }


    return (
        <FeatureFlagHome
            featureFlags={featureFlags ?? []}
            users={users?.users}
            moreData={users?.moreData}
            page={parsedPage}
            currentFlagId={validFlagId}
            searchQuery={search}
        />
    )
}

export default page