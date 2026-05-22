'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useCartStore, isCartItemActive } from '@/hooks/use-cart';
import { getCheckoutSchema, CheckoutValues } from '@/components/checkout/schema';
import CheckoutForm from '@/components/checkout/checkout-form';
import OrderSummary from '@/components/checkout/order-summary';
import { UserAddress } from '@/lib/api/address.api';
import { cn, formatCurrency } from '@/lib/utils';
import {
    IconArrowLeft,
    IconCheck,
    IconCopy,
    IconQrcode
} from '@tabler/icons-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const router = useRouter();
    const { t, i18n } = useTranslation('common');
    const { items, totalAmount, clearCart } = useCartStore();

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

    // Submission states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [generatedOrderNumber, setGeneratedOrderNumber] = useState('');
    const [copied, setCopied] = useState(false);

    // Redirect if active cart is empty and success modal isn't open
    useEffect(() => {
        if (activeItems.length === 0 && !showSuccessModal) {
            router.push('/cart');
        }
    }, [activeItems, router, showSuccessModal]);

    // Financial math
    const subtotal = totalAmount;
    const shippingFee = subtotal > 0 ? 12.5 : 0;
    const handmadeFee = subtotal > 0 ? 5.0 : 0;

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

    // Final order placement submission
    const onSubmit = async (values: CheckoutValues) => {
        try {
            // values.selectedAddressId is validated — selectedAddress holds the full object
            const orderCode = Math.floor(100000 + Math.random() * 900000);
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const newOrderNumber = `FLR-${dateStr}-${orderCode}`;

            // Simulate delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setGeneratedOrderNumber(newOrderNumber);
            setShowSuccessModal(true);
            toast.success(
                i18n.resolvedLanguage?.startsWith('vi')
                    ? 'Đơn hàng đã được thiết lập thành công!'
                    : 'Order established successfully!'
            );
        } catch (err) {
            console.error(err);
            toast.error('An unexpected error occurred. Please try again.');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedOrderNumber);
        setCopied(true);
        toast.success(
            i18n.resolvedLanguage?.startsWith('vi')
                ? 'Đã sao chép mã đơn hàng!'
                : 'Order number copied to clipboard!'
        );
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSuccessFinalize = () => {
        clearCart();
        router.push('/');
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

            {/* Premium VietQR / PayOS Simulated Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-surface rounded-2xl overflow-hidden shadow-2xl nocturnal-shadow border border-outline/10 ring-1 ring-black/5 animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">

                        {/* Modal Left Side: QR SCANNING (VietQR Mock) */}
                        <div className="md:w-1/2 bg-primary/5 p-8 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-surface-container-high">
                            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center gap-1 border border-primary/20 shrink-0">
                                <IconQrcode className="w-3.5 h-3.5 shrink-0" stroke={2.5} />
                                VietQR PayOS
                            </div>

                            <h3 className="font-headline font-black text-xl text-on-surface mb-1">
                                {t('checkout.qrTitle')}
                            </h3>
                            <p className="text-secondary text-xs leading-relaxed max-w-[220px] mb-6">
                                {t('checkout.qrSubtitle')}
                            </p>

                            {/* Mock QR Code */}
                            <div className="relative w-44 h-44 bg-white p-3 rounded-2xl shadow-md border border-outline/10 flex items-center justify-center shrink-0">
                                <svg viewBox="0 0 100 100" className="w-full h-full text-on-background">
                                    <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="5" />
                                    <rect x="10" y="10" width="15" height="15" fill="currentColor" />
                                    <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="5" />
                                    <rect x="75" y="10" width="15" height="15" fill="currentColor" />
                                    <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="5" />
                                    <rect x="10" y="75" width="15" height="15" fill="currentColor" />
                                    <path d="M40 5h10v10H40zm15 0h10v15H55zm15 35h15v10H70zm-30 15h15v10H40zm15 15h15v15H55zm15 5h15v10H70z" fill="currentColor" />
                                    <path d="M45 25H35v15h10v-5h10v10h15V35H55V25H45z" fill="currentColor" />
                                    <path d="M15 45h15v10H15zm20 30h10v10H35z" fill="currentColor" />
                                    <rect x="42" y="42" width="16" height="16" rx="4" fill="var(--color-primary)" />
                                    <circle cx="50" cy="50" r="4" fill="white" />
                                </svg>
                            </div>

                            {/* Bank info */}
                            <div className="mt-4 text-xs font-semibold text-secondary space-y-0.5">
                                <p className="text-on-surface font-extrabold uppercase text-primary">MB BANK</p>
                                <p>1903 678 9999</p>
                                <p className="text-[10px] tracking-wide text-secondary/80">FLORLEN HANDMADE</p>
                            </div>
                        </div>

                        {/* Modal Right Side: Receipt details */}
                        <div className="md:w-1/2 p-8 flex flex-col justify-between">
                            <div>
                                <h3 className="font-headline font-black text-2xl text-on-surface mb-1 text-primary">
                                    {t('checkout.successTitle')}
                                </h3>
                                <p className="text-secondary text-xs leading-relaxed mb-6">
                                    {t('checkout.successSubtitle')}
                                </p>

                                <div className="space-y-4 text-sm bg-surface-container-low p-4 rounded-xl border border-surface-container-high/60 mb-6">
                                    <div>
                                        <span className="text-xs text-secondary font-semibold uppercase tracking-wider block">
                                            {t('checkout.orderNumber')}
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="font-headline font-extrabold text-on-surface select-all">
                                                {generatedOrderNumber}
                                            </span>
                                            <button
                                                onClick={copyToClipboard}
                                                className="text-secondary hover:text-primary transition-colors p-0.5 rounded focus:outline-none"
                                                title="Copy to clipboard"
                                            >
                                                {copied ? (
                                                    <IconCheck className="w-4 h-4 text-primary shrink-0 animate-in zoom-in" stroke={3} />
                                                ) : (
                                                    <IconCopy className="w-4 h-4 shrink-0" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Shipping address summary */}
                                    {selectedAddress && (
                                        <>
                                            <div className="h-px bg-surface-container-high/80" />
                                            <div>
                                                <span className="text-xs text-secondary font-semibold uppercase tracking-wider block">
                                                    {t('address.shippingTo')}
                                                </span>
                                                <p className="font-semibold text-on-surface mt-1 text-sm">
                                                    {selectedAddress.recipient_name}
                                                </p>
                                                <p className="text-secondary text-xs mt-0.5">
                                                    {selectedAddress.phone_number}
                                                </p>
                                                <p className="text-secondary text-xs mt-0.5">
                                                    {selectedAddress.address_line_1}, {selectedAddress.city}
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    <div className="h-px bg-surface-container-high/80" />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-secondary font-semibold uppercase tracking-wider block">
                                                {t('checkout.totalToday')}
                                            </span>
                                            <span className="font-headline font-extrabold text-lg text-primary block mt-0.5">
                                                {formatCurrency(depositAmount)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-secondary font-semibold uppercase tracking-wider block">
                                                {i18n.resolvedLanguage?.startsWith('vi') ? 'Hình thức' : 'Billing Type'}
                                            </span>
                                            <span className="font-headline font-bold text-xs text-on-surface block mt-1 uppercase">
                                                {paymentOption === 'deposit' ? t('checkout.deposit') : t('checkout.fullPaid')}
                                            </span>
                                        </div>
                                    </div>

                                    {paymentOption === 'deposit' && (
                                        <>
                                            <div className="h-px bg-surface-container-high/80" />
                                            <div className="flex justify-between text-xs font-semibold text-secondary">
                                                <span>{t('checkout.remainingBalance')}</span>
                                                <span className="text-on-surface font-bold">{formatCurrency(remainingAmount)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="space-y-3">
                                <Button
                                    onClick={handleSuccessFinalize}
                                    variant="primary"
                                    size="lg"
                                    className="w-full flex items-center justify-center rounded-full h-12 text-sm shadow-[0_10px_20px_-5px_rgba(164,0,21,0.2)]"
                                >
                                    {t('checkout.backHome')}
                                </Button>
                                <Button
                                    onClick={handleSuccessFinalize}
                                    variant="secondary"
                                    size="lg"
                                    className="w-full flex items-center justify-center rounded-full h-12 text-sm"
                                >
                                    {i18n.resolvedLanguage?.startsWith('vi')
                                        ? 'Xác nhận Đã chuyển khoản'
                                        : 'Confirm I Have Transferred'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
