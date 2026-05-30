'use client';

import { useTranslation } from 'react-i18next';
import { IconEdit, IconTrash, IconShoppingCart } from '@tabler/icons-react';
import { Design } from '@/lib/api/design.api';
import { formatCurrency } from '@/lib/utils';

const ACCESSORIES_CONFIG = {
  pants: { labelKey: 'accessoryPants' },
  shirt: { labelKey: 'accessoryShirt' },
  hat: { labelKey: 'accessoryHat' },
  hair: { labelKey: 'accessoryHair' },
  bag: { labelKey: 'accessoryBag' },
  scarf: { labelKey: 'accessoryScarf' },
  handAccessory: { labelKey: 'accessoryHandAccessory' },
};

interface DesignCardProps {
  design: Design;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddToCart: (id: string) => void;
}

export default function DesignCard({ design, onEdit, onDelete, onAddToCart }: DesignCardProps) {
  const { t, i18n } = useTranslation('common');

  const promptUsed = design.ai_prompt_used?.toLowerCase() || '';
  const isMiniFigure = promptUsed.includes('mini_figure');
  const isBag = promptUsed.includes('bag');
  const isHat = promptUsed.includes('hat');

  const basePrice =
    design.products?.base_price || (isMiniFigure ? 250000 : isBag ? 150000 : 120000);
  const custFee = design.customization_fee || 0;
  const totalPrice = Number(basePrice) + Number(custFee);

  const displayType = isMiniFigure
    ? t('aiStudio.productMiniFigure')
    : isBag
    ? t('aiStudio.productBag')
    : isHat
    ? t('aiStudio.productHat')
    : 'Custom Product';

  const isEn = i18n.language?.startsWith('en');
  const displayName = isEn ? `AI's ${displayType}` : `${displayType} của AI`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-outline/10 bg-surface-container-lowest shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Mockup Frame */}
      <div className="relative aspect-square w-full bg-surface-container overflow-hidden">
        {design.mockup_image_url ? (
          <img
            src={design.mockup_image_url}
            alt={design.prompt_text || 'AI Design'}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-secondary italic">
            No Mockup generated
          </div>
        )}

        {/* Floating product category tag */}
        <div className="absolute left-3 top-3 rounded-full bg-surface/80 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-primary backdrop-blur-sm border border-outline/10">
          {displayType}
        </div>
      </div>

      {/* Metadata and Pricing */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-on-surface line-clamp-1">{displayName}</h3>
          <p className="mt-2 text-xs text-secondary line-clamp-3 leading-relaxed">
            <strong className="text-on-surface">Mô tả:</strong> {design.prompt_text}
          </p>

          {/* Display Selected Options */}
          {design.selected_colors && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.entries(design.selected_colors).map(([key, value]) => {
                if (!value) return null;
                const label =
                  key === 'color'
                    ? `Màu: ${value}`
                    : key === 'illustration'
                    ? 'Họa tiết thêu'
                    : ACCESSORIES_CONFIG[key as keyof typeof ACCESSORIES_CONFIG]
                    ? t(
                        `aiStudio.${
                          ACCESSORIES_CONFIG[key as keyof typeof ACCESSORIES_CONFIG].labelKey
                        }`
                      ).split(' (+')[0]
                    : key;
                return (
                  <span
                    key={key}
                    className="inline-flex text-[9px] font-bold text-secondary bg-surface-container px-2 py-0.5 rounded-full"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-outline/5 pt-4">
          <div className="flex justify-between items-center text-xs mb-4">
            <span className="text-secondary">Tổng chi phí:</span>
            <span className="font-extrabold text-primary text-sm">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {/* Edit */}
            <button
              type="button"
              onClick={() => onEdit(design.id)}
              title={t('aiStudio.editSavedDesign')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-outline/20 text-secondary hover:bg-surface-container active:scale-95 transition-all"
            >
              <IconEdit className="h-4.5 w-4.5" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => onDelete(design.id)}
              title={t('aiStudio.deleteSavedDesign')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-outline/20 text-red-600 hover:bg-red-50 active:scale-95 transition-all"
            >
              <IconTrash className="h-4.5 w-4.5" />
            </button>

            {/* Lock & Purchase */}
            <button
              type="button"
              onClick={() => onAddToCart(design.id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary py-2 text-xs font-bold text-on-primary hover:bg-primary-hover active:scale-95 transition-all"
            >
              <IconShoppingCart className="h-3.5 w-3.5" />{' '}
              {t('aiStudio.addToCartBtn').split(' ')[0]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
