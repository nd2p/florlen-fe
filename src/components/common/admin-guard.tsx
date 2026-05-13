"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_ROLES } from "@/lib/role-constants";
import { getAccessToken, isAuthenticated } from "@/lib/auth";
import { getMe } from "@/lib/api/auth.api";

interface AdminGuardProps {
    children: React.ReactNode;
}

/**
 * AdminGuard - Client component that enforces both authentication and admin role
 * Redirects to admin login if user is not authenticated or not an admin
 */
export default function AdminGuard({ children }: AdminGuardProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAdminAccess = async () => {
            const authenticated = isAuthenticated() && getAccessToken();

            if (!authenticated) {
                router.replace("/auth/admin/login");
                setIsChecking(false);
                return;
            }

            try {
                const response = await getMe();
                const role = response.user?.role;
                const hasAdminRole = role ? ADMIN_ROLES.includes(role as any) : false;

                if (!hasAdminRole) {
                    router.replace("/auth/admin/login");
                    return;
                }

                setIsAuthorized(true);
            } catch {
                router.replace("/auth/admin/login");
            } finally {
                setIsChecking(false);
            }
        };

        checkAdminAccess();
    }, [router]);

    if (isChecking) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-secondary">Checking admin access...</p>
                </div>
            </div>
        );
    }

    return isAuthorized ? children : null;
}