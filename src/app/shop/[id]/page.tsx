"use client";

import { useEffect, useState, use } from "react";
import { getProductById, listProducts, type ProductListItem } from "@/lib/api/product.api";
import { cn, formatCurrency } from "@/lib/utils";
import Image from "next/image";
import type { ListProductsParams } from "@/lib/api/product.api";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductListItem | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const prodData = await getProductById(id);
        const p = prodData.product as ProductListItem;
        setProduct(p);
        
        if (p.product_images && p.product_images.length > 0) {
          const primary = p.product_images.find(img => img.is_primary) || p.product_images[0];
          setSelectedImage(primary.url);
        }

        // Recommendations Logic
        const recParams: ListProductsParams = { limit: 20 };
        if (p.collection_id) {
          recParams.collection = p.collection_id;
        } else if (p.product_type) {
          recParams.type = p.product_type;
        }

        const recRes = await listProducts(recParams);
        // Filter out current product
        const filteredRecs = recRes.products.filter(item => item.id !== id);
        
        // If few recommendations from same collection, fallback/append latest of same type
        if (filteredRecs.length < 4 && p.collection_id && p.product_type) {
            const fallbackRes = await listProducts({ type: p.product_type, limit: 20 });
            const combined = [...filteredRecs, ...fallbackRes.products.filter(item => item.id !== id && !filteredRecs.find(f => f.id === item.id))];
            setRecommendedProducts(combined.slice(0, 20));
        } else {
            setRecommendedProducts(filteredRecs.slice(0, 20));
        }

      } catch (err) {
        console.error("Failed to fetch product", err);
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-32">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-32 text-center">
        <h1 className="text-2xl font-bold text-on-surface">Product not found</h1>
        <Link href="/" className="mt-4 text-primary hover:underline">Back to Home</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    toast.success(`Added ${quantity} ${product.name} to cart`);
    // Logic for cart store would go here
  };

  return (
    <div className="bg-background selection:bg-primary-fixed selection:text-on-primary-fixed">
      <main className="mx-auto max-w-7xl px-8 pt-32 pb-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container-low shadow-sm">
                <Image
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 60vw"
                  src={selectedImage || "/placeholder-product.jpg"}
                  alt={product.name}
                  className="h-full w-full object-cover transition-all duration-500"
                />
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {product.product_images?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={cn(
                    "relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                    selectedImage === img.url ? "border-primary opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <Image
                    fill
                    sizes="96px"
                    src={img.url}
                    alt={`${product.name} thumb ${idx}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="space-y-6">
              <div>
                <h1 className="font-headline text-4xl font-black tracking-tight text-on-surface">{product.name}</h1>
                <p className="mt-2 text-xl font-bold text-primary">{formatCurrency(product.base_price)}</p>
              </div>

              <div className="h-px bg-outline-variant" />

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">Description</h3>
                <p className="text-on-surface/80 leading-relaxed">
                  {product.description || product.short_description || "No description available."}
                </p>
              </div>

              {/* Variants placeholder if needed */}
              {product.product_variants && product.product_variants.length > 0 && (
                <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">Options</h3>
                    <div className="flex flex-wrap gap-3">
                        {product.product_variants.map((v, i) => (
                            <div key={i} className="rounded-full border border-outline-variant px-4 py-2 text-xs font-bold text-on-surface bg-surface">
                                {v.color_name} {v.size ? `(${v.size})` : ""}
                            </div>
                        ))}
                    </div>
                </div>
              )}

              <div className="mt-auto pt-12 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center justify-between rounded-full bg-surface-container-high p-1 w-full sm:w-32">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-container-highest"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-bold text-on-surface">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-container-highest"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary font-bold text-on-primary transition-all hover:bg-primary/90 active:scale-95"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <section className="mt-32">
          <div className="mb-8 flex items-end justify-between">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-black tracking-tight tracking-tight text-on-surface">You Might Also Like</h2>
              <p className="text-secondary text-sm">Recommended handcrafted companions based on your interests.</p>
            </div>
          </div>

          <div className="relative group">
            <div className="flex gap-6 overflow-x-auto pb-8 scroll-smooth scrollbar-none snap-x snap-mandatory">
              {recommendedProducts.length > 0 ? (
                recommendedProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/shop/${item.id}`}
                    className="w-[calc((100%-72px)/4)] flex-shrink-0 snap-start group/card"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container-low transition-all duration-500 group-hover/card:-translate-y-2 group-hover/card:shadow-xl">
                      <Image
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        src={item.product_images?.[0]?.url || "/placeholder-product.jpg"}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-on-surface group-hover/card:text-primary transition-colors">{item.name}</h3>
                        <p className="text-xs text-secondary underline-offset-4 decoration-primary/30">{formatCurrency(item.base_price)}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-surface-container-low text-secondary italic">
                  Looking for more treasures...
                </div>
              )}
            </div>
            
            {/* Scroll indicators or arrows can be added here if needed */}
          </div>
        </section>
      </main>
    </div>
  );
}
