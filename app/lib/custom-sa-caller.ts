import { verifyAccessToken } from "../auth/sign-in/lib/signIn"
import { refresh } from "./refresh"
import { cookies } from "next/headers"

export const customSACaller = async () => {


    const cookieStore = await cookies()

    const accessToken = cookieStore.get('access_token') ?? null
    const refreshToken = cookieStore.get('refresh_token') ?? null

    if (!accessToken) {
        return {
            success: false,
            error: 'No access token'
        }
    }

    if (!refreshToken) {
        return {
            success: false,
            error: 'No refresh token'
        }
    }

    let isValidJwt = false;
    try {
        isValidJwt = await verifyAccessToken(accessToken.value) ? true : false
    } catch (error) {
        isValidJwt = false
    }


    if (!isValidJwt) {
        const refreshResult = await refresh(refreshToken.value)
        if (!refreshResult.success) {
            return {
                success: false,
                error: 'Unable to generate a new access token'
            }
        }

        cookieStore.set('access_token', refreshResult.newAccess, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 5, // 5 min
        })

        // 2. Refresh Token Cookie
        cookieStore.set('refresh_token', refreshResult.newRefresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 30,
        });

    }

    return { success: true, error: '' }

}