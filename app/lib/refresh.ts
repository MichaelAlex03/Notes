import { supabaseAdmin } from '@/supabase/adminClient';
import { createJWT, createRefreshToken, verifyRefreshToken } from '../auth/sign-in/lib/signIn';

export const refresh = async (refreshToken: string) => {

    const payload = await verifyRefreshToken(refreshToken)
    if (!payload) {
        return {
            success: false,
            error: 'Invalid refresh token',
            newRefresh: '',
            newAccess: ''
        }
    }

    const { data: userData, error: userDataError } = await supabaseAdmin
        .from('users')
        .select('refresh_token, id')
        .eq('id', payload.sub as string)
        .single()

    if (!userData || userDataError) {
        return {
            success: false,
            error: 'Unable to find user given refresh token',
            newRefresh: '',
            newAccess: ''
        }
    }

    if (userData?.refresh_token !== refreshToken) {

        // Invalidate current refresh token because it has been stolen
        const { error: removeRefreshError } = await supabaseAdmin
            .from('users')
            .update({
                refresh_token: null
            })
            .eq('id', payload.sub as string)

        return {
            success: false,
            error: 'Expired or old refresh token being used',
            newRefresh: '',
            newAccess: ''
        }
    }

    const accessToken = await createJWT({ sub: userData.id, role: 'authenticated' })
    const newRefreshToken = await createRefreshToken({ sub: userData.id, role: 'authenticated' })

    const { error: updateRefreshError } = await supabaseAdmin
        .from('users')
        .update({ refresh_token: newRefreshToken })
        .eq('refresh_token', refreshToken)


    if (updateRefreshError) {
        return {
            success: false,
            error: 'Unable to update refresh token for user',
            newRefresh: '',
            newAccess: ''
        }
    }


    return {
        success: true,
        error: '',
        newRefresh: newRefreshToken,
        newAccess: accessToken
    }
}