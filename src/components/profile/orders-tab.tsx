'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  IconCircleDot,
  IconBuildingStore,
  IconTruck,
  IconCheck,
  IconHourglassEmpty,
  IconCalendar,
  IconClock,
  IconCreditCard,
} from '@tabler/icons-react';
import { Loading } from '@/components/ui/loading';
import { OrderSummary, OrderMetrics } from '@/lib/api/order.api';
import { formatCurrency } from '@/lib/utils';

interface OrdersTabProps {
  orders: OrderSummary[];
  ordersLoading: boolean;
  metrics: OrderMetrics;
  activeStatus: 'all' | 'in_production' | 'shipping' | 'completed';
  setActiveStatus: (status: 'all' | 'in_production' | 'shipping' | 'completed') => void;
  handlePayRemaining: (id: string) => Promise<void>;
  isVi: boolean;
}

export default function OrdersTab({
  orders,
  ordersLoading,
  metrics,
  activeStatus,
  setActiveStatus,
  handlePayRemaining,
  isVi,
}: OrdersTabProps) {
  const { t } = useTranslation('common');
  const router = useRouter();

  const handleRemainingPayment = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); // prevent card click
    handlePayRemaining(orderId);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-surface-container-lowest border border-outline/5 rounded-3xl p-6 shadow-sm space-y-2">
        <h2 className="text-2xl font-bold font-headline text-on-surface">
          {t('profile.orders.title')}
        </h2>
        <p className="text-secondary text-xs sm:text-sm">{t('profile.orders.subtitle')}</p>
      </div>

      {/* Status Metrics Counters & Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric Box: All Orders */}
        <button
          onClick={() => setActiveStatus('all')}
          className={`flex flex-col items-center justify-between p-4 sm:p-5 rounded-3xl border transition-all active:scale-95 text-center h-28 sm:h-32 ${
            activeStatus === 'all'
              ? 'border-primary bg-primary/5 ring-2 ring-primary/10 shadow-sm'
              : 'border-outline/5 bg-surface-container-lowest hover:border-outline/20 shadow-sm'
          }`}
        >
          <IconCircleDot
            className={`w-6 h-6 sm:w-7 sm:h-7 ${
              activeStatus === 'all' ? 'text-primary' : 'text-secondary'
            }`}
            stroke={1.5}
          />
          <span className="text-[10px] sm:text-xs font-bold font-headline tracking-wide uppercase text-secondary">
            {t('profile.orders.status.all')}
          </span>
          <span
            className={`text-xl sm:text-2xl font-extrabold font-headline ${
              activeStatus === 'all' ? 'text-primary' : 'text-on-surface'
            }`}
          >
            {metrics.all}
          </span>
        </button>

        {/* Metric Box: In Production */}
        <button
          onClick={() => setActiveStatus('in_production')}
          className={`flex flex-col items-center justify-between p-4 sm:p-5 rounded-3xl border transition-all active:scale-95 text-center h-28 sm:h-32 ${
            activeStatus === 'in_production'
              ? 'border-primary bg-primary/5 ring-2 ring-primary/10 shadow-sm'
              : 'border-outline/5 bg-surface-container-lowest hover:border-outline/20 shadow-sm'
          }`}
        >
          <IconBuildingStore
            className={`w-6 h-6 sm:w-7 sm:h-7 ${
              activeStatus === 'in_production' ? 'text-primary' : 'text-secondary'
            }`}
          />
          <span className="text-[10px] sm:text-xs font-bold font-headline tracking-wide uppercase text-secondary">
            {t('profile.orders.status.in_production')}
          </span>
          <span
            className={`text-xl sm:text-2xl font-extrabold font-headline ${
              activeStatus === 'in_production' ? 'text-primary' : 'text-on-surface'
            }`}
          >
            {metrics.in_production}
          </span>
        </button>

        {/* Metric Box: Shipping */}
        <button
          onClick={() => setActiveStatus('shipping')}
          className={`flex flex-col items-center justify-between p-4 sm:p-5 rounded-3xl border transition-all active:scale-95 text-center h-28 sm:h-32 ${
            activeStatus === 'shipping'
              ? 'border-primary bg-primary/5 ring-2 ring-primary/10 shadow-sm'
              : 'border-outline/5 bg-surface-container-lowest hover:border-outline/20 shadow-sm'
          }`}
        >
          <IconTruck
            className={`w-6 h-6 sm:w-7 sm:h-7 ${
              activeStatus === 'shipping' ? 'text-primary' : 'text-secondary'
            }`}
            stroke={1.5}
          />
          <span className="text-[10px] sm:text-xs font-bold font-headline tracking-wide uppercase text-secondary">
            {t('profile.orders.status.shipping')}
          </span>
          <span
            className={`text-xl sm:text-2xl font-extrabold font-headline ${
              activeStatus === 'shipping' ? 'text-primary' : 'text-on-surface'
            }`}
          >
            {metrics.shipping}
          </span>
        </button>

        {/* Metric Box: Completed */}
        <button
          onClick={() => setActiveStatus('completed')}
          className={`flex flex-col items-center justify-between p-4 sm:p-5 rounded-3xl border transition-all active:scale-95 text-center h-28 sm:h-32 ${
            activeStatus === 'completed'
              ? 'border-primary bg-primary/5 ring-2 ring-primary/10 shadow-sm'
              : 'border-outline/5 bg-surface-container-lowest hover:border-outline/20 shadow-sm'
          }`}
        >
          <IconCheck
            className={`w-6 h-6 sm:w-7 sm:h-7 ${
              activeStatus === 'completed' ? 'text-primary' : 'text-secondary'
            }`}
          />
          <span className="text-[10px] sm:text-xs font-bold font-headline tracking-wide uppercase text-secondary">
            {t('profile.orders.status.completed')}
          </span>
          <span
            className={`text-xl sm:text-2xl font-extrabold font-headline ${
              activeStatus === 'completed' ? 'text-primary' : 'text-on-surface'
            }`}
          >
            {metrics.completed}
          </span>
        </button>
      </div>

      {/* Order List Result */}
      <div className="space-y-4">
        {ordersLoading ? (
          <Loading
            variant="spinner"
            text={isVi ? 'Đang tìm kiếm đơn hàng...' : 'Searching for orders...'}
          />
        ) : orders.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline/5 rounded-3xl p-12 text-center shadow-sm space-y-4">
            <IconHourglassEmpty
              className="w-12 h-12 text-secondary/35 mx-auto"
              stroke={1.5}
            />
            <div className="space-y-1">
              <p className="font-bold text-on-surface tracking-tight font-headline">
                {t('profile.orders.empty')}
              </p>
              <p className="text-xs text-secondary">
                Orders placed with matching status will reflect here immediately.
              </p>
            </div>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() => router.push(`/orders/${order.id}`)}
              className="bg-surface-container-lowest border border-outline/5 rounded-3xl p-6 shadow-sm space-y-6 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              {/* Top Bar: Order Info & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/orders/${order.id}`);
                      }}
                      className="font-headline font-extrabold text-on-surface hover:text-primary transition-colors cursor-pointer"
                      title={
                        isVi
                          ? 'Xem chi tiết đơn hàng'
                          : 'View order details'
                      }
                    >
                      {t('profile.orders.orderNumber')} {order.order_number}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-secondary">
                    <span className="flex items-center gap-1.5">
                      <IconCalendar className="w-3.5 h-3.5" />
                      {t('profile.orders.created')}:{' '}
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    {order.estimated_delivery && (
                      <span className="flex items-center gap-1.5 font-semibold text-primary/80">
                        <IconClock className="w-3.5 h-3.5" />
                        {t('profile.orders.delivery')}:{' '}
                        {new Date(order.estimated_delivery).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span
                    className={`px-3.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border ${
                      order.status === 'completed'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : order.status === 'cancelled'
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}
                  >
                    {t(`profile.orders.status.${order.status}`)}
                  </span>
                </div>
              </div>

              {/* Middle Area: Items display */}
              <div className="space-y-4">
                {order.order_items &&
                  order.order_items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start sm:items-center">
                      <div className="relative w-14 h-14 rounded-xl bg-surface-container-high border border-outline/5 overflow-hidden flex-shrink-0">
                        {item.product_image_url ? (
                          <Image
                            src={item.product_image_url}
                            fill
                            sizes="56px"
                            className="object-cover"
                            alt={item.product_name}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-xs font-bold">
                            Len
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-on-surface font-headline truncate">
                          {item.product_name}
                        </h4>
                        {item.variant_label && (
                          <p className="text-[11px] text-secondary font-medium tracking-wide">
                            {item.variant_label}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-on-surface font-bold">
                          {formatCurrency(item.subtotal)}
                        </p>
                        <p className="text-secondary font-semibold">
                          {formatCurrency(item.unit_price)} x {item.quantity || 1}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Bottom Info: Pricing Breakdown & Payment Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-outline/5">
                <div className="space-y-1.5 text-xs text-secondary">
                  <p>
                    <span className="font-medium">
                      {t('profile.orders.paymentOption')}:
                    </span>{' '}
                    <span className="font-bold text-on-surface">
                      {order.payment_option === 'full'
                        ? t('profile.orders.payOptionFull')
                        : t('profile.orders.payOptionDeposit')}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">{t('profile.orders.stage')}:</span>{' '}
                    <span className="font-bold text-primary">
                      {t(`profile.orders.stages.${order.payment_stage}`)}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/orders/${order.id}`);
                    }}
                    className="mt-2 text-xs font-bold text-primary hover:underline flex items-center gap-1 transition-all"
                  >
                    {isVi
                      ? 'Xem chi tiết đơn hàng'
                      : 'View order details'}{' '}
                    →
                  </button>
                </div>

                {/* Order Pricing Total Summary */}
                <div className="text-right flex flex-col justify-end space-y-1 self-end sm:self-center">
                  <div className="flex items-baseline justify-end gap-2 text-xs">
                    <span className="text-secondary font-medium">
                      {t('profile.orders.total')}:
                    </span>
                    <span className="text-lg font-black text-on-surface font-headline">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>

                  {/* Remaining payment required? */}
                  {order.payment_option === 'deposit' && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-secondary font-medium">
                        {t('profile.orders.deposit')}:{' '}
                        <span className="font-bold text-emerald-600">
                          {formatCurrency(order.deposit_amount)}
                        </span>{' '}
                        | {t('profile.orders.remaining')}:{' '}
                        <span className="font-bold text-primary">
                          {formatCurrency(order.remaining_amount)}
                        </span>
                      </p>

                      {/* Action Trigger for pay remaining 70% */}
                      {order.status === 'awaiting_remaining_payment' && (
                        <button
                          onClick={(e) => handleRemainingPayment(e, order.id)}
                          className="w-full mt-2 sm:w-auto px-4 py-2 bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold rounded-xl shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <IconCreditCard className="w-4 h-4" />
                          {t('profile.orders.payRemaining')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
