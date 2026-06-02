'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import AuthLayout from '@/components/common/auth-layout';
import { forgotPassword } from '@/lib/api/auth.api';
import { useTranslation } from 'react-i18next';

const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPassword() {
  const { t } = useTranslation('common');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(ForgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      toast.loading(t('auth.sendResetLink') || 'Sending reset link...', { id: 'forgot-password' });

      await forgotPassword(values.email);

      toast.success(
        t('auth.emailResetSuccess') ||
          "If an account with this email exists, a password reset link has been sent. Please check your spam/junk folder if you don't see it in your inbox.",
        { id: 'forgot-password', duration: 8000 }
      );
    } catch (err: unknown) {
      console.error('Forgot password error:', err);
      let errorMessage = 'Request failed. Please try again.';
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: unknown }).response === 'object' &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        errorMessage = (err as { response?: { data?: { message?: string } } }).response!.data!
          .message!;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String((err as { message?: unknown }).message || errorMessage);
      }
      toast.error(errorMessage, { id: 'forgot-password' });
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-10">
        <div className="lg:hidden mb-8 text-center">
          <span className="text-primary font-headline font-extrabold text-3xl tracking-tighter">
            Florlen
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="text-on-surface font-headline text-4xl font-extrabold tracking-tight leading-tight">
            {t('auth.forgotPassword') || 'Forgot Password'}
          </h1>
          <p className="text-secondary font-body">
            {t('auth.forgotPasswordDesc') ||
              "Enter your email address and we'll send you a recovery link to reset your password."}
          </p>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="hello@artisan.com"
              required
              {...register('email')}
              error={errors.email?.message}
            />

            <div className="pt-4">
              <Button variant="primary" size="lg" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t('auth.sendResetLink') || 'Sending...'
                  : t('auth.sendResetLink') || 'Send Reset Link'}
              </Button>
            </div>
          </form>
        </div>

        <div className="pt-6 text-center">
          <p className="text-secondary font-body">
            <Link
              className="text-primary font-headline font-bold hover:underline"
              href="/auth/login"
            >
              ← {t('auth.backToLogin') || 'Back to Login'}
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
