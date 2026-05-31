'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import ProductDialog from '@/components/admin/product-dialog';
import {
  IconChartBar,
  IconChevronLeft,
  IconChevronRight,
  IconDiscount,
  IconFolder,
  IconLogout2,
  IconPackage,
  IconShoppingBag,
  IconSparkles,
  IconUsers,
} from '@tabler/icons-react';

const navigationItems = [
  { href: '/admin/orders', key: 'orders', icon: IconShoppingBag },
  { href: '/admin/products', key: 'products', icon: IconPackage },
  { href: '/admin/collections', key: 'collections', icon: IconFolder },
  { href: '/admin/discounts', key: 'discounts', icon: IconDiscount },
  { href: '/admin/users', key: 'users', icon: IconUsers },
  { href: '/admin/reports', key: 'reports', icon: IconChartBar },
  { href: '/admin/ai-management', key: 'aiManagement', icon: IconSparkles },
];

export default function Sidebar() {
  const { t } = useTranslation('common');
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`sticky top-0 z-40 hidden h-screen shrink-0 flex-col bg-surface-container-low px-5 py-6 transition-[width] duration-300 lg:flex ${
        collapsed ? 'w-24' : 'w-72'
      }`}
    >
      <div className="space-y-10">
        <div
          className={`flex items-start gap-3 ${
            collapsed ? 'justify-center ml-10' : 'justify-between'
          }`}
        >
          <Link href="/admin/orders" className={`block ${collapsed ? 'text-center' : ''}`}>
            <div className="space-y-1">
              {collapsed ? (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-headline text-xl font-extrabold tracking-tight text-on-primary -mr-2">
                  F
                </span>
              ) : (
                <>
                  <p className="font-headline text-3xl font-extrabold tracking-tight text-primary">
                    Florlen
                  </p>
                  <p className="text-sm text-secondary">{t('adminSidebar.dashboardTitle')}</p>
                </>
              )}
            </div>
          </Link>

          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="mt-1 h-9 w-9 shrink-0 rounded-full bg-surface-container-high px-0 py-0 text-secondary transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            aria-label={collapsed ? t('adminSidebar.expandSidebar') : t('adminSidebar.collapseSidebar')}
          >
            {collapsed ? (
              <IconChevronRight className="h-4 w-4" stroke={2} />
            ) : (
              <IconChevronLeft className="h-4 w-4" stroke={2} />
            )}
          </Button>
        </div>

        <nav aria-label="Admin navigation" className="space-y-2">
          {navigationItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center rounded-full py-3 text-sm font-semibold transition-all ${
                  collapsed ? 'justify-center px-3' : 'gap-3 px-4'
                } ${
                  active
                    ? 'bg-primary text-on-primary shadow-[0_18px_36px_-18px_rgba(164,0,21,0.55)]'
                    : 'text-secondary hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" stroke={2} />
                {collapsed ? null : <span>{t(`adminSidebar.${item.key}`)}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-4 pt-8">
        <ProductDialog compact={collapsed} />

        <Button
          variant="secondary"
          size="md"
          type="button"
          className={`w-full rounded-full bg-surface-container-high py-3 text-sm text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface ${
            collapsed ? 'justify-center px-3' : 'gap-3 px-4'
          }`}
        >
          <IconLogout2 className="h-5 w-5 shrink-0" stroke={2} />
          {collapsed ? null : t('profile.logout')}
        </Button>
      </div>
    </aside>
  );
}
