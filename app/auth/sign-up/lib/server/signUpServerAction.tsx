'use server'

import { supabaseAdmin } from "@/supabase/adminClient";
import { Confirm, ConfirmForm, SignUp, SignUpForm } from "../schema/schema";
import { sendVerifyEmail } from "@/app/lib/emails";
import { createHashedPassword } from "../signUp";
import { randomInt } from "crypto";
import { checkRateLimits } from "@/app/auth/lib/server/rateLimit";
import { headers } from 'next/headers'

const RATE_LIMIT_WINDOW = 300000


export const signUp = async (data: SignUp) => {

    const h = await headers()
    const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? h.get('x-real-ip') ?? 'unknown'

    const { data: rateLimits, error: rateLimitError } = await supabaseAdmin.rpc('check_rate_limit', {
        p_event_type: 'sign.up',
        p_window_size_ms: RATE_LIMIT_WINDOW,
        p_identifier: ip,
        p_threshold: 10
    })

    if (!rateLimits || rateLimitError) {
        return {
            success: false,
            error: 'Unable to fetch rate limits'
        }
    }

    const remainingMinutes = Math.ceil(new Date(rateLimits[0].windowend).getTime() - Date.now() / (1000 * 60))
    if (!rateLimits[0].allowed) return { success: false, error: `Too many attempts try again in ${remainingMinutes}` }

    const validData = SignUpForm.safeParse(data)

    if (!validData.success) {
        return {
            success: false,
            error: 'Sign up data invalid'
        }
    }

    const { password, ...profile } = validData.data
    const securePass = await createHashedPassword(password)
    const emailCode = randomInt(100000, 1000000)
    const newUser = { ...profile, user_password: securePass, email_code: emailCode }



    const { error } = await supabaseAdmin
        .from('users')
        .insert(newUser)

    if (error) {
        console.error('Supabase insert error:', error)
        return {
            success: false,
            error: 'Cannot add new user'
        }
    }

    /*
     * sendVerifyEmail throws an Error class instance on failure.
     * Next.js cannot serialize class instances across the server action boundary,
     * so we catch it here and return a plain object instead.
     */
    try {
        await sendVerifyEmail(newUser.user_email, emailCode)
    } catch {
        return {
            success: false,
            error: 'Failed to send verification email'
        }
    }

    return {
        success: true,
        error: ''
    }
}

export const verifySignUp = async (verifyEmailData: Confirm) => {

    const h = await headers()
    const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? h.get('x-real-ip') ?? 'unknown'

    const { data: ipRateLimits, error: ipRateLimitError } = await supabaseAdmin.rpc('check_rate_limit', {
        p_event_type: 'verify.sign.up',
        p_window_size_ms: RATE_LIMIT_WINDOW,
        p_identifier: ip,
        p_threshold: 10
    })

    if (!ipRateLimits || ipRateLimitError) {
        return {
            success: false,
            error: 'Unable to fetch rate limits'
        }
    }

    const remainingMinutes = Math.ceil(new Date(ipRateLimits[0].windowend).getTime() - Date.now() / (1000 * 60))
    if (!ipRateLimits[0].allowed) return { success: false, error: `Too many attempts try again in ${remainingMinutes}` }

    const validData = ConfirmForm.safeParse(verifyEmailData)

    if (!validData.success) {
        return {
            success: false,
            error: 'Invalid verify data'
        }
    }

    const { email, code } = validData.data

    const { data: emailRateLimits, error: emailRateLimitError } = await supabaseAdmin.rpc('check_rate_limit', {
        p_event_type: 'verify.sign.up',
        p_window_size_ms: RATE_LIMIT_WINDOW,
        p_identifier: email,
        p_threshold: 10
    })

    if (!emailRateLimits || emailRateLimitError) {
        return {
            success: false,
            error: 'Unable to fetch rate limits'
        }
    }

    const emailRemainingMinutes = Math.ceil(new Date(emailRateLimits[0].windowend).getTime() - Date.now() / (1000 * 60))
    if (!emailRateLimits[0].allowed) return { success: false, error: `Too many attempts try again in ${emailRemainingMinutes}` }

    const { data, error } = await supabaseAdmin
        .from('users')
        .select('email_code')
        .eq('user_email', email)
        .single()

    if (error || code != (String(data.email_code) ?? '')) {
        return {
            success: false,
            error: 'Incorrect code entered. Please try again'
        }
    }

    const { error: signUpError } = await supabaseAdmin
        .from('users')
        .update({
            authenticated: true,
            email_code: null
        })
        .eq('user_email', email)

    if (signUpError)
        return {
            success: false,
            error: 'Unable to authenticate user'
        }

    return {
        success: true,
        error: ''
    }

}

export const resendEmail = async (email: string) => {

    const emailCode = randomInt(100000, 1000000)


    const { error } = await supabaseAdmin
        .from('users')
        .update({ email_code: emailCode })
        .eq('user_email', email)

    if (error) {
        console.error('Supabase insert error:', error)
        return {
            success: false,
            error: 'Cannot add new user'
        }
    }

    try {
        await sendVerifyEmail(email, emailCode)
    } catch (error) {
        return {
            success: false,
            error: 'Failed to send verification email'
        }
    }
}