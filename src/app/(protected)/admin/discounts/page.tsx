'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  IconTicket,
  IconPlus,
  IconEdit,
  IconTrash,
  IconLoader,
  IconDeviceFloppy,
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
} from '@/lib/api/discount.api';
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

export default function DiscountManagementPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Form Fields State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount' | 'free_shipping'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLimited, setIsLimited] = useState(false);
  const [usageLimit, setUsageLimit] = useState(100);
  const [isUserLimited, setIsUserLimited] = useState(false);
  const [userLimit, setUserLimit] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Delete State
  const [deletingVoucherId, setDeletingVoucherId] = useState<string | null>(null);

  // Fetch vouchers
  const loadVouchers = async (search?: string) => {
    setIsLoading(true);
    try {
      const data = await getAdminVouchers(search);
      setVouchers(data.vouchers || []);
    } catch (err: unknown) {
      console.error('Failed to load vouchers:', err);
      toast.error('Không thể tải danh sách mã giảm giá');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers(searchQuery);
  }, [searchQuery]);

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
    setIsDialogOpen(true);
  };

  // Create or Update Action
  const handleSaveVoucher = async () => {
    if (!code.trim()) {
      toast.error('Vui lòng nhập mã voucher!');
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
    };

    setIsSaving(true);
    const toastId = toast.loading('Đang lưu thông tin voucher...');

    try {
      if (editingVoucher) {
        await updateVoucher(editingVoucher.id, payload);
        toast.success('Cập nhật mã giảm giá thành công!', { id: toastId });
      } else {
        await createVoucher(payload);
        toast.success('Tạo mã giảm giá mới thành công!', { id: toastId });
      }
      setIsDialogOpen(false);
      loadVouchers(searchQuery);
    } catch (err: any) {
      console.error('Save voucher error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lưu voucher!';
      toast.error(msg, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingVoucherId) return;

    const toastId = toast.loading('Đang xóa mã giảm giá...');
    try {
      await deleteVoucher(deletingVoucherId);
      toast.success('Đã xóa mã giảm giá thành công!', { id: toastId });
      setDeletingVoucherId(null);
      loadVouchers(searchQuery);
    } catch (err: any) {
      console.error('Delete voucher error:', err);
      toast.error('Xóa mã giảm giá thất bại!', { id: toastId });
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Vô hạn';
    return new Date(dateStr).toLocaleString('vi-VN', {
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
              Discount Management
            </h1>
          </div>
          <p className="max-w-2xl text-base text-secondary">
            Thiết lập và quản lý các mã giảm giá (voucher), hỗ trợ giảm theo phần trăm, số tiền cố định hoặc miễn phí vận chuyển.
          </p>
        </div>

        <Button
          onClick={openAddDialog}
          className="flex items-center gap-2"
        >
          <IconPlus className="h-5 w-5" />
          Tạo mã giảm giá mới
        </Button>
      </section>

      {/* Search Input Filter */}
      <div className="max-w-md bg-surface-container-lowest p-1 rounded-2xl border border-outline/10 shadow-sm flex items-center gap-2">
        <Input
          type="text"
          placeholder="Tìm kiếm mã voucher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-none bg-transparent shadow-none focus:ring-0 w-full"
        />
      </div>

      {/* Main Grid display case */}
      <div className="rounded-3xl border border-outline/10 bg-surface-container-lowest p-6 shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-[30vh] w-full flex-col items-center justify-center gap-4">
              <IconLoader className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-semibold text-secondary">Đang tải danh sách voucher...</p>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="flex h-[20vh] w-full items-center justify-center text-secondary italic text-sm">
              Không tìm thấy mã giảm giá nào. Hãy click "Tạo mã giảm giá mới"!
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline/5 text-xs font-bold uppercase tracking-wider text-secondary">
                  <th className="py-3 px-4">Mã CODE</th>
                  <th className="py-3 px-4">Loại hình giảm</th>
                  <th className="py-3 px-4 text-right">Giá trị</th>
                  <th className="py-3 px-4 text-center">Thời hạn áp dụng</th>
                  <th className="py-3 px-4 text-center">Lượt dùng (Đã dùng/Giới hạn)</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {vouchers.map((v) => (
                  <tr
                    key={v.id}
                    className="text-sm hover:bg-surface-container-low transition-colors"
                  >
                    <td className="py-4 px-4 font-mono font-black text-primary text-base">
                      {v.code}
                    </td>
                    <td className="py-4 px-4">
                      {v.discount_type === 'percentage' && (
                        <span className="text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded-full font-bold border border-primary/10">
                          % Phần trăm
                        </span>
                      )}
                      {v.discount_type === 'fixed_amount' && (
                        <span className="text-[10px] text-blue-500 bg-blue-500/5 px-2.5 py-0.5 rounded-full font-bold border border-blue-500/10">
                          ₫ Số tiền
                        </span>
                      )}
                      {v.discount_type === 'free_shipping' && (
                        <span className="text-[10px] text-purple-500 bg-purple-500/5 px-2.5 py-0.5 rounded-full font-bold border border-purple-500/10">
                          ✈ Freeship
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-on-surface">
                      {v.discount_type === 'percentage'
                        ? `${v.discount_value}%`
                        : v.discount_type === 'fixed_amount'
                        ? formatCurrency(v.discount_value)
                        : 'Miễn phí ship'}
                    </td>
                    <td className="py-4 px-4 text-center text-xs text-secondary leading-relaxed">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="flex items-center gap-1">
                          <IconCalendar className="h-3 w-3" />
                          {formatDate(v.start_date)}
                        </span>
                        <span className="text-[10px] text-outline">đến</span>
                        <span className="flex items-center gap-1 font-semibold text-on-surface">
                          <IconCalendar className="h-3 w-3 text-primary" />
                          {formatDate(v.end_date)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-on-surface bg-surface-container px-3 py-1 rounded-full w-max mx-auto border border-outline/5">
                          <IconUsers className="h-3.5 w-3.5 text-secondary" />
                          <span>{v.used_count}</span>
                          <span className="text-secondary font-normal">/</span>
                          <span className="text-secondary">
                            {v.usage_limit === null ? '∞' : v.usage_limit}
                          </span>
                        </div>
                        {v.limit_per_user !== null && (
                          <span className="text-[10px] text-primary font-bold">
                            Tối đa {v.limit_per_user} lần/user
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {v.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold">
                          ● Đang chạy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-outline/10 text-secondary border border-outline/20 px-2.5 py-0.5 rounded-full font-bold">
                          ○ Tạm ngưng
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => openEditDialog(v)}
                          className="h-8 w-8 rounded-full bg-surface-container-high text-secondary hover:text-primary hover:bg-surface-container-highest transition-all flex items-center justify-center active:scale-90"
                          title="Chỉnh sửa"
                        >
                          <IconEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingVoucherId(v.id)}
                          className="h-8 w-8 rounded-full bg-surface-container-high text-secondary hover:text-error hover:bg-surface-container-highest transition-all flex items-center justify-center active:scale-90"
                          title="Xóa"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Voucher Dialog Modal (Create / Edit) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVoucher ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá mới'}
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {/* Coupon Code */}
            <Input
              label="Mã giảm giá (e.g. WELCOME10, FLORLEN50)"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={Boolean(editingVoucher)}
              placeholder="Nhập mã code giảm giá..."
              className="font-mono text-base tracking-widest font-black uppercase disabled:opacity-50"
            />

            {/* Discount Type */}
            <div className="space-y-2">
              <label className="block text-sm font-headline font-bold text-on-surface ml-1">
                Loại hình giảm giá
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-6 py-4 bg-surface-container-low border-none rounded-xl font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface transition-all outline-none"
              >
                <option value="percentage">Giảm theo phần trăm (%)</option>
                <option value="fixed_amount">Giảm theo số tiền (VND)</option>
                <option value="free_shipping">Miễn phí vận chuyển (Freeship)</option>
              </select>
            </div>

            {/* Discount Value */}
            {discountType !== 'free_shipping' && (
              <Input
                label={discountType === 'percentage' ? 'Tỉ lệ giảm giá (%)' : 'Số tiền giảm giá (₫)'}
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
                  Ngày bắt đầu
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
                  Ngày kết thúc
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
                    Giới hạn tổng lượt sử dụng
                  </label>

                  {isLimited && (
                    <Input
                      label="Tổng lượt sử dụng tối đa"
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
                    Giới hạn mỗi tài khoản
                  </label>

                  {isUserLimited && (
                    <Input
                      label="Lượt dùng tối đa / khách hàng"
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
              Kích hoạt ngay (Hoạt động)
            </label>
          </DialogBody>

          <DialogFooter>
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="secondary"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveVoucher}
              disabled={isSaving}
              className="flex items-center gap-1.5"
            >
              <IconCheck className="h-4 w-4" stroke={3} />
              {isSaving ? 'Đang lưu...' : 'Xác nhận'}
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
            <AlertDialogTitle>Xóa mã giảm giá?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mã giảm giá này khỏi hệ thống? 
              Hành động này không thể hoàn tác và khách hàng sẽ không thể áp dụng mã này tại trang thanh toán nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
