"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getAccessToken } from "@/lib/auth";

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * AuthGuard - Client component that enforces authentication
 * Redirects to login if user is not authenticated
 */
export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthed, setIsAuthed] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = isAuthenticated() && getAccessToken();

            if (!authenticated) {
                // Not authenticated, redirect to login
                router.replace("/auth/login");
            } else {
                // Authenticated, show content
                setIsAuthed(true);
            }

            setIsChecking(false);
        };

        checkAuth();
    }, [router]);

    // Show nothing while checking auth status (prevents flash of protected content)
    if (isChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    // Render children only if authenticated
    return isAuthed ? children : null;
}
