'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  IconTicket,
  IconPlus,
  IconEdit,
  IconTrash,
  IconLoader,
  IconCheck,
  IconCalendar,
  IconUsers,
} from '@tabler/icons-react';
import { formatCurrency } from '@/lib/utils';
import {
  getAdminVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  Voucher,
  AssignedUser,
} from '@/lib/api/discount.api';
import { Button } from '@/components/ui/button';
import DataTable, { type TableColumn, type TableAction } from '@/components/admin/data-table';
import { getAllUsersAdmin, type AdminUserListItem } from '@/lib/api/admin-users.api';
import Input from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DiscountManagementPage() {
  const { t, i18n } = useTranslation('common');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Form Fields State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount' | 'free_shipping'>(
    'percentage'
  );
  const [discountValue, setDiscountValue] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLimited, setIsLimited] = useState(false);
  const [usageLimit, setUsageLimit] = useState(100);
  const [isUserLimited, setIsUserLimited] = useState(false);
  const [userLimit, setUserLimit] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // User assignment state — debounced search instead of bulk fetch
  const [userSearchResults, setUserSearchResults] = useState<AdminUserListItem[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [selectedUsersCache, setSelectedUsersCache] = useState<Map<string, AssignedUser>>(new Map());
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const userSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Delete State
  const [deletingVoucherId, setDeletingVoucherId] = useState<string | null>(null);

  // Fetch vouchers
  const loadVouchers = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const data = await getAdminVouchers(search);
      setVouchers(data.vouchers || []);
    } catch (err: unknown) {
      console.error('Failed to load vouchers:', err);
      toast.error(t('adminDiscounts.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadVouchers(searchQuery);
    });
  }, [searchQuery, loadVouchers]);

  // Debounced user search — only fires API call after 400ms of inactivity
  useEffect(() => {
    if (userSearchTimerRef.current) {
      clearTimeout(userSearchTimerRef.current);
    }

    void Promise.resolve().then(() => {
      if (!userSearchQuery.trim()) {
        setUserSearchResults([]);
        setIsSearchingUsers(false);
        return;
      }

      setIsSearchingUsers(true);
      userSearchTimerRef.current = setTimeout(async () => {
        try {
          const data = await getAllUsersAdmin({ search: userSearchQuery.trim(), limit: 20 });
          setUserSearchResults(data.users || []);
        } catch (err) {
          console.error('Failed to search users:', err);
        } finally {
          setIsSearchingUsers(false);
        }
      }, 400);
    });

    return () => {
      if (userSearchTimerRef.current) {
        clearTimeout(userSearchTimerRef.current);
      }
    };
  }, [userSearchQuery]);

  // Helper: add user to cache when selected
  const selectUser = useCallback((user: AdminUserListItem) => {
    setAssignedUserIds((prev) =>
      prev.includes(user.id) ? prev : [...prev, user.id]
    );
    setSelectedUsersCache((prev) => {
      const next = new Map(prev);
      next.set(user.id, {
        id: user.id,
        full_name: user.full_name,
        display_name: user.display_name,
        email: user.email,
        avatar_url: user.avatar_url,
      });
      return next;
    });
  }, []);

  const deselectUser = useCallback((userId: string) => {
    setAssignedUserIds((prev) => prev.filter((id) => id !== userId));
  }, []);

  // Open Dialog for Add
  const openAddDialog = () => {
    setEditingVoucher(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(10);

    // Set default start date to today
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
    setStartDate(localISOTime);
    setEndDate('');

    setIsLimited(false);
    setUsageLimit(100);
    setIsUserLimited(false);
    setUserLimit(1);
    setIsActive(true);
    setAssignedUserIds([]);
    setSelectedUsersCache(new Map());
    setUserSearchQuery('');
    setUserSearchResults([]);
    setIsDialogOpen(true);
  };

  // Open Dialog for Edit
  const openEditDialog = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setCode(voucher.code);
    setDiscountType(voucher.discount_type);
    setDiscountValue(voucher.discount_value);

    if (voucher.start_date) {
      setStartDate(new Date(voucher.start_date).toISOString().slice(0, 16));
    } else {
      setStartDate('');
    }

    if (voucher.end_date) {
      setEndDate(new Date(voucher.end_date).toISOString().slice(0, 16));
    } else {
      setEndDate('');
    }

    setIsLimited(voucher.usage_limit !== null);
    setUsageLimit(voucher.usage_limit || 100);
    setIsUserLimited(voucher.limit_per_user !== null);
    setUserLimit(voucher.limit_per_user || 1);
    setIsActive(voucher.is_active);

    // Pre-populate cache from voucher's assigned_users
    const cache = new Map<string, AssignedUser>();
    (voucher.assigned_users || []).forEach((u) => cache.set(u.id, u));
    setSelectedUsersCache(cache);

    // Sync user_ids: prefer voucher.user_ids, fallback to ids extracted from assigned_users
    const resolvedUserIds =
      voucher.user_ids && voucher.user_ids.length > 0
        ? voucher.user_ids
        : (voucher.assigned_users || []).map((u) => u.id);
    setAssignedUserIds(resolvedUserIds);
    setUserSearchQuery('');
    setUserSearchResults([]);
    setIsDialogOpen(true);
  };

  // Create or Update Action
  const handleSaveVoucher = async () => {
    if (!code.trim()) {
      toast.error(t('adminDiscounts.codeRequired'));
      return;
    }

    const payload: Partial<Voucher> = {
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: discountType === 'free_shipping' ? 0 : Number(discountValue),
      start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
      usage_limit: isLimited ? Number(usageLimit) : null,
      limit_per_user: isUserLimited ? Number(userLimit) : null,
      is_active: isActive,
      user_ids: assignedUserIds,
    };

    setIsSaving(true);
    const toastId = toast.loading(t('adminDiscounts.saving'));

    try {
      if (editingVoucher) {
        await updateVoucher(editingVoucher.id, payload);
        toast.success(t('adminDiscounts.updated'), { id: toastId });
      } else {
        await createVoucher(payload);
        toast.success(t('adminDiscounts.created'), { id: toastId });
      }
      setIsDialogOpen(false);
      loadVouchers(searchQuery);
    } catch (err: unknown) {
      console.error('Save voucher error:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error?.response?.data?.message || error?.message || t('adminDiscounts.saveError');
      toast.error(msg, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingVoucherId) return;

    const toastId = toast.loading(t('adminDiscounts.deleting'));
    try {
      await deleteVoucher(deletingVoucherId);
      toast.success(t('adminDiscounts.deleted'), { id: toastId });
      setDeletingVoucherId(null);
      loadVouchers(searchQuery);
    } catch (err: unknown) {
      console.error('Delete voucher error:', err);
      toast.error(t('adminDiscounts.deleteError'), { id: toastId });
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return t('adminDiscounts.table.always');
    return new Date(dateStr).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-300">
      {/* Header and Add Action */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-outline/5 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <IconTicket className="h-8 w-8" />
            <h1 className="font-headline text-4xl font-black tracking-tight text-on-surface sm:text-5xl">
              {t('adminDiscounts.title')}
            </h1>
          </div>
          <p className="max-w-2xl text-base text-secondary">
            {t('adminDiscounts.subtitle')}
          </p>
        </div>

        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <IconPlus className="h-5 w-5" />
          {t('adminDiscounts.addVoucher')}
        </Button>
      </section>

      {/* Main DataTable */}
      {isLoading ? (
        <div className="flex h-[30vh] w-full flex-col items-center justify-center gap-4">
          <IconLoader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-secondary">{t('adminDiscounts.loading')}</p>
        </div>
      ) : (
        <DataTable<Voucher>
          data={vouchers}
          searchPlaceholder={t('adminDiscounts.searchPlaceholder')}
          onSearch={(term) => setSearchQuery(term)}
          searchableFields={['code']}
          columns={[
            {
              key: 'code',
              label: t('adminDiscounts.table.code'),
              render: (value) => (
                <span className="font-mono font-black text-primary text-base tracking-widest">
                  {value}
                </span>
              ),
            },
            {
              key: 'discount_type',
              label: t('adminDiscounts.table.type'),
              render: (value) => {
                if (value === 'percentage')
                  return <span className="text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded-full font-bold border border-primary/10">{t('adminDiscounts.form.percentage')}</span>;
                if (value === 'fixed_amount')
                  return <span className="text-[10px] text-blue-500 bg-blue-500/5 px-2.5 py-0.5 rounded-full font-bold border border-blue-500/10">{t('adminDiscounts.form.fixedAmount')}</span>;
                return <span className="text-[10px] text-purple-500 bg-purple-500/5 px-2.5 py-0.5 rounded-full font-bold border border-purple-500/10">{t('adminDiscounts.form.freeShipping')}</span>;
              },
            },
            {
              key: 'discount_value',
              label: t('adminDiscounts.table.value'),
              align: 'right',
              render: (value, row) =>
                row.discount_type === 'percentage'
                  ? <span className="font-black text-on-surface">{value}%</span>
                  : row.discount_type === 'fixed_amount'
                  ? <span className="font-black text-on-surface">{formatCurrency(value)}</span>
                  : <span className="font-black text-on-surface">{t('adminDiscounts.table.freeShip')}</span>,
            },
            {
              key: 'start_date',
              label: t('adminDiscounts.table.dates'),
              align: 'center',
              render: (_, row) => (
                <div className="flex flex-col items-center gap-0.5 text-xs text-secondary leading-relaxed">
                  <span className="flex items-center gap-1">
                    <IconCalendar className="h-3 w-3" />
                    {formatDate(row.start_date)}
                  </span>
                  <span className="text-[10px] text-outline">{t('shop.priceTo').toLowerCase()}</span>
                  <span className="flex items-center gap-1 font-semibold text-on-surface">
                    <IconCalendar className="h-3 w-3 text-primary" />
                    {formatDate(row.end_date)}
                  </span>
                </div>
              ),
            },
            {
              key: 'used_count',
              label: t('adminDiscounts.form.usageLimit'),
              align: 'center',
              render: (value, row) => (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-on-surface bg-surface-container px-3 py-1 rounded-full w-max mx-auto border border-outline/5">
                    <IconUsers className="h-3.5 w-3.5 text-secondary" />
                    <span>{value}</span>
                    <span className="text-secondary font-normal">/</span>
                    <span className="text-secondary">{row.usage_limit === null ? '∞' : row.usage_limit}</span>
                  </div>
                  {row.limit_per_user !== null && (
                    <span className="text-[10px] text-primary font-bold">{t('adminDiscounts.form.limitPerUser')}: {row.limit_per_user}</span>
                  )}
                </div>
              ),
            },
            {
              key: 'assigned_users',
              label: t('adminDiscounts.table.users'),
              align: 'center',
              render: (_, row) => {
                const count = row.assigned_users?.length ?? 0;
                if (count > 0) {
                  return (
                    <span className="inline-flex items-center gap-1.5 text-[11px] bg-blue-500/8 text-blue-600 border border-blue-500/15 px-2.5 py-1 rounded-full font-bold">
                      <IconUsers className="h-3 w-3" />
                      {t('adminDiscounts.assignedUsersCount', { count })}
                    </span>
                  );
                }
                return <span className="text-[11px] text-secondary italic">{t('adminDiscounts.table.general')}</span>;
              },
            },
            {
              key: 'is_active',
              label: t('adminDiscounts.table.status'),
              align: 'center',
              render: (value) =>
                value ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold">● {t('adminDiscounts.table.active')}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-outline/10 text-secondary border border-outline/20 px-2.5 py-0.5 rounded-full font-bold">○ {t('adminDiscounts.table.inactive')}</span>
                ),
            },
          ] satisfies TableColumn<Voucher>[]}
          actions={[
            {
              label: t('adminCollections.actions.edit'),
              icon: <IconEdit className="h-4 w-4" />,
              onClick: (row) => openEditDialog(row),
            },
            {
              label: t('adminCollections.actions.delete'),
              icon: <IconTrash className="h-4 w-4" />,
              onClick: (row) => setDeletingVoucherId(row.id),
              className: 'h-9 w-9 rounded-full bg-surface-container-high px-0 py-0 text-secondary hover:bg-error/10 hover:text-error',
            },
          ] satisfies TableAction<Voucher>[]}
        />
      )}

      {/* Voucher Dialog Modal (Create / Edit) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVoucher ? t('adminDiscounts.editVoucher') : t('adminDiscounts.createVoucher')}
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {/* Coupon Code */}
            <Input
              label={t('adminDiscounts.form.code')}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={Boolean(editingVoucher)}
              placeholder={t('adminDiscounts.form.code')}
              className="font-mono text-base tracking-widest font-black uppercase disabled:opacity-50"
            />

            {/* Discount Type */}
            <div className="space-y-2">
              <label className="block text-sm font-headline font-bold text-on-surface ml-1">
                {t('adminDiscounts.form.discountType')}
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed_amount' | 'free_shipping')}
                className="w-full px-6 py-4 bg-surface-container-low border-none rounded-xl font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface transition-all outline-none text-sm"
              >
                <option value="percentage">{t('adminDiscounts.form.percentage')}</option>
                <option value="fixed_amount">{t('adminDiscounts.form.fixedAmount')}</option>
                <option value="free_shipping">{t('adminDiscounts.form.freeShipping')}</option>
              </select>
            </div>

            {/* Discount Value */}
            {discountType !== 'free_shipping' && (
              <Input
                label={
                  discountType === 'percentage' ? t('adminDiscounts.form.percentage') : t('adminDiscounts.form.fixedAmount')
                }
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 50000'}
              />
            )}

            {/* Start and End Date */}
            <div className="grid gap-4 grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                  {t('adminDiscounts.form.startDate')}
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface transition-all outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                  {t('adminDiscounts.form.endDate')}
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface transition-all outline-none text-sm"
                />
              </div>
            </div>

            {/* Usage Limit Options */}
            <div className="space-y-4 pt-2 border-t border-outline/5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-on-surface">
                    <input
                      type="checkbox"
                      checked={isLimited}
                      onChange={(e) => setIsLimited(e.target.checked)}
                      className="rounded border-outline/35 text-primary focus:ring-primary/20 h-4 w-4"
                    />
                    {t('adminDiscounts.form.limitQty')}
                  </label>

                  {isLimited && (
                    <Input
                      label={t('adminDiscounts.form.usageLimit')}
                      type="number"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="e.g. 100"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-on-surface">
                    <input
                      type="checkbox"
                      checked={isUserLimited}
                      onChange={(e) => setIsUserLimited(e.target.checked)}
                      className="rounded border-outline/35 text-primary focus:ring-primary/20 h-4 w-4"
                    />
                    {t('adminDiscounts.form.limitPerUser')}
                  </label>

                  {isUserLimited && (
                    <Input
                      label={t('adminDiscounts.form.userLimit')}
                      type="number"
                      value={userLimit}
                      onChange={(e) => setUserLimit(Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="e.g. 1"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Active Status */}
            <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-on-surface pt-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-outline/35 text-primary focus:ring-primary/20 h-4 w-4"
              />
              {t('adminDiscounts.form.active')}
            </label>

            {/* User Assignment Section */}
            <div className="space-y-3 pt-3 border-t border-outline/5">
              <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-on-surface">
                <input
                  type="checkbox"
                  checked={assignedUserIds.length > 0}
                  onChange={(e) => {
                    if (!e.target.checked) setAssignedUserIds([]);
                  }}
                  className="rounded border-outline/35 text-primary focus:ring-primary/20 h-4 w-4"
                />
                <span className="flex items-center gap-1.5">
                  <IconUsers className="h-4 w-4 text-primary" />
                  {t('adminDiscounts.form.assignedToSpecific')}
                </span>
              </label>

              {assignedUserIds.length === 0 && (
                <p className="text-xs text-secondary ml-7">
                  {t('adminDiscounts.assignedToAll')}
                </p>
              )}

              {/* Picker area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary ml-1">
                    {t('adminDiscounts.table.users')} ({assignedUserIds.length})
                  </label>
                  {assignedUserIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAssignedUserIds([])}
                      className="text-[10px] text-error hover:text-error/80 font-bold transition-colors"
                    >
                      {t('adminDiscounts.deselectAll')}
                    </button>
                  )}
                </div>

                {/* Search input with debounce */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('adminDiscounts.searchCustomers')}
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface transition-all outline-none text-sm"
                  />
                  {isSearchingUsers && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <IconLoader className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                {/* Search results dropdown */}
                <div
                  className="max-h-52 overflow-y-auto rounded-xl border border-outline/10 bg-surface-container-lowest divide-y divide-outline/5"
                >
                  {!userSearchQuery.trim() ? (
                    <div className="px-4 py-5 text-center text-xs text-secondary italic">
                      {t('adminDiscounts.searchCustomers')}
                    </div>
                  ) : isSearchingUsers ? (
                    <div className="px-4 py-5 text-center text-xs text-secondary italic flex items-center justify-center gap-2">
                      <IconLoader className="h-3.5 w-3.5 animate-spin" />
                      {t('adminDataTable.searching') || 'Searching...'}
                    </div>
                  ) : userSearchResults.length === 0 ? (
                    <div className="px-4 py-5 text-center text-xs text-secondary italic">
                      {t('adminDiscounts.noCustomers')}
                    </div>
                  ) : (
                    userSearchResults.map((user) => {
                      const isSelected = assignedUserIds.includes(user.id);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              deselectUser(user.id);
                            } else {
                              selectUser(user);
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-surface-container-low ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all shrink-0 ${
                            isSelected
                              ? 'bg-primary border-primary text-on-primary'
                              : 'border-outline/30 bg-transparent'
                          }`}>
                            {isSelected && <IconCheck className="h-3.5 w-3.5" stroke={3} />}
                          </div>

                          {/* Avatar */}
                          {user.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.avatar_url}
                              alt={user.full_name || 'User'}
                              className="h-8 w-8 rounded-full object-cover ring-1 ring-outline/10"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                              {(user.full_name || user.display_name || user.email || '?').charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-on-surface truncate">
                                {user.full_name || user.display_name || '(No name)'}
                              </p>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${
                                  user.role === 'admin' || user.role === 'super_admin'
                                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                    : 'bg-surface-container-high text-secondary border-outline/10'
                                }`}
                              >
                                {user.role}
                              </span>
                            </div>
                            <p className="text-[11px] text-secondary truncate">
                              {user.email || user.phone_number || '(No contact info)'}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Selected users summary chips */}
                {assignedUserIds.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-primary ml-1">
                      {t('adminDiscounts.assignedUsersCount', { count: assignedUserIds.length })}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {assignedUserIds.map((uid) => {
                        const cachedUser = selectedUsersCache.get(uid);
                        const displayName = cachedUser
                          ? (cachedUser.full_name || cachedUser.display_name || cachedUser.email || uid)
                          : uid;
                        const email = cachedUser?.email || null;
                        const avatarUrl = cachedUser?.avatar_url || null;
                        const initial = displayName.charAt(0).toUpperCase();
                        return (
                          <span
                            key={uid}
                            className="inline-flex items-center gap-2 bg-primary/5 text-primary border border-primary/10 pl-1 pr-2 py-1 rounded-full"
                          >
                            {/* Avatar */}
                            {avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={avatarUrl}
                                alt={displayName}
                                className="h-6 w-6 rounded-full object-cover shrink-0 ring-1 ring-primary/20"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-[10px] font-black text-primary">
                                {initial}
                              </div>
                            )}
                            {/* Name + Email */}
                            <div className="flex flex-col leading-tight min-w-0">
                              <span className="text-[11px] font-semibold truncate max-w-30">
                                {displayName}
                              </span>
                              {email && (
                                <span className="text-[9px] text-primary/60 truncate max-w-30">
                                  {email}
                                </span>
                              )}
                            </div>
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => deselectUser(uid)}
                              className="ml-0.5 h-4 w-4 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors text-primary/50 hover:text-primary shrink-0"
                              title="Bỏ chọn"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="secondary">
              {t('adminDiscounts.form.cancel')}
            </Button>
            <Button
              onClick={handleSaveVoucher}
              disabled={isSaving}
              className="flex items-center gap-1.5"
            >
              <IconCheck className="h-4 w-4" stroke={3} />
              {isSaving ? t('adminDiscounts.saving') : t('adminDiscounts.form.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deletingVoucherId)}
        onOpenChange={(open) => {
          if (!open) setDeletingVoucherId(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminDiscounts.form.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('adminDiscounts.form.deleteDesc', { code: vouchers.find(v => v.id === deletingVoucherId)?.code || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{t('adminDiscounts.form.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>{t('adminDiscounts.form.deleteConfirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
