'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCartStore, isCartItemActive } from '@/hooks/use-cart';
import { getCheckoutSchema, CheckoutValues } from '@/components/checkout/schema';
import CheckoutForm from '@/components/checkout/checkout-form';
import OrderSummary from '@/components/checkout/order-summary';
import { UserAddress } from '@/lib/api/address.api';
import { createOrder } from '@/lib/api/order.api';
import { formatCurrency } from '@/lib/utils';
import {
    IconArrowLeft,
    IconAlertTriangle,
} from '@tabler/icons-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, i18n } = useTranslation('common');
    const { items, totalAmount, cart } = useCartStore();

    // Only include active items in checkout processing
    const activeItems = useMemo(() => items.filter(isCartItemActive), [items]);

    const checkoutSchema = useMemo(() => getCheckoutSchema(t), [t]);

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<CheckoutValues>({
        resolver: zodResolver(checkoutSchema),
    });

    // Track selected address object for order submission
    const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    // Checkout options
    const [paymentOption, setPaymentOption] = useState<'full' | 'deposit'>('full');
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: 'flat' | 'percentage'; value: number } | null>(null);
    const [promoError, setPromoError] = useState('');

    // Show cancelled message if redirected from PayOS
    const wasCancelled = searchParams.get('cancelled') === 'true';
    useEffect(() => {
        if (wasCancelled) {
            toast.error(
                i18n.resolvedLanguage?.startsWith('vi')
                    ? 'Thanh toán đã bị huỷ. Bạn có thể thử lại.'
                    : 'Payment was cancelled. You can try again.'
            );
        }
    }, [wasCancelled, i18n.resolvedLanguage]);

    // Redirect if active cart is empty
    useEffect(() => {
        if (activeItems.length === 0) {
            router.push('/cart');
        }
    }, [activeItems, router]);

    // Financial math
    const subtotal = totalAmount;
    const shippingFee = 0;
    const handmadeFee = 0;

    // Discount calculations
    let discount = 0;
    if (appliedPromo) {
        if (appliedPromo.type === 'flat') {
            discount = appliedPromo.value;
        } else {
            discount = Math.round(subtotal * appliedPromo.value);
        }
    }

    const totalBeforePaymentStage = Math.max(0, subtotal + shippingFee + handmadeFee - discount);
    const depositAmount = paymentOption === 'deposit' ? Math.ceil(totalBeforePaymentStage * 0.3) : totalBeforePaymentStage;
    const remainingAmount = paymentOption === 'deposit' ? totalBeforePaymentStage - depositAmount : 0;

    // Handle address selection from AddressSelector
    const handleAddressSelect = (address: UserAddress | null) => {
        setSelectedAddress(address);
        setSelectedAddressId(address?.id ?? null);
        if (address) {
            setValue('selectedAddressId', address.id);
        }
    };

    // Handle Promo Code submission
    const handleApplyPromo = () => {
        setPromoError('');
        const trimmedCode = promoCode.trim().toUpperCase();
        if (!trimmedCode) return;

        if (trimmedCode === 'FLORLEN50') {
            setAppliedPromo({ code: 'FLORLEN50', type: 'flat', value: 50000 });
            toast.success(t('checkout.appliedPromo'));
        } else if (trimmedCode === 'WELCOME10') {
            setAppliedPromo({ code: 'WELCOME10', type: 'percentage', value: 0.1 });
            toast.success(t('checkout.appliedPromo'));
        } else {
            setPromoError(t('checkout.invalidPromo'));
            toast.error(t('checkout.invalidPromo'));
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        setPromoError('');
    };

    // Final order placement — calls real API and redirects to PayOS
    const onSubmit = async (values: CheckoutValues) => {
        try {
            if (!cart?.id) {
                toast.error(
                    i18n.resolvedLanguage?.startsWith('vi')
                        ? 'Không tìm thấy giỏ hàng. Vui lòng thử lại.'
                        : 'Cart not found. Please try again.'
                );
                return;
            }

            const result = await createOrder({
                cartId: cart.id,
                paymentOption,
                addressId: values.selectedAddressId,
                note: values.note,
            });

            // Redirect to PayOS checkout page
            if (result.paymentLink?.checkoutUrl) {
                toast.success(
                    i18n.resolvedLanguage?.startsWith('vi')
                        ? 'Đơn hàng đã được tạo! Đang chuyển đến trang thanh toán...'
                        : 'Order created! Redirecting to payment page...'
                );

                // Small delay for toast to be visible before redirect
                setTimeout(() => {
                    window.location.href = result.paymentLink.checkoutUrl;
                }, 500);
            } else {
                toast.error(
                    i18n.resolvedLanguage?.startsWith('vi')
                        ? 'Không thể tạo liên kết thanh toán. Vui lòng thử lại.'
                        : 'Could not create payment link. Please try again.'
                );
            }
        } catch (err: unknown) {
            console.error('Checkout error:', err);
            const message =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                      'An unexpected error occurred. Please try again.';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-surface pt-32 pb-24 px-6 md:px-12">
            <div className="mx-auto max-w-7xl">
                {/* Back button */}
                <button
                    onClick={() => router.push('/cart')}
                    className="flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary transition-colors mb-8 focus:outline-none"
                >
                    <IconArrowLeft className="w-5 h-5" stroke={2.5} />
                    {i18n.resolvedLanguage?.startsWith('vi') ? 'Quay lại giỏ hàng' : 'Back to Cart'}
                </button>

                {/* Cancelled payment notice */}
                {wasCancelled && (
                    <div className="flex items-center gap-3 bg-error/10 text-error border border-error/20 rounded-xl px-5 py-4 mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                        <IconAlertTriangle className="w-5 h-5 shrink-0" stroke={2} />
                        <p className="text-sm font-semibold">
                            {i18n.resolvedLanguage?.startsWith('vi')
                                ? 'Thanh toán đã bị huỷ. Đơn hàng của bạn vẫn đang chờ thanh toán. Bạn có thể đặt lại.'
                                : 'Payment was cancelled. Your order is still pending. You can place a new order.'}
                        </p>
                    </div>
                )}

                {/* Header */}
                <header className="mb-12">
                    <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-2">
                        {t('checkout.title')}
                    </h1>
                    <p className="text-secondary text-sm md:text-base">
                        {i18n.resolvedLanguage?.startsWith('vi')
                            ? 'Môi trường đặt hàng bảo mật được xác thực với hệ thống Florlen.'
                            : 'Authenticated secure ordering environment with the Florlen platform.'}
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: Form Details */}
                    <div className="lg:col-span-7">
                        <CheckoutForm
                            control={control}
                            errors={errors}
                            paymentOption={paymentOption}
                            setPaymentOption={setPaymentOption}
                            onAddressSelect={handleAddressSelect}
                            selectedAddressId={selectedAddressId}
                        />
                    </div>
                    {/* Right Column: Order Summary & Pricing */}
                    <div className="lg:col-span-5 sticky top-32">
                        <OrderSummary
                            activeItems={activeItems}
                            promoCode={promoCode}
                            setPromoCode={setPromoCode}
                            appliedPromo={appliedPromo}
                            promoError={promoError}
                            handleApplyPromo={handleApplyPromo}
                            handleRemovePromo={handleRemovePromo}
                            subtotal={subtotal}
                            shippingFee={shippingFee}
                            handmadeFee={handmadeFee}
                            discount={discount}
                            depositAmount={depositAmount}
                            remainingAmount={remainingAmount}
                            paymentOption={paymentOption}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
