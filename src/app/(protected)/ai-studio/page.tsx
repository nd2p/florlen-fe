'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  IconChevronRight,
  IconChevronLeft,
  IconSparkles,
  IconShoppingCart,
  IconFolderPlus,
  IconLoader2,
  IconCircleCheck,
  IconRotate,
  IconPalette,
  IconTag,
  IconArrowLeft,
} from '@tabler/icons-react';

import {
  generateDesign,
  saveDesignDraft,
  finalizeDesign,
  getDesignById,
  Design,
  listDesigns,
  deleteDesign,
  finalizeExistingDesign,
  getDailyLimit,
  DailyLimitData,
  getAIConfig,
} from '@/lib/api/design.api';
import { useCartStore } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/utils';
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
import DesignCard from '@/components/ui/design-card';

// Static Surcharge Constants Fallbacks
const PRODUCT_BASE_PRICES_DEFAULT = {
  'mini_figure': 250000,
  'bag': 150000,
  'hat': 120000,
};

const ACCESSORIES_CONFIG_DEFAULT = {
  'pants': { labelKey: 'accessoryPants', price: 15000 },
  'shirt': { labelKey: 'accessoryShirt', price: 20000 },
  'hat': { labelKey: 'accessoryHat', price: 25000 },
  'hair': { labelKey: 'accessoryHair', price: 20000 },
  'bag': { labelKey: 'accessoryBag', price: 15000 },
  'scarf': { labelKey: 'accessoryScarf', price: 10000 },
  'handAccessory': { labelKey: 'accessoryHandAccessory', price: 30000 },
} as const;

const ILLUSTRATION_PRICE_DEFAULT = 40000;

type AccessoryKey = keyof typeof ACCESSORIES_CONFIG_DEFAULT;

const MINI_FIGURE_OPTIONS: AccessoryKey[] = [
  'pants',
  'shirt',
  'hat',
  'hair',
  'bag',
  'scarf',
  'handAccessory',
];

type DesignOptions = Record<AccessoryKey, boolean> & {
  color: string;
  illustration: boolean;
};

type ToggleableOptionKey = AccessoryKey | 'illustration';

const DEFAULT_OPTIONS: DesignOptions = {
  pants: false,
  shirt: false,
  hat: false,
  hair: false,
  bag: false,
  scarf: false,
  handAccessory: false,
  color: '',
  illustration: false,
};

const MINI_FIGURE_KEYWORDS: Record<AccessoryKey, string[]> = {
  pants: ['pants', 'trousers', 'jeans', 'shorts', 'skirt', 'quan', 'vay'],
  shirt: ['shirt', 't-shirt', 'tee', 'hoodie', 'jacket', 'coat', 'sweater', 'ao'],
  hat: ['hat', 'cap', 'beanie', 'mu'],
  hair: ['hair', 'hairstyle', 'pony', 'braid', 'bang', 'toc'],
  bag: ['bag', 'backpack', 'tui'],
  scarf: ['scarf', 'khan'],
  handAccessory: ['hand accessory', 'handheld', 'held', 'prop', 'cam tay'],
};
const BAG_HAT_PATTERN_KEYWORDS = [
  'pattern',
  'print',
  'logo',
  'illustration',
  'graphic',
  'drawing',
  'motif',
  'icon',
  'cartoon',
  'hoa tiet',
  'hoa van',
  'hinh ve',
];

const normalizeForCompare = (value: string) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const containsAnyKeyword = (text: string, keywords: string[]) => {
  if (!text || !keywords.length) return false;
  const normalized = normalizeForCompare(text);
  return keywords.some((keyword) => normalized.includes(keyword));
};

const getPromptScopeErrorKey = (
  productType: 'mini_figure' | 'bag' | 'hat',
  options: DesignOptions,
  customPrompt: string
) => {
  const prompt = String(customPrompt || '').trim();
  if (!prompt) return null;

  if (productType === 'mini_figure') {
    const selected = new Set(
      MINI_FIGURE_OPTIONS.filter((key) => Boolean(options[key]))
    );
    const disallowedKeywords = MINI_FIGURE_OPTIONS.filter((key) => !selected.has(key)).flatMap(
      (key) => MINI_FIGURE_KEYWORDS[key]
    );
    if (containsAnyKeyword(prompt, disallowedKeywords)) {
      return 'aiStudio.promptOutOfScope';
    }
  }

  if ((productType === 'bag' || productType === 'hat') && !options.illustration) {
    if (containsAnyKeyword(prompt, BAG_HAT_PATTERN_KEYWORDS)) {
      return 'aiStudio.illustrationRequired';
    }
  }

  return null;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};

