import { supabaseAdmin } from '@/supabase/adminClient';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createJWT, createRefreshToken, verifyRefreshToken } from '@/app/auth/sign-in/lib/signIn';

export async function POST(request: NextRequest) {

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
        return NextResponse.json({ messsage: 'Missing refresh token' }, { status: 401 })
    }

    const payload = await verifyRefreshToken(refreshToken)
    if (!payload) {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', payload.id as string)
        .single()

    if (!userData || userError) {
        return NextResponse.json({ error: 'Unable to look up user from refresh token' }, { status: 500 })
    }

    // If a user hits this then someone stole the old refreshToken and tried to use it
    if (userData.refresh_token !== refreshToken) {
        const response = NextResponse.json({ error: 'Invalid Token' }, { status: 401 })
        response.cookies.delete('refresh_token')
        return response
    }

    const accessToken = await createJWT({ id: userData.id })
    const newRefreshToken = await createRefreshToken({ id: userData.id })

    const { error: updateRefreshError } = await supabaseAdmin
        .from('users')
        .update({ refresh_token: newRefreshToken })
        .eq('refresh_token', refreshToken)

    if (updateRefreshError) {
        return NextResponse.json({ error: 'Unable to update refresh token' }, { status: 500 })
    }

    cookieStore.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({ accessToken })

}