import z from "zod"

export const SignInForm = z.object({
    email: z.string(),
    password: z.string()
})

export type SignIn = z.infer<typeof SignInForm>

export const JWTPayload = z.object({
    id: z.string()
})

export type JWT = z.infer<typeof JWTPayload>