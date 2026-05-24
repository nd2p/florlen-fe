'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconHourglassEmpty } from '@tabler/icons-react';
import { Loading } from '@/components/ui/loading';
import { PaymentLog } from '@/lib/api/order.api';
import { formatCurrency } from '@/lib/utils';

interface PaymentLogsTabProps {
  payments: PaymentLog[];
  paymentsLoading: boolean;
  isVi: boolean;
}

export default function PaymentLogsTab({ payments, paymentsLoading, isVi }: PaymentLogsTabProps) {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-surface-container-lowest border border-outline/5 rounded-3xl p-6 shadow-sm space-y-2">
        <h2 className="text-2xl font-bold font-headline text-on-surface">
          {t('profile.payments.title')}
        </h2>
        <p className="text-secondary text-xs sm:text-sm">
          {t('profile.payments.subtitle')}
        </p>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-surface-container-lowest border border-outline/5 rounded-3xl shadow-sm overflow-hidden">
        {paymentsLoading ? (
          <Loading
            variant="spinner"
            text={isVi ? 'Đang tìm kiếm giao dịch...' : 'Searching for transaction logs...'}
            className="p-16"
          />
        ) : payments.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <IconHourglassEmpty
              className="w-12 h-12 text-secondary/35 mx-auto"
              stroke={1.5}
            />
            <div className="space-y-1">
              <p className="font-bold text-on-surface tracking-tight font-headline">
                {t('profile.payments.empty')}
              </p>
              <p className="text-xs text-secondary">
                Completed PayOS checkouts will record transaction receipts here.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-outline/5 bg-surface-container-low/40">
                  <th className="px-6 py-4 font-bold font-headline text-secondary uppercase text-[10px] tracking-wider">
                    {t('profile.payments.table.id')}
                  </th>
                  <th className="px-6 py-4 font-bold font-headline text-secondary uppercase text-[10px] tracking-wider">
                    {t('profile.payments.table.order')}
                  </th>
                  <th className="px-6 py-4 font-bold font-headline text-secondary uppercase text-[10px] tracking-wider">
                    {t('profile.payments.table.type')}
                  </th>
                  <th className="px-6 py-4 font-bold font-headline text-secondary uppercase text-[10px] tracking-wider">
                    {t('profile.payments.table.amount')}
                  </th>
                  <th className="px-6 py-4 font-bold font-headline text-secondary uppercase text-[10px] tracking-wider">
                    {t('profile.payments.table.status')}
                  </th>
                  <th className="px-6 py-4 font-bold font-headline text-secondary uppercase text-[10px] tracking-wider">
                    {t('profile.payments.table.date')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-surface-container-low/20 transition-all"
                  >
                    {/* Transaction ID */}
                    <td className="px-6 py-4 font-mono text-xs text-on-surface font-semibold max-w-[120px] truncate">
                      #{payment.payment_intent_id || payment.id.slice(0, 8)}
                    </td>

                    {/* Order reference number */}
                    <td className="px-6 py-4 text-on-surface font-bold">
                      {payment.orders?.order_number || 'N/A'}
                    </td>

                    {/* Payment type */}
                    <td className="px-6 py-4 text-xs text-secondary font-medium">
                      {t(`profile.payments.types.${payment.payment_type}`) ||
                        payment.payment_type}
                    </td>

                    {/* Amount formatted */}
                    <td className="px-6 py-4 font-extrabold text-on-surface">
                      {formatCurrency(payment.amount)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border ${
                          payment.status === 'succeeded'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : payment.status === 'pending' ||
                              payment.status === 'processing'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}
                      >
                        {t(`profile.payments.statuses.${payment.status}`) || payment.status}
                      </span>
                    </td>

                    {/* Paid at date */}
                    <td className="px-6 py-4 text-xs text-secondary">
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleString()
                        : new Date(payment.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
