'use server'

import bcrypt from "bcryptjs";
import { SignIn, SignInForm } from "../schemas/schema"
import { supabaseAdmin } from "@/supabase/adminClient";
import { createJWT, createRefreshToken } from "../signIn";
import { cookies } from "next/headers";

const RATE_LIMIT_SIGN_IN_WINDOW_MS = 300000

export const signIn = async (data: SignIn) => {

	const validData = SignInForm.safeParse(data)

	if (!validData.success){
		return {
			success: false,
			error: 'Sign in payload data invalid',
			accessToken: ''
		}
	}

	const { email, password } = validData.data

	const { data: signInRate, error: signInRateError } = await supabaseAdmin
		.from('rate_limits')
		.select('*')
		.eq('identifier', email)
		.eq('event_type', 'sign_in')
		.gt('window_start', new Date(Date.now() - RATE_LIMIT_SIGN_IN_WINDOW_MS).toISOString())
		.order('window_start', { ascending: false })
		.limit(1)

	if (signInRateError) {
		return {
			success: false,
			error: 'Unable to fetch sign in rate limit data',
			accessToken: ''
		}
	}

	const attempts = signInRate.length > 0 ? signInRate[0].attempts : 0

	if (attempts > 10) {
		const timeUntilReset = Math.ceil(((new Date(signInRate[0].window_start).getTime() + RATE_LIMIT_SIGN_IN_WINDOW_MS) - Date.now()) / (1000 * 60))
		return {
			success: false,
			error: `To many tries please try again in ${timeUntilReset} minutes`,
			accessToken: ''
		}
	}

	if (attempts === 0) {
		const { error: signInRateLimitErr } = await supabaseAdmin
			.from('rate_limits')
			.insert({
				identifier: email,
				attempts: 1,
				window_start: new Date((Date.now() / RATE_LIMIT_SIGN_IN_WINDOW_MS) * RATE_LIMIT_SIGN_IN_WINDOW_MS).toISOString(),
				event_type: 'sign_in'

			})

		if (signInRateLimitErr) {
			return {
				success: false,
				error: 'Unable to insert new rate limit row',
				accessToken: ''
			}
		}
	} else {
		const { error: signInUpdateLimit } = await supabaseAdmin
			.from('rate_limits')
			.update({
				attempts: attempts + 1
			})
			.eq('id', signInRate[0].id)

		if (signInUpdateLimit){
			return {
				success: false,
				error: 'Unable to update rate limit',
				accessToken: ''
			}
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

	if (insertError) {
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
