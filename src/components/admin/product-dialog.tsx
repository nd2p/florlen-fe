"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IconPlus, IconTrash, IconChevronDown, IconChevronLeft, IconChevronRight, IconCrop } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Checkbox from "@/components/ui/checkbox";
import ImageCropper from "./image-cropper";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    createProduct,
    getProductById,
    uploadProductImages,
    updateProduct,
    type ProductType,
    type ProductVariantInput,
    type ProductListItem,
} from "@/lib/api/product.api";
import { PRODUCT_TYPE } from "@/lib/product-constants";

type ProductImageItem = {
    id?: string;
    url: string;
    file?: File;
    bucket?: string | null;
    storage_path?: string | null;
    alt_text?: string | null;
    is_primary?: boolean;
};

type VariantDraft = {
    id?: string;
    sku_suffix: string;
    size: string;
    color_name: string;
    additional_price: string;
    stock_qty: string;
};

type EditSnapshot = {
    sku: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    productType: ProductType;
    basePrice: string;
    customizationFee: string;
    productionDaysMin: string;
    productionDaysMax: string;
    productImages: { id?: string; url: string; bucket?: string | null; storage_path?: string | null; alt_text?: string | null; is_primary?: boolean }[];
    variants: VariantDraft[];
    isFeatured: boolean;
};

const initialVariant = (): VariantDraft => ({
    id: undefined,
    sku_suffix: "",
    size: "",
    color_name: "",
    additional_price: "0",
    stock_qty: "0",
});

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

type ProductDialogProps = {
    compact?: boolean;
    product?: Partial<ProductListItem> | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSaved?: () => void | Promise<void>;
};

