"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import type { ProductListItem } from "@/lib/api/product.api";
import { formatCurrency, cn } from "@/lib/utils";
import Badge from "@/components/ui/badge";
import { useCartStore } from "@/hooks/use-cart";

type ProductCardProps = {
    product: ProductListItem;
    href: string;
    className?: string;
    imageSizes?: string;
};

export default function ProductCard({
    product,
    href,
    className,
    imageSizes = "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw",
}: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const isUnavailable = product.is_active === false;
    const firstActiveVariant = product.product_variants?.find((variant) => variant.is_active !== false) ?? null;

    const handleQuickAdd = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (isUnavailable) {
            return;
        }

        await addItem({
            item_type: "normal",
            product_id: product.id,
            variant_id: firstActiveVariant?.id,
            quantity: 1,
        });
    };

    return (
        <Link
            href={href}
            className={cn(
                "group/product block space-y-3 transition-transform duration-300 ease-out hover:-translate-y-1",
                className
            )}
        >
            {/* Image container */}
            <div className="relative aspect-square overflow-hidden rounded-xl border border-transparent bg-surface-container-high transition-all duration-300 group-hover/product:border-primary/60">
                <Image
                    fill
                    sizes={imageSizes}
                    src={product.product_images?.[0]?.url || "/placeholder-product.jpg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/product:scale-105"
                />

                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover/product:bg-black/10" />

                {/* Badges */}
                {isUnavailable && (
                    <div className="absolute left-3 top-3">
                        <Badge variant="default">Temporarily unavailable</Badge>
                    </div>
                )}

                {/* Quick-add button — slides up on hover */}
                <div className="absolute bottom-3 inset-x-3 translate-y-10 opacity-0 transition-all duration-300 ease-out group-hover/product:translate-y-0 group-hover/product:opacity-100">
                    <button
                        type="button"
                        aria-label={`Add ${product.name} to cart`}
                        onClick={handleQuickAdd}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-container-lowest/90 py-2.5 text-xs font-bold text-on-surface backdrop-blur-sm transition-colors duration-200 hover:bg-primary hover:text-on-primary active:scale-95"
                    >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Quick Add
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="space-y-0.5 px-0.5">
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-on-surface transition-colors duration-200 group-hover/product:text-primary">
                    {product.name}
                </h3>
                <p className="text-sm font-semibold text-secondary transition-colors duration-200 group-hover/product:text-on-surface">
                    {formatCurrency(product.base_price)}
                </p>
            </div>
        </Link>
    );
}