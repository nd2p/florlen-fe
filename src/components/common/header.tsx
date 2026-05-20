'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconSearch, IconShoppingCart, IconUser, IconLoader2 } from "@tabler/icons-react";
import { useCartStore } from "@/hooks/use-cart";
import { getAccessToken } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";
import { listProducts, type ProductListItem } from "@/lib/api/product.api";
import { listCollections, type Collection } from "@/lib/api/collection.api";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
    const router = useRouter();
    const { t, i18n } = useTranslation("common");
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<{ products: ProductListItem[], collections: Collection[] }>({ products: [], collections: [] });
    const { fetchCart, totalQuantity } = useCartStore();
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const activeLanguage = i18n.resolvedLanguage?.startsWith("vi") ? "vi" : "en";

    const handleLanguageChange = (value: string) => {
        if (value !== activeLanguage) {
            void i18n.changeLanguage(value);
        }
    };

    const handleProfileClick = () => {
        const accessToken = getAccessToken();

        if (accessToken) {
            router.push("/profile");
        } else {
            router.push("/auth/login");
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setShowResults(false);
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Debounced search logic
    useEffect(() => {
        let isMounted = true;

        if (!searchQuery.trim() || searchQuery.length < 2) {
            queueMicrotask(() => {
                if (isMounted) {
                    setResults({ products: [], collections: [] });
                    setShowResults(false);
                }
            });
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            setShowResults(true);
            try {
                const [prodRes, colRes] = await Promise.all([
                    listProducts({ q: searchQuery, limit: 5 }),
                    listCollections({ search: searchQuery, limit: 3 })
                ]);
                if (isMounted) {
                    setResults({
                        products: prodRes.products,
                        collections: colRes.collections
                    });
                }
            } catch (err) {
                console.error("Real-time search error", err);
            } finally {
                if (isMounted) setIsSearching(false);
            }
        }, 300);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [searchQuery]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 z-50 h-16 w-full bg-surface/80 backdrop-blur-md nocturnal-shadow">
            <div className="flex w-full items-center px-8 h-full">
                {/* Left Section: Logo & Search */}
                <div className="flex flex-1 items-center gap-6">
                    <Link
                        href="/"
                        className="font-headline text-3xl font-extrabold tracking-tight text-primary whitespace-nowrap"
                    >
                        {t("header.brand")}
                    </Link>
                    <div className="relative hidden lg:block w-full max-w-[320px]" ref={dropdownRef}>
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input
                                type="text"
                                placeholder={t("header.search.placeholder")}
                                className="w-full rounded-full bg-surface-container-high px-10 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-secondary focus:ring-2 focus:ring-primary/20"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (!showResults && e.target.value.length >= 2) setShowResults(true);
                                }}
                                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                            />
                            {isSearching ? (
                                <IconLoader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" stroke={2} />
                            ) : (
                                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" stroke={2} />
                            )}
                        </form>

                        {/* Real-time Results Dropdown */}
                        {showResults && (searchQuery.length >= 2) && (
                            <div className="absolute top-full left-0 mt-2 w-100 overflow-hidden rounded-2xl bg-surface-container-high shadow-2xl nocturnal-shadow border border-outline/10 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200 z-100">
                                {isSearching && results.products.length === 0 && results.collections.length === 0 ? (
                                    <div className="p-8 text-center text-secondary">
                                        <IconLoader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                                        <p className="text-sm">{t("header.search.searching")}</p>
                                    </div>
                                ) : (results.products.length > 0 || results.collections.length > 0) ? (
                                    <div className="max-h-[70vh] overflow-y-auto p-2">
                                        {results.collections.length > 0 && (
                                            <div className="mb-2">
                                                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-secondary">{t("header.search.collectionsTitle")}</div>
                                                {results.collections.map((col) => (
                                                    <Link
                                                        key={col.id}
                                                        href={`/collections/${col.id}`}
                                                        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-container-highest"
                                                        onClick={() => setShowResults(false)}
                                                    >
                                                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-surface-dim">
                                                            <Image fill sizes="40px" src={col.cover_image_url || "/placeholder-collection.jpg"} alt="" className="h-full w-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="truncate text-sm font-bold text-on-surface">{col.name}</div>
                                                            <div className="text-[11px] text-secondary">{t("header.search.collectionLabel")}</div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {results.products.length > 0 && (
                                            <div>
                                                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-secondary">{t("header.search.productsTitle")}</div>
                                                {results.products.map((prod) => (
                                                    <Link
                                                        key={prod.id}
                                                        href={`/shop/${prod.id}`}
                                                        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-container-highest"
                                                        onClick={() => setShowResults(false)}
                                                    >
                                                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-surface-dim">
                                                            <Image fill sizes="40px" src={prod.product_images?.[0]?.url || "/placeholder-product.jpg"} alt="" className="h-full w-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="truncate text-sm font-bold text-on-surface">{prod.name}</div>
                                                            <div className="text-[11px] text-secondary">{formatCurrency(prod.base_price)}</div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        <Link
                                            href={`/search?q=${encodeURIComponent(searchQuery)}`}
                                            className="mt-2 block w-full rounded-xl bg-primary/5 p-3 text-center text-xs font-bold text-primary transition-colors hover:bg-primary/10"
                                            onClick={() => setShowResults(false)}
                                        >
                                            {t("header.search.viewAllResults", { query: searchQuery })}
                                        </Link>
                                    </div>
                                ) : !isSearching ? (
                                    <div className="p-8 text-center text-secondary italic">
                                        <p className="text-sm">{t("header.search.noResults", { query: searchQuery })}</p>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Section: Menu Items */}
                <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
                    <Link href="/shop" className="font-headline font-bold text-secondary transition-colors hover:text-primary">{t("header.nav.shopAll")}</Link>
                    <Link href="/ai-studio" className="font-headline font-bold text-secondary transition-colors hover:text-primary">{t("header.nav.aiStudio")}</Link>
                    <Link href="/collections" className="font-headline font-bold text-secondary transition-colors hover:text-primary">{t("header.nav.collections")}</Link>
                    <Link href="/blog" className="font-headline font-bold text-secondary transition-colors hover:text-primary">{t("header.nav.blog")}</Link>
                </div>

                {/* Right Section: Actions */}
                <div className="flex flex-1 items-center justify-end gap-3">
                    <button className="md:hidden rounded-full p-2 hover:bg-surface-container-highest" aria-label={t("header.actions.searchMobile")}>
                        <IconSearch className="h-5 w-5 text-primary" stroke={2} />
                    </button>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="rounded-full border border-primary px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary transition-all duration-200 hover:bg-primary/10 active:scale-95"
                                aria-label={t("header.language.label")}
                            >
                                {activeLanguage.toUpperCase()}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="rounded-lg border-0 bg-primary text-on-primary shadow-2xl"
                        >
                            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-on-primary/80">
                                {t("header.language.label")}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-on-primary/20" />
                            <DropdownMenuRadioGroup value={activeLanguage} onValueChange={handleLanguageChange}>
                                <DropdownMenuRadioItem
                                    value="en"
                                    className="text-on-primary focus:bg-on-primary/10 focus:text-on-primary"
                                >
                                    {t("header.language.en")}
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                    value="vi"
                                    className="text-on-primary focus:bg-on-primary/10 focus:text-on-primary"
                                >
                                    {t("header.language.vi")}
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Link
                        href="/cart"
                        className="relative rounded-full p-2 transition-all duration-200 hover:bg-surface-container-highest active:scale-95"
                        aria-label={t("header.actions.openCart")}
                    >
                        <IconShoppingCart className="h-5 w-5 text-primary" stroke={2} />
                        {totalQuantity > 0 && (
                            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                                {totalQuantity}
                            </span>
                        )}
                    </Link>
                    <button type="button" onClick={handleProfileClick} className="rounded-full p-2 transition-all duration-200 hover:bg-surface-container-highest active:scale-95" aria-label={t("header.actions.openProfile")}>
                        <IconUser className="h-5 w-5 text-primary" stroke={2} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
