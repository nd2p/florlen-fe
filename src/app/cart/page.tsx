'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { IconMinus, IconPlus, IconTrash, IconTruck } from '@tabler/icons-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useCartStore, isCartItemActive } from '@/hooks/use-cart';
import { Loading } from '@/components/ui/loading';

export default function CartPage() {
    const router = useRouter();
    const { items, updateQuantity, removeItem, totalAmount, isLoading } = useCartStore();

    const subtotal = totalAmount;
    const shipping = 0;
    const handmadeFee = 0;
    const total = subtotal + shipping + handmadeFee;

    return (
        <div className="min-h-screen flex flex-col bg-surface">
            <main className="grow pt-32 pb-20 px-6">
                <div className="mx-auto max-w-7xl">
                    {/* Cart Header */}
                    <header className="mb-12">
                        <h1 className="font-headline text-5xl font-black tracking-tight text-on-surface mb-2">
                            Your Bag
                        </h1>
                        <p className="text-secondary text-lg">
                            {items.length} curated collectible{items.length !== 1 ? 's' : ''} waiting for their new home.
                        </p>
                    </header>

                    {/* Cart Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Items Section */}
                        <section className="lg:col-span-8 space-y-6">
                            {isLoading && items.length === 0 ? (
                                <Loading text="Loading your bag..." className="py-20" />
                            ) : items.length === 0 ? (
                                <div className="rounded-lg bg-surface-container-low p-12 text-center">
                                    <p className="text-secondary text-lg">Your cart is empty</p>
                                </div>
                            ) : (
                                items.map((item) => {
                                    const isUnavailable = !isCartItemActive(item);
                                    const isQuantityDisabled = isLoading || isUnavailable;

                                    return (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "rounded-lg bg-surface-container-low p-6 flex flex-col sm:flex-row gap-6 items-start",
                                                isUnavailable && "opacity-50"
                                            )}
                                        >
                                            {/* Product Image */}
                                            <div className="relative w-full sm:w-40 h-40 bg-surface-container-highest rounded overflow-hidden shrink-0">
                                                <Image
                                                    loading="eager"
                                                    src={item.product_snapshot.image_url || "/placeholder-product.jpg"}
                                                    alt={item.product_name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 640px) 100vw, 160px"
                                                />
                                                {isUnavailable && (
                                                    <div className="absolute left-3 top-3">
                                                        <Badge variant="default">Unavailable</Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="grow space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-on-surface">
                                                            {item.product_name}
                                                        </h3>
                                                        <div className="flex gap-2 mt-2 flex-wrap">
                                                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-surface-container-highest text-secondary">
                                                                {item.item_type === 'ai_personalization' ? 'AI Personalization' : 'Standard'}
                                                            </span>
                                                            {item.product_snapshot.variant_label && (
                                                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-surface-container-highest text-secondary">
                                                                    {item.product_snapshot.variant_label}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-xl font-black text-primary">
                                                        {formatCurrency(item.unit_price + item.customization_fee)}
                                                    </span>
                                                </div>

                                                {/* Snapshot Info */}
                                                <div className="py-3 text-sm text-secondary leading-relaxed">
                                                    {/* <p>
                                                        Each piece is handcrafted specifically for you.
                                                    </p> */}
                                                </div>

                                                {/* Quantity & Remove */}
                                                <div className="flex justify-between items-center pt-4">
                                                    <div
                                                        className={cn(
                                                            "flex items-center bg-surface-container-highest rounded-full px-4 py-2",
                                                            isQuantityDisabled && "opacity-60"
                                                        )}
                                                    >
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={isQuantityDisabled}
                                                            className="text-secondary hover:text-primary transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <IconMinus className="w-4 h-4" stroke={2} />
                                                        </button>
                                                        <span className="px-4 font-bold">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            disabled={isQuantityDisabled}
                                                            className="text-secondary hover:text-primary transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <IconPlus className="w-4 h-4" stroke={2} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        disabled={isLoading}
                                                        className="text-secondary hover:text-error transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                                                        aria-label={`Remove ${item.product_name}`}
                                                    >
                                                        <IconTrash className="w-5 h-5" stroke={2} />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </section>

                        {/* Order Summary Section */}
                        <aside className="lg:col-span-4">
                            <div className="bg-surface-container-high rounded-xl p-8 sticky top-32">
                                <h2 className="font-headline text-2xl font-black text-on-surface mb-8">
                                    Summary
                                </h2>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-secondary">
                                        <span>Subtotal</span>
                                        <span className="font-semibold text-on-surface">
                                            {formatCurrency(subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-secondary">
                                        <span>Shipping</span>
                                        <span className="font-semibold text-on-surface">
                                            {formatCurrency(shipping)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-secondary">
                                        <span>Handmade Fee</span>
                                        <span className="font-semibold text-on-surface">
                                            {formatCurrency(handmadeFee)}
                                        </span>
                                    </div>

                                    <div className="h-px bg-outline-variant opacity-15 my-4" />

                                    <div className="flex justify-between text-xl font-black text-on-surface">
                                        <span>Total</span>
                                        <span className="text-primary">{formatCurrency(total)}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={() => router.push('/checkout')}
                                        disabled={items.length === 0}
                                    >
                                        Proceed to checkout
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        onClick={() => router.push('/shop')}
                                    >
                                        Continue Shopping
                                    </Button>
                                </div>

                                {/* Shipping Info */}
                                <div className="mt-8 flex items-center gap-4 bg-surface-container-lowest p-4 rounded-lg border border-surface-container-high">
                                    <IconTruck className="w-6 h-6 text-primary shrink-0" stroke={2} />
                                    <div>
                                        <p className="text-xs font-bold text-on-surface">
                                            Arrives in 5-7 business days
                                        </p>
                                        <p className="text-xs text-secondary">
                                            Each piece is handmade to order.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}
