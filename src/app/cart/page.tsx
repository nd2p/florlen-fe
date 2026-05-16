'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { IconMinus, IconPlus, IconTrash, IconTruck } from '@tabler/icons-react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    tags: string[];
    customization: string;
    quantity: number;
}

const initialCartItems: CartItem[] = [
    {
        id: '1',
        name: 'Rosie the Axolotl',
        price: 64.0,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEVVC9lGd86TKlhuFEfyMdq4dcY8P-8NGTZU83F7bgLAqEwh7O8wsJfmMZ92ep0o6lm8quxkUDLfwYa-tiCnGVQLhVh2_fmFYNL-RY2avGAEfG9UPnTc6Jsfs75yX8t5eDv4G7i9HhelDxVG0K2xnmD6iQir_6HVFHo_NZ8h81fMVWoJBOB48ps-ssAU37IpMi7qblF4h2w7xn2JljyLmbLt6Gx-tw_8M7XXgYuhIvW7OTWhCFgMn0W7n9kSzHyHMkP5U5mhAyoFI',
        tags: ['Limited Edition', 'Handmade'],
        customization: 'Pastel Pink Yarn, Safety Eyes (Glitter Blue), Silk Ribbon Accessory.',
        quantity: 1,
    },
    {
        id: '2',
        name: 'Mossy Guardian',
        price: 48.0,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABnB2ovQDMVwk6VZ3-7h7aN0X4X7R932Z7-XQen2RukCUFdGJY6-fpuqqYUdaD4SjQYYdnpzrgcHsbyMx9geryVuRy17Ygi47ogG1Gyjfu-GwAWfgJdvHGDQEdLmDffS9XrwLTHFaQtyGC3y0xSM4LwaUYmLZmF6x2cSCgjirO50OaB6mh35LzFlXpIWFk3DIfjzlkjHc5urQvmZjoPX-btIatDO2k3S9mwrZlJrW5FY0SKCmVe0WeuA9cgnyyloqAJdVv9t07_1Q',
        tags: ['Eco-Yarn'],
        customization: 'Forest Green Base, White Leaf Crown, Bamboo Stuffing.',
        quantity: 2,
    },
];

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCartItems(
            cartItems.map((item) =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const removeItem = (id: string) => {
        setCartItems(cartItems.filter((item) => item.id !== id));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 12.5;
    const handmadeFee = 5.0;
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
                            {cartItems.length} curated collectible{cartItems.length !== 1 ? 's' : ''} waiting for their new home.
                        </p>
                    </header>

                    {/* Cart Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Items Section */}
                        <section className="lg:col-span-8 space-y-6">
                            {cartItems.length === 0 ? (
                                <div className="rounded-lg bg-surface-container-low p-12 text-center">
                                    <p className="text-secondary text-lg">Your cart is empty</p>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg bg-surface-container-low p-6 flex flex-col sm:flex-row gap-6 items-start"
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-full sm:w-40 h-40 bg-surface-container-highest rounded overflow-hidden shrink-0">
                                            <Image
                                                loading="eager"
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 100vw, 160px"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="grow space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold text-on-surface">
                                                        {item.name}
                                                    </h3>
                                                    <div className="flex gap-2 mt-2 flex-wrap">
                                                        {item.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className={`px-3 py-1 text-xs font-bold rounded-full ${tag === 'Limited Edition'
                                                                    ? 'bg-primary-fixed text-on-primary-fixed'
                                                                    : 'bg-surface-container-highest text-secondary font-medium'
                                                                    }`}
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-xl font-black text-primary">
                                                    ${item.price.toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Customization */}
                                            <div className="py-3 text-sm text-secondary leading-relaxed">
                                                <p>
                                                    <span className="font-bold text-on-surface">Customization:</span>{' '}
                                                    {item.customization}
                                                </p>
                                            </div>

                                            {/* Quantity & Remove */}
                                            <div className="flex justify-between items-center pt-4">
                                                <div className="flex items-center bg-surface-container-highest rounded-full px-4 py-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="text-secondary hover:text-primary transition-colors p-1"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <IconMinus className="w-4 h-4" stroke={2} />
                                                    </button>
                                                    <span className="px-4 font-bold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="text-secondary hover:text-primary transition-colors p-1"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <IconPlus className="w-4 h-4" stroke={2} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-secondary hover:text-error transition-colors flex items-center gap-2 text-sm font-medium"
                                                    aria-label={`Remove ${item.name}`}
                                                >
                                                    <IconTrash className="w-5 h-5" stroke={2} />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
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
                                            ${subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-secondary">
                                        <span>Shipping</span>
                                        <span className="font-semibold text-on-surface">
                                            ${shipping.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-secondary">
                                        <span>Handmade Fee</span>
                                        <span className="font-semibold text-on-surface">
                                            ${handmadeFee.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="h-px bg-outline-variant opacity-15 my-4" />

                                    <div className="flex justify-between text-xl font-black text-on-surface">
                                        <span>Total</span>
                                        <span className="text-primary">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Button variant="primary" size="lg">
                                        Proceed to checkout
                                    </Button>
                                    <Button variant="secondary" size="lg">
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
