'use client';

import { useEffect, useState } from 'react';
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
  // Config state
  const [config, setConfig] = useState<AdminAIConfig | null>(null);
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
        toast.error('Không thể tải cấu hình AI. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Save configurations
  const handleSaveChanges = async () => {
    setIsSaving(true);
    const toastId = toast.loading('Đang lưu thay đổi cấu hình...');

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
      toast.success('Cấu hình AI đã được cập nhật thành công!', { id: toastId });
    } catch (err: unknown) {
      console.error('Failed to update config:', err);
      toast.error('Lưu thay đổi thất bại. Vui lòng kiểm tra lại!', { id: toastId });
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
      toast.error('Vui lòng điền đầy đủ các trường thông tin!');
      return;
    }

    const key = accKey.trim().toLowerCase();

    // Check conflict for new accessory keys
    if (!editingAcc && accessories.some((a) => a.key === key)) {
      toast.error('Key này đã tồn tại! Vui lòng chọn key khác.');
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
      toast.success('Đã cập nhật phụ kiện trong danh sách tạm thời');
    } else {
      // Add mode
      setAccessories((prev) => [...prev, newAcc]);
      toast.success('Đã thêm phụ kiện mới vào danh sách tạm thời');
    }

    setIsAccDialogOpen(false);
  };

  // Delete Accessory (Local state list)
  const handleDeleteAccessory = () => {
    if (!deletingAccKey) return;
    setAccessories((prev) => prev.filter((a) => a.key !== deletingAccKey));
    setDeletingAccKey(null);
    toast.success('Đã xóa phụ kiện khỏi danh sách tạm thời');
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
        <IconLoader className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-secondary">Đang tải cấu hình AI...</p>
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
              AI Management
            </h1>
          </div>
          <p className="max-w-2xl text-base text-secondary">
            Cấu hình khóa tích hợp Gemini, quản lý danh mục phụ kiện và thiết lập khung giá sản phẩm
            AI Studio.
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
          Lưu tất cả thay đổi
        </Button>
      </section>

      {/* Main Settings Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* API Key & Pricing Overview */}
        <div className="lg:col-span-1 space-y-8">
          {/* Gemini API Key Card */}
          <div className="rounded-3xl border border-outline/10 bg-surface-container-lowest p-6 shadow-md transition-all duration-300 hover:shadow-lg">
            <h2 className="text-lg font-bold text-on-surface mb-4">Gemini API Integration</h2>
            <p className="text-xs text-secondary mb-4 leading-relaxed">
              Khóa API kết nối trực tiếp với Google AI Gemini Studio để soạn thảo prompt và phân
              tích ngôn ngữ tự nhiên.
            </p>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Nhập GEMINI_API_KEY..."
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
            <h2 className="text-lg font-bold text-on-surface mb-4">Surcharges & Drawing Price</h2>
            <p className="text-xs text-secondary mb-4 leading-relaxed">
              Khung giá thu thêm khi khách hàng yêu cầu thêm họa tiết thêu hoặc hình vẽ đơn giản lên
              bề mặt túi/mũ.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                  Phí vẽ/thêu họa tiết (VND)
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
            <h2 className="text-lg font-bold text-on-surface mb-4">Base Product Prices</h2>
            <p className="text-xs text-secondary mb-6 leading-relaxed">
              Thiết lập giá gốc cho các dòng sản phẩm nền của AI Studio. Người dùng sẽ phải trả mức
              phí nền này cộng với các chi phí phụ kiện custom.
            </p>

            <div className="grid gap-6 sm:grid-cols-3">
              {/* Keychain Crochet */}
              <div className="rounded-2xl bg-surface-container p-4 space-y-2 border border-outline/5">
                <span className="text-xs font-bold text-secondary uppercase block">
                  Móc khóa companion
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
                  Túi len Mini Plush
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
                  Mũ len Mini Sweater
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
                <h2 className="text-lg font-bold text-on-surface">Accessories Config (Keychain)</h2>
                <p className="text-xs text-secondary leading-relaxed mt-1">
                  Định nghĩa các lựa chọn phụ trang/phụ kiện của Keychain Companion.
                </p>
              </div>

              <Button
                onClick={openAddAccDialog}
                variant="secondary"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <IconPlus className="h-3.5 w-3.5" /> Thêm phụ kiện
              </Button>
            </div>

            {/* Accessories List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline/5 text-xs font-bold uppercase tracking-wider text-secondary">
                    <th className="py-3 px-4">Key</th>
                    <th className="py-3 px-4">Tên phụ kiện (Vie)</th>
                    <th className="py-3 px-4">I18n Translation Key</th>
                    <th className="py-3 px-4 text-right">Mức giá</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/5">
                  {accessories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-secondary italic">
                        Không có phụ kiện nào. Hãy click "Thêm phụ kiện"!
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
            <DialogTitle>{editingAcc ? 'Cập nhật phụ kiện' : 'Thêm phụ kiện mới'}</DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <Input
              label="Accessory Unique Key (e.g. hair, scarf)"
              type="text"
              value={accKey}
              onChange={(e) => setAccKey(e.target.value)}
              disabled={Boolean(editingAcc)}
              placeholder="Nhập unique key..."
              className="font-mono"
            />

            <Input
              label="Tên phụ kiện tiếng Việt (e.g. Tóc giả, Khăn quàng)"
              type="text"
              value={accLabel}
              onChange={(e) => setAccLabel(e.target.value)}
              placeholder="Nhập tên phụ kiện..."
            />

            <Input
              label="Translation Key i18n (e.g. accessoryHair, accessoryScarf)"
              type="text"
              value={accLabelKey}
              onChange={(e) => setAccLabelKey(e.target.value)}
              placeholder="Nhập translation key..."
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                Đơn giá phụ kiện (₫)
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
              Hủy
            </Button>
            <Button
              onClick={handleSaveAccessory}
              className="flex items-center gap-1.5 rounded-full py-3 text-sm px-5"
            >
              <IconCheck className="h-4 w-4" stroke={3} /> Xác nhận
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
            <AlertDialogTitle>Xóa phụ kiện?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phụ kiện{' '}
              <span className="font-mono font-bold text-on-surface">"{deletingAccKey}"</span> khỏi
              danh sách cấu hình tạm thời?
              <br />
              <span className="text-[11px] text-secondary mt-1 block">
                (Lưu ý: Thay đổi chỉ chính thức được áp dụng khi bạn click "Lưu tất cả thay đổi" ở
                góc trên)
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccessory}>Xác nhận xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
