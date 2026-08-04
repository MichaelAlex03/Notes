'use client'

import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { SignIn, SignInForm } from "../lib/schemas/schema";
import { Button, TextField } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "../lib/server/signInServerAction";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";



const SignInPage = () => {

    const router = useRouter()
    const { setAccessToken } = useAuth()

    const { control, handleSubmit, formState } = useForm<SignIn>({
        resolver: zodResolver(SignInForm),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const [error, setError] = useState<string>('');
    const [signingIn, setSigningIn] = useState<boolean>(false);

    const onSubmit: SubmitHandler<SignIn> = async (data) => {
        setSigningIn(true)
        try {

            const signInRes = await signIn(data)
            if (!signInRes.success) {
                setError(signInRes.error)
                return
            }

            setAccessToken(signInRes.accessToken)
            router.replace('/home')
        } finally {
            setSigningIn(false)
        }

    }

    const handleGoToSignUp = () => {
        router.push('/auth/sign-up')
    }

    return (
        <div className="flex flex-col gap-4 h-screen items-center justify-center">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Controller
                    name="email"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            {...field}
                            variant="outlined"
                            label="email"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message} />
                    )}
                />
                <Controller
                    name="password"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            {...field}
                            variant="outlined"
                            label="password"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                        />
                    )}
                />
                <Button variant="contained" type="submit">
                    <p>Sign In</p>
                </Button>
            </form>

            <button onClick={handleGoToSignUp} disabled={signingIn}>
                <p className="text-black">Don't have an account? <span className="underline cursor-pointer">Sign up</span></p>
            </button>
        </div>
    )
}

export default SignInPage