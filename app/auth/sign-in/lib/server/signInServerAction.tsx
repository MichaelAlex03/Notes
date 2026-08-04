'use server'

import bcrypt from "bcryptjs";
import { SignIn } from "../schemas/schema"
import { supabaseAdmin } from "@/supabase/adminClient";
import { createJWT, createRefreshToken } from "../signIn";
import { cookies } from "next/headers";

export const signIn = async (data: SignIn) => {
	const { email, password } = data;

	if (!email || !password) {
		return {
			success: false,
			'error': 'Missing email or password',
			accessToken: ''
		}
	}

	const { data: userData, error } = await supabaseAdmin
		.from('users')
		.select('user_email, user_password, id')
		.eq('user_email', email)
		.single()

	if (error || !userData) {
		return {
			success: false,
			'error': 'Unable to find user',
			accessToken: ''
		}
	}

	const hashedPass = await bcrypt.compare(password, userData.user_password)

	if (!hashedPass) {
		return {
			success: false,
			'error': 'Incorrect password',
			accessToken: ''
		}
	}

	const accessToken = await createJWT({ id: userData.id });
	const refreshToken = await createRefreshToken({ id: userData.id });

	const { error: insertError } = await supabaseAdmin
		.from('users')
		.update({
			...userData,
			refresh_token: refreshToken
		})
		.eq('user_email', email)

	if (insertError){
		return {
			success: false,
			'error': 'Unable to insert refresh token',
			accessToken: ''
		}
	}

	const cookieStore = await cookies();

	// 2. Refresh Token Cookie
	cookieStore.set('refresh_token', refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/api/auth', // CRITICAL: Only sent to the refresh API route and logout to invalidate it in DB
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});


	return {
		success: true,
		'error': '',
		accessToken
	}

}
