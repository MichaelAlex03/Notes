'use server'

import { customSACaller } from "@/modules/authentication"
import { supabaseClient } from "@/supabase/client"
import { type Error } from "@/app/types/errors"
import { extractJwt } from "@/modules/shared/extract-jwt"
import { AddFeatureFlagResults, AddFeatureFlagSchema } from "../schemas/schemas"
import { isRedirectError } from "next/dist/client/components/redirect-error"


export const enableGlobalAccess = async (flagId: string, enabled: boolean): Promise<Error> => {
    await customSACaller()
    const client = supabaseClient(await extractJwt())

    // Defense-in-depth: RLS already blocks non-admins at the DB level, but checking here
    // avoids a wasted round trip and makes the intent of this action explicit.
    const { data: checkAdmin, error: checkAdminError } = await client.rpc('has_role', {
        p_role_name: 'admin'
    })

    // Separate the RPC failure from the authorization failure so callers can distinguish
    // between "we couldn't determine your role" and "you're definitely not an admin".
    if (checkAdminError) {
        return {
            success: false,
            error: 'Unable to check if user is admin'
        }
    }

    if (!checkAdmin) {
        return {
            success: false,
            error: 'User is not admin unable to use this server action'
        }
    }

    const { error: updateGlobalError } = await client
        .from('feature_flags')
        .update({
            global_enabled: enabled
        })
        .eq('id', flagId)

    if (updateGlobalError) {
        return {
            success: false,
            error: 'Unable to toggle feature flag'
        }
    }

    return {
        success: true,
        error: ''
    }
}

export const enableUserAccess = async (flagId: string, userId: string, enabled: boolean): Promise<Error> => {
    await customSACaller()
    const client = supabaseClient(await extractJwt())

    // Defense-in-depth: RLS already blocks non-admins at the DB level, but checking here
    // avoids a wasted round trip and makes the intent of this action explicit.
    const { data: checkAdmin, error: checkAdminError } = await client.rpc('has_role', {
        p_role_name: 'admin'
    })

    // Separate the RPC failure from the authorization failure so callers can distinguish
    // between "we couldn't determine your role" and "you're definitely not an admin".
    if (checkAdminError) {
        return {
            success: false,
            error: 'Unable to check if user is admin'
        }
    }

    if (!checkAdmin) {
        return {
            success: false,
            error: 'User is not admin unable to use this server action'
        }
    }

    // Users have no row in feature_flag_user by default, so we check first and insert
    // if missing, otherwise update the existing row.
    const { data: userFeatureFlag, error: userFeatureFlagError } = await client
        .from('feature_flag_user')
        .select('id')
        .eq('user_id', userId)
        .eq('flag_id', flagId)
        .maybeSingle()

    if (userFeatureFlagError) {
        return {
            success: false,
            error: 'Unable to fetch users individual feature flag'
        }
    }

    if (!userFeatureFlag) {

        const { error: insertUserAccessError } = await client
            .from('feature_flag_user')
            .insert({
                flag_id: flagId,
                user_id: userId,
                enabled
            })

        if (insertUserAccessError) {
            return {
                success: false,
                error: 'Unable to insert feature flag row for user'
            }
        }

    } else {
        const { error: updateUserAccessError } = await client
            .from('feature_flag_user')
            .update({
                enabled
            })
            .eq('user_id', userId)
            .eq('flag_id', flagId)

        if (updateUserAccessError) {
            return {
                success: false,
                error: 'Unable to toggle user feature flag access'
            }
        }

    }

    return {
        success: true,
        error: ''
    }
}

/*
  * No AbortController here — addFeatureFlag is a cheap INSERT and idempotent
  * by name, so if the timeout fires before the response arrives but the DB
  * write went through, retrying is safe and the wasted server work is trivial.
  * withTimeout is sufficient to bound the client-side hang.
  */
export const addFeatureFlag = async (flagName: string): Promise<AddFeatureFlagResults> => {

    await customSACaller()
    const client = supabaseClient(await extractJwt())
    const validName = AddFeatureFlagSchema.safeParse({ flagName })



    if (!validName.success) {
        return {
            success: false,
            flagId: '',
            error: 'Invalid name type'
        }
    }

    const { data: flagId, error: insertFlagError } = await client
        .from('feature_flags')
        .upsert(
            { name: validName.data.flagName, global_enabled: false },
            { onConflict: 'name' }
        )
        .select()
        .single()


    if (insertFlagError) {
        return {
            success: false,
            flagId: '',
            error: 'Unable to insert feature flag'
        }
    }

    if (!flagId) {
        return {
            success: false,
            flagId: '',
            error: 'Unable to select id for new feature flag'
        }
    }

    return {
        success: true,
        flagId: flagId.id,
        error: ''
    }

}
