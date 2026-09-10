import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from './auth/sign-in/lib/signIn'
import { refresh } from './lib/refresh';

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {

    const accessTokenCookie = request.cookies.get('access_token') ?? null
    const refreshToken = request.cookies.get('refresh_token') ?? null

    if (!accessTokenCookie) {
        return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }

    if (!refreshToken) {
        return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }

    let isValidJwt = false;
    if (accessTokenCookie) {
        try {
            isValidJwt = await verifyAccessToken(accessTokenCookie.value) ? true : false
        } catch (error) {
            isValidJwt = false
        }
    }

    let response;
    if (!isValidJwt) {
        const result = await refresh(refreshToken.value)
        if (!result.success) {
            return NextResponse.redirect(new URL('/auth/sign-in', request.url))
        }

        response = NextResponse.next()
        response.cookies.set('access_token', result.newAccess, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 5,
        })
        response.cookies.set('refresh_token', result.newRefresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 30,
        })
    }


    return response ?? NextResponse.next()
}



export const config = {
    matcher: ['/home', '/home/:path*']
}