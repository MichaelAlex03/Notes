'use client'

import { useForm, SubmitHandler } from "react-hook-form"
import { SignIn, SignInForm } from "../types/sign-in-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "../server-actions/signInServerAction";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SignInPage = () => {
    const router = useRouter()

    const { register, handleSubmit, formState: { errors } } = useForm<SignIn>({
        resolver: zodResolver(SignInForm),
        defaultValues: { email: "", password: "" }
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
            router.replace('/home')
        } finally {
            setSigningIn(false)
        }
    }

    return (
        <div className="flex min-h-screen">

            {/* Left panel */}
            <div className="hidden md:flex md:w-1/2 flex-col p-10 relative overflow-hidden" style={{ background: '#2D2318' }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(139,94,60,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(232,213,183,0.05) 0%, transparent 50%)' }} />

                <div className="flex items-center gap-2.5 relative z-10" style={{ color: '#E8D5B7' }}>
                    <span className="text-xl">✎</span>
                    <span className="text-lg font-semibold tracking-tight">notes</span>
                </div>

                <div className="flex-1 flex flex-col justify-center relative z-10 pb-16">
                    <p className="text-4xl font-semibold leading-tight tracking-tight mb-4" style={{ color: '#E8D5B7' }}>
                        Your thoughts,<br />organized.
                    </p>
                    <p className="text-sm leading-relaxed max-w-70" style={{ color: 'rgba(232,213,183,0.55)' }}>
                        Everything in one place — folders, notes, and nothing in between.
                    </p>
                </div>

                {/* Note stack decoration */}
                <div className="absolute bottom-12 right-12 w-40 h-28 z-10">
                    <div className="absolute w-36 h-24 rounded-md bottom-0 right-0 opacity-15" style={{ background: '#F2E8D6', transform: 'rotate(8deg)' }} />
                    <div className="absolute w-36 h-24 rounded-md bottom-1.5 right-2 opacity-25" style={{ background: '#F2E8D6', transform: 'rotate(4deg)' }} />
                    <div className="absolute w-36 h-24 rounded-md bottom-3 right-4 opacity-45 p-4 flex flex-col gap-2" style={{ background: '#F2E8D6', transform: 'rotate(-2deg)' }}>
                        <div className="h-0.5 rounded w-full opacity-30" style={{ background: '#2D2318' }} />
                        <div className="h-0.5 rounded w-2/5 opacity-30" style={{ background: '#2D2318' }} />
                        <div className="h-0.5 rounded w-full opacity-30" style={{ background: '#2D2318' }} />
                        <div className="h-0.5 rounded w-3/4 opacity-30" style={{ background: '#2D2318' }} />
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-10" style={{ background: '#FDFAF6' }}>
                <div className="w-full max-w-85">
                    <div className="mb-8">
                        <h1 className="text-3xl font-semibold tracking-tight leading-tight mb-1.5" style={{ color: '#1C1510' }}>
                            Welcome back
                        </h1>
                        <p className="text-sm" style={{ color: '#6B5744' }}>Sign in to your notes</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium" style={{ color: '#7A6650' }}>Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="you@example.com"
                                className="bg-white rounded-lg px-3 py-2.5 text-sm outline-none transition-all placeholder:text-[#C4B09A]"
                                style={{ border: '1.5px solid #C8B89A', color: '#1C1510' }}
                                onFocus={e => { e.target.style.borderColor = '#8B5E3C'; e.target.style.boxShadow = '0 0 0 3px rgba(139,94,60,0.12)' }}
                                onBlur={e => { e.target.style.borderColor = '#C8B89A'; e.target.style.boxShadow = 'none' }}
                            />
                            {errors.email && <span className="text-[13px]" style={{ color: '#B54A2A' }}>{errors.email.message}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium" style={{ color: '#7A6650' }}>Password</label>
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className="bg-white rounded-lg px-3 py-2.5 text-sm outline-none transition-all placeholder:text-[#C4B09A]"
                                style={{ border: '1.5px solid #C8B89A', color: '#1C1510' }}
                                onFocus={e => { e.target.style.borderColor = '#8B5E3C'; e.target.style.boxShadow = '0 0 0 3px rgba(139,94,60,0.12)' }}
                                onBlur={e => { e.target.style.borderColor = '#C8B89A'; e.target.style.boxShadow = 'none' }}
                            />
                            {errors.password && <span className="text-[13px]" style={{ color: '#B54A2A' }}>{errors.password.message}</span>}
                        </div>

                        {error && (
                            <div className="text-[13px] rounded-lg px-3 py-2.5" style={{ color: '#B54A2A', background: 'rgba(181,74,42,0.07)', border: '1px solid rgba(181,74,42,0.2)' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={signingIn}
                            className="w-full font-semibold text-sm py-3 rounded-lg mt-1 transition-all disabled:opacity-60 cursor-pointer"
                            style={{ background: '#2D2318', color: '#E8D5B7' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#8B5E3C')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#2D2318')}
                        >
                            {signingIn ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-[13px]" style={{ color: '#6B5744' }}>
                        Don&apos;t have an account?{' '}
                        <button
                            onClick={() => router.push('/auth/sign-up')}
                            className="font-medium hover:underline bg-transparent border-none cursor-pointer"
                            style={{ color: '#8B5E3C' }}
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignInPage
