"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconShoppingBag, IconUser } from "@tabler/icons-react";
import { getAccessToken } from "@/lib/auth";

export default function Header() {
    const router = useRouter();

    const handleProfileClick = () => {
        const accessToken = getAccessToken();

        if (accessToken) {
            router.push("/profile");
        } else {
            router.push("/auth/login");
        }
    };

    return (
        <nav className="fixed top-0 z-50 h-16 w-full bg-surface/80 backdrop-blur-md nocturnal-shadow">
            <div className="flex w-full items-center justify-between px-8 h-full">
                <div className="flex items-center gap-8">
                    <Link
                        href="/"
                        className="font-headline text-3xl font-extrabold  tracking-tight text-primary"
                    >
                        Florlen
                    </Link>
                    <div className="hidden items-center gap-6 md:flex">
                        <a href="/shop" className="font-headline font-bold text-secondary transition-colors hover:text-primary">Shop All</a>
                        <a href="/ai-studio" className="font-headline font-bold text-secondary transition-colors hover:text-primary">AI Studio</a>
                        <a href="/collections" className="font-headline font-bold text-secondary transition-colors hover:text-primary">Collections</a>
                        <a href="/blog" className="font-headline font-bold text-secondary transition-colors hover:text-primary">Blog</a>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="rounded-full p-2 transition-all duration-200 hover:bg-surface-container-highest active:scale-95" aria-label="Open cart">
                        <IconShoppingBag className="h-5 w-5 text-primary" stroke={2} />
                    </button>
                    <button type="button" onClick={handleProfileClick} className="rounded-full p-2 transition-all duration-200 hover:bg-surface-container-highest active:scale-95" aria-label="Open profile">
                        <IconUser className="h-5 w-5 text-primary" stroke={2} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
