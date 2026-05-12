"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import AuthLayout from "@/components/common/auth-layout";

const RegisterSchema = z
    .object({
        fullName: z.string().min(2, { message: "Full name is required" }),
        email: z.email({ message: "Invalid email address" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters" }),
        confirmPassword: z.string().min(8),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterValues = z.infer<typeof RegisterSchema>;

export default function Register() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterValues>({ resolver: zodResolver(RegisterSchema) });

    const onSubmit = async (values: RegisterValues) => {
        try {
            console.log("Register values:", values);
            // TODO: call auth service (Supabase signUp)
        } catch (err) {
            console.error(err);
        }
    };

    const handleGoogleRegister = async () => {
        try {
            console.log("Google register clicked");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-md space-y-10">
                <div className="mb-8 text-center lg:hidden">
                    <span className="font-headline text-3xl font-extrabold tracking-tighter text-primary">Florlen</span>
                </div>

                <div className="space-y-4">
                    <h1 className="font-headline text-4xl font-extrabold leading-tight tracking-tight text-on-surface">Create your account.</h1>
                    <p className="font-body text-secondary">Start building your crochet collection and unlock exclusive handmade drops.</p>
                </div>

                <div className="space-y-6">
                    <div className="grid gap-4">
                        <Button variant="social" size="md" onClick={handleGoogleRegister} type="button" className="rounded-xl px-6 py-4">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            <span>Continue with Google</span>
                        </Button>
                    </div>

                    <div className="relative flex items-center py-4">
                        <div className="grow border-t border-surface-container-high"></div>
                        <span className="mx-4 shrink font-headline text-xs font-bold uppercase tracking-widest text-secondary">or register with email</span>
                        <div className="grow border-t border-surface-container-high"></div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <Input id="full-name" label="Full Name" type="text" placeholder="Arielle Bloom" required {...register("fullName")} error={errors.fullName?.message} />

                        <Input id="email" label="Email Address" type="email" placeholder="hello@artisan.com" required {...register("email")} error={errors.email?.message} />

                        <Input id="password" label="Password" type="password" placeholder="Create a password" required {...register("password")} error={errors.password?.message} />

                        <Input id="confirm-password" label="Confirm Password" type="password" placeholder="Re-enter your password" required {...register("confirmPassword")} error={errors.confirmPassword?.message} />

                        <div className="pt-1">
                            <p className="font-body text-xs text-secondary">By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
                        </div>

                        <div className="pt-4">
                            <Button variant="primary" size="lg" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Join Florlen"}</Button>
                        </div>
                    </form>
                </div>

                <div className="pt-6 text-center">
                    <p className="font-body text-secondary">Already have an account?<a className="ml-1 font-headline font-bold text-primary hover:underline" href="/auth/login">Sign in</a></p>
                </div>
            </div>
        </AuthLayout>
    );
}
