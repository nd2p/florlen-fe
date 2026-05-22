'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { CartItem } from '@/lib/api/cart.api';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
    IconCheck,
    IconInfoCircle,
    IconTicket,
    IconLock,
    IconLoader2
} from '@tabler/icons-react';

interface OrderSummaryProps {
    activeItems: CartItem[];
    promoCode: string;
    setPromoCode: (code: string) => void;
    appliedPromo: { code: string; type: 'flat' | 'percentage'; value: number } | null;
    promoError: string;
    handleApplyPromo: () => void;
    handleRemovePromo: () => void;
    subtotal: number;
    shippingFee: number;
    handmadeFee: number;
    discount: number;
    depositAmount: number;
    remainingAmount: number;
    paymentOption: 'full' | 'deposit';
    isSubmitting: boolean;
}

export default function OrderSummary({
    activeItems,
    promoCode,
    setPromoCode,
    appliedPromo,
    promoError,
    handleApplyPromo,
    handleRemovePromo,
    subtotal,
    shippingFee,
    handmadeFee,
    discount,
    depositAmount,
    remainingAmount,
    paymentOption,
    isSubmitting
}: OrderSummaryProps) {
    const { t, i18n } = useTranslation('common');

    return (
        <aside className="space-y-6">
            {/* Summary Container */}
            <div className="bg-surface-container-high rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container-highest">
                <h2 className="font-headline text-2xl font-black text-on-surface mb-6 border-b border-surface-container-highest pb-4 flex items-center gap-2">
                    {t('checkout.orderSummary')}
                    <span className="bg-primary text-on-primary text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                        {activeItems.length}
                    </span>
                </h2>

                {/* Nested Items Scrollbox */}
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin mb-6 border-b border-surface-container-highest pb-6">
                    {activeItems.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center bg-surface-container-low p-3 rounded-xl border border-surface-container-high/55">
                            <div className="relative w-16 h-16 bg-surface-container-highest rounded-lg overflow-hidden shrink-0">
                                <Image
                                    src={item.product_snapshot.image_url || '/placeholder-product.jpg'}
                                    alt={item.product_name}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                />
                            </div>
                            <div className="grow min-w-0">
                                <h4 className="text-sm font-bold text-on-surface truncate">
                                    {item.product_name}
                                </h4>
                                <p className="text-secondary text-xs mt-0.5">
                                    {item.product_snapshot.variant_label || (item.item_type === 'ai_personalization' ? 'AI Custom' : 'Standard')} x{item.quantity}
                                </p>
                            </div>
                            <span className="text-sm font-extrabold text-primary shrink-0 whitespace-nowrap">
                                {formatCurrency((item.unit_price + item.customization_fee) * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Promo Code section */}
                <div className="space-y-3 mb-6 border-b border-surface-container-highest pb-6">
                    <label className="text-sm font-headline font-bold text-on-surface block ml-1">
                        {t('checkout.promoCode')}
                    </label>
                    <div className="flex gap-3">
                        <div className="relative grow">
                            <input
                                type="text"
                                placeholder={t('checkout.promoPlaceholder')}
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                disabled={!!appliedPromo}
                                className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline/10 rounded-xl text-sm font-headline outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                            />
                            <IconTicket className="w-5 h-5 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        {appliedPromo ? (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleRemovePromo}
                                className="px-4 py-3 text-sm shrink-0 rounded-xl h-[46px] border border-outline/10 bg-error/10 text-error hover:bg-error/20"
                            >
                                {i18n.resolvedLanguage?.startsWith('vi') ? 'Gỡ' : 'Remove'}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleApplyPromo}
                                disabled={!promoCode.trim()}
                                className="px-5 py-3 text-sm shrink-0 rounded-xl h-[46px]"
                            >
                                {t('checkout.apply')}
                            </Button>
                        )}
                    </div>
                    {promoError && <p className="text-xs text-error ml-1">{promoError}</p>}
                    {appliedPromo && (
                        <div className="flex items-center gap-1.5 text-xs text-primary font-bold ml-1 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-top-1 duration-200">
                            <IconCheck className="w-4 h-4 shrink-0" stroke={3} />
                            {i18n.resolvedLanguage?.startsWith('vi') 
                                ? `Mã ${appliedPromo.code} được áp dụng (-${appliedPromo.type === 'flat' ? formatCurrency(appliedPromo.value) : `${appliedPromo.value * 100}%`})`
                                : `Code ${appliedPromo.code} applied (-${appliedPromo.type === 'flat' ? formatCurrency(appliedPromo.value) : `${appliedPromo.value * 100}%`})`}
                        </div>
                    )}
                </div>

                {/* Calculation Rows */}
                <div className="space-y-4 text-sm mb-6 border-b border-surface-container-highest pb-6">
                    <div className="flex justify-between text-secondary">
                        <span>{t('checkout.subtotal')}</span>
                        <span className="font-semibold text-on-surface">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-secondary">
                        <span>{t('checkout.shipping')}</span>
                        <span className="font-semibold text-on-surface">{formatCurrency(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between text-secondary">
                        <span>{t('checkout.handmadeFee')}</span>
                        <span className="font-semibold text-on-surface">{formatCurrency(handmadeFee)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-primary font-bold">
                            <span>{t('checkout.discount')}</span>
                            <span>-{formatCurrency(discount)}</span>
                        </div>
                    )}

                    <div className="h-px bg-surface-container-highest my-2" />

                    {/* Total due today */}
                    <div className="flex justify-between text-lg font-black text-on-surface">
                        <span>{t('checkout.totalToday')}</span>
                        <span className="text-primary text-xl font-black">
                            {formatCurrency(depositAmount)}
                        </span>
                    </div>

                    {/* Remaining payment indicator (deposit only) */}
                    {paymentOption === 'deposit' && (
                        <div className="flex justify-between text-xs text-secondary bg-surface-container-low px-4 py-2.5 rounded-lg mt-2 border border-surface-container-high/60 animate-in fade-in duration-200">
                            <span className="flex items-center gap-1">
                                <IconInfoCircle className="w-4 h-4 shrink-0 text-primary" />
                                {t('checkout.remainingBalance')}
                            </span>
                            <span className="font-extrabold text-on-surface">{formatCurrency(remainingAmount)}</span>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-full h-14"
                >
                    {isSubmitting ? (
                        <>
                            <IconLoader2 className="w-5 h-5 animate-spin" />
                            {t('checkout.submitting')}
                        </>
                    ) : (
                        <>
                            <IconLock className="w-5 h-5 shrink-0" stroke={2.5} />
                            {t('checkout.placeOrder')}
                        </>
                    )}
                </Button>
            </div>
        </aside>
    );
}
