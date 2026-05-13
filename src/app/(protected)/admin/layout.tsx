import type { ReactNode } from "react";
import Header from "@/components/admin/header";
import Sidebar from "@/components/admin/sidebar";
import AdminGuard from "@/components/common/admin-guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-surface text-on-surface lg:flex">
                <Sidebar />

                <div className="min-w-0 flex-1">
                    <Header />

                    <main className="px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pt-6">{children}</main>
                </div>
            </div>
        </AdminGuard>
    );
}