'use client'

import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { SignUp, SignUpForm } from "../lib/schema/schema";
import { Button, TextField } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";

const SignUpPage = () => {

    const { control, handleSubmit } = useForm<SignUp>({
        resolver: zodResolver(SignUpForm),
        defaultValues: {
            first_name: "",
            last_name: "",
            user_email: "",
            password: ""
        }
    });

    const onSubmit: SubmitHandler<SignUp> = (data) => console.log(data)

    return (
        <div className="flex flex-col gap-4 h-screen items-center justify-center">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Controller
                    name="first_name"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            {...field}
                            variant="outlined"
                            label="First name"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    name="last_name"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            {...field}
                            variant="outlined"
                            label="Last name"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    name="user_email"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            {...field}
                            type="email"
                            variant="outlined"
                            label="Email"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    name="password"
                    control={control}
                    render={({ field, fieldState }) => (
                        <TextField
                            {...field}
                            type="password"
                            variant="outlined"
                            label="Password"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                        />
                    )}
                />
                <Button variant="contained" type="submit">
                    <p>Sign Up</p>
                </Button>
            </form>

            <p className="text-black">Already have an account? <span className="underline cursor-pointer">Sign in</span></p>
        </div>
    )
}

export default SignUpPage
