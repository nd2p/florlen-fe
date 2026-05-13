import React from "react";
import AuthGuard from "@/components/common/auth-guard";

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

/**
 * Protected Layout - Wraps all protected routes
 * Uses AuthGuard to enforce authentication
 */
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
    return <AuthGuard>{children}</AuthGuard>;
}
