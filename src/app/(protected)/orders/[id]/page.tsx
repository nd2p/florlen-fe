'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import {
  IconArrowLeft,
  IconClock,
  IconCreditCard,
  IconPackage,
  IconUser,
  IconLoader2,
  IconMaximize,
} from '@tabler/icons-react';
import { useImageLightbox } from '@/components/ui/image-lightbox';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { getOrderById, payRemaining, type Order, type OrderStatus } from '@/lib/api/order.api';
import Badge from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';

// Sequence of order statuses for the visual progress tracker line
const ORDER_STATUS_STEPS: { status: OrderStatus; labelKey: string }[] = [
  { status: 'pending_payment', labelKey: 'profile.orders.status.pending_payment' },
  { status: 'confirmed', labelKey: 'profile.orders.status.confirmed' },
  { status: 'in_production', labelKey: 'profile.orders.status.in_production' },
  { status: 'quality_check', labelKey: 'profile.orders.status.quality_check' },
  { status: 'ready_to_ship', labelKey: 'profile.orders.status.ready_to_ship' },
  { status: 'shipping', labelKey: 'profile.orders.status.shipping' },
  { status: 'completed', labelKey: 'profile.orders.status.completed' },
];

export default function UserOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t, i18n } = useTranslation('common');
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPayingRemaining, setIsPayingRemaining] = useState(false);
  const { openLightbox, LightboxNode } = useImageLightbox();

  useEffect(() => {
    if (!orderId) return;
    let active = true;

    const fetchOrderDetail = async () => {
      try {
        const response = await getOrderById(orderId);
        if (active) {
          setOrder(response.order);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Load order detail error:', error);
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Failed to retrieve order details.'
          );
          setIsLoading(false);
        }
      }
    };

    fetchOrderDetail();
    return () => {
      active = false;
    };
  }, [orderId]);

  const handlePayRemaining = async () => {
    if (!orderId) return;
    setIsPayingRemaining(true);
    const toastId = toast.loading(t('profile.orders.details.generatingLink'));
    try {
      const response = await payRemaining(orderId);
      if (response.paymentLink?.checkoutUrl) {
        toast.success(t('profile.orders.details.redirectingPayOS'), { id: toastId });
        setTimeout(() => {
          window.location.href = response.paymentLink.checkoutUrl;
        }, 800);
      } else {
        toast.error(t('profile.orders.details.linkCreationFailed'), { id: toastId });
      }
    } catch (error) {
      console.error('Pay remaining error:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err?.response?.data?.message || 'Payment generation failed.';
      toast.error(msg, { id: toastId });
    } finally {
      setIsPayingRemaining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <Loading variant="skeleton-detail" className="pt-8" />
      </div>
    );
  }

  const isVi = !!i18n.resolvedLanguage?.startsWith('vi');
  const locale = isVi ? 'vi-VN' : 'en-US';

  if (errorMessage || !order) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-4">
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary/80"
        >
          <IconArrowLeft className="h-4 w-4" stroke={2} />
          {t('profile.orders.details.backToProfile')}
        </button>
        <div className="rounded-[1.5rem] bg-error/10 border border-error/20 p-6 text-error">
          <h2 className="text-lg font-black">{t('profile.orders.details.errorTitle')}</h2>
          <p className="mt-2 text-sm">{errorMessage || t('profile.orders.details.errorNotFound')}</p>
        </div>
      </div>
    );
  }

  // Determine current index in status pipeline
  const currentStepIndex = ORDER_STATUS_STEPS.findIndex((step) => step.status === order.status);
  const isCancelled = order.status === 'cancelled';
  const awaitingRemaining = order.status === 'awaiting_remaining_payment';

  const formatStatusLabel = (status: OrderStatus) => {
    return t(`profile.orders.status.${status}`);
  };

  return (
    <div className="min-h-screen bg-surface pt-32 pb-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 text-sm font-bold text-secondary transition-colors hover:text-primary"
          >
            <IconArrowLeft className="h-4 w-4" stroke={2} />
            {t('profile.orders.details.backToProfile')}
          </button>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
                {isVi ? 'Đơn hàng' : 'Order'}{' '}
                <span className="font-mono font-black text-primary">#{order.order_number}</span>
              </h1>
              <Badge
                variant={
                  [
                    'confirmed',
                    'in_production',
                    'quality_check',
                    'ready_to_ship',
                    'shipping',
                    'completed',
                  ].includes(order.status)
                    ? 'active'
                    : 'inactive'
                }
              >
                {formatStatusLabel(order.status)}
              </Badge>
            </div>
            <p className="text-base text-secondary">
              {t('profile.orders.created')}{' '}
              {new Date(order.created_at).toLocaleDateString(locale, {
                dateStyle: 'full',
              })}
            </p>
          </div>
        </div>
      </section>

      {/* PIPELINE PROGRESS LINE CARD */}
      <section className="rounded-[1.5rem] bg-surface-container-low p-6 shadow-[0_22px_50px_-40px_rgba(27,28,28,0.28)]">
        <h2 className="mb-4 text-lg font-black text-on-surface">
          {t('profile.orders.details.progressTitle')}
        </h2>

        {isCancelled ? (
          <div className="flex items-center gap-3 rounded-[1.25rem] bg-rose-50 border border-rose-100 p-4 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-300">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold">{t('profile.orders.details.cancelledTitle')}</p>
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {t('profile.orders.details.cancelledDesc')}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative p-4 overflow-x-auto scrollbar-thin">
            <div className="min-w-[900px] relative">
              {/* Connecting Line container */}
              <div className="absolute left-10 right-12 top-5 h-[6px] -translate-y-1/2">
                {/* Background Grey Line - solid rail */}
                <div className="absolute inset-0 bg-surface-container-highest rounded-full" />
                {/* Active Colored Progress Line */}
                <div
                  className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width: awaitingRemaining
                      ? `calc(20px + (4 / ${ORDER_STATUS_STEPS.length - 1}) * (100% - 72px))`
                      : currentStepIndex === ORDER_STATUS_STEPS.length - 1
                      ? '100%'
                      : currentStepIndex >= 0
                      ? `calc(20px + (${currentStepIndex} / ${
                          ORDER_STATUS_STEPS.length - 1
                        }) * (100% - 72px))`
                      : '0%',
                  }}
                />
              </div>

              {/* Steps elements */}
              <div className="relative flex justify-between">
                {ORDER_STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const isAwaitingBalStep = step.status === 'ready_to_ship' && awaitingRemaining;

                  return (
                    <div key={step.status} className="flex flex-col items-center w-24">
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 shadow-sm transition-all duration-300 ${
                          isCurrent
                            ? 'bg-primary border-primary-container text-on-primary scale-110 font-bold'
                            : isAwaitingBalStep
                            ? 'bg-orange-500 border-orange-200 text-white animate-pulse font-bold'
                            : isCompleted
                            ? 'bg-primary border-primary text-on-primary'
                            : 'bg-surface-container-low border-surface-container-highest text-secondary'
                        }`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`mt-3 text-center text-xs font-black tracking-tight ${
                          isCurrent || isAwaitingBalStep ? 'text-primary' : 'text-secondary'
                        }`}
                      >
                        {isAwaitingBalStep
                          ? t('profile.orders.details.awaitingBalance')
                          : t(step.labelKey)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* TWO-COLUMN DETAILS LAYOUT */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* COLUMN 1: ITEMS IN ORDER */}
        <div className="lg:col-span-2 space-y-6">
          <article className="rounded-[1.5rem] bg-surface-container-low p-6 shadow-[0_22px_50px_-40px_rgba(27,28,28,0.28)]">
            <div className="mb-4 flex items-center gap-3 border-b border-surface-container-high pb-4">
              <IconPackage className="h-6 w-6 text-primary" stroke={2} />
              <h2 className="text-xl font-black text-on-surface">
                {t('profile.orders.details.itemsTitle')}
              </h2>
            </div>

            <div className="divide-y divide-surface-container-high">
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item) => (
                  <div key={item.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex gap-4">
                      {item.product_image_url ? (
                        <button
                          type="button"
                          onClick={() => openLightbox(item.product_image_url!, item.product_name)}
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-container-highest shadow-inner group/img cursor-zoom-in text-left focus:outline-none focus:ring-2 focus:ring-primary"
                          title="Xem ảnh"
                        >
                          <Image
                            src={item.product_image_url}
                            alt={item.product_name}
                            fill
                            className="object-cover transition-transform duration-200 group-hover/img:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                            <IconMaximize className="w-4 h-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-200" />
                          </div>
                        </button>
                      ) : (
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-container-highest shadow-inner flex items-center justify-center text-2xl">
                          🧸
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="font-headline text-lg font-black text-on-surface">
                          {item.product_name}
                        </h3>
                        <p className="font-mono text-xs text-secondary">SKU: {item.product_sku}</p>
                        <p className="text-sm font-semibold text-secondary">
                          {t('profile.orders.details.variant')}:{' '}
                          <span className="text-on-surface">
                            {item.variant_label || t('profile.orders.details.standard')}
                          </span>
                        </p>

                        {item.item_type === 'ai_personalization' && item.design_summary && (
                          <div className="mt-3 rounded-[1rem] bg-surface-container-lowest p-3 border border-surface-container-high">
                            <p className="text-[11px] font-black uppercase tracking-wider text-primary">
                              ✨ AI Personalized Design
                            </p>
                            <p className="mt-1 text-xs text-secondary leading-relaxed">
                              Prompt:{' '}
                              {(item.design_summary as { prompt?: string })?.prompt ||
                                'Generated Prompt'}
                            </p>
                            {item.design_mockup_url && (
                              <a
                                href={item.design_mockup_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center text-xs font-bold text-primary hover:underline"
                              >
                                {t('profile.orders.details.viewMockup')}
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-secondary">
                          {formatCurrency(Number(item.unit_price))} × {item.quantity}
                        </p>
                        {Number(item.customization_fee) > 0 && (
                          <p className="text-xs text-primary">
                            + {formatCurrency(Number(item.customization_fee))}{' '}
                            {t('profile.orders.details.custFee')}
                          </p>
                        )}
                        <p className="mt-2 text-lg font-black text-on-surface">
                          {formatCurrency(Number(item.subtotal))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback mapping from root order object for backward compatibility
                <div className="py-5">
                  <div className="flex gap-4">
                    {order.product_image_url ? (
                      <button
                        type="button"
                        onClick={() => openLightbox(order.product_image_url!, order.product_name)}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-container-highest shadow-inner group/img cursor-zoom-in text-left focus:outline-none focus:ring-2 focus:ring-primary"
                        title="Xem ảnh"
                      >
                        <Image
                          src={order.product_image_url}
                          alt={order.product_name}
                          fill
                          className="object-cover transition-transform duration-200 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                          <IconMaximize className="w-4 h-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-200" />
                        </div>
                      </button>
                    ) : (
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-container-highest shadow-inner flex items-center justify-center text-2xl">
                        🧸
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="font-headline text-lg font-black text-on-surface">
                        {order.product_name}
                      </h3>
                      <p className="font-mono text-xs text-secondary">SKU: {order.product_sku}</p>
                      <p className="text-sm font-semibold text-secondary">
                        {t('profile.orders.details.variant')}:{' '}
                        <span className="text-on-surface">
                          {order.variant_label || t('profile.orders.details.standard')}
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-secondary">
                        {formatCurrency(Number(order.unit_price))} × {order.quantity}
                      </p>
                      {Number(order.customization_fee) > 0 && (
                        <p className="text-xs text-primary">
                          + {formatCurrency(Number(order.customization_fee))}{' '}
                          {t('profile.orders.details.custFee')}
                        </p>
                      )}
                      <p className="mt-2 text-lg font-black text-on-surface">
                        {formatCurrency(Number(order.subtotal))}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-surface-container-high pt-4 space-y-2 text-right">
              <div className="flex justify-between text-sm text-secondary">
                <span>{t('profile.orders.details.subtotal')}</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex justify-between border-t border-surface-container-high pt-2 text-xl font-black text-on-surface">
                <span>{t('profile.orders.details.totalPrice')}</span>
                <span className="text-primary">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </article>

          {/* STATUS HISTORY TIMELINE LOG */}
          <article className="rounded-[1.5rem] bg-surface-container-low p-6 shadow-[0_22px_50px_-40px_rgba(27,28,28,0.28)]">
            <div className="mb-4 flex items-center gap-3 border-b border-surface-container-high pb-4">
              <IconClock className="h-6 w-6 text-primary" stroke={2} />
              <h2 className="text-xl font-black text-on-surface">
                {t('profile.orders.details.historyTitle')}
              </h2>
            </div>

            <div className="flow-root mt-4">
              <ul className="-mb-8">
                {order.status_logs && order.status_logs.length > 0 ? (
                  order.status_logs.map((log, idx) => (
                    <li key={log.id}>
                      <div className="relative pb-8">
                        {idx !== order.status_logs!.length - 1 ? (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-surface-container-highest"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-xs text-primary ring-8 ring-surface-container-low font-bold">
                              ✓
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm font-bold text-on-surface">
                                {t('profile.orders.details.transitionedTo')}{' '}
                                <span className="text-primary uppercase text-xs tracking-wider font-black">
                                  {formatStatusLabel(log.to_status as OrderStatus)}
                                </span>
                              </p>
                              {log.from_status && (
                                <p className="text-xs text-secondary mt-0.5">
                                  {t('profile.orders.details.from')}:{' '}
                                  {formatStatusLabel(log.from_status as OrderStatus)}
                                </p>
                              )}
                              {log.note && (
                                <p className="mt-1 text-xs text-on-surface bg-surface-container-lowest p-2 rounded-[0.5rem] italic">
                                  &ldquo;{log.note}&rdquo;
                                </p>
                              )}
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-secondary font-mono">
                              <p>{new Date(log.created_at).toLocaleDateString(locale)}</p>
                              <p>
                                {new Date(log.created_at).toLocaleTimeString(locale, {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-secondary">
                    {t('profile.orders.details.noHistory')}
                  </p>
                )}
              </ul>
            </div>
          </article>
        </div>

        {/* SIDEBAR: CUSTOMER & PAYMENT CARDS */}
        <div className="space-y-6">
          {/* CUSTOMER INFO CARD */}
          <aside className="rounded-[1.5rem] bg-surface-container-low p-6 shadow-[0_22px_50px_-40px_rgba(27,28,28,0.28)] space-y-4">
            <div className="flex items-center gap-3 border-b border-surface-container-high pb-4">
              <IconUser className="h-6 w-6 text-primary" stroke={2} />
              <h2 className="text-lg font-black text-on-surface">
                {t('profile.orders.details.recipientTitle')}
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {t('profile.orders.details.recipientName')}
                </p>
                <p className="text-base font-bold text-on-surface">{order.recipient_name}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {t('profile.orders.details.recipientPhone')}
                </p>
                <p className="text-base font-bold text-on-surface">{order.recipient_phone}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {t('profile.orders.details.shippingAddress')}
                </p>
                <div className="rounded-[1rem] bg-surface-container-lowest p-3 border border-surface-container-high text-sm text-on-surface space-y-1 mt-1">
                  {order.shipping_address?.label && (
                    <span className="inline-block bg-primary-fixed text-on-primary-fixed text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1">
                      {order.shipping_address.label}
                    </span>
                  )}
                  <p className="font-semibold">{order.shipping_address?.address_line_1}</p>
                  <p className="text-secondary">
                    {order.shipping_address?.city}, {order.shipping_address?.country_code}
                  </p>
                </div>
              </div>

              {order.customer_note && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                    {t('profile.orders.details.customerNote')}
                  </p>
                  <p className="text-sm text-on-surface bg-amber-50 dark:bg-amber-950/20 p-3 rounded-[1rem] border border-amber-100 dark:border-amber-900 leading-relaxed mt-1">
                    &ldquo;{order.customer_note}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* PAYMENT DETAILS CARD */}
          <aside className="rounded-[1.5rem] bg-surface-container-low p-6 shadow-[0_22px_50px_-40px_rgba(27,28,28,0.28)] space-y-4">
            <div className="flex items-center gap-3 border-b border-surface-container-high pb-4">
              <IconCreditCard className="h-6 w-6 text-primary" stroke={2} />
              <h2 className="text-lg font-black text-on-surface">
                {t('profile.orders.details.paymentTitle')}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {t('profile.orders.details.payOption')}
                </p>
                <span
                  className={`inline-block mt-1 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                    order.payment_option === 'full'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {order.payment_option === 'full'
                    ? t('profile.orders.details.payOptionFull')
                    : t('profile.orders.details.payOptionDeposit')}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {t('profile.orders.details.payStage')}
                </p>
                <span className="inline-block mt-1 bg-surface-container-highest text-secondary text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {t(`profile.orders.stages.${order.payment_stage}`)}
                </span>
              </div>

              <div className="border-t border-surface-container-high pt-3 divide-y divide-surface-container-high">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-secondary">
                    {t('profile.orders.details.totalAmount')}
                  </span>
                  <span className="font-bold text-on-surface">
                    {formatCurrency(Number(order.total_amount))}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-secondary">{t('profile.orders.details.depositAmount')}</span>
                  <span className="font-bold text-on-surface">
                    {formatCurrency(Number(order.deposit_amount))}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-secondary">
                    {t('profile.orders.details.remainingAmount')}
                  </span>
                  <span
                    className={`font-bold ${
                      Number(order.remaining_amount) > 0 ? 'text-rose-500' : 'text-emerald-600'
                    }`}
                  >
                    {formatCurrency(Number(order.remaining_amount))}
                  </span>
                </div>
              </div>

              {/* ACTION TRIGGER FOR PAY REMAINING 70% */}
              {order.status === 'awaiting_remaining_payment' && (
                <button
                  onClick={handlePayRemaining}
                  disabled={isPayingRemaining}
                  className="w-full mt-2 px-4 py-3 bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold rounded-xl shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isPayingRemaining ? (
                    <IconLoader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <IconCreditCard className="w-4.5 h-4.5" />
                  )}
                  {t('profile.orders.payRemaining')}
                </button>
              )}
            </div>
          </aside>
        </div>
      </section>
      {LightboxNode}
    </div>
  );
}
