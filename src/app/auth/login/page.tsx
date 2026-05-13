"use client";

import { z } from "zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import AuthLayout from "@/components/common/auth-layout";
import { login } from "@/lib/api/auth.api";
import { setTokens, setCachedUser } from "@/lib/auth";

const LoginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function Login() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({ resolver: zodResolver(LoginSchema) });

    const onSubmit = async (values: LoginValues) => {
        try {
            toast.loading("Signing in...", { id: "login" });

            const response = await login({
                email: values.email,
                password: values.password,
            });

            // Save tokens to localStorage
            setTokens({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                expiresIn: response.expiresIn,
            });

            // Cache user data without role; authorization is checked from server
            const { role: _role, ...safeUser } = response.user;
            setCachedUser(safeUser);

            toast.success("Welcome back! Redirecting to your profile...", { id: "login" });

            // Redirect to profile
            setTimeout(() => router.push("/"), 500);
        } catch (err: any) {
            console.error("Login error:", err);
            // Extract error message from response or use fallback
            let errorMessage = "Login failed. Please try again.";
            if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err?.message) {
                errorMessage = err.message;
            }
            toast.error(errorMessage, { id: "login" });
        }
    };

    const handleGoogleLogin = async () => {
        try {
            console.log("Google login clicked");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-md space-y-10">
                <div className="lg:hidden mb-8 text-center">
                    <span className="text-primary font-headline font-extrabold text-3xl tracking-tighter">Florlen</span>
                </div>

                <div className="space-y-4">
                    <h1 className="text-on-surface font-headline text-4xl font-extrabold tracking-tight leading-tight">
                        Welcome back.
                    </h1>
                    <p className="text-secondary font-body">
                        Sign in to manage your collection and discover new limited edition crochet patterns.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="grid gap-4">
                        <Button variant="social" size="md" onClick={handleGoogleLogin} type="button" className="py-4 px-6 rounded-xl">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                        <span className="shrink mx-4 text-secondary text-xs font-headline font-bold uppercase tracking-widest">or use email</span>
                        <div className="grow border-t border-surface-container-high"></div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <Input id="email" label="Email Address" type="email" placeholder="hello@artisan.com" required {...register("email")} error={errors.email?.message} />

                        <Input id="password" label="Password" type="password" placeholder="••••••••" required {...register("password")} rightElement={<a className="text-xs font-headline font-bold text-primary hover:underline" href="#">Forgot password?</a>} error={errors.password?.message} />

                        <div className="pt-4">
                            <Button variant="primary" size="lg" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Signing in..." : "Enter Gallery"}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="pt-6 text-center">
                    <p className="text-secondary font-body">
                        New to the crochet world?
                        <a className="text-primary font-headline font-bold ml-1 hover:underline" href="/auth/register">
                            Create Account
                        </a>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
