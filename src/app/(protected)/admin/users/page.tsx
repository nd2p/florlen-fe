'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  IconEdit,
  IconAlertTriangle,
  IconUser,
  IconUserCheck,
  IconUserX,
} from '@tabler/icons-react';

import DataTable, { TableColumn, TableAction } from '@/components/admin/data-table';
import Badge from '@/components/ui/badge';
import Input from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import {
  getAllUsersAdmin,
  updateUserAdmin,
  type AdminUserListItem,
  type UserRole,
} from '@/lib/api/admin-users.api';

export default function AdminUsersPage() {
  const { t, i18n } = useTranslation('common');

  // Core lists state
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters state (Role & Status)
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Modal dialog editing state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserListItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit fields state
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [statusVal, setStatusVal] = useState<'active' | 'inactive' | 'banned'>('active');
  const [bannedReason, setBannedReason] = useState('');

  // Critical operations warning dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingUpdatePayload, setPendingUpdatePayload] = useState<{
    id: string;
    role: UserRole;
    is_active: boolean;
    is_banned: boolean;
    banned_reason: string | null;
  } | null>(null);

  // Load complete list of users
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getAllUsersAdmin({ limit: 1000 });
      setUsers(response.users);
    } catch (error) {
      console.error('Failed to load users:', error);
      const msg = error instanceof Error ? error.message : t('adminUsers.details.loadError');
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadUsers();
    });
  }, [loadUsers]);

  // Format date helper
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status mapping
  const formatStatus = (user: AdminUserListItem) => {
    if (user.is_banned) {
      return <Badge variant="inactive" className="bg-red-100 text-red-800 border-none font-bold">{t('adminUsers.statuses.banned')}</Badge>;
    }
    if (!user.is_active) {
      return <Badge variant="inactive" className="bg-amber-100 text-amber-800 border-none font-bold">{t('adminUsers.statuses.inactive')}</Badge>;
    }
    return <Badge variant="active" className="font-bold">{t('adminUsers.statuses.active')}</Badge>;
  };

  // Role style mapping
  const formatRole = (userRole: UserRole) => {
    if (userRole === 'super_admin') {
      return (
        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-black tracking-wider text-purple-800 uppercase">
          {t('adminUsers.roles.super_admin')}
        </span>
      );
    }
    if (userRole === 'admin') {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black tracking-wider text-emerald-800 uppercase">
          {t('adminUsers.roles.admin')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-black tracking-wider text-blue-800 uppercase">
        {t('adminUsers.roles.customer')}
      </span>
    );
  };

  // Apply filters on the users list
  const filteredUsers = users.filter((u) => {
    // 1. Role filter
    if (selectedRole && u.role !== selectedRole) return false;

    // 2. Status filter
    if (selectedStatus) {
      if (selectedStatus === 'banned') {
        if (!u.is_banned) return false;
      } else if (selectedStatus === 'inactive') {
        if (u.is_active || u.is_banned) return false;
      } else if (selectedStatus === 'active') {
        if (!u.is_active || u.is_banned) return false;
      }
    }
    return true;
  });

  // Table columns definition
  const columns: TableColumn<AdminUserListItem>[] = [
    {
      key: 'full_name',
      label: t('adminUsers.table.user'),
      render: (_, row) => {
        const initials = (row.full_name || row.display_name || row.email || '?')
          .slice(0, 1)
          .toUpperCase();
        return (
          <div className="flex items-center gap-4">
            <div className="relative flex h-11 w-11 shrink-0 overflow-hidden rounded-full bg-primary/10 border-2 border-primary/20 items-center justify-center font-bold text-primary font-headline text-lg">
              {row.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.avatar_url}
                  alt={row.full_name || 'User'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <p className="font-bold text-on-surface text-base">
                {row.full_name || row.display_name || t('profile.settings.fullNamePlaceholder')}
              </p>
              {row.display_name && row.full_name ? (
                <p className="text-xs text-secondary">@{row.display_name}</p>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      key: 'email',
      label: t('adminUsers.table.email'),
      render: (value) => (
        <div>
          <p className="font-semibold text-sm text-on-surface">{value || '-'}</p>
        </div>
      ),
    },
    {
      key: 'phone_number',
      label: t('adminUsers.table.phone'),
      render: (value) => <p className="font-mono text-sm text-on-surface">{value || '-'}</p>,
    },
    {
      key: 'role',
      label: t('adminUsers.table.role'),
      render: (value) => formatRole(value as UserRole),
    },
    {
      key: 'is_active',
      label: t('adminUsers.table.status'),
      render: (_, row) => formatStatus(row),
    },
    {
      key: 'created_at',
      label: t('adminUsers.table.createdAt'),
      render: (value) => <p className="text-xs text-secondary font-semibold">{formatDate(value)}</p>,
    },
  ];

  // Actions for table rows
  const actions: TableAction<AdminUserListItem>[] = [
    {
      label: t('address.edit'),
      icon: <IconEdit className="h-4 w-4" stroke={2} />,
      onClick: (row) => {
        setEditingUser(row);
        setFullName(row.full_name || '');
        setDisplayName(row.display_name || '');
        setPhoneNumber(row.phone_number || '');
        setRole(row.role);
        setStatusVal(row.is_banned ? 'banned' : !row.is_active ? 'inactive' : 'active');
        setBannedReason(row.banned_reason || '');
        setEditDialogOpen(true);
      },
      className:
        'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-primary',
    },
  ];

  // Execute update on backend
  const executeUserUpdate = async (payload: {
    id: string;
    full_name?: string;
    display_name?: string;
    phone_number?: string;
    role: UserRole;
    is_active: boolean;
    is_banned: boolean;
    banned_reason: string | null;
  }) => {
    setIsUpdating(true);
    const toastId = toast.loading(t('adminUsers.details.updating'));
    try {
      await updateUserAdmin(payload.id, {
        full_name: payload.full_name,
        display_name: payload.display_name,
        phone_number: payload.phone_number,
        role: payload.role,
        is_active: payload.is_active,
        is_banned: payload.is_banned,
        banned_reason: payload.banned_reason,
      });
      toast.success(t('adminUsers.details.successUpdate'), { id: toastId });
      setEditDialogOpen(false);
      void loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      const msg = error instanceof Error ? error.message : t('adminUsers.details.errorUpdate');
      toast.error(msg, { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle saving form details
  const handleSaveUser = () => {
    if (!editingUser) return;

    const nextIsActive = statusVal === 'active';
    const nextIsBanned = statusVal === 'banned';
    const nextBannedReason = nextIsBanned ? bannedReason : null;

    const payload = {
      id: editingUser.id,
      full_name: fullName.trim() || undefined,
      display_name: displayName.trim() || undefined,
      phone_number: phoneNumber.trim() || undefined,
      role,
      is_active: nextIsActive,
      is_banned: nextIsBanned,
      banned_reason: nextBannedReason,
    };

    // If changing role or banning, trigger confirmation warning dialog
    const isRoleChanged = role !== editingUser.role;
    const isNewlyBanned = nextIsBanned && !editingUser.is_banned;

    if (isRoleChanged || isNewlyBanned) {
      setPendingUpdatePayload(payload);
      setConfirmDialogOpen(true);
      return;
    }

    // Direct save if it is a simple update
    void executeUserUpdate(payload);
  };

  // Statistics summaries
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.is_active && !u.is_banned).length;
  const bannedCount = users.filter((u) => u.is_banned).length;

  return (
    <div className="space-y-8">
      {/* Premium Header Section */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <h1 className="font-headline text-4xl font-black tracking-tight text-on-surface sm:text-5xl">
            {t('adminUsers.title')}
          </h1>
          <p className="max-w-2xl text-base text-secondary sm:text-lg leading-relaxed">
            {t('adminUsers.subtitle')}
          </p>
        </div>

        {/* Quick Stat Blocks */}
        <div className="flex gap-4">
          <div className="rounded-[1.25rem] bg-surface-container-low border border-outline/5 px-6 py-4 flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <IconUser className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black font-headline text-on-surface">{totalUsers}</p>
              <p className="text-xs text-secondary font-semibold uppercase tracking-wider">{t('adminUsers.statistics.totalUsers')}</p>
            </div>
          </div>

          <div className="rounded-[1.25rem] bg-surface-container-low border border-outline/5 px-6 py-4 flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <IconUserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black font-headline text-on-surface">{activeCount}</p>
              <p className="text-xs text-secondary font-semibold uppercase tracking-wider">{t('adminUsers.statuses.active')}</p>
            </div>
          </div>

          <div className="rounded-[1.25rem] bg-surface-container-low border border-outline/5 px-6 py-4 flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-800">
              <IconUserX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black font-headline text-on-surface">{bannedCount}</p>
              <p className="text-xs text-secondary font-semibold uppercase tracking-wider">{t('adminUsers.statuses.banned')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Error notification */}
      {errorMessage ? (
        <section className="rounded-[1.5rem] bg-red-50 border border-red-200/50 p-4 text-sm text-red-800 font-medium">
          {errorMessage}
        </section>
      ) : null}

      {/* Main Grid View */}
      <section>
        <DataTable<AdminUserListItem>
          columns={columns}
          data={filteredUsers}
          actions={actions}
          searchPlaceholder={t('adminUsers.searchPlaceholder')}
          searchableFields={['full_name', 'display_name', 'email', 'phone_number']}
          filterOptions={{
            label: t('adminUsers.table.role'),
            options: [
              { value: null, label: t('adminUsers.roles.all') },
              { value: 'customer', label: t('adminUsers.roles.customer') },
              { value: 'admin', label: t('adminUsers.roles.admin') },
              { value: 'super_admin', label: t('adminUsers.roles.super_admin') },
            ],
            onFilter: (value) => setSelectedRole(value),
          }}
          itemsPerPage={10}
        />
      </section>

      {/* Secondary filter by status */}
      <div className="flex items-center gap-2 mt-[-1rem] text-sm text-secondary font-semibold pl-1">
        <span>{t('adminOrders.statusFilter')}</span>
        <button
          onClick={() => setSelectedStatus(null)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${!selectedStatus ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'}`}
        >
          {t('adminUsers.statuses.all')}
        </button>
        <button
          onClick={() => setSelectedStatus('active')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedStatus === 'active' ? 'bg-emerald-600 text-white shadow-md' : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'}`}
        >
          {t('adminUsers.statuses.active')}
        </button>
        <button
          onClick={() => setSelectedStatus('inactive')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedStatus === 'inactive' ? 'bg-amber-600 text-white shadow-md' : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'}`}
        >
          {t('adminUsers.statuses.inactive')}
        </button>
        <button
          onClick={() => setSelectedStatus('banned')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedStatus === 'banned' ? 'bg-red-600 text-white shadow-md' : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'}`}
        >
          {t('adminUsers.statuses.banned')}
        </button>
      </div>

      {isLoading ? <div className="text-sm text-secondary text-center py-6 font-semibold animate-pulse">{t('adminUsers.details.loading')}</div> : null}

      {/* Dialogue Form for Editing User */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('adminUsers.details.title')}</DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-6">
            {/* Show user identifier header in modal */}
            {editingUser && (
              <div className="flex items-center gap-4 bg-surface-container-high/40 p-4 rounded-2xl border border-outline/5">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                  {editingUser.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={editingUser.avatar_url}
                      alt="User avatar"
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{editingUser.full_name?.slice(0, 1).toUpperCase() || editingUser.email?.slice(0, 1).toUpperCase() || '?'}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-base">{editingUser.email}</h4>
                  <p className="text-xs text-secondary font-semibold">ID: <span className="font-mono">{editingUser.id}</span></p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="edit_fullname" className="text-xs font-black uppercase tracking-wider text-secondary">
                  {t('adminUsers.details.fullName')}
                </label>
                <Input
                  id="edit_fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('profile.settings.fullNamePlaceholder')}
                  className="rounded-xl h-12 border border-outline/15 bg-surface"
                />
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label htmlFor="edit_displayname" className="text-xs font-black uppercase tracking-wider text-secondary">
                  {t('adminUsers.details.displayName')}
                </label>
                <Input
                  id="edit_displayname"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('profile.settings.displayNamePlaceholder')}
                  className="rounded-xl h-12 border border-outline/15 bg-surface"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Phone number */}
              <div className="space-y-1.5">
                <label htmlFor="edit_phone" className="text-xs font-black uppercase tracking-wider text-secondary">
                  {t('adminUsers.details.phone')}
                </label>
                <Input
                  id="edit_phone"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t('profile.settings.phonePlaceholder')}
                  className="rounded-xl h-12 border border-outline/15 bg-surface font-mono"
                />
              </div>

              {/* Role selection */}
              <div className="space-y-1.5">
                <label htmlFor="edit_role" className="text-xs font-black uppercase tracking-wider text-secondary">
                  {t('adminUsers.details.role')}
                </label>
                <select
                  id="edit_role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="flex w-full rounded-xl border border-outline/15 bg-surface h-12 px-4 py-2 text-sm outline-none font-bold text-on-surface focus:ring-2 focus:ring-primary/10 focus:border-primary/20"
                >
                  <option value="customer">{t('adminUsers.roles.customer')}</option>
                  <option value="admin">{t('adminUsers.roles.admin')}</option>
                  <option value="super_admin">{t('adminUsers.roles.super_admin')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Status selection */}
              <div className="space-y-1.5">
                <label htmlFor="edit_status" className="text-xs font-black uppercase tracking-wider text-secondary">
                  {t('adminUsers.details.status')}
                </label>
                <select
                  id="edit_status"
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as 'active' | 'inactive' | 'banned')}
                  className="flex w-full rounded-xl border border-outline/15 bg-surface h-12 px-4 py-2 text-sm outline-none font-bold text-on-surface focus:ring-2 focus:ring-primary/10 focus:border-primary/20"
                >
                  <option value="active">{t('adminUsers.statuses.active')}</option>
                  <option value="inactive">{t('adminUsers.statuses.inactive')}</option>
                  <option value="banned">{t('adminUsers.statuses.banned')}</option>
                </select>
              </div>

              {/* Joined Date (readonly display) */}
              <div className="space-y-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-secondary block">
                  {t('adminUsers.table.createdAt')}
                </span>
                <div className="flex w-full items-center rounded-xl bg-surface-container-high/60 h-12 px-4 py-2 text-sm text-secondary font-semibold font-mono border border-transparent">
                  {editingUser ? formatDate(editingUser.created_at) : ''}
                </div>
              </div>
            </div>

            {/* Ban reason input block */}
            {statusVal === 'banned' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label htmlFor="edit_banreason" className="text-xs font-black uppercase tracking-wider text-secondary">
                  {t('adminUsers.details.bannedReason')}
                </label>
                <textarea
                  id="edit_banreason"
                  rows={2}
                  value={bannedReason}
                  onChange={(e) => setBannedReason(e.target.value)}
                  placeholder={t('adminUsers.details.bannedReasonPlaceholder')}
                  className="flex min-h-[60px] w-full rounded-xl border border-outline/15 bg-surface px-4 py-3 text-sm outline-none font-semibold text-on-surface focus:ring-2 focus:ring-primary/10 focus:border-primary/20"
                />
              </div>
            )}

            {/* Last metadata tracking info block */}
            {editingUser && (editingUser.last_login_at) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-outline/5 pt-4 text-xs text-secondary font-semibold">
                <div>
                  <span className="block text-secondary/65 font-black uppercase tracking-widest">{t('adminUsers.details.lastLogin')}</span>
                  <span>{formatDate(editingUser.last_login_at)}</span>
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditDialogOpen(false)}
              disabled={isUpdating}
              className="rounded-full border-none bg-surface-container-high px-6 py-3 text-sm font-bold text-on-surface hover:bg-surface-container-highest active:scale-95"
            >
              {t('address.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSaveUser}
              disabled={isUpdating}
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-95"
            >
              {t('address.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* safety check Alert Dialog for critical changes */}
      <AlertDialog
        open={confirmDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialogOpen(false);
            setPendingUpdatePayload(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-800">
              <IconAlertTriangle className="h-6 w-6 stroke-[2]" />
              {t('adminUsers.dialog.confirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-secondary/90 leading-relaxed text-sm">
              {t('adminUsers.dialog.confirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-none bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface hover:bg-surface-container-highest">
              {t('address.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingUpdatePayload) {
                  void executeUserUpdate(pendingUpdatePayload);
                }
                setConfirmDialogOpen(false);
                setPendingUpdatePayload(null);
              }}
              className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-500"
            >
              {t('adminUsers.dialog.confirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