export default function AIStudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { t, i18n } = useTranslation('common');
  const { fetchCart } = useCartStore();

  // Stepper State
  const [step, setStep] = useState(1);
  const [productType, setProductType] = useState<'mini_figure' | 'bag' | 'hat' | null>(null);
  const [options, setOptions] = useState<DesignOptions>(DEFAULT_OPTIONS);
  const [customPrompt, setCustomPrompt] = useState('');

  // Dynamic pricing config states
  const [productBasePrices, setProductBasePrices] = useState<Record<string, number>>({
    mini_figure: 250000,
    bag: 150000,
    hat: 120000,
  });
  const [accessoriesConfig, setAccessoriesConfig] = useState<Record<string, { labelKey: string; label: string; price: number }>>({
    pants: { labelKey: 'accessoryPants', label: 'Quần', price: 15000 },
    shirt: { labelKey: 'accessoryShirt', label: 'Áo', price: 20000 },
    hat: { labelKey: 'accessoryHat', label: 'Mũ phụ kiện', price: 25000 },
    hair: { labelKey: 'accessoryHair', label: 'Tóc', price: 20000 },
    bag: { labelKey: 'accessoryBag', label: 'Túi phụ kiện', price: 15000 },
    scarf: { labelKey: 'accessoryScarf', label: 'Khăn', price: 10000 },
    handAccessory: { labelKey: 'accessoryHandAccessory', label: 'Phụ kiện cầm tay', price: 30000 },
  });
  const [illustrationPrice, setIllustrationPrice] = useState<number>(40000);

  // Load config on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await getAIConfig();
        if (config) {
          if (config.productBasePrices) setProductBasePrices(config.productBasePrices);
          if (config.accessoriesConfig) setAccessoriesConfig(config.accessoriesConfig as any);
          if (typeof config.illustrationPrice === 'number') setIllustrationPrice(config.illustrationPrice);
        }
      } catch (err) {
        console.error('Failed to load dynamic AI configs, using defaults:', err);
      }
    }
    loadConfig();
  }, []);

  // Generation status (Memory-First State)
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMsgIdx, setGenerationMsgIdx] = useState(0);
  
  // Ephemeral AI design states
  const [attempts, setAttempts] = useState(0);
  const [mockupImageUrl, setMockupImageUrl] = useState<string | null>(null);
  const [aiPromptUsed, setAiPromptUsed] = useState('');
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [materialSuggestions, setMaterialSuggestions] = useState<string[]>([]);
  const [customizationFee, setCustomizationFee] = useState(0);
  // Pre-screen state variables
  const [userDesigns, setUserDesigns] = useState<Design[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [showSavedScreen, setShowSavedScreen] = useState(false);
  const [dailyLimitData, setDailyLimitData] = useState<DailyLimitData>({
    count: 0,
    limit: 3,
  });

  // Dialog State for Delete Confirmation on Pre-screen
  const [preDeleteId, setPreDeleteId] = useState<string | null>(null);
  const [preIsDeleting, setPreIsDeleting] = useState(false);

  const pricingBreakdown = useMemo(() => {
    if (!productType) {
      return { basePrice: 0, customizationFee: 0, totalPrice: 0 };
    }

    const basePrice = productBasePrices[productType] || 0;
    let custFee = 0;

    if (productType === 'mini_figure') {
      MINI_FIGURE_OPTIONS.forEach((optKey) => {
        if (options[optKey]) {
          const config = accessoriesConfig[optKey];
          if (config) {
            custFee += config.price;
          }
        }
      });
    } else if (options.illustration) {
      custFee += illustrationPrice;
    }

    return {
      basePrice,
      customizationFee: custFee,
      totalPrice: basePrice + custFee,
    };
  }, [productType, options, productBasePrices, accessoriesConfig, illustrationPrice]);

  // Fun loading screen messages
  const loadingMessages = [
    t('aiStudio.generatingText'),
    t('aiStudio.generatingText2'),
    t('aiStudio.generatingText3'),
    t('aiStudio.generatingText4'),
  ];

  const fetchDailyLimitData = useCallback(async () => {
    try {
      const data = await getDailyLimit();
      setDailyLimitData(data);
    } catch (err) {
      console.error('Failed to load daily limit data:', err);
    }
  }, []);

  const fetchAllDesigns = useCallback(async () => {
    try {
      const all = await listDesigns();
      // Filter only drafts
      const draftsOnly = all.filter((d) => d.status === 'draft');
      setUserDesigns(draftsOnly);
      
      // If user has designs and we are NOT editing, show the pre-screen
      if (draftsOnly.length > 0 && !editId) {
        setShowSavedScreen(true);
      }
    } catch (err) {
      console.error('Failed to load user designs:', err);
    } finally {
      setLoadingDesigns(false);
    }
  }, [editId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllDesigns();
    fetchDailyLimitData();
  }, [fetchAllDesigns, fetchDailyLimitData]);

  // Dialog deletion handlers for pre-screen
  const handlePreDeleteClick = (id: string) => {
    setPreDeleteId(id);
  };

  const handlePreConfirmDelete = async () => {
    if (!preDeleteId) return;
    setPreIsDeleting(true);
    try {
      await deleteDesign(preDeleteId);
      toast.success('Đã xóa bản vẽ thành công');
      setUserDesigns((prev) => prev.filter((d) => d.id !== preDeleteId));
      
      // If deleted last design, automatically hide pre-screen to start wizard
      const remaining = userDesigns.filter((d) => d.id !== preDeleteId);
      if (remaining.length === 0) {
        setShowSavedScreen(false);
      }
      setPreDeleteId(null);
      await fetchDailyLimitData();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Lỗi khi xóa bản vẽ'));
    } finally {
      setPreIsDeleting(false);
    }
  };

  const handlePreAddToCartClick = async (id: string) => {
    try {
      await finalizeExistingDesign(id);
      toast.success(t('aiStudio.successFinalize'));
      await fetchCart(); // Refresh cart badge
      router.push('/cart');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Lỗi khi hoàn thành bản vẽ'));
    }
  };

  const handlePreEditClick = async (id: string) => {
    try {
      toast.loading('Đang tải cấu hình bản vẽ...', { id: 'preload-design' });
      const existing = await getDesignById(id);
      const sku = existing.products?.sku || '';
      if (sku.includes('MINI-FIGURE')) {
        setProductType('mini_figure');
      } else if (sku.includes('BAG')) {
        setProductType('bag');
      } else {
        setProductType('hat');
      }

      const mergedOptions = {
        ...DEFAULT_OPTIONS,
        ...((existing.selected_colors || {}) as Partial<DesignOptions>),
      };
      setOptions(mergedOptions);
      setCustomPrompt(existing.prompt_text || '');
      setMockupImageUrl(existing.mockup_image_url || null);
      setAiPromptUsed(existing.ai_prompt_used || '');
      setColorPalette(existing.color_palette || []);
      setMaterialSuggestions(existing.material_suggestions || []);
      setCustomizationFee(existing.customization_fee || 0);
      setAttempts(existing.generation_attempts || 0);
      setStep(4); // Reopen result screen directly
      
      setShowSavedScreen(false); // Switch from pre-screen to wizard edit view
      toast.success('Đã tải bản vẽ thành công', { id: 'preload-design' });
    } catch (err: unknown) {
      console.error(err);
      toast.error('Không thể tải bản vẽ', { id: 'preload-design' });
    }
  };

  // Preload saved design for editing
  useEffect(() => {
    if (!editId) return;

    const loadDesign = async () => {
      try {
        const existing = await getDesignById(editId);
        const sku = existing.products?.sku || '';
        if (sku.includes('MINI-FIGURE')) {
          setProductType('mini_figure');
        } else if (sku.includes('BAG')) {
          setProductType('bag');
        } else {
          setProductType('hat');
        }

        const mergedOptions = {
          ...DEFAULT_OPTIONS,
          ...((existing.selected_colors || {}) as Partial<DesignOptions>),
        };
        setOptions(mergedOptions);
        setCustomPrompt(existing.prompt_text || '');
        setMockupImageUrl(existing.mockup_image_url || null);
        setAiPromptUsed(existing.ai_prompt_used || '');
        setColorPalette(existing.color_palette || []);
        setMaterialSuggestions(existing.material_suggestions || []);
        setCustomizationFee(existing.customization_fee || 0);
        setAttempts(existing.generation_attempts || 0);
        setStep(4); // Reopen result screen directly
      } catch (err: unknown) {
        console.error('Failed to preload design details:', err);
        toast.error('Không thể tải bản thiết kế lưu trữ để chỉnh sửa');
      }
    };

    loadDesign();
  }, [editId]);

  // Rotate loading messages during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating, loadingMessages.length]);

  // Helper selectors
  const toggleOption = (key: ToggleableOptionKey) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTextChange = (val: string) => {
    setCustomPrompt(val);
  };

  const handleColorChange = (val: string) => {
    setOptions((prev) => ({ ...prev, color: val }));
  };

  // Generation Triggers (Purely Ephemeral)
  const handleGenerate = async () => {
    if (!productType) return;
    if (!customPrompt.trim()) {
      toast.error(t('aiStudio.promptRequired'));
      return;
    }
    const promptScopeErrorKey = getPromptScopeErrorKey(productType, options, customPrompt);
    if (promptScopeErrorKey) {
      toast.warning(t(promptScopeErrorKey));
    }

    setIsGenerating(true);
    setStep(4);
    setGenerationMsgIdx(0);

    try {
      const result = await generateDesign({
        productType,
        options,
        customPrompt,
      });

      // Update local memory state
      setMockupImageUrl(result.mockup_image_url);
      setAiPromptUsed(result.ai_prompt_used);
      setColorPalette(result.color_palette || []);
      setMaterialSuggestions(result.material_suggestions || []);
      setCustomizationFee(result.customization_fee);
      setAttempts((prev) => prev + 1);

      // Refetch daily limit count
      await fetchDailyLimitData();

      toast.success(t('profile.orders.details.progressTitle'));
    } catch (err: unknown) {
      console.error(err);
      toast.error(getErrorMessage(err, t('aiStudio.errorTitle')));
      // Step back if failed
      setStep(3);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Draft Handler (Option 1 - Database Persistence)
  const handleSaveDraft = async () => {
    if (!mockupImageUrl) return;
    try {
      await saveDesignDraft({
        productType: productType!,
        options,
        customPrompt,
        mockupImageUrl,
        aiPromptUsed,
        colorPalette,
        materialSuggestions,
        customizationFee,
        attempts,
      });
      toast.success(t('aiStudio.successSaveDraft'));
      router.push('/profile?tab=saved_designs');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('aiStudio.errorTitle')));
    }
  };

  // Finalize / Add to Cart Handler (Option 2 - Database Persistence & Cart)
  const handleFinalize = async () => {
    if (!mockupImageUrl) return;
    try {
      await finalizeDesign({
        productType: productType!,
        options,
        customPrompt,
        mockupImageUrl,
        aiPromptUsed,
        colorPalette,
        materialSuggestions,
        customizationFee,
        attempts,
      });
      toast.success(t('aiStudio.successFinalize'));
      await fetchCart(); // Update header cart items badge
      router.push('/cart');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('aiStudio.errorTitle')));
    }
  };

  const handleRegenerate = () => {
    if (attempts >= 3) return;
    setStep(2); // Go back to customize step to update parameters if desired
  };

  const handleRestart = () => {
    setStep(1);
    setProductType(null);
    setCustomPrompt('');
    setMockupImageUrl(null);
    setAiPromptUsed('');
    setColorPalette([]);
    setMaterialSuggestions([]);
    setCustomizationFee(0);
    setAttempts(0);
    setOptions({ ...DEFAULT_OPTIONS });
  };

  if (loadingDesigns) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background py-32">
        <IconLoader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (showSavedScreen) {
    return (
      <div className="flex-1 bg-background px-6 py-24 lg:px-16 animate-in fade-in duration-300">
        <div className="mx-auto max-w-4xl space-y-8">
          
          {/* Header block */}
          <div className="bg-surface-container-lowest border border-outline/5 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-headline text-on-surface">
                {t('aiStudio.libraryTitle')}
              </h2>
              <p className="text-secondary text-xs sm:text-sm">
                Bạn có thể tiếp tục chỉnh sửa các thiết kế nháp hiện có hoặc bắt đầu một bản vẽ mới bên dưới.
              </p>
            </div>
            <div className="rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-xs font-extrabold text-primary self-start sm:self-center">
              {t('aiStudio.dailyCount', { count: dailyLimitData.count, limit: dailyLimitData.limit })}
            </div>
          </div>

          {/* Grid display case */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userDesigns.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                onEdit={handlePreEditClick}
                onDelete={handlePreDeleteClick}
                onAddToCart={handlePreAddToCartClick}
              />
            ))}
          </div>

          {/* Creation Button Footer */}
          <div className="mt-12 flex flex-col items-center justify-center p-8 bg-surface-container-lowest border border-outline/5 rounded-3xl shadow-sm text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-base font-bold text-on-surface mb-2">Bắt đầu ý tưởng mới?</h3>
            <p className="text-xs text-secondary max-w-sm mb-4 leading-relaxed">
              Tự thiết kế một nhân vật crochet, túi xách hay mũ len theo phong cách độc nhất của chính bạn bằng AI.
            </p>
            <div className="text-xs font-bold text-primary mb-6">
              {t('aiStudio.dailyCount', { count: dailyLimitData.count, limit: dailyLimitData.limit })}
            </div>
            <div title={dailyLimitData.count >= dailyLimitData.limit ? t('aiStudio.dailyLimitReachedTooltip') : undefined}>
              <button
                type="button"
                disabled={dailyLimitData.count >= dailyLimitData.limit}
                onClick={() => {
                  handleRestart();
                  setShowSavedScreen(false);
                }}
                className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-on-primary enabled:hover:bg-primary-hover enabled:active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconSparkles className="h-4 w-4" /> Bắt đầu thiết kế mới
              </button>
            </div>
          </div>

          {/* Deletion Dialog */}
          <AlertDialog open={preDeleteId !== null} onOpenChange={(open) => !open && setPreDeleteId(null)}>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('aiStudio.deleteConfirmTitle')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('aiStudio.deleteConfirmDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPreDeleteId(null)}>
                  {t('address.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={preIsDeleting}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePreConfirmDelete();
                  }}
                  variant="primary"
                >
                  {t('address.delete').split(' ')[0]}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background px-6 py-24 lg:px-16 animate-in fade-in duration-300">
      <div className="mx-auto max-w-4xl">
        {/* Back to library button */}
        {userDesigns.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSavedScreen(true)}
            className="flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary transition-colors mb-8 focus:outline-none"
          >
            <IconArrowLeft className="w-5 h-5" stroke={2.5} />
            {i18n.resolvedLanguage?.startsWith('vi') ? 'Quay lại danh sách bản vẽ' : 'Back to Saved Designs'}
          </button>
        )}

        {/* Header Title */}
        <div className="mb-10 text-center flex flex-col items-center gap-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface sm:text-5xl">
            {t('aiStudio.title')}
          </h1>
          <p className="text-secondary text-sm">{t('aiStudio.subtitle')}</p>
          <div className="rounded-full bg-primary/10 border border-primary/20 px-4.5 py-1.5 text-xs font-extrabold text-primary">
            {t('aiStudio.dailyCount', { count: dailyLimitData.count, limit: dailyLimitData.limit })}
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="mb-12">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-surface-container-highest" />
            <div
              className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-primary transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                disabled={s > step && !mockupImageUrl}
                onClick={() => setStep(s)}
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                  s < step
                    ? 'bg-primary text-on-primary ring-4 ring-primary/20'
                    : s === step
                    ? 'bg-primary text-on-primary ring-4 ring-primary/30'
                    : 'bg-surface-container text-secondary border border-outline/20'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[11px] font-bold uppercase tracking-wider text-secondary">
            <span>{t('aiStudio.step1Title')}</span>
            <span>{t('aiStudio.step2Title')}</span>
            <span>{t('aiStudio.step3Title')}</span>
            <span>{t('aiStudio.step4Title')}</span>
          </div>
        </div>

        {/* Step Contents */}
        <div className="rounded-3xl bg-surface-container-lowest p-8 shadow-xl border border-outline/5 transition-all">
          
          {/* STEP 1: Select Product Type */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-300">
              <h2 className="mb-6 text-xl font-bold">{t('aiStudio.step1Title')}</h2>
              <div className="grid gap-6 sm:grid-cols-3">
                
                {/* Mini Figure */}
                <button
                  type="button"
                  onClick={() => {
                    setProductType('mini_figure');
                    setStep(2);
                  }}
                  className={`group flex flex-col items-center rounded-2xl border p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg ${
                    productType === 'mini_figure'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                      : 'border-outline/10 hover:border-primary/50'
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    🧶
                  </div>
                  <h3 className="mt-4 text-base font-bold text-on-surface">
                    {t('aiStudio.productMiniFigure')}
                  </h3>
                  <p className="mt-2 text-xs text-secondary leading-relaxed">
                    {t('aiStudio.productMiniFigureDesc')}
                  </p>
                </button>

                {/* Bag */}
                <button
                  type="button"
                  onClick={() => {
                    setProductType('bag');
                    setStep(2);
                  }}
                  className={`group flex flex-col items-center rounded-2xl border p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg ${
                    productType === 'bag'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                      : 'border-outline/10 hover:border-primary/50'
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    👜
                  </div>
                  <h3 className="mt-4 text-base font-bold text-on-surface">
                    {t('aiStudio.productBag')}
                  </h3>
                  <p className="mt-2 text-xs text-secondary leading-relaxed">
                    {t('aiStudio.productBagDesc')}
                  </p>
                </button>

                {/* Hat */}
                <button
                  type="button"
                  onClick={() => {
                    setProductType('hat');
                    setStep(2);
                  }}
                  className={`group flex flex-col items-center rounded-2xl border p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg ${
                    productType === 'hat'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                      : 'border-outline/10 hover:border-primary/50'
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    👒
                  </div>
                  <h3 className="mt-4 text-base font-bold text-on-surface">
                    {t('aiStudio.productHat')}
                  </h3>
                  <p className="mt-2 text-xs text-secondary leading-relaxed">
                    {t('aiStudio.productHatDesc')}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Configure Details */}
          {step === 2 && productType && (
            <div className="animate-in fade-in duration-300">
              <h2 className="mb-6 text-xl font-bold flex items-center gap-2">
                <IconPalette className="text-primary" /> {t('aiStudio.optionsTitle')}
              </h2>

              {/* Accessories Selection for Mini Figure */}
              {productType === 'mini_figure' && (
                <div className="mb-8">
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-4">
                    {t('aiStudio.miniFigureAccessories')}
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(accessoriesConfig).map(([key, config]) => {
                      const optionKey = key as AccessoryKey;
                      return (
                      <button
                        key={optionKey}
                        type="button"
                        onClick={() => toggleOption(optionKey)}
                        className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all active:scale-95 ${
                          options[optionKey]
                            ? 'border-primary bg-primary/5 font-bold text-primary'
                            : 'border-outline/10 hover:border-primary/30 text-on-surface'
                        }`}
                      >
                        <span className="text-sm">
                          {t(`aiStudio.${config.labelKey}`) !== `aiStudio.${config.labelKey}`
                            ? t(`aiStudio.${config.labelKey}`)
                            : config.label || key}
                        </span>
                        <span className="text-xs bg-surface-container px-2.5 py-1 rounded-full text-secondary">
                          +{formatCurrency(config.price)}
                        </span>
                      </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color & Illustration Selection for Bag/Hat */}
              {(productType === 'bag' || productType === 'hat') && (
                <div className="mb-8 space-y-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                    {t('aiStudio.bagHatOptions')}
                  </label>

                  {/* Free Color Input */}
                  <div>
                    <span className="block text-sm font-bold text-on-surface mb-2">
                      {t('aiStudio.colorLabel')}
                    </span>
                    <input
                      type="text"
                      value={options.color || ''}
                      onChange={(e) => handleColorChange(e.target.value)}
                      placeholder={t('aiStudio.colorSelectPlaceholder')}
                      className="w-full rounded-xl bg-surface-container px-4 py-3 text-sm border border-outline/15 text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Illustration checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleOption('illustration')}
                    className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all active:scale-95 ${
                      options.illustration
                        ? 'border-primary bg-primary/5 font-bold text-primary'
                        : 'border-outline/10 hover:border-primary/30 text-on-surface'
                    }`}
                  >
                    <span className="text-sm">{t('aiStudio.illustrationLabel')}</span>
                    <span className="text-xs bg-surface-container px-2.5 py-1 rounded-full text-secondary">
                      +{formatCurrency(illustrationPrice)}
                    </span>
                  </button>
                </div>
              )}

              {/* Custom raw user description prompt */}
              <div className="mb-8">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-3">
                  {t('aiStudio.promptLabel')}
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={t('aiStudio.promptPlaceholder')}
                  rows={4}
                  className="w-full rounded-2xl bg-surface-container p-4 text-sm border border-outline/15 text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between border-t border-outline/5 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 rounded-full border border-outline/25 px-6 py-2.5 text-sm font-bold text-secondary hover:bg-surface-container active:scale-95 transition-all"
                >
                  <IconChevronLeft className="h-4 w-4" /> {t('address.cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!customPrompt.trim()}
                  className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {t('home.hero.buyNow')} <IconChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Final Quote Review */}
          {step === 3 && productType && (
            <div className="animate-in fade-in duration-300">
              <h2 className="mb-6 text-xl font-bold flex items-center gap-2">
                <IconTag className="text-primary" /> {t('aiStudio.invoiceTitle')}
              </h2>

              <div className="rounded-2xl bg-surface-container p-6 space-y-4 mb-8">
                {/* Base Product Price */}
                <div className="flex justify-between border-b border-outline/5 pb-3">
                  <span className="text-sm text-secondary">{t('aiStudio.invoiceBase')}</span>
                  <span className="text-sm font-bold">{formatCurrency(pricingBreakdown.basePrice)}</span>
                </div>

                {/* Surcharges list */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-secondary">
                    {t('aiStudio.invoiceSurcharge')}
                  </span>
                  
                  {productType === 'mini_figure' ? (
                    Object.entries(options).some(([k, v]) => v && accessoriesConfig[k]) ? (
                      Object.entries(options).map(([optKey, isSelected]) => {
                        if (isSelected && accessoriesConfig[optKey]) {
                          const config = accessoriesConfig[optKey];
                          return (
                            <div key={optKey} className="flex justify-between text-xs text-on-surface px-2">
                              <span>+ {t(`aiStudio.${config.labelKey}`)}</span>
                              <span>{formatCurrency(config.price)}</span>
                            </div>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <span className="text-xs text-secondary italic px-2">Không chọn phụ kiện</span>
                    )
                  ) : (
                    options.illustration ? (
                      <div className="flex justify-between text-xs text-on-surface px-2">
                        <span>+ {t('aiStudio.illustrationLabel').split(' (+')[0]}</span>
                        <span>{formatCurrency(illustrationPrice)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-secondary italic px-2">Không chọn thêu hình</span>
                    )
                  )}
                </div>

                {/* Total Custom Surcharges */}
                <div className="flex justify-between border-t border-outline/5 pt-4 text-base font-bold text-primary">
                  <span>{t('aiStudio.invoiceTotal')}</span>
                  <span>{formatCurrency(pricingBreakdown.totalPrice)}</span>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between border-t border-outline/5 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 rounded-full border border-outline/25 px-6 py-2.5 text-sm font-bold text-secondary hover:bg-surface-container active:scale-95 transition-all"
                >
                  <IconChevronLeft className="h-4 w-4" /> {t('profile.orders.details.backToProfile').split(' ')[0]}
                </button>
                <div title={dailyLimitData.count >= dailyLimitData.limit ? t('aiStudio.dailyLimitReachedTooltip') : undefined}>
                  <button
                    type="button"
                    disabled={dailyLimitData.count >= dailyLimitData.limit}
                    onClick={handleGenerate}
                    className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-on-primary enabled:hover:bg-primary-hover enabled:active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IconSparkles className="h-4 w-4" /> {t('aiStudio.generateBtn')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: AI Mockup Result Screen */}
          {step === 4 && (
            <div className="animate-in fade-in duration-300">
              
              {/* Generation Loader State */}
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <div className="absolute h-full w-full rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <span className="text-3xl animate-bounce">🧶</span>
                  </div>
                  <h3 className="mt-8 text-lg font-bold text-on-surface animate-pulse">
                    {loadingMessages[generationMsgIdx]}
                  </h3>
                  <p className="mt-2 text-xs text-secondary">
                    {t('checkout.submitting').split('...')[0]} (Imagen 3 API)
                  </p>
                </div>
              ) : mockupImageUrl ? (
                
                /* Mockup Result Displayed */
                <div className="space-y-8 animate-in zoom-in-95 duration-300">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <IconCircleCheck className="text-green-600" /> {t('aiStudio.step4Title')}
                  </h2>

                  <div className="grid gap-8 sm:grid-cols-2 items-center">
                    
                    {/* Mockup Image Frame */}
                    <div className="relative overflow-hidden rounded-3xl border border-outline/10 bg-surface-container-high shadow-2xl transition-all duration-300 hover:scale-102">
                      <div className="aspect-square w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mockupImageUrl}
                          alt="AI Mockup crochet"
                          className="h-full w-full object-cover rounded-3xl"
                        />
                      </div>
                      
                      {/* Interactive Glassmorphic attempts badge */}
                      <div className="absolute bottom-4 left-4 rounded-xl bg-surface/75 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur-md border border-outline/10">
                        Attempt {attempts} / 3
                      </div>
                    </div>

                    {/* Meta Suggestions & Details */}
                    <div className="space-y-5">
                      <div className="rounded-2xl bg-surface-container p-5 space-y-3">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                          {t('aiStudio.optionsTitle')}
                        </div>
                        <p className="text-xs text-on-surface leading-relaxed">
                          <strong className="text-primary font-bold">Mô tả:</strong> {customPrompt}
                        </p>
                        
                        {colorPalette.length > 0 && (
                          <div className="space-y-1 pt-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                              Bảng màu gợi ý (AI):
                            </span>
                            <div className="flex gap-2">
                              {colorPalette.map((color, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full"
                                >
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {materialSuggestions.length > 0 && (
                          <div className="space-y-1 pt-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                              Gợi ý chất liệu len:
                            </span>
                            <div className="flex gap-2 flex-wrap">
                              {materialSuggestions.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 flex justify-between items-center text-sm">
                        <span className="font-bold text-primary">{t('checkout.totalToday')}</span>
                        <span className="font-extrabold text-primary text-base">
                          {formatCurrency(pricingBreakdown.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stepper buttons / Final Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-outline/5">
                    
                    {/* Regenerate if attempts < 3 */}
                    {attempts < 3 ? (
                      <button
                        type="button"
                        onClick={handleRegenerate}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full border border-primary text-primary px-6 py-3 text-sm font-bold hover:bg-primary/5 transition-all active:scale-95"
                      >
                        <IconRotate className="h-4 w-4" />
                        {t('aiStudio.regenerateBtn', { count: 3 - attempts })}
                      </button>
                    ) : null}

                    {/* Option 1: Save Design as Draft */}
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full border border-outline/35 px-6 py-3 text-sm font-bold text-secondary hover:bg-surface-container transition-all active:scale-95"
                    >
                      <IconFolderPlus className="h-4 w-4" />
                      {t('aiStudio.saveDraftBtn').split(' (')[0]}
                    </button>

                    {/* Option 2: Lock and Add to Cart */}
                    <button
                      type="button"
                      onClick={handleFinalize}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary hover:bg-primary-hover transition-all active:scale-95 shadow-lg"
                    >
                      <IconShoppingCart className="h-4 w-4" />
                      {t('aiStudio.addToCartBtn').split(' (')[0]}
                    </button>
                  </div>

                  {/* Reset/Restart trigger */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="text-xs font-bold text-secondary underline hover:text-primary"
                    >
                      Bắt đầu phiên thiết kế mới
                    </button>
                  </div>
                </div>
              ) : (
                /* Failed Generation State */
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-4xl">❌</span>
                  <h3 className="mt-6 text-lg font-bold">{t('aiStudio.errorTitle')}</h3>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="mt-6 rounded-full bg-primary px-6 py-2 text-xs font-bold text-on-primary hover:bg-primary-hover active:scale-95"
                  >
                    {t('address.editTitle').split(' ')[0]} {t('aiStudio.generateBtn')}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
