'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import I18nProvider from '@/components/common/i18n-provider';
import Footer from '@/components/common/footer';
import Header from '@/components/common/header';

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/auth/admin');

  if (isAdminRoute) {
    return (
      <I18nProvider>
        <main className='flex-1'>{children}</main>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <Header />
      <main className='flex-1'>{children}</main>
      <Footer />
    </I18nProvider>
  );
}