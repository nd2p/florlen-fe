'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import { IconLoader2, IconMapPin } from '@tabler/icons-react';
import { UserAddress } from '@/lib/api/address.api';

// ─── Schema ───────────────────────────────────────────────────────────────────

const getAddressFormSchema = (t: (k: string) => string) =>
  z.object({
    label: z.string().optional(),
    recipientName: z.string().min(1, t('address.nameRequired')),
    phone: z
      .string()
      .min(1, t('checkout.fieldRequired'))
      .regex(/^[0-9+()#.\s-]{8,15}$/, t('checkout.invalidPhone')),
    addressLine1: z.string().min(1, t('address.addressRequired')),
    city: z.string().min(1, t('address.cityRequired')),
    countryCode: z.string(),
    isDefault: z.boolean(),
  });

export type AddressFormValues = z.infer<ReturnType<typeof getAddressFormSchema>>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddressDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddressFormValues) => Promise<void>;
  /** Prefill when editing an existing address */
  initialValues?: Partial<UserAddress>;
  isLoading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddressDialog({
  open,
  onClose,
  onSubmit,
  initialValues,
  isLoading = false,
}: AddressDialogProps) {
  const { t } = useTranslation('common');
  const schema = getAddressFormSchema(t);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: '',
      recipientName: '',
      phone: '',
      addressLine1: '',
      city: '',
      countryCode: 'VN',
      isDefault: false,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const isDefault = watch('isDefault');

  // Populate form when editing
  useEffect(() => {
    if (open && initialValues) {
      reset({
        label: initialValues.label ?? '',
        recipientName: initialValues.recipient_name ?? '',
        phone: initialValues.phone_number ?? '',
        addressLine1: initialValues.address_line_1 ?? '',
        city: initialValues.city ?? '',
        countryCode: initialValues.country_code ?? 'VN',
        isDefault: initialValues.is_default ?? false,
      });
    } else if (open && !initialValues) {
      reset({
        label: '',
        recipientName: '',
        phone: '',
        addressLine1: '',
        city: '',
        countryCode: 'VN',
        isDefault: false,
      });
    }
  }, [open, initialValues, reset]);

  const handleFormSubmit = async (values: AddressFormValues) => {
    await onSubmit(values);
  };

  const isEditing = Boolean(initialValues?.id);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-surface border border-surface-container-high/50 shadow-2xl rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-surface-container-high/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <IconMapPin className="w-5 h-5 text-primary" stroke={2} />
            </div>
            <div>
              <DialogTitle className="font-headline font-extrabold text-lg text-on-surface">
                {isEditing ? t('address.editTitle') : t('address.addTitle')}
              </DialogTitle>
              <p className="text-xs text-secondary mt-0.5">
                {isEditing ? t('address.editSubtitle') : t('address.addSubtitle')}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Form body */}
        <form
          onSubmit={(e) => {
            e.stopPropagation();
            handleSubmit(handleFormSubmit)(e);
          }}
          id="address-form"
        >
          <div className="px-6 py-5 space-y-4">
            {/* Label (optional) */}
            <Input
              id="addr-label"
              label={t('address.label')}
              placeholder={t('address.labelPlaceholder')}
              {...register('label')}
              error={errors.label?.message}
            />

            {/* Recipient Name */}
            <Input
              id="addr-name"
              label={t('address.recipientName')}
              placeholder={t('address.recipientNamePlaceholder')}
              {...register('recipientName')}
              error={errors.recipientName?.message}
            />

            {/* Phone */}
            <Input
              id="addr-phone"
              label={t('checkout.phone')}
              placeholder={t('checkout.phonePlaceholder')}
              {...register('phone')}
              error={errors.phone?.message}
            />

            {/* Address Line */}
            <Input
              id="addr-line1"
              label={t('address.addressLine')}
              placeholder={t('checkout.addressPlaceholder')}
              {...register('addressLine1')}
              error={errors.addressLine1?.message}
            />

            {/* City */}
            <Input
              id="addr-city"
              label={t('checkout.city')}
              placeholder={t('checkout.cityPlaceholder')}
              {...register('city')}
              error={errors.city?.message}
            />

            {/* Set as Default toggle */}
            <button
              type="button"
              onClick={() => setValue('isDefault', !isDefault)}
              className="flex items-center gap-3 w-full text-left group focus:outline-none"
            >
              <div
                className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-all duration-200 ${
                  isDefault ? 'bg-primary' : 'bg-surface-container-high'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    isDefault ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                {t('address.setAsDefault')}
              </span>
            </button>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t border-surface-container-high/40 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="w-full sm:w-auto rounded-full"
            >
              {t('address.cancel')}
            </Button>
            <Button
              type="submit"
              form="address-form"
              variant="primary"
              size="sm"
              disabled={isSubmitting || isLoading}
              className="w-full sm:w-auto rounded-full shadow-[0_6px_20px_-5px_rgba(164,0,21,0.3)]"
            >
              {isSubmitting || isLoading ? (
                <span className="flex items-center gap-2">
                  <IconLoader2 className="w-4 h-4 animate-spin" />
                  {t('address.saving')}
                </span>
              ) : isEditing ? (
                t('address.saveChanges')
              ) : (
                t('address.addAddress')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