export default function ProductDialog({ compact = false, product = null, open, onOpenChange, onSaved }: ProductDialogProps) {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [internalOpen, setInternalOpen] = useState(false);
    const controlled = typeof open === "boolean" && typeof onOpenChange === "function";
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sku, setSku] = useState("");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [productType, setProductType] = useState<ProductType>(PRODUCT_TYPE.NORMAL);
    const [basePrice, setBasePrice] = useState("0");
    const [customizationFee, setCustomizationFee] = useState("0");
    const [productionDaysMin, setProductionDaysMin] = useState("3");
    const [productionDaysMax, setProductionDaysMax] = useState("7");
    const [isFeatured, setIsFeatured] = useState(false);
    
    // Unified Product Images state
    const [productImages, setProductImages] = useState<ProductImageItem[]>([]);
    
    // Cropper inline target state
    const [croppingTargetIdx, setCroppingTargetIdx] = useState<number | null>(null);

    const cropperImageUrl = useMemo(() => {
        if (croppingTargetIdx === null) return null;
        return productImages[croppingTargetIdx]?.url || null;
    }, [croppingTargetIdx, productImages]);

    const [variants, setVariants] = useState<VariantDraft[]>([initialVariant()]);
    const [editSnapshot, setEditSnapshot] = useState<EditSnapshot | null>(null);

    const actualOpen = controlled ? open! : internalOpen;
    const setActualOpen = (v: boolean) => {
        if (controlled) onOpenChange!(v);
        else setInternalOpen(v);
    };

    const generatedSlug = useMemo(() => slugify(name), [name]);

    useEffect(() => {
        if (!product) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEditSnapshot(null);
            return;
        }

        /* eslint-disable @typescript-eslint/no-explicit-any */

        const initialSku = product.sku ?? "";
        const initialName = product.name ?? "";
        const initialSlug = (product as any)?.slug ?? (product.name ? slugify(product.name) : "");
        const initialDescription = (product as any)?.description ?? "";
        const initialShortDescription = (product as any)?.short_description ?? "";
        const initialProductType = ((product as any)?.product_type ?? PRODUCT_TYPE.NORMAL) as ProductType;
        const initialBasePrice = ((product as any)?.base_price ?? 0).toString();
        const initialCustomizationFee = ((product as any)?.customization_fee ?? 0).toString();
        const initialProductionDaysMin = ((product as any)?.production_days_min ?? 3).toString();
        const initialProductionDaysMax = ((product as any)?.production_days_max ?? 7).toString();
        const initialIsFeatured = Boolean((product as any)?.is_featured);
        const initialExistingImages =
            (product as any)?.product_images?.map((img: any) => ({
                id: img.id,
                url: img.url,
                bucket: img.bucket ?? null,
                storage_path: img.storage_path ?? null,
                alt_text: img.alt_text ?? null,
                is_primary: img.is_primary ?? false,
            })) ?? [];
        const initialVariants =
            (product as any)?.product_variants?.length
                ? (product as any).product_variants
                    .filter((variant: any) => variant.is_active !== false)
                    .map((variant: any) => ({
                        id: variant.id,
                        sku_suffix: variant.sku_suffix ?? "",
                        size: variant.size ?? "",
                        color_name: variant.color_name ?? "",
                        additional_price: (variant.additional_price ?? 0).toString(),
                        stock_qty: (variant.stock_qty ?? 0).toString(),
                    }))
                : [initialVariant()];
        /* eslint-enable @typescript-eslint/no-explicit-any */

        setSku(initialSku);
        setName(initialName);
        setSlug(initialSlug);
        setDescription(initialDescription);
        setShortDescription(initialShortDescription);
        setProductType(initialProductType);
        setBasePrice(initialBasePrice);
        setCustomizationFee(initialCustomizationFee);
        setProductionDaysMin(initialProductionDaysMin);
        setProductionDaysMax(initialProductionDaysMax);
        setIsFeatured(initialIsFeatured);
        setProductImages(initialExistingImages);
        setVariants(initialVariants);
        setEditSnapshot({
            sku: initialSku,
            name: initialName,
            slug: initialSlug,
            description: initialDescription,
            shortDescription: initialShortDescription,
            productType: initialProductType,
            basePrice: initialBasePrice,
            customizationFee: initialCustomizationFee,
            productionDaysMin: initialProductionDaysMin,
            productionDaysMax: initialProductionDaysMax,
            productImages: initialExistingImages.map((img: ProductImageItem) => ({
                id: img.id,
                url: img.url,
                bucket: img.bucket,
                storage_path: img.storage_path,
                alt_text: img.alt_text,
                is_primary: img.is_primary
            })),
            variants: initialVariants,
            isFeatured: initialIsFeatured,
        });
    }, [product]);

    const hasChanges = useMemo(() => {
        if (!product?.id || !editSnapshot) {
            return true;
        }

        const currentSnapshot: EditSnapshot = {
            sku,
            name,
            slug,
            description,
            shortDescription,
            productType,
            basePrice,
            customizationFee,
            productionDaysMin,
            productionDaysMax,
            productImages: productImages.map((img: ProductImageItem) => ({
                id: img.id,
                url: img.url,
                bucket: img.bucket,
                storage_path: img.storage_path,
                alt_text: img.alt_text,
                is_primary: img.is_primary
            })),
            variants,
            isFeatured,
        };

        return JSON.stringify(currentSnapshot) !== JSON.stringify(editSnapshot);
    }, [
        product?.id,
        editSnapshot,
        sku,
        name,
        slug,
        description,
        shortDescription,
        productType,
        basePrice,
        customizationFee,
        productionDaysMin,
        productionDaysMax,
        productImages,
        variants,
        isFeatured,
    ]);

    const handleNameChange = (value: string) => {
        setName(value);
        if (!slug || slug === generatedSlug) {
            setSlug(slugify(value));
        }
    };

    const handleFilesChange = (files: FileList | null) => {
        if (!files) return;
        const newItems: ProductImageItem[] = Array.from(files).map((file) => ({
            url: URL.createObjectURL(file),
            file: file,
            alt_text: name.trim() || "Product image",
            is_primary: false,
        }));
        setProductImages((prev) => {
            const updated = [...prev, ...newItems];
            // Ensure first is primary if none are primary
            if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
                updated[0].is_primary = true;
            }
            return updated;
        });
    };

    const removeImage = (index: number) => {
        setProductImages((prev) => {
            const removedItem = prev[index];
            if (removedItem?.file && removedItem.url.startsWith("blob:")) {
                URL.revokeObjectURL(removedItem.url);
            }
            const updated = prev.filter((_, i) => i !== index);
            // Ensure there's a primary image
            if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
                updated[0].is_primary = true;
            }
            return updated;
        });
    };

    const moveImage = (index: number, direction: "left" | "right") => {
        setProductImages((prev) => {
            const nextIdx = direction === "left" ? index - 1 : index + 1;
            if (nextIdx < 0 || nextIdx >= prev.length) return prev;
            const updated = [...prev];
            const temp = updated[index];
            updated[index] = updated[nextIdx];
            updated[nextIdx] = temp;

            // Re-apply primary and sort_order implicitly based on index
            return updated.map((img, idx) => ({
                ...img,
                is_primary: idx === 0,
            }));
        });
    };

    const handleCrop = (croppedFile: File) => {
        if (croppingTargetIdx === null) return;
        setProductImages((prev) => {
            const updated = [...prev];
            const target = updated[croppingTargetIdx];
            if (target.file && target.url.startsWith("blob:")) {
                URL.revokeObjectURL(target.url);
            }
            updated[croppingTargetIdx] = {
                ...target,
                url: URL.createObjectURL(croppedFile),
                file: croppedFile,
            };
            return updated;
        });
        setCroppingTargetIdx(null);
    };

    const handleVariantChange = (index: number, field: keyof VariantDraft, value: string) => {
        setVariants((current) =>
            current.map((variant, variantIndex) =>
                variantIndex === index ? { ...variant, [field]: value } : variant
            )
        );
    };

    const addVariant = () => {
        setVariants((current) => [...current, initialVariant()]);
    };

    const removeVariant = (index: number) => {
        setVariants((current) => current.filter((_, variantIndex) => variantIndex !== index));
    };

    const resetForm = () => {
        setSku("");
        setName("");
        setSlug("");
        setDescription("");
        setShortDescription("");
        setProductType(PRODUCT_TYPE.NORMAL);
        setBasePrice("0");
        setCustomizationFee("0");
        setProductionDaysMin("3");
        setProductionDaysMax("7");
        setIsFeatured(false);
        setProductImages([]);
        setVariants([initialVariant()]);
        setEditSnapshot(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!sku.trim() || !name.trim() || !description.trim()) {
            toast.error(t("adminProducts.dialog.fieldsRequired"));
            return;
        }

        if (!slug.trim()) {
            toast.error(t("adminProducts.dialog.slugRequired"));
            return;
        }

        const normalizedVariants: ProductVariantInput[] = variants
            .map((variant) => ({
                id: variant.id,
                sku_suffix: variant.sku_suffix.trim(),
                size: variant.size.trim() || undefined,
                color_name: variant.color_name.trim() || undefined,
                additional_price: Number(variant.additional_price || 0),
                stock_qty: Number(variant.stock_qty || 0),
                is_active: true,
            }))
            .filter((variant) => variant.sku_suffix.length > 0);

        if (!normalizedVariants.length) {
            toast.error(t("adminProducts.dialog.variantRequired"));
            return;
        }

        const loadingId = toast.loading(product?.id ? t("adminProducts.dialog.updating") : t("adminProducts.dialog.creating"));
        setIsSubmitting(true);

        try {
            // Filter out newly added files
            const filesToUpload = productImages.filter((img) => img.file).map((img) => img.file as File);
            const uploadedImages = filesToUpload.length ? await uploadProductImages(filesToUpload) : [];

            // Construct final images in exact sorted order
            let uploadedIdx = 0;
            const finalImages = productImages.map((img, idx) => {
                if (img.file) {
                    const uploaded = uploadedImages[uploadedIdx++];
                    return {
                        bucket: uploaded.bucket,
                        url: uploaded.url,
                        storage_path: uploaded.storage_path,
                        original_name: undefined,
                        mime_type: undefined,
                        size: undefined,
                        alt_text: name.trim(),
                        is_primary: idx === 0,
                        sort_order: idx,
                    };
                } else {
                    return {
                        id: img.id,
                        bucket: img.bucket || "",
                        url: img.url,
                        storage_path: img.storage_path || img.url,
                        original_name: undefined,
                        mime_type: undefined,
                        size: undefined,
                        alt_text: img.alt_text ?? name.trim(),
                        is_primary: idx === 0,
                        sort_order: idx,
                    };
                }
            });

            if (product?.id) {
                await updateProduct(product.id as string, {
                    product: {
                        sku: sku.trim(),
                        name: name.trim(),
                        slug: slug.trim(),
                        description: description.trim(),
                        short_description: shortDescription.trim() || undefined,
                        product_type: productType,
                        base_price: Number(basePrice || 0),
                        customization_fee: Number(customizationFee || 0),
                        production_days_min: Number(productionDaysMin || 0),
                        production_days_max: Number(productionDaysMax || 0),
                        is_active: true,
                        is_featured: isFeatured,
                    },
                    images: finalImages,
                    variants: normalizedVariants,
                });

                toast.success(t("adminProducts.dialog.updated"), { id: loadingId });
            } else {
                const createdResponse = await createProduct({
                    product: {
                        sku: sku.trim(),
                        name: name.trim(),
                        slug: slug.trim(),
                        description: description.trim(),
                        short_description: shortDescription.trim() || undefined,
                        product_type: productType,
                        base_price: Number(basePrice || 0),
                        customization_fee: Number(customizationFee || 0),
                        production_days_min: Number(productionDaysMin || 0),
                        production_days_max: Number(productionDaysMax || 0),
                        is_active: true,
                        is_featured: isFeatured,
                    },
                    images: finalImages,
                    variants: normalizedVariants,
                });

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const createdProductId = (createdResponse as any)?.product?.id;
                if (createdProductId) {
                    await getProductById(createdProductId);
                }

                if (!onSaved) {
                    window.location.reload();
                    return;
                }

                toast.success(t("adminProducts.dialog.created"), { id: loadingId });
            }

            if (!product?.id) resetForm();
            setActualOpen(false);
            router.refresh();
            await onSaved?.();
        } catch (error) {
            const message = error instanceof Error ? error.message : t("adminDiscounts.saveError");
            toast.error(message, { id: loadingId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={actualOpen} onOpenChange={setActualOpen}>
            {!controlled && (
                <DialogTrigger asChild>
                    <Button
                        variant="primary"
                        size="md"
                        type="button"
                        className={`w-full rounded-full py-3 text-sm transition-colors ${compact ? "justify-center px-3" : "gap-3 px-4"}`}
                        aria-label={compact ? t("adminProducts.dialog.newProduct") : undefined}
                    >
                        <IconPlus className="h-5 w-5 shrink-0" stroke={2} />
                        {compact ? null : product?.id ? t("adminProducts.dialog.editProduct") : t("adminProducts.dialog.newProduct")}
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{product?.id ? t("adminProducts.dialog.editProductHeader") : t("adminProducts.dialog.createProduct")}</DialogTitle>
                    <DialogDescription>
                        {product?.id
                            ? t("adminProducts.dialog.editDesc")
                            : t("adminProducts.dialog.createDesc")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <DialogBody className="space-y-8">
                        <section className="grid gap-4 md:grid-cols-2">
                            <Input
                                label={t("adminProducts.dialog.sku")}
                                id="product-sku"
                                value={sku}
                                onChange={(event) => setSku(event.target.value)}
                                placeholder="AXO-001"
                            />
                            <Input
                                label={t("adminProducts.dialog.name")}
                                id="product-name"
                                value={name}
                                onChange={(event) => handleNameChange(event.target.value)}
                                placeholder="Rosie the Axolotl"
                            />
                            <Input
                                label={t("adminProducts.dialog.slug")}
                                id="product-slug"
                                value={slug}
                                onChange={(event) => setSlug(event.target.value)}
                                placeholder={generatedSlug || "rosie-the-axolotl"}
                                helperText={t("adminProducts.dialog.slugHelper")}
                            />
                            <Input
                                label={t("adminProducts.dialog.basePrice")}
                                id="product-base-price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={basePrice}
                                onChange={(event) => setBasePrice(event.target.value)}
                                placeholder="64.00"
                            />
                            <Input
                                label={t("adminProducts.dialog.customizationFee")}
                                id="product-customization-fee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={customizationFee}
                                onChange={(event) => setCustomizationFee(event.target.value)}
                                placeholder="0.00"
                            />
                            <Input
                                label={t("adminProducts.dialog.productionDaysMin")}
                                id="product-production-min"
                                type="number"
                                min="0"
                                value={productionDaysMin}
                                onChange={(event) => setProductionDaysMin(event.target.value)}
                                placeholder="3"
                            />
                            <Input
                                label={t("adminProducts.dialog.productionDaysMax")}
                                id="product-production-max"
                                type="number"
                                min="0"
                                value={productionDaysMax}
                                onChange={(event) => setProductionDaysMax(event.target.value)}
                                placeholder="7"
                            />
                             <div className="space-y-2">
                                <span className="ml-1 block text-sm font-headline font-bold text-on-surface">
                                    {t("adminProducts.dialog.productType")}
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            disabled={productType === "ai_base"}
                                            variant="secondary"
                                            className="flex w-full items-center justify-between rounded-xl bg-surface-container-low px-6 py-4 font-body font-normal text-on-surface outline-none transition-all hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span>
                                                {productType === PRODUCT_TYPE.NORMAL
                                                    ? t("adminProducts.dialog.typeOptions.normal")
                                                    : productType === "ai_base"
                                                    ? "AI Base"
                                                    : t("adminProducts.dialog.typeOptions.addons")}
                                            </span>
                                            <IconChevronDown className="h-5 w-5 text-secondary" stroke={2} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
                                        className="bg-surface-container-highest border border-outline-variant rounded-xl shadow-lg p-1 z-100"
                                    >
                                        <DropdownMenuRadioGroup
                                            value={productType}
                                            onValueChange={(val) => setProductType(val as ProductType)}
                                        >
                                            <DropdownMenuRadioItem
                                                value={PRODUCT_TYPE.NORMAL}
                                                className="rounded-lg py-2 pl-8 pr-3 font-body text-sm cursor-pointer hover:bg-surface-container-low"
                                            >
                                                {t("adminProducts.dialog.typeOptions.normal")}
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem
                                                value={PRODUCT_TYPE.ADD_ONS}
                                                className="rounded-lg py-2 pl-8 pr-3 font-body text-sm cursor-pointer hover:bg-surface-container-low"
                                            >
                                                {t("adminProducts.dialog.typeOptions.addons")}
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-container-low px-6 py-4 text-sm text-secondary h-fit self-end">
                                <span className="relative flex h-4 w-4 items-center justify-center rounded-sm bg-surface-container-highest">
                                    <Checkbox
                                        id="product-is-featured"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                    />
                                    <span className="absolute inset-0 rounded-sm bg-surface-container-highest ring-1 ring-transparent transition peer-checked:bg-primary-fixed peer-checked:ring-primary-fixed" />
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 12 10"
                                        className="relative h-3 w-3 opacity-0 transition peer-checked:opacity-100"
                                        fill="none"
                                    >
                                        <path d="M1 5L4.2 8L11 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <span className="font-headline font-bold text-on-surface select-none">
                                    {t("adminProducts.dialog.isFeatured") || "Featured Product"}
                                </span>
                            </label>
                        </section>

                        <section className="space-y-2">
                            <label
                                htmlFor="product-description"
                                className="ml-1 block text-sm font-headline font-bold text-on-surface"
                            >
                                {t("adminProducts.dialog.description")}
                            </label>
                            <textarea
                                id="product-description"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                rows={5}
                                placeholder={t("adminProducts.dialog.descriptionPlaceholder")}
                                className="w-full rounded-xl border-none bg-surface-container-low px-6 py-4 font-body text-on-surface outline-none transition-all placeholder:text-secondary focus:bg-surface-container-highest focus:ring-2 focus:ring-primary"
                            />
                        </section>

                        <section className="space-y-2">
                            <label
                                htmlFor="product-short-description"
                                className="ml-1 block text-sm font-headline font-bold text-on-surface"
                            >
                                {t("adminProducts.dialog.shortDescription")}
                            </label>
                            <textarea
                                id="product-short-description"
                                value={shortDescription}
                                onChange={(event) => setShortDescription(event.target.value)}
                                rows={3}
                                placeholder={t("adminProducts.dialog.shortDescriptionPlaceholder")}
                                className="w-full rounded-xl border-none bg-surface-container-low px-6 py-4 font-body text-on-surface outline-none transition-all placeholder:text-secondary focus:bg-surface-container-highest focus:ring-2 focus:ring-primary"
                            />
                        </section>

                        <section className="space-y-3 rounded-[1.5rem] bg-surface-container-highest p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-headline text-lg font-black text-on-surface">{t("adminProducts.dialog.images")}</h3>
                                    <p className="text-sm text-secondary">
                                        {t("adminProducts.dialog.imagesDesc")}
                                    </p>
                                </div>
                            </div>
                            {productImages.length > 0 && (
                                <div className="flex gap-4 overflow-x-auto py-3 px-1 scrollbar-thin scrollbar-thumb-outline-variant">
                                    {productImages.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low transition-all hover:shadow-md"
                                        >
                                            <Image
                                                src={img.url}
                                                alt={img.alt_text ?? `image-${idx}`}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                sizes="112px"
                                            />

                                            {/* Primary Cover Badge */}
                                            {idx === 0 && (
                                                <span className="absolute left-1 top-1 z-20 rounded-full bg-primary px-2 py-0.5 font-headline text-[9px] font-black uppercase tracking-wider text-on-primary shadow-sm">
                                                    {t("adminProducts.dialog.primaryBadge")}
                                                </span>
                                            )}

                                            {/* Remove Button */}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute right-1 top-1 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-container-high/80 text-secondary hover:bg-error hover:text-on-error backdrop-blur-sm shadow-sm transition-all"
                                                aria-label={t("adminProducts.dialog.removeImage", { index: idx + 1 })}
                                            >
                                                <IconTrash className="h-3.5 w-3.5" stroke={2} />
                                            </button>

                                            {/* Hover Crop Trigger */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCroppingTargetIdx(idx);
                                                }}
                                                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-headline text-[10px] font-bold gap-1 cursor-pointer"
                                            >
                                                <IconCrop className="h-5 w-5 text-white animate-pulse" stroke={2} />
                                                <span>{t("adminProducts.dialog.cropTitle")}</span>
                                            </button>

                                            {/* Sorting Controls */}
                                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full bg-black/60 p-0.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    type="button"
                                                    disabled={idx === 0}
                                                    onClick={() => moveImage(idx, "left")}
                                                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent"
                                                    aria-label={t("adminProducts.dialog.moveLeft")}
                                                >
                                                    <IconChevronLeft className="h-4 w-4" stroke={2.5} />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={idx === productImages.length - 1}
                                                    onClick={() => moveImage(idx, "right")}
                                                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent"
                                                    aria-label={t("adminProducts.dialog.moveRight")}
                                                >
                                                    <IconChevronRight className="h-4 w-4" stroke={2.5} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                multiple
                                onChange={(event) => handleFilesChange(event.target.files)}
                                className="block w-full rounded-xl border border-dashed border-outline-variant bg-surface px-4 py-4 text-sm text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-headline file:font-bold file:text-on-primary hover:file:bg-primary-container animate-fade-in"
                            />
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-headline text-lg font-black text-on-surface">{t("adminProducts.dialog.variants")}</h3>
                                    <p className="text-sm text-secondary">
                                        {t("adminProducts.dialog.variantsDesc")}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={addVariant}
                                    className="rounded-full bg-surface-container-high px-4 py-2 text-sm hover:bg-surface-container-highest"
                                >
                                    {t("adminProducts.dialog.addVariant")}
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {variants.map((variant, index) => {
                                    const isExistingVariant = Boolean(variant.id);
                                    return (
                                        <div
                                            key={index}
                                            className="grid gap-4 rounded-[1.25rem] bg-surface-container-highest p-4 md:grid-cols-5"
                                        >
                                            <Input
                                                label={t("adminProducts.dialog.skuSuffix")}
                                                id={`variant-sku-${index}`}
                                                value={variant.sku_suffix}
                                                onChange={(event) =>
                                                    handleVariantChange(index, "sku_suffix", event.target.value)
                                                }
                                                placeholder="001-A"
                                                disabled={isExistingVariant}
                                            />
                                            <Input
                                                label={t("adminProducts.dialog.size")}
                                                id={`variant-size-${index}`}
                                                value={variant.size}
                                                onChange={(event) => handleVariantChange(index, "size", event.target.value)}
                                                placeholder="M"
                                                disabled={isExistingVariant}
                                            />
                                            <Input
                                                label={t("adminProducts.dialog.color")}
                                                id={`variant-color-${index}`}
                                                value={variant.color_name}
                                                onChange={(event) =>
                                                    handleVariantChange(index, "color_name", event.target.value)
                                                }
                                                placeholder="Blue"
                                                disabled={isExistingVariant}
                                            />
                                            <Input
                                                label={t("adminProducts.dialog.additionalPrice")}
                                                id={`variant-price-${index}`}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={variant.additional_price}
                                                onChange={(event) =>
                                                    handleVariantChange(index, "additional_price", event.target.value)
                                                }
                                                placeholder="0"
                                            />
                                            <div className="flex items-end gap-3">
                                                <div className="flex-1">
                                                    <Input
                                                        label={t("adminProducts.dialog.stockQty")}
                                                        id={`variant-stock-${index}`}
                                                        type="number"
                                                        min="0"
                                                        value={variant.stock_qty}
                                                        onChange={(event) =>
                                                            handleVariantChange(index, "stock_qty", event.target.value)
                                                        }
                                                        placeholder="0"
                                                    />
                                                </div>
                                                {variants.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => removeVariant(index)}
                                                        className="h-12 w-12 rounded-full px-0 py-0 text-secondary hover:text-error"
                                                        aria-label={t("adminProducts.dialog.removeVariant", { index: index + 1 })}
                                                    >
                                                        <IconTrash className="h-4 w-4" stroke={2} />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </DialogBody>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => setActualOpen(false)}
                            className="rounded-full px-6 py-3 text-sm hover:bg-surface-container-highest"
                        >
                            {t("adminDiscounts.form.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={isSubmitting || (Boolean(product?.id) && !hasChanges) || productType === "ai_base"}
                            className="rounded-full px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (product?.id ? t("adminProducts.dialog.updating") : t("adminProducts.dialog.creating")) : product?.id ? t("adminProducts.dialog.editProduct") : t("adminProducts.dialog.newProduct")}
                        </Button>
                    </DialogFooter>
                </form>
                {/* Absolute overlay ImageCropper to prevent Radix Dialog portal overlaps */}
                {croppingTargetIdx !== null && (
                    <div className="absolute inset-0 z-50 bg-surface p-6 flex flex-col rounded-2xl animate-fade-in">
                        <ImageCropper
                            imageUrl={cropperImageUrl}
                            onCancel={() => setCroppingTargetIdx(null)}
                            onCrop={handleCrop}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
