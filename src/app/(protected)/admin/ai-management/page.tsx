'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  IconSparkles,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconEdit,
  IconTrash,
  IconLoader,
  IconDeviceFloppy,
  IconCheck,
} from '@tabler/icons-react';
import { formatCurrency } from '@/lib/utils';
import { getAdminAIConfig, updateAdminAIConfig, AdminAIConfig } from '@/lib/api/design.api';
import { Button } from '@/components/ui/button';
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

interface AccessoryItem {
  key: string;
  labelKey: string;
  label: string;
  price: number;
}

export default function AIManagementPage() {
  const { t } = useTranslation('common');
  // Config state
  const [, setConfig] = useState<AdminAIConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [basePrices, setBasePrices] = useState<Record<string, number>>({
    mini_figure: 250000,
    bag: 150000,
    hat: 120000,
  });
  const [accessories, setAccessories] = useState<AccessoryItem[]>([]);
  const [illustrationPrice, setIllustrationPrice] = useState(40000);

  // Accessory Dialog states
  const [isAccDialogOpen, setIsAccDialogOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<AccessoryItem | null>(null);
  const [accKey, setAccKey] = useState('');
  const [accLabelKey, setAccLabelKey] = useState('');
  const [accLabel, setAccLabel] = useState('');
  const [accPrice, setAccPrice] = useState(10000);

  // Delete Confirm states
  const [deletingAccKey, setDeletingAccKey] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    async function loadConfig() {
      setIsLoading(true);
      try {
        const data = await getAdminAIConfig();
        if (data) {
          setConfig(data);
          setGeminiApiKey(data.geminiApiKey || '');
          if (data.productBasePrices) {
            setBasePrices({ ...data.productBasePrices });
          }
          if (data.accessoriesConfig) {
            const list = Object.entries(data.accessoriesConfig).map(([k, v]) => ({
              key: k,
              labelKey: v.labelKey,
              label: v.label || '',
              price: v.price || 0,
            }));
            setAccessories(list);
          }
          if (typeof data.illustrationPrice === 'number') {
            setIllustrationPrice(data.illustrationPrice);
          }
        }
      } catch (err: unknown) {
        console.error('Failed to load admin AI config:', err);
        toast.error(t('adminAI.loadError') || 'Failed to load AI configurations.');
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, [t]);

  // Save configurations
  const handleSaveChanges = async () => {
    setIsSaving(true);
    const toastId = toast.loading(t('adminAI.saving'));

    // Convert accessories list back to key-value object
    const accConfigObj: Record<string, { labelKey: string; label: string; price: number }> = {};
    accessories.forEach((item) => {
      accConfigObj[item.key] = {
        labelKey: item.labelKey,
        label: item.label,
        price: item.price,
      };
    });

    const payload: AdminAIConfig = {
      geminiApiKey,
      productBasePrices: basePrices,
      accessoriesConfig: accConfigObj,
      illustrationPrice,
    };

    try {
      await updateAdminAIConfig(payload);
      toast.success(t('adminAI.updated'), { id: toastId });
    } catch (err: unknown) {
      console.error('Failed to update config:', err);
      toast.error(t('adminAI.saveError'), { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Open Add Accessory Modal
  const openAddAccDialog = () => {
    setEditingAcc(null);
    setAccKey('');
    setAccLabelKey('');
    setAccLabel('');
    setAccPrice(10000);
    setIsAccDialogOpen(true);
  };

  // Open Edit Accessory Modal
  const openEditAccDialog = (item: AccessoryItem) => {
    setEditingAcc(item);
    setAccKey(item.key);
    setAccLabelKey(item.labelKey);
    setAccLabel(item.label);
    setAccPrice(item.price);
    setIsAccDialogOpen(true);
  };

  // Save Accessory (Create / Update local state list)
  const handleSaveAccessory = () => {
    if (!accKey.trim() || !accLabel.trim() || !accLabelKey.trim()) {
      toast.error(t('adminAI.accRequired'));
      return;
    }

    const key = accKey.trim().toLowerCase();

    // Check conflict for new accessory keys
    if (!editingAcc && accessories.some((a) => a.key === key)) {
      toast.error(t('adminAI.accConflict'));
      return;
    }

    const newAcc: AccessoryItem = {
      key,
      labelKey: accLabelKey.trim(),
      label: accLabel.trim(),
      price: accPrice,
    };

    if (editingAcc) {
      // Edit mode
      setAccessories((prev) => prev.map((a) => (a.key === editingAcc.key ? newAcc : a)));
      toast.success(t('adminAI.accUpdated'));
    } else {
      // Add mode
      setAccessories((prev) => [...prev, newAcc]);
      toast.success(t('adminAI.accAdded'));
    }

    setIsAccDialogOpen(false);
  };

  // Delete Accessory (Local state list)
  const handleDeleteAccessory = () => {
    if (!deletingAccKey) return;
    setAccessories((prev) => prev.filter((a) => a.key !== deletingAccKey));
    setDeletingAccKey(null);
    toast.success(t('adminAI.accDeleted'));
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
        <IconLoader className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-secondary">{t('adminAI.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-300">
      {/* Header and save action */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-outline/5 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <IconSparkles className="h-8 w-8" />
            <h1 className="font-headline text-4xl font-black tracking-tight text-on-surface sm:text-5xl">
              {t('adminAI.title')}
            </h1>
          </div>
          <p className="max-w-2xl text-base text-secondary">
            {t('adminAI.subtitle')}
          </p>
        </div>

        <Button
          onClick={handleSaveChanges}
          disabled={isSaving}
          size="md"
          className="rounded-full py-3 text-sm px-5"
        >
          {isSaving ? (
            <IconLoader className="h-4 w-4 animate-spin" />
          ) : (
            <IconDeviceFloppy className="h-4 w-4" />
          )}
          {t('adminAI.saveChanges')}
        </Button>
      </section>

      {/* Main Settings Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* API Key & Pricing Overview */}
        <div className="lg:col-span-1 space-y-8">
          {/* Gemini API Key Card */}
          <div className="rounded-3xl border border-outline/10 bg-surface-container-lowest p-6 shadow-md transition-all duration-300 hover:shadow-lg">
            <h2 className="text-lg font-bold text-on-surface mb-4">{t('adminAI.apiIntegration')}</h2>
            <p className="text-xs text-secondary mb-4 leading-relaxed">
              {t('adminAI.apiDesc')}
            </p>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder={t('adminAI.apiKeyPlaceholder')}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
              >
                {showApiKey ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Surcharges & Illustration Pricing */}
          <div className="rounded-3xl border border-outline/10 bg-surface-container-lowest p-6 shadow-md transition-all duration-300 hover:shadow-lg">
            <h2 className="text-lg font-bold text-on-surface mb-4">{t('adminAI.drawingPrice')}</h2>
            <p className="text-xs text-secondary mb-4 leading-relaxed">
              {t('adminAI.drawingDesc')}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                  {t('adminAI.illustrationFee')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-secondary font-bold z-10">
                    ₫
                  </span>
                  <Input
                    type="number"
                    value={illustrationPrice}
                    onChange={(e) =>
                      setIllustrationPrice(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Base Products Card & Accessories Config Table */}
        <div className="lg:col-span-2 space-y-8">
          {/* Base Product Pricing Card */}
          <div className="rounded-3xl border border-outline/10 bg-surface-container-lowest p-6 shadow-md transition-all duration-300 hover:shadow-lg">
            <h2 className="text-lg font-bold text-on-surface mb-4">{t('adminAI.basePrices')}</h2>
            <p className="text-xs text-secondary mb-6 leading-relaxed">
              {t('adminAI.basePricesDesc')}
            </p>

            <div className="grid gap-6 sm:grid-cols-3">
              {/* Keychain Crochet */}
              <div className="rounded-2xl bg-surface-container p-4 space-y-2 border border-outline/5">
                <span className="text-xs font-bold text-secondary uppercase block">
                  {t('adminAI.keychainCompanion')}
                </span>
                <span className="text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded-full font-bold inline-block">
                  mini_figure
                </span>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-secondary font-bold z-10">
                    ₫
                  </span>
                  <Input
                    type="number"
                    value={basePrices.mini_figure || 0}
                    onChange={(e) =>
                      setBasePrices((prev) => ({
                        ...prev,
                        mini_figure: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Mini Plush Bag */}
              <div className="rounded-2xl bg-surface-container p-4 space-y-2 border border-outline/5">
                <span className="text-xs font-bold text-secondary uppercase block">
                  {t('adminAI.bagMiniPlush')}
                </span>
                <span className="text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded-full font-bold inline-block">
                  bag
                </span>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-secondary font-bold z-10">
                    ₫
                  </span>
                  <Input
                    type="number"
                    value={basePrices.bag || 0}
                    onChange={(e) =>
                      setBasePrices((prev) => ({
                        ...prev,
                        bag: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Mini Sweater Hat */}
              <div className="rounded-2xl bg-surface-container p-4 space-y-2 border border-outline/5">
                <span className="text-xs font-bold text-secondary uppercase block">
                  {t('adminAI.hatMiniSweater')}
                </span>
                <span className="text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded-full font-bold inline-block">
                  hat
                </span>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-secondary font-bold z-10">
                    ₫
                  </span>
                  <Input
                    type="number"
                    value={basePrices.hat || 0}
                    onChange={(e) =>
                      setBasePrices((prev) => ({
                        ...prev,
                        hat: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Accessories config table */}
          <div className="rounded-3xl border border-outline/10 bg-surface-container-lowest p-6 shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-on-surface">{t('adminAI.accConfig')}</h2>
                <p className="text-xs text-secondary leading-relaxed mt-1">
                  {t('adminAI.accConfigDesc')}
                </p>
              </div>

              <Button
                onClick={openAddAccDialog}
                variant="secondary"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <IconPlus className="h-3.5 w-3.5" /> {t('adminAI.addAcc')}
              </Button>
            </div>

            {/* Accessories List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline/5 text-xs font-bold uppercase tracking-wider text-secondary">
                    <th className="py-3 px-4">{t('adminAI.table.key')}</th>
                    <th className="py-3 px-4">{t('adminAI.table.name')}</th>
                    <th className="py-3 px-4">{t('adminAI.table.i18n')}</th>
                    <th className="py-3 px-4 text-right">{t('adminAI.table.price')}</th>
                    <th className="py-3 px-4 text-center">{t('adminAI.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/5">
                  {accessories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-secondary italic">
                        {t('adminAI.emptyAcc')}
                      </td>
                    </tr>
                  ) : (
                    accessories.map((item) => (
                      <tr
                         key={item.key}
                        className="text-sm hover:bg-surface-container-low transition-colors"
                      >
                        <td className="py-4 px-4 font-mono font-bold text-secondary text-xs">
                          {item.key}
                        </td>
                        <td className="py-4 px-4 font-bold text-on-surface">{item.label}</td>
                        <td className="py-4 px-4 text-xs text-secondary">{item.labelKey}</td>
                        <td className="py-4 px-4 text-right font-bold text-primary">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => openEditAccDialog(item)}
                              className="h-8 w-8 rounded-full bg-surface-container-high text-secondary hover:text-primary hover:bg-surface-container-highest transition-all flex items-center justify-center active:scale-90"
                              title="Chỉnh sửa"
                            >
                              <IconEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingAccKey(item.key)}
                              className="h-8 w-8 rounded-full bg-surface-container-high text-secondary hover:text-error hover:bg-surface-container-highest transition-all flex items-center justify-center active:scale-90"
                              title="Xóa"
                            >
                              <IconTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Add/Edit Dialog modal */}
      <Dialog open={isAccDialogOpen} onOpenChange={setIsAccDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAcc ? t('adminAI.editAcc') : t('adminAI.newAcc')}</DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <Input
              label={t('adminAI.accKeyLabel')}
              type="text"
              value={accKey}
              onChange={(e) => setAccKey(e.target.value)}
              disabled={Boolean(editingAcc)}
              placeholder={t('adminAI.accKeyPlaceholder')}
              className="font-mono"
            />

            <Input
              label={t('adminAI.accNameLabel')}
              type="text"
              value={accLabel}
              onChange={(e) => setAccLabel(e.target.value)}
              placeholder={t('adminAI.accNamePlaceholder')}
            />

            <Input
              label={t('adminAI.accI18nLabel')}
              type="text"
              value={accLabelKey}
              onChange={(e) => setAccLabelKey(e.target.value)}
              placeholder={t('adminAI.accI18nPlaceholder')}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                {t('adminAI.accPriceLabel')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-secondary font-bold z-10">
                  ₫
                </span>
                <Input
                  type="number"
                  value={accPrice}
                  onChange={(e) => setAccPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="pl-8"
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              onClick={() => setIsAccDialogOpen(false)}
              variant="secondary"
              className="rounded-full py-3 text-sm px-5"
            >
              {t('adminAI.cancel')}
            </Button>
            <Button
              onClick={handleSaveAccessory}
              className="flex items-center gap-1.5 rounded-full py-3 text-sm px-5"
            >
              <IconCheck className="h-4 w-4" stroke={3} /> {t('adminAI.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deletingAccKey)}
        onOpenChange={(open) => {
          if (!open) setDeletingAccKey(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminAI.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('adminAI.deleteDesc', { key: deletingAccKey })}
              <br />
              <span className="text-[11px] text-secondary mt-1 block">
                {t('adminAI.deleteWarn')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{t('adminAI.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccessory}>{t('adminAI.deleteConfirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
