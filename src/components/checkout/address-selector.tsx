'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  IconPlus,
  IconCheck,
  IconPencil,
  IconTrash,
  IconStar,
  IconLoader2,
  IconBuildingStore,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import AddressDialog, { AddressFormValues } from './address-dialog';
import {
  UserAddress,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '@/lib/api/address.api';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddressSelectorProps {
  /** Called whenever the selected address changes (or null = deselected) */
  onSelect: (address: UserAddress | null) => void;
  selectedAddressId: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddressSelector({
  onSelect,
  selectedAddressId,
}: AddressSelectorProps) {
  const { t } = useTranslation('common');

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.addresses);

      // Auto-select default if nothing selected yet
      if (!selectedAddressId && res.addresses.length > 0) {
        const def = res.addresses.find((a) => a.is_default) ?? res.addresses[0];
        onSelect(def);
      }
    } catch {
      // Fail silently — user can still add addresses
    } finally {
      setLoading(false);
    }
  }, [selectedAddressId, onSelect]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Dialog Handlers ────────────────────────────────────────────────────────

  const openAddDialog = () => {
    setEditingAddress(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (address: UserAddress) => {
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAddress(undefined);
  };

  const handleDialogSubmit = async (values: AddressFormValues) => {
    setSubmitting(true);
    try {
      if (editingAddress) {
        // Update existing
        const res = await updateAddress(editingAddress.id, {
          recipientName: values.recipientName,
          phone: values.phone,
          addressLine1: values.addressLine1,
          city: values.city,
          countryCode: values.countryCode,
          label: values.label || undefined,
          isDefault: values.isDefault,
        });
        setAddresses((prev) =>
          prev.map((a) => {
            if (values.isDefault && a.id !== editingAddress.id) {
              return { ...a, is_default: false };
            }
            return a.id === editingAddress.id ? res.address : a;
          })
        );
        // Keep selected if it's the one being edited
        if (selectedAddressId === editingAddress.id) {
          onSelect(res.address);
        }
        toast.success(t('address.updatedSuccess'));
      } else {
        // Create new
        const res = await createAddress({
          recipientName: values.recipientName,
          phone: values.phone,
          addressLine1: values.addressLine1,
          city: values.city,
          countryCode: values.countryCode,
          label: values.label || undefined,
          isDefault: values.isDefault,
        });
        setAddresses((prev) => {
          // Unset old defaults if new one is default
          const updated = values.isDefault
            ? prev.map((a) => ({ ...a, is_default: false }))
            : prev;
          return [res.address, ...updated];
        });
        // Auto-select the newly created address
        onSelect(res.address);
        toast.success(t('address.createdSuccess'));
      }
      closeDialog();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (address: UserAddress) => {
    setDeletingId(address.id);
    try {
      await deleteAddress(address.id);
      const remaining = addresses.filter((a) => a.id !== address.id);
      setAddresses(remaining);
      // If deleted address was selected, select default or first
      if (selectedAddressId === address.id) {
        const next = remaining.find((a) => a.is_default) ?? remaining[0] ?? null;
        onSelect(next);
      }
      toast.success(t('address.deletedSuccess'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Set Default ────────────────────────────────────────────────────────────

  const handleSetDefault = async (address: UserAddress) => {
    try {
      const res = await setDefaultAddress(address.id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === address.id }))
      );
      // Also update selected if this is the one
      if (selectedAddressId === address.id) {
        onSelect(res.address);
      }
      toast.success(t('address.defaultUpdated'));
    } catch {
      toast.error(t('address.errorGeneric'));
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3 text-secondary">
        <IconLoader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">{t('address.loading')}</span>
      </div>
    );
  }

  return (
    <>
      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/8 border border-primary/10">
            <IconBuildingStore className="w-8 h-8 text-primary/50" stroke={1.5} />
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface text-base">
              {t('address.emptyTitle')}
            </p>
            <p className="text-secondary text-sm mt-1 max-w-xs">
              {t('address.emptySubtitle')}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openAddDialog}
            className="rounded-full gap-2 shadow-[0_6px_20px_-5px_rgba(164,0,21,0.25)]"
          >
            <IconPlus className="w-4 h-4" stroke={2.5} />
            {t('address.addFirst')}
          </Button>
        </div>
      ) : (
        /* ── Address List ─────────────────────────────────────────────────── */
        <div className="space-y-3">
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address.id;
            const isDeleting = deletingId === address.id;

            return (
              <div
                key={address.id}
                onClick={() => onSelect(address)}
                className={cn(
                  'relative group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:border-primary/40',
                  isSelected
                    ? 'border-primary bg-primary/4 shadow-sm'
                    : 'border-surface-container-high/60 bg-surface-container-lowest hover:bg-surface-container-low/50'
                )}
              >
                {/* Selection indicator */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Radio */}
                    <div
                      className={cn(
                        'flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-outline/40 bg-surface'
                      )}
                    >
                      {isSelected && (
                        <IconCheck className="w-3 h-3 text-on-primary" stroke={3} />
                      )}
                    </div>

                    {/* Address info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-headline font-bold text-sm text-on-surface">
                          {address.recipient_name}
                        </span>
                        {address.label && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high text-secondary border border-surface-container-high">
                            {address.label}
                          </span>
                        )}
                        {address.is_default && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                            <IconStar className="w-2.5 h-2.5" fill="currentColor" stroke={0} />
                            {t('address.default')}
                          </span>
                        )}
                      </div>
                      <p className="text-secondary text-sm mt-1 leading-snug">
                        {address.phone_number}
                      </p>
                      <p className="text-secondary text-sm leading-snug">
                        {address.address_line_1}, {address.city}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons (visible on hover / when selected) */}
                  <div
                    className={cn(
                      'flex-shrink-0 flex items-center gap-1 transition-opacity duration-150',
                      isSelected || deletingId === address.id
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    )}
                    onClick={(e) => e.stopPropagation()} // Don't select when clicking actions
                  >
                    {!address.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address)}
                        title={t('address.setAsDefault')}
                        className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-primary/8 transition-all duration-150 focus:outline-none"
                      >
                        <IconStar className="w-4 h-4" stroke={2} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditDialog(address)}
                      title={t('address.edit')}
                      className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-primary/8 transition-all duration-150 focus:outline-none"
                    >
                      <IconPencil className="w-4 h-4" stroke={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(address)}
                      disabled={isDeleting}
                      title={t('address.delete')}
                      className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-all duration-150 focus:outline-none disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <IconLoader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <IconTrash className="w-4 h-4" stroke={2} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add new address button */}
          <button
            type="button"
            onClick={openAddDialog}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-surface-container-high text-secondary hover:border-primary/40 hover:text-primary hover:bg-primary/4 transition-all duration-200 text-sm font-semibold group focus:outline-none"
          >
            <IconPlus
              className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200"
              stroke={2.5}
            />
            {t('address.addNew')}
          </button>
        </div>
      )}

      {/* ── Dialog ───────────────────────────────────────────────────────────── */}
      <AddressDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={handleDialogSubmit}
        initialValues={editingAddress}
        isLoading={submitting}
      />
    </>
  );
}
