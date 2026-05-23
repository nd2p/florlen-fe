'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
  IconArrowLeft,
  IconClock,
  IconCreditCard,
  IconPackage,
  IconUser,
  IconLoader,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import {
  getOrderById,
  updateOrderStatusAdmin,
  type Order,
  type OrderStatus,
} from '@/lib/api/order.api';
import { formatStatusLabel } from '../page';
import Badge from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

// Sequence of order statuses for the visual progress tracker line
const ORDER_STATUS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending_payment', label: 'Payment Pending' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'in_production', label: 'Production' },
  { status: 'quality_check', label: 'Quality Check' },
  { status: 'ready_to_ship', label: 'Ready to Ship' },
  { status: 'shipping', label: 'Shipping' },
  { status: 'completed', label: 'Completed' },
];

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_production', label: 'In Production' },
  { value: 'quality_check', label: 'Quality Check' },
  { value: 'awaiting_remaining_payment', label: 'Awaiting Rem. Payment' },
  { value: 'ready_to_ship', label: 'Ready to Ship' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<OrderStatus | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

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

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!orderId || !order) return;

    setIsUpdatingStatus(true);
    const toastId = toast.loading(`Updating order status to ${formatStatusLabel(newStatus)}...`);
    try {
      await updateOrderStatusAdmin(orderId, newStatus);
      toast.success('Order status updated successfully!', { id: toastId });
      // Reload order details to refresh visual states and history log
      const response = await getOrderById(orderId);
      setOrder(response.order);
    } catch (error) {
      console.error('Update status error:', error);
      const msg = error instanceof Error ? error.message : 'Invalid state transition requested.';
      toast.error(msg, { id: toastId });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-secondary">
        <IconLoader className="h-10 w-10 animate-spin text-primary" stroke={2} />
        <span className="text-sm font-semibold">Loading order details...</span>
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push('/admin/orders')}
          className="flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary-container"
        >
          <IconArrowLeft className="h-4 w-4" stroke={2} />
          Back to Queue
        </button>
        <div className="rounded-[1.5rem] bg-error/10 border border-error/20 p-6 text-error">
          <h2 className="text-lg font-black">Error Retrieving Order</h2>
          <p className="mt-2 text-sm">{errorMessage || 'Order not found.'}</p>
        </div>
      </div>
    );
  }

  // Determine current index in status pipeline
  const currentStepIndex = ORDER_STATUS_STEPS.findIndex((step) => step.status === order.status);
  const isCancelled = order.status === 'cancelled';
  const awaitingRemaining = order.status === 'awaiting_remaining_payment';

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <button
            onClick={() => router.push('/admin/orders')}
            className="flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary-container"
          >
            <IconArrowLeft className="h-4 w-4" stroke={2} />
            Back to Queue
          </button>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
                Order{' '}
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
              Created on{' '}
              {new Date(order.created_at).toLocaleDateString('vi-VN', {
                dateStyle: 'full',
              })}
            </p>
          </div>
        </div>

        {/* Status Update Quick Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-secondary">Update Status:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                disabled={isUpdatingStatus}
                className="flex h-12 items-center gap-2 rounded-full bg-surface-container-high px-5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
              >
                <span>{formatStatusLabel(order.status)}</span>
                <span className="text-xs text-secondary">▼</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-surface-container-low border border-surface-container-high shadow-lg rounded-xl p-1.5 z-[60]"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-black uppercase tracking-wider text-secondary">
                Change Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-surface-container-high" />
              {ORDER_STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  disabled={opt.value === order.status}
                  onClick={() => {
                    setPendingStatusChange(opt.value);
                    setIsAlertOpen(true);
                  }}
                  className={`relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:bg-primary/10 focus:text-primary data-disabled:pointer-events-none data-disabled:opacity-50 ${
                    opt.value === order.status ? 'bg-primary/5 text-primary' : 'text-on-surface'
                  }`}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* PIPELINE PROGRESS LINE CARD */}
      <section className="rounded-[1.5rem] bg-surface-container-low p-6 shadow-[0_22px_50px_-40px_rgba(27,28,28,0.28)]">
        <h2 className="mb-6 text-lg font-black text-on-surface">Order Progress</h2>

        {isCancelled ? (
          <div className="flex items-center gap-3 rounded-[1.25rem] bg-rose-50 border border-rose-100 p-4 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-300">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold">This order has been Cancelled</p>
              <p className="text-xs text-rose-600 dark:text-rose-400">
                All production operations and balances for this order are suspended.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative mt-8 px-4">
            {/* Connecting Line container (extends from left to right circle outer edges at 16px/left-4) */}
            <div className="absolute left-20 right-12 top-5 h-[6px] -translate-y-1/2">
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
                  <div key={step.status} className="flex flex-col items-center">
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
                      {isAwaitingBalStep ? 'Awaiting Balance' : step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* THREE-COLUMN DETAILS LAYOUT */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* COLUMN 1: ITEMS IN ORDER */}
        <div className="lg:col-span-2 space-y-6">
          <article className="rounded-[1.5rem] bg-surface-container-low p-6 shadow-[0_22px_50px_-40px_rgba(27,28,28,0.28)]">
            <div className="mb-4 flex items-center gap-3 border-b border-surface-container-high pb-4">
              <IconPackage className="h-6 w-6 text-primary" stroke={2} />
              <h2 className="text-xl font-black text-on-surface">Order Items Details</h2>
            </div>

            <div className="divide-y divide-surface-container-high">
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item) => (
                  <div key={item.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-container-highest shadow-inner">
                        {item.product_image_url ? (
                          <Image
                            src={item.product_image_url}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl">
                            🧸
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="font-headline text-lg font-black text-on-surface">
                          {item.product_name}
                        </h3>
                        <p className="font-mono text-xs text-secondary">SKU: {item.product_sku}</p>
                        <p className="text-sm font-semibold text-secondary">
                          Variant:{' '}
                          <span className="text-on-surface">
                            {item.variant_label || 'Standard'}
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
                                View Generated Mockup ↗
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
                            + {formatCurrency(Number(item.customization_fee))} Cust. Fee
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
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-container-highest shadow-inner">
                      {order.product_image_url ? (
                        <Image
                          src={order.product_image_url}
                          alt={order.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">
                          🧸
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="font-headline text-lg font-black text-on-surface">
                        {order.product_name}
                      </h3>
                      <p className="font-mono text-xs text-secondary">SKU: {order.product_sku}</p>
                      <p className="text-sm font-semibold text-secondary">
                        Variant:{' '}
                        <span className="text-on-surface">{order.variant_label || 'Standard'}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-secondary">
                        {formatCurrency(Number(order.unit_price))} × {order.quantity}
                      </p>
                      {Number(order.customization_fee) > 0 && (
                        <p className="text-xs text-primary">
                          + {formatCurrency(Number(order.customization_fee))} Cust. Fee
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
                <span>Subtotal</span>
                <span>
                  {formatCurrency(order.total_amount - (order.currency === 'VND' ? 0 : 0))}
                </span>
              </div>
              <div className="flex justify-between border-t border-surface-container-high pt-2 text-xl font-black text-on-surface">
                <span>Total Price</span>
                <span className="text-primary">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </article>

          {/* STATUS HISTORY TIMELINE LOG */}
          <article className="rounded-[1.5rem] bg-surface-container-low p-6 shadow-[0_22px_50px_-40px_rgba(27,28,28,0.28)]">
            <div className="mb-4 flex items-center gap-3 border-b border-surface-container-high pb-4">
              <IconClock className="h-6 w-6 text-primary" stroke={2} />
              <h2 className="text-xl font-black text-on-surface">Status Logs & History</h2>
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
                                Transitioned to{' '}
                                <span className="text-primary uppercase text-xs tracking-wider font-black">
                                  {formatStatusLabel(log.to_status as OrderStatus)}
                                </span>
                              </p>
                              {log.from_status && (
                                <p className="text-xs text-secondary mt-0.5">
                                  From: {formatStatusLabel(log.from_status as OrderStatus)}
                                </p>
                              )}
                              {log.note && (
                                <p className="mt-1 text-xs text-on-surface bg-surface-container-lowest p-2 rounded-[0.5rem] italic">
                                  &ldquo;{log.note}&rdquo;
                                </p>
                              )}
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-secondary font-mono">
                              <p>{new Date(log.created_at).toLocaleDateString('vi-VN')}</p>
                              <p>
                                {new Date(log.created_at).toLocaleTimeString('vi-VN', {
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
                  <p className="text-sm text-secondary">No status log history records available.</p>
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
              <h2 className="text-lg font-black text-on-surface">Customer Recipient</h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Full Name
                </p>
                <p className="text-base font-bold text-on-surface">{order.recipient_name}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Phone Number
                </p>
                <p className="text-base font-bold text-on-surface">{order.recipient_phone}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Shipping Address
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
                    Customer Note
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
              <h2 className="text-lg font-black text-on-surface">Payment Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Payment Option Chosen
                </p>
                <span
                  className={`inline-block mt-1 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                    order.payment_option === 'full'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {order.payment_option === 'full'
                    ? 'Full Payment (100%)'
                    : 'Deposit Installment (30%)'}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Payment Stage
                </p>
                <span className="inline-block mt-1 bg-surface-container-highest text-secondary text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {order.payment_stage.replace('_', ' ')}
                </span>
              </div>

              <div className="border-t border-surface-container-high pt-3 divide-y divide-surface-container-high">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-secondary">Total Amount</span>
                  <span className="font-bold text-on-surface">
                    {formatCurrency(Number(order.total_amount))}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-secondary">Deposit (30%)</span>
                  <span className="font-bold text-on-surface">
                    {formatCurrency(Number(order.deposit_amount))}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-secondary">Remaining (70%)</span>
                  <span
                    className={`font-bold ${
                      Number(order.remaining_amount) > 0 ? 'text-rose-500' : 'text-emerald-600'
                    }`}
                  >
                    {formatCurrency(Number(order.remaining_amount))}
                  </span>
                </div>
              </div>

              {/* TRANSACTION RECORDS */}
              <div className="border-t border-surface-container-high pt-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Transaction Logs
                </p>
                {order.payments && order.payments.length > 0 ? (
                  order.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-[1rem] bg-surface-container-lowest p-3 border border-surface-container-high text-xs space-y-1 leading-relaxed"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-on-surface capitalize">
                          Type: {payment.payment_type.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            payment.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      <p className="text-secondary">
                        Amount:{' '}
                        <span className="font-bold text-on-surface">
                          {formatCurrency(Number(payment.amount))}
                        </span>
                      </p>
                      {payment.paid_at ? (
                        <p className="text-secondary">
                          Paid:{' '}
                          <span className="font-semibold text-on-surface">
                            {new Date(payment.paid_at).toLocaleString('vi-VN')}
                          </span>
                        </p>
                      ) : (
                        <p className="text-amber-600 font-bold">Awaiting Transaction Completion</p>
                      )}
                      {payment.status !== 'PAID' && payment.qr_code_url && (
                        <a
                          href={payment.qr_code_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center text-[10px] font-black uppercase tracking-wider text-primary hover:underline"
                        >
                          View PayOS Link / QR ↗
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-secondary">No payment transactions registered.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Transition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to transition the status of Order #{order.order_number} from{' '}
              <span className="font-bold text-on-surface">{formatStatusLabel(order.status)}</span>{' '}
              to{' '}
              <span className="font-bold text-primary">
                {pendingStatusChange ? formatStatusLabel(pendingStatusChange) : ''}
              </span>
              ? This update will log this change in the chronological status logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingStatusChange(null);
                setIsAlertOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingStatusChange) {
                  handleStatusChange(pendingStatusChange);
                }
                setPendingStatusChange(null);
                setIsAlertOpen(false);
              }}
            >
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
