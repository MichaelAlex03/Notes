import z from "zod"

export const SignUpForm = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    user_email: z.email("Please enter a valid email"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
       
})

export type SignUp = z.infer<typeof SignUpForm>

export const ConfirmForm = z.object({
    code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code")
})

export type Confirm = z.infer<typeof ConfirmForm>


