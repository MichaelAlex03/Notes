import { supabaseClient } from "@/supabase/client"
import { extractJwt } from "@/modules/shared/extract-jwt";
import { FeatureFlagResults, FetchUserProps, UserResults } from "../schemas/schemas";


export const fetchFeatureFlags = async (): Promise<FeatureFlagResults[]> => {
    const client = supabaseClient(await extractJwt())

    const { data: featureFlags, error: featureFlagErrors } = await client
        .from('feature_flags')
        .select('*')

    if (featureFlagErrors) {
        throw new Error('Unable to fetch feature flags')
    }

    return featureFlags
}



export const fetchUsers = async ({ page, flagId, searchQuery }: FetchUserProps): Promise<UserResults> => {
    const client = supabaseClient(await extractJwt())

    const limit = 50
    const offset = (page - 1) * limit
    let moreData = false
    const { data: userResults, error: userResultsError } = await client
        .rpc('get_users_with_flag_override', {
            p_flag_id: flagId,
            p_limit: limit,
            p_offset: offset,
            p_search: searchQuery
        })


    if (userResultsError || !userResults) {
        throw new Error('Unable to fetch users')
    }

    moreData = userResults.length > limit ? true : false
    const users = moreData ? userResults.slice(0, limit) : userResults

    const res = users.map((u) => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        enabled: u.enabled
    }))

    return {
        users: res,
        moreData
    }
}