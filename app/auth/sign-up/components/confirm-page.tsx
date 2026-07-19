'use client'

import { useEffect, useRef, useState } from "react"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { Button, FormHelperText, TextField } from "@mui/material"
import { zodResolver } from "@hookform/resolvers/zod"
import { Confirm, ConfirmForm } from "../lib/schema/schema"
import { resendEmail, verifySignUp } from "../lib/server/signUpServerAction"
import { useRouter, useSearchParams } from "next/navigation"

const CODE_LENGTH = 6


const ConfirmPage = () => {

    const inputs = useRef<Array<HTMLInputElement | null>>([]);
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email') ?? ''

    const { control, handleSubmit, formState: { isSubmitting } } = useForm<Confirm>({
        resolver: zodResolver(ConfirmForm),
        defaultValues: {
            code: ""
        }
    })

    const [error, setError] = useState<string>('')

    const handleEmailResent = () => {
        resendEmail('test')
    }

    const onSubmit: SubmitHandler<Confirm> = async (data) => {

        setError('')
        const body = {
            ...data,
            email
        }

        const verifyRes = await verifySignUp(body);
        if (!verifyRes.success) {
            setError(verifyRes.error)
            return
        }

        router.replace('/auth/sign-in')
    };

    // Initially set focus to first textfield
    useEffect(() => {
        inputs.current[0]?.focus()
    }, [])

    return (
        <div className="flex flex-col gap-4 h-screen items-center justify-center">
            <div className="flex flex-col gap-1 items-center">
                <h1 className="text-black text-xl font-semibold">Enter your code</h1>
                <p className="text-gray-500 text-sm">We sent a 6-digit code to your email.</p>
            </div>


            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 items-center">
                <Controller
                    name="code"
                    control={control}
                    render={({ field, fieldState }) => {
                        // fixed-length representation so empty slots stay in place
                        const digits = field.value.padEnd(CODE_LENGTH).split("")

                        return (
                            <div className="flex flex-col gap-1 items-center">
                                <div className="flex gap-2" >
                                    {Array.from({ length: CODE_LENGTH }).map((_, index) => (
                                        <TextField
                                            key={index}
                                            value={digits[index].trim()}
                                            className="w-16"
                                            slotProps={{
                                                htmlInput: {
                                                    maxLength: 1,
                                                    inputMode: "numeric",
                                                    className: "text-center"
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Backspace" && digits[index].trim() === "" && index > 0) {
                                                    inputs.current[index - 1]?.focus()
                                                }
                                            }}
                                            onChange={
                                                (e) => {
                                                    const digit = e.target.value
                                                    // keep an empty box as a space so the slot is preserved, not collapsed
                                                    digits[index] = digit === "" ? " " : digit
                                                    if (digit.trim() !== "" && index < CODE_LENGTH - 1) {
                                                        inputs.current[index + 1]?.focus()
                                                    }
                                                    field.onChange(digits.join(""))
                                                }
                                            }
                                            inputRef={(el) => inputs.current[index] = el}
                                        />
                                    ))}
                                </div>
                                {fieldState.error && (
                                    <FormHelperText error>
                                        {fieldState.error.message}
                                    </FormHelperText>
                                )}
                            </div>
                        )
                    }}
                />

                {error && (
                    <FormHelperText error>
                        {error}
                    </FormHelperText>
                )}

                <Button disabled={isSubmitting} variant="contained" type="submit" fullWidth>
                    <p>{isSubmitting ? "Verifying..." : "Verify"}</p>
                </Button>
            </form>

            <button onClick={handleEmailResent}>
                <p className="text-gray-500 text-sm">
                    Didn&apos;t get a code? <span className="underline cursor-pointer">Resend</span>
                </p>
            </button>
        </div>
    )
}

export default ConfirmPage
