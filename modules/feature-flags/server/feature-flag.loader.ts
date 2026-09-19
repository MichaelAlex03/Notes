import { customSACaller } from "@/modules/auth";
import { supabaseClient } from "@/supabase/client"

interface FeatureFlagResults {
    id: string;
    name: string;
    global_enabled: boolean;
}

export const fetchFeatureFlags = async (): Promise<FeatureFlagResults[]> => {
    const client = supabaseClient()

    const { data: featureFlags, error: featureFlagErrors } = await client
        .from('feature_flags')
        .select('*')

    if (featureFlagErrors || !featureFlags) {
        throw new Error('Unable to fetch feature flags')
    }

    return featureFlags
}

type User = {
    id: string;
    first_name: string;
    last_name: string;
    enabled: boolean
}

interface UserResults {
    users: User[];
    moreData: boolean;
}

interface FetchUserProps {
    page: number;
    flagId: string;
    searchQuery: string
}

export const fetchUsers = async ({ page, flagId, searchQuery }: FetchUserProps): Promise<UserResults> => {
    await customSACaller()
    
    const client = supabaseClient()

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
    const users = moreData ? userResults.slice(-1) : userResults

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