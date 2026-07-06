'use server'

import { supabaseAdmin } from "@/supabase/adminClient";
import { SignUp, SignUpForm } from "../schema/schema";


export const signUp = async (data: SignUp) => {

    const validData = SignUpForm.safeParse(data)

    if (!validData.success) {
        return {
            success: false,
            error: 'Sign up data invalid'
        }
    }

    const newUser = validData.data
    const { error } = await supabaseAdmin
        .from('users')
        .insert({ newUser })

    if (error) {
        return {
            success: false,
            error: 'Cannot add new user'
        }
    }

    return {
        success: true,
        error: ''
    }
}