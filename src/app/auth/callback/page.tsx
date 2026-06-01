"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { exchangeGoogleCode, getMe } from "@/lib/api/auth.api";
import { setTokens, setCachedUser } from "@/lib/auth";
import { useCartStore } from "@/hooks/use-cart";

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation("common");
    const isExchangingRef = useRef(false);

    useEffect(() => {
        // 1. Check for errors in search parameters
        const errorMsg = searchParams.get("error_description") || searchParams.get("error");
        if (errorMsg) {
            console.error("Auth redirect error:", errorMsg);
            toast.error(`Authentication failed: ${errorMsg}`);
            router.push("/auth/login");
            return;
        }

        const code = searchParams.get("code");

        // 2. Parse hash fragment in case of implicit grant flow
        let hashParams: URLSearchParams | null = null;
        if (typeof window !== "undefined" && window.location.hash) {
            hashParams = new URLSearchParams(window.location.hash.substring(1));
            const hashError = hashParams.get("error_description") || hashParams.get("error");
            if (hashError) {
                console.error("Auth redirect hash error:", hashError);
                toast.error(`Authentication failed: ${hashError}`);
                router.push("/auth/login");
                return;
            }
        }

        const accessTokenFromHash = hashParams?.get("access_token");
        const refreshTokenFromHash = hashParams?.get("refresh_token");
        const expiresInFromHash = hashParams?.get("expires_in");

        if (!code && !accessTokenFromHash) {
            console.error("No authorization code or access token found in URL");
            toast.error("Authentication failed: No code or token provided.");
            router.push("/auth/login");
            return;
        }

        // Avoid duplicate execution in React StrictMode
        if (isExchangingRef.current) return;
        isExchangingRef.current = true;

        const handleAuthExchange = async () => {
            try {
                toast.loading(t("auth.callbackLoading") || "Authenticating...", { id: "oauth-callback" });

                let loginResponse;

                if (code) {
                    // Exchange code via backend (PKCE Flow)
                    loginResponse = await exchangeGoogleCode(code);
                } else if (accessTokenFromHash && refreshTokenFromHash) {
                    // Handle implicit grant flow directly on client!
                    // Save tokens temporarily so the API client is authorized for getMe()
                    setTokens({
                        accessToken: accessTokenFromHash,
                        refreshToken: refreshTokenFromHash,
                        expiresIn: expiresInFromHash ? parseInt(expiresInFromHash) : undefined,
                    });

                    // Fetch user profile from backend (reads roles and DB data)
                    const meData = await getMe();
                    loginResponse = {
                        accessToken: accessTokenFromHash,
                        refreshToken: refreshTokenFromHash,
                        expiresIn: expiresInFromHash ? parseInt(expiresInFromHash) : 3600,
                        user: meData.user,
                    };
                }

                if (!loginResponse) {
                    throw new Error("Failed to process login session");
                }

                // Save tokens to localStorage
                setTokens({
                    accessToken: loginResponse.accessToken,
                    refreshToken: loginResponse.refreshToken,
                    expiresIn: loginResponse.expiresIn,
                });

                // Cache safe user data without role; checked from server
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { role: _role, ...safeUser } = loginResponse.user;
                setCachedUser(safeUser);

                // Merge guest cart items into the user cart
                await useCartStore.getState().mergeCartAfterLogin();

                toast.success(t("auth.loginSuccess") || "Welcome back!", { id: "oauth-callback" });

                // Redirect to home
                setTimeout(() => {
                    router.push("/");
                }, 500);
            } catch (err: any) {
                console.error("OAuth exchange error:", err);
                let errorMessage = "Authentication failed. Please try again.";
                if (err?.response?.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err?.message) {
                    errorMessage = err.message;
                }
                toast.error(errorMessage, { id: "oauth-callback" });
                router.push("/auth/login");
            }
        };

        handleAuthExchange();
    }, [searchParams, router, t]);

    return (
        <div className="flex flex-col items-center space-y-6 max-w-sm text-center">
            {/* Modern smooth micro-animation spinner */}
            <div className="w-12 h-12 rounded-full border-4 border-surface-container-high border-t-primary animate-spin"></div>
            <div className="space-y-2">
                <h2 className="text-2xl font-headline font-bold text-on-surface">
                    {t("auth.signingIn") || "Signing in..."}
                </h2>
                <p className="text-secondary text-sm font-body">
                    {t("auth.callbackLoading") || "Verifying your credentials..."}
                </p>
            </div>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-6">
                <div className="w-12 h-12 rounded-full border-4 border-surface-container-high border-t-primary animate-spin"></div>
            </div>
        }>
            <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-6">
                <CallbackHandler />
            </div>
        </Suspense>
    );
}
