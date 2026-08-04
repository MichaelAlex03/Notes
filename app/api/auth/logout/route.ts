import { supabaseAdmin } from '@/supabase/adminClient';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value

    cookieStore.delete('refresh_token')

    if (!refreshToken) {
        return new NextResponse(null, { status: 204 })
    }

    const { error } = await supabaseAdmin
        .from('users')
        .update({ refresh_token: null })
        .eq('refresh_token', refreshToken)

    if (error) {
        return NextResponse.json({ message: 'Failed to invalidate session' }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
}