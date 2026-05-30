'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  IconTrash,
  IconSparkles,
  IconLoader2,
} from '@tabler/icons-react';

import { listDesigns, deleteDesign, finalizeExistingDesign, Design } from '@/lib/api/design.api';
import { useCartStore } from '@/hooks/use-cart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DesignCard from '../ui/design-card';

export default function DesignsTab() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { fetchCart } = useCartStore();

  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State for Delete Confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUserDesigns = async () => {
    try {
      const all = await listDesigns();
      // Filter only drafts
      const draftsOnly = all.filter((d) => d.status === 'draft');
      setDesigns(draftsOnly);
    } catch (err: any) {
      console.error(err);
      toast.error('Không thể tải danh sách bản vẽ của bạn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDesigns();
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteDesign(deleteId);
      toast.success('Đã xóa bản vẽ thành công');
      setDesigns((prev) => prev.filter((d) => d.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      toast.error('Lỗi khi xóa bản vẽ');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (id: string) => {
    router.push(`/ai-studio?edit=${id}`);
  };

  const handleAddToCartClick = async (id: string) => {
    try {
      await finalizeExistingDesign(id);
      toast.success(t('aiStudio.successFinalize'));
      await fetchCart(); // Refresh cart badge
      router.push('/cart');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi hoàn thành bản vẽ');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Title block matching orders-tab */}
      <div className="bg-surface-container-lowest border border-outline/5 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-headline text-on-surface">
            {t('aiStudio.libraryTitle')}
          </h2>
          <p className="text-secondary text-xs sm:text-sm">
            {t('aiStudio.librarySubtitle')}
          </p>
        </div>

        {/* Start button */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            type="button"
            onClick={() => router.push('/ai-studio')}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary hover:bg-primary-hover active:scale-95 transition-all"
          >
            <IconSparkles className="h-3.5 w-3.5" /> {t('aiStudio.startBtn')}
          </button>
        </div>
      </div>

      {/* Grid Lists / Empty State */}
      {designs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-outline/10 bg-surface-container-lowest p-12 text-center shadow-md">
          <h3 className="mt-6 text-lg font-bold text-on-surface">
            {t('aiStudio.emptyStateTitle')}
          </h3>
          <p className="mt-2 max-w-sm text-sm text-secondary">
            {t('aiStudio.emptyStateSubtitle')}
          </p>
          <button
            type="button"
            onClick={() => router.push('/ai-studio')}
            className="mt-6 flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary hover:bg-primary-hover active:scale-95 transition-all shadow-md"
          >
            <IconSparkles className="h-4 w-4" /> {t('aiStudio.startBtn')}
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design) => (
            <DesignCard
              key={design.id}
              design={design}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onAddToCart={handleAddToCartClick}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="rounded-2xl border-0 bg-surface-container-lowest shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-on-surface">
              {t('aiStudio.deleteConfirmTitle')}
            </DialogTitle>
            <DialogDescription className="text-sm text-secondary pt-2">
              {t('aiStudio.deleteConfirmDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setDeleteId(null)}
              className="rounded-full border border-outline/25 px-5 py-2 text-xs font-bold text-secondary hover:bg-surface-container active:scale-95 transition-all"
            >
              {t('address.cancel')}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-bold text-on-primary hover:bg-primary-hover active:scale-95 transition-all"
            >
              {isDeleting ? (
                <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <IconTrash className="h-3.5 w-3.5" />
              )}
              {t('address.delete').split(' ')[0]}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
