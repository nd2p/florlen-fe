'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import Footer from '@/components/common/footer';
import Header from '@/components/common/header';

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/auth/admin');

  if (isAdminRoute) {
    return <main className='flex-1'>{children}</main>;
  }

  return (
    <>
      <Header />
      <main className='flex-1'>{children}</main>
      <Footer />
    </>
  );
}