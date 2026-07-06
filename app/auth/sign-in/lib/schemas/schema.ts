import z from "zod"

export const SignInForm = z.object({
    email: z.string(),
    password: z.string()
})

export type SignIn = z.infer<typeof SignInForm>