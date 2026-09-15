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

        // Timeout cookie — maxAge just needs to exceed the JWT expiration (5m) so the cookie
        // is still present when the next request checks it. A missing cookie and an expired
        // JWT look identical (both redirect), so the cookie must outlive the token to give us
        // the window to detect expiry and refresh. Adjust this value as needed — the JWT
        // expiration is the real auth boundary, the cookie is just the delivery mechanism.
        cookieStore.set('access_token', refreshResult.newAccess, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 30,
        })

        // Refresh token cookie maxAge matches the JWT expiration — once either expires the
        // session is over anyway, so keeping them in sync avoids a dangling cookie.
        // The access token cookie being the shorter-lived value is what effectively caps
        // how long a session can stay alive between requests.
        cookieStore.set('refresh_token', refreshResult.newRefresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60,
        });

    } else {
        redirect('/auth/sign-in')
    }

}