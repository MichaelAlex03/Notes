import { verifyAccessToken } from "../auth/sign-in/lib/signIn"
import { refresh } from "./refresh"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"


// redirect() throws internally — if you wrap this call in a try/catch you must
// explicitly re-throw the redirect error, otherwise the redirect is swallowed.
export const customSACaller = async () => {

    const cookieStore = await cookies()

    const accessToken = cookieStore.get('access_token') ?? null
    const refreshToken = cookieStore.get('refresh_token') ?? null

    if (!accessToken) {
        redirect('/auth/sign-in')
    }

    if (!refreshToken) {
        redirect('/auth/sign-in')
    }

    const result = await verifyAccessToken(accessToken.value) 

    // Refresh only on a genuinely expired token — an attacker must present a structurally valid
    // access token to reach this path, so a bare refresh token alone isn't enough to authenticate.
    if (!result.payload && result.expired) {
        const refreshResult = await refresh(refreshToken.value)
        if (!refreshResult.success) {
            redirect('/auth/sign-in')
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

    } else {
        redirect('/auth/sign-in')
    }

}