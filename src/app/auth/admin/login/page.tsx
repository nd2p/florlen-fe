"use client";

import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Form from "next/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IconShieldLock, IconUserShield } from "@tabler/icons-react";
import Input from "@/components/ui/input";
import Checkbox from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/api/auth.api";
import { setTokens, setCachedUser } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/role-constants";


const AdminLoginSchema = z.object({
    adminId: z.string().min(1, { message: "Admin ID or email is required" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type AdminLoginValues = z.infer<typeof AdminLoginSchema>;

export default function AdminLoginPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<AdminLoginValues>({ resolver: zodResolver(AdminLoginSchema) });

    const onSubmit = async (values: AdminLoginValues) => {
        try {
            const response = await login({ email: values.adminId, password: values.password });

            const role = response.user?.role || null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!role || !ADMIN_ROLES.includes(role as any)) {
                toast.error("Unauthorized: admin access required");
                return;
            }

            // Save tokens
            setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken, expiresIn: response.expiresIn });

            // Cache user without role; authorization is checked from server
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { role: _role, ...safeUser } = response.user;
            setCachedUser(safeUser);

            toast.success("Welcome back, admin! Redirecting...");

            router.push("/admin/orders");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Admin login error:", err);
            let message = "Login failed. Please try again.";
            if (err?.response?.data?.message) message = err.response.data.message;
            else if (err?.message) message = err.message;
            toast.error(message);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-on-background sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-12 h-80 w-80 -translate-x-1/2 rounded-full bg-surface-container-low opacity-80 blur-3xl" />
                <div className="absolute left-[12%] top-[18%] h-24 w-24 rounded-full bg-primary-fixed opacity-30 blur-2xl" />
                <div className="absolute right-[10%] top-[22%] h-28 w-28 rounded-full bg-surface-container-highest opacity-70 blur-3xl" />
                <div className="absolute bottom-16 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-primary-fixed-dim opacity-25 blur-3xl" />
            </div>

            <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-105 flex-col items-center justify-between gap-8 py-4 sm:py-8">
                <header className="pt-2 text-center">
                    <Link href="/" className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
                        Florlen
                    </Link>
                    <p className="mt-1 text-[0.7rem] uppercase tracking-[0.4em] text-secondary sm:text-[0.75rem]">
                        Administrative Access
                    </p>
                </header>

                <section className="w-full rounded-4xl bg-surface-container-lowest px-6 py-7 text-center nocturnal-shadow sm:px-8 sm:py-8">
                    <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-2 text-xs font-semibold text-on-primary-fixed shadow-[0_10px_24px_-14px_rgba(164,0,21,0.55)]">
                        <IconShieldLock className="h-3.5 w-3.5" stroke={2} />
                        <span>Secure Portal</span>
                    </div>

                    <div className="mt-6 space-y-2">
                        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-[2rem]">Welcome Back</h1>
                        <p className="text-sm text-secondary sm:text-[0.95rem]">Please authenticate to manage the collection</p>
                    </div>

                    <Form action="#" onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4 text-left">
                        <div className="space-y-2">
                            <label htmlFor="admin-id" className="ml-1 text-sm font-medium text-on-surface">Admin ID or Email</label>
                            <div className="relative">
                                <Input id="admin-id" placeholder="Enter credentials" {...register('adminId')} error={errors.adminId?.message as string | undefined} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-4">
                                <label htmlFor="admin-password" className="ml-1 text-sm font-medium text-on-surface">Password</label>
                                <Link href="/auth/forgot-password" className="text-xs font-semibold text-primary transition-colors hover:text-primary-hover">Forgot?</Link>
                            </div>
                            <div className="relative">
                                <Input id="admin-password" type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message as string | undefined} />
                            </div>
                        </div>

                        <label className="flex cursor-pointer items-center gap-3 px-1 pt-1 text-sm text-secondary">
                            <span className="relative flex h-4 w-4 items-center justify-center rounded-sm bg-surface-container-highest">
                                <Checkbox name="remember-session" defaultChecked />
                                <span className="absolute inset-0 rounded-sm bg-surface-container-highest ring-1 ring-transparent transition peer-checked:bg-primary-fixed peer-checked:ring-primary-fixed" />
                                <svg aria-hidden="true" viewBox="0 0 12 10" className="relative h-3 w-3 opacity-0 transition peer-checked:opacity-100" fill="none">
                                    <path d="M1 5L4.2 8L11 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <span>Keep session active for 8 hours</span>
                        </label>

                        <div className="pt-4">
                            <Button variant="primary" size="lg" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Authorizing..." : "Authorize Entry"}
                            </Button>
                        </div>
                    </Form>

                    <div className="mt-8 h-px w-full bg-surface-container-high/80" />

                    <p className="mx-auto mt-7 max-w-xs text-center text-xs leading-6 text-secondary">Authorized personnel only. All access attempts are logged and monitored. IP address tracking is active.</p>
                </section>

                <footer className="flex flex-col items-center gap-4 pb-2 text-sm text-secondary sm:flex-row sm:gap-5">
                    <Link href="/support" className="inline-flex items-center gap-2 transition-colors hover:text-primary">
                        <IconUserShield className="h-4 w-4" stroke={1.8} />
                        <span>Contact System Administrator</span>
                    </Link>
                </footer>
            </div>
        </main>
    );
}
