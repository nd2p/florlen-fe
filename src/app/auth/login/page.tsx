'use client';

import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import AuthLayout from '@/components/common/auth-layout';
import { login, getGoogleLoginUrl } from '@/lib/api/auth.api';
import { setTokens, setCachedUser } from '@/lib/auth';
import { useCartStore } from '@/hooks/use-cart';
import { useTranslation } from 'react-i18next';

const getLoginSchema = (t: (k: string) => string) =>
  z.object({
    email: z.string().email({ message: t('auth.errors.invalidEmail') }),
    password: z.string().min(8, { message: t('auth.errors.passwordMin') }),
  });

type LoginValues = z.infer<ReturnType<typeof getLoginSchema>>;

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const schema = getLoginSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      toast.loading(t('auth.login.signingIn'), { id: 'login' });

      const response = await login({
        email: values.email,
        password: values.password,
      });

      // Save tokens to localStorage
      setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
      });

      // Cache user data without role; authorization is checked from server
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { role: _role, ...safeUser } = response.user;
      setCachedUser(safeUser);

      // Merge guest cart items into the user cart
      await useCartStore.getState().mergeCartAfterLogin();

      toast.success(t('auth.login.welcomeBack'), { id: 'login' });

      // Redirect to profile
      setTimeout(() => router.push('/'), 500);
    } catch (err: unknown) {
      console.error('Login error:', err);
      // Extract error message from response or use fallback
      let errorMessage = t('auth.login.failed');
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
      toast.error(errorMessage, { id: 'login' });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      toast.loading(t('auth.signingIn'), { id: 'google-login' });
      const response = await getGoogleLoginUrl();
      toast.dismiss('google-login');
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('Could not retrieve Google Login URL');
      }
    } catch (err: unknown) {
      console.error('Google login initiation error:', err);
      toast.dismiss('google-login');
      const errorMessage =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: unknown }).message || t('auth.login.googleFailed'))
          : t('auth.login.googleFailed');
      toast.error(errorMessage);
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
            {t('auth.login.title')}
          </h1>
          <p className="text-secondary font-body">
            {t('auth.login.subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4">
            <Button
              variant="social"
              size="md"
              onClick={handleGoogleLogin}
              type="button"
              className="py-4 px-6 rounded-xl"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                ></path>
              </svg>
              <span>{t('auth.continueWithGoogle')}</span>
            </Button>
          </div>

          <div className="relative flex items-center py-4">
            <div className="grow border-t border-surface-container-high"></div>
            <span className="shrink mx-4 text-secondary text-xs font-headline font-bold uppercase tracking-widest">
              {t('auth.login.orEmail')}
            </span>
            <div className="grow border-t border-surface-container-high"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="email"
              label={t('auth.login.emailLabel')}
              type="email"
              placeholder={t('auth.login.emailPlaceholder')}
              required
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              id="password"
              label={t('auth.login.passwordLabel')}
              type="password"
              placeholder={t('auth.login.passwordPlaceholder')}
              required
              {...register('password')}
              rightElement={
                <Link
                  className="text-xs font-headline font-bold text-primary hover:underline"
                  href="/auth/forgot-password"
                >
                  {t('auth.forgotPassword')}
                </Link>
              }
              error={errors.password?.message}
            />

            <div className="pt-4">
              <Button variant="primary" size="lg" type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('auth.login.signingIn') : t('auth.login.signIn')}
              </Button>
            </div>
          </form>
        </div>

        <div className="pt-6 text-center">
          <p className="text-secondary font-body">
            {t('auth.login.newPrompt')}
            <a
              className="text-primary font-headline font-bold ml-1 hover:underline"
              href="/auth/register"
            >
              {t('auth.login.createAccount')}
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
