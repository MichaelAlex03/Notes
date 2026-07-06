'use client'

import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { SignIn, SignInForm } from "../lib/schemas/schema";
import { Button, TextField } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";



const SignInPage = () => {

    const { control, handleSubmit, formState } = useForm<SignIn>({
        resolver: zodResolver(SignInForm),
        defaultValues: {
            email: "",
            password: ""
        }
    });
    const onSubmit: SubmitHandler<SignIn> = (data) => console.log("test")

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

            <p className="text-black">Don't have an account? <span className="underline cursor-pointer">Sign up</span></p>
        </div>
    )
}

export default SignInPage