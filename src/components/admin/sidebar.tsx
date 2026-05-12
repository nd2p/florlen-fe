"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    IconChartBar,
    IconChevronLeft,
    IconChevronRight,
    IconDiscount,
    IconFolder,
    IconPlus,
    IconLogout2,
    IconPackage,
    IconSettings,
    IconShoppingBag,
    IconUsers,
} from "@tabler/icons-react";

const navigationItems = [
    { href: "/admin/orders", label: "Order Management", icon: IconShoppingBag },
    { href: "/admin/products", label: "Product Management", icon: IconPackage },
    { href: "/admin/collections", label: "Collection Management", icon: IconFolder },
    { href: "/admin/discounts", label: "Discount Management", icon: IconDiscount },
    { href: "/admin/users", label: "User Management", icon: IconUsers },
    { href: "/admin/reports", label: "Reports", icon: IconChartBar },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside
            className={`sticky top-0 z-40 hidden h-screen shrink-0 flex-col bg-surface-container-low px-5 py-6 transition-[width] duration-300 lg:flex ${collapsed ? "w-24" : "w-72"}`}
        >
            <div className="space-y-10">
                <div className={`flex items-start gap-3 ${collapsed ? "justify-center ml-10" : "justify-between"}`}>
                    <Link href="/admin/orders" className={`block ${collapsed ? "text-center" : ""}`}>
                        <div className="space-y-1">
                            {collapsed ? (
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-headline text-xl font-extrabold tracking-tight text-on-primary -mr-2">
                                    F
                                </span>
                            ) : (
                                <>
                                    <p className="font-headline text-3xl font-extrabold tracking-tight text-primary">Florlen</p>
                                    <p className="text-sm text-secondary">Admin Dashboard</p>
                                </>
                            )}
                        </div>
                    </Link>

                    <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={() => setCollapsed((value) => !value)}
                        className="mt-1 h-9 w-9 shrink-0 rounded-full bg-surface-container-high px-0 py-0 text-secondary transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? (
                            <IconChevronRight className="h-4 w-4" stroke={2} />
                        ) : (
                            <IconChevronLeft className="h-4 w-4" stroke={2} />
                        )}
                    </Button>
                </div>

                <nav aria-label="Admin navigation" className="space-y-2">
                    {navigationItems.map((item) => {
                        const active = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={`flex items-center rounded-full py-3 text-sm font-semibold transition-all ${collapsed ? "justify-center px-3" : "gap-3 px-4"} ${active
                                    ? "bg-primary text-on-primary shadow-[0_18px_36px_-18px_rgba(164,0,21,0.55)]"
                                    : "text-secondary hover:bg-surface-container-high hover:text-on-surface"
                                    }`}
                            >
                                <Icon className="h-5 w-5 shrink-0" stroke={2} />
                                {collapsed ? null : <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto space-y-4 pt-8">
                <Button
                    variant="primary"
                    size="md"
                    type="button"
                    className={`w-full rounded-full py-3 text-sm transition-colors ${collapsed ? "justify-center px-3" : "gap-3 px-4"}`}
                >
                    <IconPlus className="h-5 w-5 shrink-0" stroke={2} />
                    {collapsed ? null : "Add New Product"}
                </Button>

                <Button
                    asChild
                    variant="secondary"
                    size="md"
                    className={`w-full rounded-full bg-surface-container-high py-3 text-sm transition-colors hover:bg-surface-container-highest ${collapsed ? "justify-center px-3" : "gap-3 px-4"}`}
                >
                    <Link href="/admin/settings">
                        <IconSettings className="h-5 w-5 shrink-0" stroke={2} />
                        {collapsed ? null : "Settings"}
                    </Link>
                </Button>

                <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    className={`w-full rounded-full bg-surface-container-high py-3 text-sm text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface ${collapsed ? "justify-center px-3" : "gap-3 px-4"}`}
                >
                    <IconLogout2 className="h-5 w-5 shrink-0" stroke={2} />
                    {collapsed ? null : "Sign Out"}
                </Button>
            </div>
        </aside>
    );
}
