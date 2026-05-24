'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loading } from '@/components/ui/loading';

// Subcomponents refactored
import ProfileSidebar from '@/components/profile/profile-sidebar';
import OrdersTab from '@/components/profile/orders-tab';
import SettingsTab from '@/components/profile/settings-tab';
import PaymentLogsTab from '@/components/profile/payment-logs-tab';
import AvatarEditorDialog from '@/components/profile/avatar-editor-dialog';

// API & Helpers
import { getMe, updateProfile } from '@/lib/api/auth.api';
import { deleteUploadedImage } from '@/lib/api/upload.api';
import {
  getOrders,
  getOrderMetrics,
  getPaymentLogs,
  payRemaining,
  OrderStatus,
  OrderSummary,
  OrderMetrics,
  PaymentLog,
} from '@/lib/api/order.api';
import { clearTokens, clearCachedUser, setCachedUser, User } from '@/lib/auth';

type TabType = 'my_orders' | 'profile_settings' | 'payment_logs';

export default function UserProfile() {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const isVi = !!i18n.resolvedLanguage?.startsWith('vi');

  // Primary states
  const [activeTab, setActiveTab] = useState<TabType>('my_orders');
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Tab 1: Orders states
  const [activeStatus, setActiveStatus] = useState<
    'all' | 'in_production' | 'shipping' | 'completed'
  >('all');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [metrics, setMetrics] = useState<OrderMetrics>({
    all: 0,
    in_production: 0,
    shipping: 0,
    completed: 0,
  });

  // Tab 3: Payment logs states
  const [payments, setPayments] = useState<PaymentLog[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Avatar states & refs
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string>('');
  const [isAvatarOptionsOpen, setIsAvatarOptionsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const originalAvatarUrl = useRef<string>('');

  // Perform logout
  const handleLogout = () => {
    clearTokens();
    clearCachedUser();
    toast.success('Logged out successfully');
    router.replace('/auth/login');
  };

  // Helper: parse storage path from full URL
  const parseStorageUrl = (url: string) => {
    if (!url) return null;
    try {
      const publicMarker = '/public/';
      const idx = url.indexOf(publicMarker);
      if (idx !== -1) {
        const relativePath = url.substring(idx + publicMarker.length);
        const parts = relativePath.split('/');
        const bucket = parts[0];
        const path = parts.slice(1).join('/');
        return { bucket, path };
      }
    } catch (e) {
      console.error('Error parsing storage URL:', e);
    }
    return null;
  };

  // Fetch logged in user
  const fetchUserProfile = async (silent = false) => {
    if (!silent) setUserLoading(true);
    try {
      const response = await getMe();
      if (response.user) {
        setUser(response.user);
        setCachedUser(response.user);
        setPreviewAvatarUrl(response.user.avatar_url || '');
        originalAvatarUrl.current = response.user.avatar_url || '';
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      toast.error('Failed to load profile. Please sign in again.');
      handleLogout();
    } finally {
      setUserLoading(false);
    }
  };

  // Fetch metrics counts
  const fetchMetrics = async () => {
    try {
      const metricsData = await getOrderMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching order metrics:', error);
    }
  };

  // Fetch orders based on status
  const fetchOrdersByStatus = async (
    status: 'all' | 'in_production' | 'shipping' | 'completed'
  ) => {
    setOrdersLoading(true);
    try {
      const apiStatus = status === 'all' ? undefined : (status as OrderStatus);
      const response = await getOrders({ status: apiStatus, limit: 50 });
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Could not fetch orders history.');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch payment logs
  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const response = await getPaymentLogs();
      setPayments(response.payments || []);
    } catch (error) {
      console.error('Error fetching payment logs:', error);
      toast.error('Could not fetch transaction logs.');
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUserProfile();
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'my_orders') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchOrdersByStatus(activeStatus);
      fetchMetrics();
    }
  }, [activeStatus, activeTab]);

  useEffect(() => {
    if (activeTab === 'payment_logs') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPayments();
    }
  }, [activeTab]);

  // Save profile settings form
  const handleSaveSettings = async (values: {
    full_name: string;
    display_name?: string;
    phone?: string;
  }) => {
    try {
      toast.loading(t('profile.settings.updating'), { id: 'profile-update' });
      const response = await updateProfile({
        full_name: values.full_name,
        display_name: values.display_name || undefined,
        phone: values.phone || undefined,
      });

      if (response.user) {
        setUser(response.user);
        setCachedUser(response.user);
        toast.success(t('profile.settings.success'), { id: 'profile-update' });
        fetchUserProfile(true);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(t('profile.settings.error'), { id: 'profile-update' });
    }
  };

  // Avatar click handler
  const handleAvatarClick = () => {
    setIsAvatarOptionsOpen(true);
  };

  // Remove avatar action (immediately deletes from bucket and clears user profile)
  const handleRemoveAvatar = async () => {
    try {
      toast.loading(t('profile.settings.avatar.saving') || 'Removing avatar...', {
        id: 'avatar-action',
      });

      if (previewAvatarUrl) {
        const parsed = parseStorageUrl(previewAvatarUrl);
        if (parsed && parsed.bucket === 'reference-uploads') {
          await deleteUploadedImage(parsed.bucket, parsed.path);
        }
      }

      const response = await updateProfile({
        avatar_url: '',
      });

      if (response.user) {
        setUser(response.user);
        setCachedUser(response.user);
        setPreviewAvatarUrl('');
        originalAvatarUrl.current = '';

        toast.success(t('profile.settings.avatar.removeSuccess') || 'Avatar removed!', {
          id: 'avatar-action',
        });
        setIsAvatarOptionsOpen(false);
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove avatar', { id: 'avatar-action' });
    }
  };

  // Save new uploaded avatar url reference
  const handleSaveAvatar = async (newUrl: string) => {
    try {
      const response = await updateProfile({
        avatar_url: newUrl,
      });

      if (response.user) {
        // If there was an old avatar, delete it from the bucket to avoid leaks
        if (originalAvatarUrl.current && originalAvatarUrl.current !== newUrl) {
          const parsed = parseStorageUrl(originalAvatarUrl.current);
          if (parsed && parsed.bucket === 'reference-uploads') {
            try {
              await deleteUploadedImage(parsed.bucket, parsed.path);
            } catch (err) {
              console.error('Failed to delete old avatar:', err);
            }
          }
        }

        setUser(response.user);
        setCachedUser(response.user);
        setPreviewAvatarUrl(newUrl);
        originalAvatarUrl.current = newUrl;
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save avatar reference');
    }
  };

  // Remaining 70% payment redirection
  const handlePayRemaining = async (orderId: string) => {
    try {
      toast.loading('Generating payment link...', { id: 'pay-remaining' });
      const response = await payRemaining(orderId);
      if (response.paymentLink?.checkoutUrl) {
        toast.success('Redirecting to PayOS checkout...', { id: 'pay-remaining' });
        setTimeout(() => {
          window.location.href = response.paymentLink.checkoutUrl;
        }, 800);
      } else {
        toast.error('Checkout link creation failed.', { id: 'pay-remaining' });
      }
    } catch (error) {
      console.error('Pay remaining error:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err?.response?.data?.message || 'Payment generation failed.';
      toast.error(msg, { id: 'pay-remaining' });
    }
  };

  // Get Initials for Avatar placeholder
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fullscreen loader
  if (userLoading) {
    return <Loading variant="fullscreen" text="Loading your profile companion..." />;
  }

  return (
    <div className="min-h-screen py-24 px-4 sm:px-8 max-w-7xl mx-auto font-body">
      <div className="mb-10 space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface">
          {t('profile.title')}
        </h1>
        <p className="text-secondary text-sm">
          Welcome to Florlen, <span className="font-semibold text-primary">{user?.full_name}</span>.
        </p>
      </div>

      {/* Grid Layout: Left (Sidebar) - Right (Active Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
        {/* LEFT COLUMN: Profile Overview & Navigation */}
        <ProfileSidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          previewAvatarUrl={previewAvatarUrl}
          onAvatarClick={handleAvatarClick}
          onLogout={handleLogout}
          tempUploadedAvatar={null}
          handleCancelUpload={() => {}}
          getInitials={getInitials}
          t={t}
        />

        {/* RIGHT COLUMN: Active Panel Content */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === 'my_orders' && (
            <OrdersTab
              orders={orders}
              ordersLoading={ordersLoading}
              metrics={metrics}
              activeStatus={activeStatus}
              setActiveStatus={setActiveStatus}
              handlePayRemaining={handlePayRemaining}
              isVi={isVi}
            />
          )}

          {activeTab === 'profile_settings' && (
            <SettingsTab user={user} onSave={handleSaveSettings} />
          )}

          {activeTab === 'payment_logs' && (
            <PaymentLogsTab payments={payments} paymentsLoading={paymentsLoading} isVi={isVi} />
          )}
        </div>
      </div>

      {/* Avatar Dialogs & Interactive HTML5 Canvas Editor */}
      <AvatarEditorDialog
        user={user}
        previewAvatarUrl={previewAvatarUrl}
        isAvatarOptionsOpen={isAvatarOptionsOpen}
        setIsAvatarOptionsOpen={setIsAvatarOptionsOpen}
        isEditorOpen={isEditorOpen}
        setIsEditorOpen={setIsEditorOpen}
        onRemoveAvatar={handleRemoveAvatar}
        onSaveAvatar={handleSaveAvatar}
        getInitials={getInitials}
      />
    </div>
  );
}
