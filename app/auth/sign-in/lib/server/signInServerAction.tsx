'use server'

import bcrypt from "bcryptjs";
import { SignIn, SignInForm } from "../schemas/schema"
import { supabaseAdmin } from "@/supabase/adminClient";
import { createJWT, createRefreshToken } from "../signIn";
import { cookies } from "next/headers";
import { headers } from 'next/headers'

const RATE_LIMIT_SIGN_IN_WINDOW_MS = 300000

export const signIn = async (data: SignIn) => {

	const validData = SignInForm.safeParse(data)

	if (!validData.success) {
		return {
			success: false,
			error: 'Sign in payload data invalid',
			accessToken: ''
		}
	}

	const { email, password } = validData.data

	const h = await headers()
	const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? h.get('x-real-ip') ?? 'unknown'

	// Rate limit by IP to prevent an attacker from spreading requests across many
	// email addresses to bypass per-email limits.
	const { data: ipRateLimits, error: ipRateLimitError } = await supabaseAdmin.rpc('check_rate_limit', {
		p_event_type: 'sign.in',
		p_window_size_ms: RATE_LIMIT_SIGN_IN_WINDOW_MS,
		p_identifier: ip,
		p_threshold: 10
	})

	if (!ipRateLimits || ipRateLimitError) return { success: false, error: 'Unable to fetch rate limits', accessToken: '' }
	if (!ipRateLimits[0].allowed) {
		const remainingMinutes = Math.ceil((new Date(ipRateLimits[0].windowend).getTime() - Date.now()) / 60000)
		return { success: false, error: `Too many attempts, try again in ${remainingMinutes} minutes`, accessToken: '' }
	}

	// Rate limit by email to prevent an attacker from brute-forcing a single
	// account's password from many different IP addresses.
	const { data: emailRateLimits, error: emailRateLimitError } = await supabaseAdmin.rpc('check_rate_limit', {
		p_event_type: 'sign.in',
		p_window_size_ms: RATE_LIMIT_SIGN_IN_WINDOW_MS,
		p_identifier: email,
		p_threshold: 5
	})

	if (!emailRateLimits || emailRateLimitError) return { success: false, error: 'Unable to fetch rate limits', accessToken: '' }
	if (!emailRateLimits[0].allowed) {
		const remainingMinutes = Math.ceil((new Date(emailRateLimits[0].windowend).getTime() - Date.now()) / 60000)
		return { success: false, error: `Too many attempts, try again in ${remainingMinutes} minutes`, accessToken: '' }
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
