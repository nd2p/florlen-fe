'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { IconLoader2 } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import { User } from '@/lib/auth';

// Zod Validation Schema for Profile Updating
const ProfileSchema = z.object({
  full_name: z.string().min(1, { message: 'Full name is required' }),
  display_name: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9+ ]{9,15}$/.test(val), {
      message: 'Please enter a valid phone number',
    }),
});

type ProfileValues = z.infer<typeof ProfileSchema>;

interface SettingsTabProps {
  user: User | null;
  onSave: (values: { full_name: string; display_name?: string; phone?: string }) => Promise<void>;
}

export default function SettingsTab({ user, onSave }: SettingsTabProps) {
  const { t } = useTranslation('common');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
  });

  // Keep form values in sync with fetched user
  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        display_name: user.display_name || '',
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: ProfileValues) => {
    await onSave({
      full_name: values.full_name,
      display_name: values.display_name,
      phone: values.phone,
    });
  };

  return (
    <div className="bg-surface-container-lowest border border-outline/5 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-1 pb-4 border-b border-outline/5">
        <h2 className="text-2xl font-bold font-headline text-on-surface">
          {t('profile.settings.title')}
        </h2>
        <p className="text-secondary text-xs sm:text-sm">
          {t('profile.settings.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input
            id="full_name"
            label={t('profile.settings.fullName')}
            placeholder={t('profile.settings.fullNamePlaceholder')}
            {...register('full_name')}
            error={errors.full_name?.message}
          />

          <Input
            id="display_name"
            label={t('profile.settings.displayName')}
            placeholder={t('profile.settings.displayNamePlaceholder')}
            {...register('display_name')}
            error={errors.display_name?.message}
          />

          <Input
            id="phone"
            label={t('profile.settings.phone')}
            placeholder={t('profile.settings.phonePlaceholder')}
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

        {/* Submitting button */}
        <div className="pt-4 flex items-center justify-end">
          <Button
            variant="primary"
            size="lg"
            type="submit"
            className="rounded-2xl px-8"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <IconLoader2 className="w-4 h-4 animate-spin" />
                {t('profile.settings.updating')}
              </span>
            ) : (
              t('profile.settings.save')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
