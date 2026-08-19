'use server'

import { supabaseAdmin } from "@/supabase/adminClient";
import { Confirm, ConfirmForm, SignUp, SignUpForm } from "../schema/schema";
import { sendVerifyEmail } from "@/app/lib/emails";
import { createHashedPassword } from "../signUp";
import { randomInt } from "crypto";

const RATE_LIMIT_WINDOW = 300000


export const signUp = async (data: SignUp) => {
    console.log(data)

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

    const validData = ConfirmForm.safeParse(verifyEmailData)

    if (!validData.success) {
        return {
            success: false,
            error: 'Invalid verify data'
        }
    }

    const { data: rateLimitAttempts, error: rateLimitError } = await supabaseAdmin
        .from('rate_limits')
        .select('id, attempts, window_start')
        .eq('identifier', validData.data.email)
        .eq('event_type', 'verify_sign_up_code')
        .gt('window_start', new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString())
        .order('window_start', { ascending: false })
        .limit(1)

    if (rateLimitError) {
        return {
            success: false,
            error: 'Unable to fetch rate limit attempts'
        }
    }

    const signUpAttempts = rateLimitAttempts.length > 0 ? rateLimitAttempts[0].attempts : 0

    if (signUpAttempts > 10) {
        const timeUntilReset = Math.ceil(((new Date(rateLimitAttempts[0].window_start).getTime() + RATE_LIMIT_WINDOW) - Date.now()) / (1000 * 60))
        return {
            success: false,
            error: `To many tries please try again in ${timeUntilReset} minutes`
        }
    }

    // Count is greater than 0 update else that means new row so insert
    if (signUpAttempts > 0) {
        const { error: rateLimitUpdateError } = await supabaseAdmin
            .from('rate_limits')
            .update({
                attempts: signUpAttempts + 1,
            })
            .eq('id', rateLimitAttempts[0].id)

        if (rateLimitUpdateError) {
            return {
                success: false,
                error: 'Unable to update rate limit'
            }
        }
    } else {
        const { error: rateLimitInsertError } = await supabaseAdmin.from('rate_limits')
            .insert({
                identifier: validData.data.email,
                event_type: 'verify_sign_up_code',
                attempts: signUpAttempts + 1,
                window_start: new Date(Math.floor(Date.now() / RATE_LIMIT_WINDOW) * RATE_LIMIT_WINDOW).toISOString()
            })

        if (rateLimitInsertError) {
            return {
                success: false,
                error: 'Unable to insert new rate limit row'
            }
        }

    }


    const { email, code } = validData.data;

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