"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import AuthLayout from "@/components/common/auth-layout";
import { resetPassword, changePassword } from "@/lib/api/auth.api";
import { setTokens } from "@/lib/auth";
import { useTranslation } from "react-i18next";

const ResetPasswordSchema = z.object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;

function ResetPasswordHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation("common");
    // Detect client-side mount without triggering setState in an effect
    const isMounted = typeof window !== "undefined";

    // Compute parameters synchronously during render (no setState in useEffect)
    const code = searchParams.get("code");
    const queryToken = searchParams.get("token");
    
    let hashAccessToken: string | null = null;
    let hashRefreshToken: string | null = null;
    let hasHash = false;

    if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        hashAccessToken = hashParams.get("access_token");
        hashRefreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        if (hashAccessToken && hashRefreshToken && type === "recovery") {
            hasHash = true;
        }
    }

    const hasValidParams = !!(code || queryToken || hasHash);

    useEffect(() => {
        if (!isMounted) return;
        const errorMsg = searchParams.get("error_description") || searchParams.get("error");
        if (errorMsg) {
            console.error("Password reset link error:", errorMsg);
            toast.error(`Password reset link invalid or expired: ${errorMsg}`);
            router.push("/auth/login");
        }
    }, [searchParams, router, isMounted]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordValues>({ resolver: zodResolver(ResetPasswordSchema) });

    const onSubmit = async (values: ResetPasswordValues) => {
        try {
            toast.loading(t("auth.updatingPassword") || "Updating password...", { id: "reset-password" });

            if (hasHash && hashAccessToken && hashRefreshToken) {
                // 1. Implicit Flow: Save tokens to storage so axios is authenticated
                setTokens({
                    accessToken: hashAccessToken,
                    refreshToken: hashRefreshToken,
                });
                
                // Call changePassword using authenticated session
                await changePassword({
                    newPassword: values.password,
                    confirmPassword: values.confirmPassword,
                    refreshToken: hashRefreshToken,
                });
            } else if (code || queryToken) {
                // 2. PKCE or Token Hash Flow
                const resetToken = code || queryToken;
                if (!resetToken) throw new Error("Reset token not found.");
                
                await resetPassword({
                    token: resetToken,
                    newPassword: values.password,
                    confirmPassword: values.confirmPassword,
                });
            } else {
                throw new Error("No reset token or session found. Please request a new password reset email.");
            }

            toast.success(
                t("auth.passwordResetSuccess") || "Your password has been reset successfully! Redirecting to login...",
                { id: "reset-password" }
            );

            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (err: unknown) {
            console.error("Reset password error:", err);
            let errorMessage = "Reset password failed. Please request a new recovery link.";
            if (
                typeof err === "object" &&
                err !== null &&
                "response" in err &&
                typeof (err as { response?: unknown }).response === "object" &&
                (err as { response?: { data?: { message?: string } } }).response?.data?.message
            ) {
                errorMessage = (err as { response?: { data?: { message?: string } } }).response!.data!.message!;
            } else if (typeof err === "object" && err !== null && "message" in err) {
                errorMessage = String((err as { message?: unknown }).message || errorMessage);
            }
            toast.error(errorMessage, { id: "reset-password" });
        }
    };

    if (!isMounted) {
        return (
            <AuthLayout>
                <div className="flex flex-col items-center justify-center min-h-[300px] p-6">
                    <div className="w-8 h-8 rounded-full border-4 border-surface-container-high border-t-primary animate-spin"></div>
                </div>
            </AuthLayout>
        );
    }

    if (!hasValidParams) {
        return (
            <AuthLayout>
                <div className="w-full max-w-md space-y-6 text-center">
                    <h1 className="text-on-surface font-headline text-3xl font-extrabold tracking-tight">
                        {t("auth.invalidResetLink") || "Invalid Reset Link"}
                    </h1>
                    <p className="text-secondary font-body">
                        {t("auth.invalidResetLinkDesc") || "This password reset link is invalid or has expired. Please request a new recovery link."}
                    </p>
                    <div className="pt-4">
                        <Link className="text-primary font-headline font-bold hover:underline" href="/auth/forgot-password">
                            {t("auth.requestNewLink") || "Request New Link"}
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="w-full max-w-md space-y-10">
                <div className="lg:hidden mb-8 text-center">
                    <span className="text-primary font-headline font-extrabold text-3xl tracking-tighter">Florlen</span>
                </div>

                <div className="space-y-4">
                    <h1 className="text-on-surface font-headline text-4xl font-extrabold tracking-tight leading-tight">
                        {t("auth.resetPassword") || "Reset Password"}
                    </h1>
                    <p className="text-secondary font-body">
                        {t("auth.resetPasswordDesc") || "Enter and confirm your new password below."}
                    </p>
                </div>

                <div className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <Input
                            id="password"
                            label={t("auth.newPassword") || "New Password"}
                            type="password"
                            placeholder="••••••••"
                            required
                            {...register("password")}
                            error={errors.password?.message}
                        />

                        <Input
                            id="confirmPassword"
                            label={t("auth.confirmPassword") || "Confirm Password"}
                            type="password"
                            placeholder="••••••••"
                            required
                            {...register("confirmPassword")}
                            error={errors.confirmPassword?.message}
                        />

                        <div className="pt-4">
                            <Button variant="primary" size="lg" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (t("auth.updatingPassword") || "Updating...") : (t("auth.resetPassword") || "Reset Password")}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-6">
                <div className="w-12 h-12 rounded-full border-4 border-surface-container-high border-t-primary animate-spin"></div>
            </div>
        }>
            <ResetPasswordHandler />
        </Suspense>
    );
}
