'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { CartItem } from '@/lib/api/cart.api';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { getAvailableVouchers, type AvailableVoucher } from '@/lib/api/discount.api';
import {
  IconCheck,
  IconInfoCircle,
  IconTicket,
  IconLock,
  IconLoader2,
  IconChevronDown,
  IconX,
  IconTag,
  IconZoomIn,
  IconZoomOut,
  IconMaximize,
} from '@tabler/icons-react';

interface OrderSummaryProps {
  activeItems: CartItem[];
  appliedPromo: { code: string; type: 'flat' | 'percentage'; value: number } | null;
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
  appliedPromo,
  handleRemovePromo,
  subtotal,
  shippingFee,
  handmadeFee,
  discount,
  depositAmount,
  remainingAmount,
  paymentOption,
  isSubmitting,
}: OrderSummaryProps) {
  const { t, i18n } = useTranslation('common');
  const isVi = i18n.resolvedLanguage?.startsWith('vi');

  // Voucher picker state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [vouchers, setVouchers] = useState<AvailableVoucher[]>([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Image lightbox state
  const [previewImg, setPreviewImg] = useState<{ src: string; alt: string } | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  const openPreview = (src: string, alt: string) => {
    setPreviewImg({ src, alt });
    setZoomScale(1);
  };
  const closePreview = () => setPreviewImg(null);
  const zoomIn = () => setZoomScale((s) => Math.min(s + 0.5, 4));
  const zoomOut = () => setZoomScale((s) => Math.max(s - 0.5, 0.5));
  const resetZoom = () => setZoomScale(1);

  // Wheel zoom inside lightbox
  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoomScale((s) => Math.min(Math.max(s - e.deltaY * 0.001, 0.5), 4));
  };

  // Fetch available vouchers when picker opens
  useEffect(() => {
    if (!isPickerOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingVouchers(true);
    getAvailableVouchers(subtotal)
      .then(setVouchers)
      .catch(console.error)
      .finally(() => setIsLoadingVouchers(false));
  }, [isPickerOpen, subtotal]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    if (isPickerOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPickerOpen]);

  const handleSelectVoucher = (v: AvailableVoucher) => {
    // Build appliedPromo compatible shape by calling handleApplyPromo indirectly
    // We inject the code into the parent state by directly patching appliedPromo via a custom event
    // Since parent owns state, we dispatch a custom synthetic event
    const event = new CustomEvent('voucher:select', { detail: v });
    window.dispatchEvent(event);
    setIsPickerOpen(false);
  };

  const discountLabel = (v: AvailableVoucher) => {
    if (v.discount_type === 'percentage') return `-${v.discount_value}%`;
    if (v.discount_type === 'fixed_amount') return `-${formatCurrency(v.discount_value)}`;
    return isVi ? 'Miễn phí ship' : 'Free shipping';
  };

  const expiryLabel = (v: AvailableVoucher) => {
    if (!v.end_date) return null;
    const d = new Date(v.end_date);
    return isVi ? `HSD: ${d.toLocaleDateString('vi-VN')}` : `Exp: ${d.toLocaleDateString('en-US')}`;
  };

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
            <div
              key={item.id}
              className="flex gap-4 items-center bg-surface-container-low p-3 rounded-xl border border-surface-container-high/55"
            >
              <button
                type="button"
                onClick={() =>
                  openPreview(
                    item.product_snapshot.image_url || '/placeholder-product.jpg',
                    item.product_name
                  )
                }
                className="relative w-16 h-16 bg-surface-container-highest rounded-lg overflow-hidden shrink-0 group/img cursor-zoom-in"
                title="Xem ảnh"
              >
                <Image
                  src={item.product_snapshot.image_url || '/placeholder-product.jpg'}
                  alt={item.product_name}
                  fill
                  className="object-cover transition-transform duration-200 group-hover/img:scale-105"
                  sizes="64px"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                  <IconMaximize className="w-4 h-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-200" />
                </div>
              </button>
              <div className="grow min-w-0">
                <h4 className="text-sm font-bold text-on-surface truncate">{item.product_name}</h4>
                <p className="text-secondary text-xs mt-0.5">
                  {item.product_snapshot.variant_label ||
                    (item.item_type === 'ai_personalization' ? 'AI Custom' : 'Standard')}{' '}
                  x{item.quantity}
                </p>
              </div>
              <span className="text-sm font-extrabold text-primary shrink-0 whitespace-nowrap">
                {formatCurrency((item.unit_price + item.customization_fee) * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Voucher Picker section */}
        <div className="space-y-3 mb-6 border-b border-surface-container-highest pb-6">
          <label className="text-sm font-headline font-bold text-on-surface block ml-1">
            {t('checkout.promoCode')}
          </label>

          {appliedPromo ? (
            /* Applied state */
            <div className="flex items-center justify-between bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <IconCheck className="w-4 h-4 text-primary" stroke={3} />
                </div>
                <div>
                  <p className="text-sm font-black text-primary font-mono tracking-widest">
                    {appliedPromo.code}
                  </p>
                  <p className="text-xs text-primary/70 font-semibold">
                    {isVi ? 'Giảm' : 'Saving'}{' '}
                    <span className="font-black">-{formatCurrency(discount)}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemovePromo}
                className="h-7 w-7 rounded-full bg-error/10 hover:bg-error/20 flex items-center justify-center transition-colors text-error shrink-0"
                title={isVi ? 'Gỡ mã' : 'Remove'}
              >
                <IconX className="w-3.5 h-3.5" stroke={2.5} />
              </button>
            </div>
          ) : (
            /* Picker trigger */
            <div ref={pickerRef} className="relative">
              <button
                type="button"
                onClick={() => setIsPickerOpen((prev) => !prev)}
                className="w-full flex items-center gap-3 pl-4 pr-3 py-3 bg-surface-container-lowest border border-outline/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all hover:border-primary/30"
              >
                <IconTicket className="w-5 h-5 text-secondary shrink-0" />
                <span className="grow text-left text-secondary">
                  {isVi ? 'Chọn mã giảm giá...' : 'Select a discount code...'}
                </span>
                <IconChevronDown
                  className={`w-4 h-4 text-secondary shrink-0 transition-transform duration-200 ${
                    isPickerOpen ? 'rotate-180' : ''
                  }`}
                  stroke={2}
                />
              </button>

              {/* Dropdown */}
              {isPickerOpen && (
                <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-surface-container-low border border-outline/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {isLoadingVouchers ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-secondary">
                      <IconLoader2 className="w-4 h-4 animate-spin" />
                      {isVi ? 'Đang tải...' : 'Loading...'}
                    </div>
                  ) : vouchers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-secondary">
                      <IconTag className="w-8 h-8 opacity-30" />
                      <p className="text-sm font-semibold">
                        {isVi ? 'Bạn chưa có mã giảm giá nào' : 'No vouchers available'}
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-outline/5 max-h-72 overflow-y-auto">
                      {vouchers.map((v) => {
                        const expiry = expiryLabel(v);
                        return (
                          <li key={v.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectVoucher(v)}
                              className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-surface-container-high transition-colors group"
                            >
                              {/* Icon */}
                              <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                                <IconTicket className="w-5 h-5 text-primary" />
                              </div>
                              {/* Info */}
                              <div className="grow min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-on-surface text-sm tracking-wider">
                                    {v.code}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15">
                                    {discountLabel(v)}
                                  </span>
                                </div>
                                {expiry && (
                                  <p className="text-[11px] text-secondary mt-0.5">{expiry}</p>
                                )}
                              </div>
                              {/* Saving */}
                              {v.discountAmount > 0 && (
                                <div className="shrink-0 text-right">
                                  <p className="text-xs text-secondary">
                                    {isVi ? 'Tiết kiệm' : 'Save'}
                                  </p>
                                  <p className="text-sm font-black text-primary">
                                    -{formatCurrency(v.discountAmount)}
                                  </p>
                                </div>
                              )}
                              {v.discount_type === 'free_shipping' && (
                                <span className="shrink-0 text-xs font-bold text-purple-600 bg-purple-500/8 border border-purple-500/15 px-2 py-1 rounded-full">
                                  ✈ {isVi ? 'Freeship' : 'Free ship'}
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
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
            <span className="text-primary text-xl font-black">{formatCurrency(depositAmount)}</span>
          </div>

          {/* Remaining payment indicator (deposit only) */}
          {paymentOption === 'deposit' && (
            <div className="flex justify-between text-xs text-secondary bg-surface-container-low px-4 py-2.5 rounded-lg mt-2 border border-surface-container-high/60 animate-in fade-in duration-200">
              <span className="flex items-center gap-1">
                <IconInfoCircle className="w-4 h-4 shrink-0 text-primary" />
                {t('checkout.remainingBalance')}
              </span>
              <span className="font-extrabold text-on-surface">
                {formatCurrency(remainingAmount)}
              </span>
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

      {/* Image Lightbox Dialog */}
      {previewImg && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-200"
          onClick={closePreview}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

          {/* Controls bar */}
          <div
            className="relative z-10 flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoomScale <= 0.5}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30"
              title="Thu nhỏ"
            >
              <IconZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="px-3 h-8 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-colors min-w-[52px] text-center"
              title="Reset zoom"
            >
              {Math.round(zoomScale * 100)}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoomScale >= 4}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30"
              title="Phóng to"
            >
              <IconZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-white/20 mx-1" />
            <button
              type="button"
              onClick={closePreview}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              title="Đóng"
            >
              <IconX className="w-4 h-4" stroke={2.5} />
            </button>
          </div>

          {/* Image container — scrollable when zoomed */}
          <div
            className="relative z-10 overflow-auto max-w-[90vw] max-h-[75vh] rounded-2xl cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheelZoom}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImg.src}
              alt={previewImg.alt}
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease',
                display: 'block',
                maxWidth: '80vw',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '1rem',
              }}
              draggable={false}
            />
          </div>

          {/* Item name label */}
          <p className="relative z-10 mt-4 text-white/60 text-xs font-semibold text-center max-w-[280px] truncate">
            {previewImg.alt}
          </p>
        </div>
      )}
    </aside>
  );
}
