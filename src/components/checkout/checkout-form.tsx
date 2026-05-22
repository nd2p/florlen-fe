'use client';

import { useCallback } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CheckoutValues } from './schema';
import AddressSelector from './address-selector';
import { UserAddress } from '@/lib/api/address.api';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface CheckoutFormProps {
  control: Control<CheckoutValues>;
  errors: FieldErrors<CheckoutValues>;
  paymentOption: 'full' | 'deposit';
  setPaymentOption: (option: 'full' | 'deposit') => void;
  onAddressSelect: (address: UserAddress | null) => void;
  selectedAddressId: string | null;
}

export default function CheckoutForm({
  control,
  errors,
  paymentOption,
  setPaymentOption,
  onAddressSelect,
  selectedAddressId,
}: CheckoutFormProps) {
  const { t } = useTranslation('common');

  const handleAddressSelect = useCallback(
    (address: UserAddress | null) => {
      onAddressSelect(address);
    },
    [onAddressSelect]
  );

  return (
    <div className="space-y-8">
      {/* ── Section 1: Information (Address Selector) ───────────────────────── */}
      <section className="bg-surface-container-low rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container-high/50 space-y-5">
        <h2 className="text-xl md:text-2xl font-headline font-extrabold text-on-surface border-b border-surface-container-high pb-4 flex items-center gap-2">
          <span className="flex items-center justify-center bg-primary/10 text-primary w-8 h-8 rounded-lg text-sm">
            1
          </span>
          {t('address.sectionTitle')}
        </h2>

        {/* Address selector — connected to form via Controller */}
        <Controller
          name="selectedAddressId"
          control={control}
          render={({ field }) => (
            <>
              <AddressSelector
                selectedAddressId={selectedAddressId}
                onSelect={(addr) => {
                  field.onChange(addr?.id ?? '');
                  handleAddressSelect(addr);
                }}
              />
              {errors.selectedAddressId && (
                <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                  <IconAlertCircle className="w-4 h-4 flex-shrink-0" stroke={2} />
                  <span>{errors.selectedAddressId.message}</span>
                </div>
              )}
            </>
          )}
        />

        {/* Order note */}
        <div className="space-y-2 pt-2 border-t border-surface-container-high/40">
          <label
            htmlFor="checkout-note"
            className="block text-sm font-headline font-bold text-on-surface ml-1"
          >
            {t('checkout.note')}
          </label>
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <textarea
                id="checkout-note"
                rows={3}
                placeholder={t('checkout.notePlaceholder')}
                className="w-full px-6 py-4 bg-surface-container-low border border-surface-container-high rounded-xl font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface transition-all outline-none resize-none"
                {...field}
              />
            )}
          />
        </div>
      </section>

      {/* ── Section 2: Payment Option ────────────────────────────────────────── */}
      <section className="bg-surface-container-low rounded-2xl p-6 md:p-8 space-y-6 shadow-sm border border-surface-container-high/50">
        <h2 className="text-xl md:text-2xl font-headline font-extrabold text-on-surface border-b border-surface-container-high pb-4 flex items-center gap-2">
          <span className="flex items-center justify-center bg-primary/10 text-primary w-8 h-8 rounded-lg text-sm">
            2
          </span>
          {t('checkout.paymentOption')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option: 30% Deposit */}
          <div
            onClick={() => setPaymentOption('deposit')}
            className={cn(
              'flex flex-col p-6 rounded-xl border-2 text-left cursor-pointer transition-all duration-200 hover:border-primary/40 active:scale-[0.98]',
              paymentOption === 'deposit'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-outline/10 bg-surface-container-lowest'
            )}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-headline font-extrabold text-lg text-on-surface">
                {t('checkout.deposit')}
              </h3>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border flex items-center justify-center',
                  paymentOption === 'deposit' ? 'border-primary bg-primary' : 'border-outline/40'
                )}
              >
                {paymentOption === 'deposit' && (
                  <IconCheck className="w-3.5 h-3.5 text-on-primary" stroke={3} />
                )}
              </div>
            </div>
            <p className="text-secondary text-xs md:text-sm leading-relaxed">
              {t('checkout.depositDesc')}
            </p>
          </div>

          {/* Option: 100% Full */}
          <div
            onClick={() => setPaymentOption('full')}
            className={cn(
              'flex flex-col p-6 rounded-xl border-2 text-left cursor-pointer transition-all duration-200 hover:border-primary/40 active:scale-[0.98]',
              paymentOption === 'full'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-outline/10 bg-surface-container-lowest'
            )}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-headline font-extrabold text-lg text-on-surface">
                {t('checkout.fullPaid')}
              </h3>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border flex items-center justify-center',
                  paymentOption === 'full' ? 'border-primary bg-primary' : 'border-outline/40'
                )}
              >
                {paymentOption === 'full' && (
                  <IconCheck className="w-3.5 h-3.5 text-on-primary" stroke={3} />
                )}
              </div>
            </div>
            <p className="text-secondary text-xs md:text-sm leading-relaxed">
              {t('checkout.fullPaidDesc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
