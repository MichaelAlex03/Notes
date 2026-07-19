'use server'

import { supabaseAdmin } from "@/supabase/adminClient";
import { Confirm, ConfirmForm, SignUp, SignUpForm } from "../schema/schema";
import { sendVerifyEmail } from "@/app/lib/emails";
import { createHashedPassword } from "../signUp";
import { randomInt } from "crypto";


export const signUp = async (data: SignUp) => {

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
        return {
            success: false,
            error: 'Cannot add new user'
        }
    }

    await sendVerifyEmail(newUser.user_email)

    return {
        success: true,
        error: ''
    }
}

export const verifySignUp = async (verifyEmailData: Confirm) => {

    const validData = ConfirmForm.safeParse(verifyEmailData)

    if (!validData.success){
        return {
            success: false,
            error: 'Invalid verify data'
        }
    }

    const { email, code } = validData.data;

    const { data, error } = await supabaseAdmin
        .from('users')
        .select('email_code')
        .eq('user_email', email)
        .single()

    if (error || code != (String(data.email_code) ?? '')){
        return {
            success: false,
            error: 'Incorrect code entered. Please try again'
        }
    }

    return {
        success: true,
        error: ''
    }

}

export const resendEmail = async (email: string) => {



    await sendVerifyEmail(email)
}