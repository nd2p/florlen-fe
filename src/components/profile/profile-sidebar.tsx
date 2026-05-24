'use client';

import React from 'react';
import Image from 'next/image';
import {
  IconShoppingBag,
  IconCreditCard,
  IconLogout,
  IconSettings,
  IconChevronRight,
  IconCamera,
} from '@tabler/icons-react';
import { User } from '@/lib/auth';

type TabType = 'my_orders' | 'profile_settings' | 'payment_logs';

interface ProfileSidebarProps {
  user: User | null;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  previewAvatarUrl: string;
  onAvatarClick: () => void;
  onLogout: () => void;
  tempUploadedAvatar: unknown;
  handleCancelUpload: () => void;
  getInitials: (name?: string) => string;
  t: (key: string) => string;
}

export default function ProfileSidebar({
  user,
  activeTab,
  setActiveTab,
  previewAvatarUrl,
  onAvatarClick,
  onLogout,
  tempUploadedAvatar,
  handleCancelUpload,
  getInitials,
  t,
}: ProfileSidebarProps) {
  return (
    <div className="lg:col-span-3 bg-surface-container-lowest border border-outline/5 rounded-3xl p-6 shadow-sm space-y-8 flex flex-col w-full">
      {/* Avatar and Info Card */}
      <div className="text-center space-y-4">
        <div className="relative">
          <button
            type="button"
            onClick={onAvatarClick}
            className="group relative w-24 h-24 mx-auto rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-headline font-extrabold text-3xl overflow-hidden shadow-inner transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 block cursor-pointer"
            title={t('profile.settings.avatar.editTitle') || 'Edit Avatar'}
          >
            {previewAvatarUrl ? (
              <Image
                src={previewAvatarUrl}
                fill
                sizes="96px"
                className="object-cover transition-transform group-hover:scale-110"
                alt={user?.full_name || 'Avatar'}
              />
            ) : (
              <span>{getInitials(user?.full_name)}</span>
            )}
            {/* Hover camera overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <IconCamera className="w-8 h-8 text-white" />
            </div>
          </button>

          {!!tempUploadedAvatar && (
            <button
              type="button"
              onClick={handleCancelUpload}
              className="text-[11px] text-error hover:underline font-bold block mx-auto mt-2 tracking-wide uppercase transition-all"
            >
              {t('profile.settings.avatar.cancel') || 'Cancel Upload'}
            </button>
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-on-surface tracking-tight font-headline line-clamp-1">
            {user?.display_name || user?.full_name || 'Companion User'}
          </h2>
          <p className="text-xs text-secondary truncate px-2">{user?.email}</p>
        </div>
        {user?.bio && (
          <p className="text-xs text-secondary/80 bg-surface-container-low/50 py-2.5 px-4 rounded-xl italic line-clamp-2 max-w-xs mx-auto">
            &ldquo;{user.bio}&rdquo;
          </p>
        )}
      </div>

      {/* Navigation Submenu */}
      <nav className="flex flex-col gap-1 w-full" aria-label="Profile navigation">
        <button
          onClick={() => setActiveTab('my_orders')}
          className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-semibold tracking-wide font-headline transition-all active:scale-[0.98] ${
            activeTab === 'my_orders'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/10'
              : 'text-secondary hover:bg-surface-container-low hover:text-on-surface'
          }`}
        >
          <IconShoppingBag className="w-5 h-5" stroke={2} />
          <span className="flex-1 text-left">{t('profile.menu.orders')}</span>
          <IconChevronRight
            className={`w-4 h-4 transition-transform ${
              activeTab === 'my_orders' ? 'rotate-90' : ''
            }`}
          />
        </button>

        <button
          onClick={() => setActiveTab('profile_settings')}
          className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-semibold tracking-wide font-headline transition-all active:scale-[0.98] ${
            activeTab === 'profile_settings'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/10'
              : 'text-secondary hover:bg-surface-container-low hover:text-on-surface'
          }`}
        >
          <IconSettings className="w-5 h-5" stroke={2} />
          <span className="flex-1 text-left">{t('profile.menu.settings')}</span>
          <IconChevronRight
            className={`w-4 h-4 transition-transform ${
              activeTab === 'profile_settings' ? 'rotate-90' : ''
            }`}
          />
        </button>

        <button
          onClick={() => setActiveTab('payment_logs')}
          className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-semibold tracking-wide font-headline transition-all active:scale-[0.98] ${
            activeTab === 'payment_logs'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/10'
              : 'text-secondary hover:bg-surface-container-low hover:text-on-surface'
          }`}
        >
          <IconCreditCard className="w-5 h-5" stroke={2} />
          <span className="flex-1 text-left">{t('profile.menu.payments')}</span>
          <IconChevronRight
            className={`w-4 h-4 transition-transform ${
              activeTab === 'payment_logs' ? 'rotate-90' : ''
            }`}
          />
        </button>
      </nav>

      <hr className="border-outline/5 my-2" />

      {/* Logout Trigger */}
      <button
        onClick={onLogout}
        className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold tracking-wide font-headline text-error hover:bg-error/5 transition-all active:scale-[0.98]"
      >
        <IconLogout className="w-5 h-5" stroke={2} />
        <span className="text-left flex-1">{t('profile.logout')}</span>
      </button>
    </div>
  );
}
