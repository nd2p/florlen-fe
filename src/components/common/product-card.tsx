import Link from "next/link";
import Image from "next/image";
import type { ProductListItem } from "@/lib/api/product.api";
import { formatCurrency, cn } from "@/lib/utils";
import Badge from "@/components/ui/badge";

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
    const isUnavailable = product.is_active === false;

    return (
        <Link href={href} className={cn("group/product block space-y-3", className)}>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-container-high">
                <Image
                    fill
                    sizes={imageSizes}
                    src={product.product_images?.[0]?.url || "/placeholder-product.jpg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/product:scale-105"
                />
                {isUnavailable && (
                    <div className="absolute left-3 top-3">
                        <Badge variant="default">Temporarily unavailable</Badge>
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-sm font-bold text-on-surface transition-colors group-hover/product:text-primary">
                    {product.name}
                </h3>
                <p className="text-sm text-secondary">{formatCurrency(product.base_price)}</p>
            </div>
        </Link>
    );
}