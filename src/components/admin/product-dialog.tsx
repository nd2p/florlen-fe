"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconPlus, IconTrash, IconChevronDown } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
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

type VariantDraft = {
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
    existingImages: { id?: string; url: string; bucket?: string | null; storage_path?: string | null; alt_text?: string | null; is_primary?: boolean }[];
    variants: VariantDraft[];
    imageFilesCount: number;
};

const initialVariant = (): VariantDraft => ({
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
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<{ id?: string; url: string; bucket?: string | null; storage_path?: string | null; alt_text?: string | null; is_primary?: boolean }[]>([]);
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
                ? (product as any).product_variants.map((variant: any) => ({
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
        setImageFiles([]);
        setExistingImages(initialExistingImages);
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
            existingImages: initialExistingImages,
            variants: initialVariants,
            imageFilesCount: 0,
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
            existingImages,
            variants,
            imageFilesCount: imageFiles.length,
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
        existingImages,
        variants,
        imageFiles,
    ]);

    const handleNameChange = (value: string) => {
        setName(value);
        if (!slug || slug === generatedSlug) {
            setSlug(slugify(value));
        }
    };

    const handleFilesChange = (files: FileList | null) => {
        setImageFiles(files ? Array.from(files) : []);
    };

    const removeExistingImage = (index: number) => {
        setExistingImages((current) => current.filter((_, i) => i !== index));
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
        setImageFiles([]);
        setExistingImages([]);
        setVariants([initialVariant()]);
        setEditSnapshot(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!sku.trim() || !name.trim() || !description.trim()) {
            toast.error("SKU, name, and description are required.");
            return;
        }

        if (!slug.trim()) {
            toast.error("Slug is required.");
            return;
        }

        const normalizedVariants: ProductVariantInput[] = variants
            .map((variant) => ({
                sku_suffix: variant.sku_suffix.trim(),
                size: variant.size.trim() || undefined,
                color_name: variant.color_name.trim() || undefined,
                additional_price: Number(variant.additional_price || 0),
                stock_qty: Number(variant.stock_qty || 0),
                is_active: true,
            }))
            .filter((variant) => variant.sku_suffix.length > 0);

        if (!normalizedVariants.length) {
            toast.error("Add at least one variant with a SKU suffix.");
            return;
        }

        const loadingId = toast.loading(product?.id ? "Updating product..." : "Creating product...");
        setIsSubmitting(true);

        try {
            const uploadedImages = imageFiles.length ? await uploadProductImages(imageFiles) : [];

            const preservedImages = existingImages.map((img, idx) => ({
                id: img.id,
                bucket: img.bucket || '',
                url: img.url,
                storage_path: img.storage_path || img.url,
                original_name: undefined,
                mime_type: undefined,
                size: undefined,
                alt_text: img.alt_text ?? name.trim(),
                is_primary: img.is_primary ?? idx === 0,
                sort_order: idx,
            }));

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
                    },
                    images: [
                        ...preservedImages,
                        ...uploadedImages.map((image, index) => ({
                            ...image,
                            is_primary: preservedImages.length === 0 ? index === 0 : false,
                            alt_text: name.trim(),
                            sort_order: preservedImages.length + index,
                        })),
                    ],
                    variants: normalizedVariants,
                });

                toast.success("Product updated.", { id: loadingId });
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
                    },
                    images: uploadedImages.map((image, index) => ({
                        ...image,
                        is_primary: index === 0,
                        alt_text: name.trim(),
                        sort_order: index,
                    })),
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

                toast.success("Product created successfully.", { id: loadingId });
            }

            if (!product?.id) resetForm();
            setActualOpen(false);
            router.refresh();
            await onSaved?.();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save product.";
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
                        aria-label={compact ? "Add New Product" : undefined}
                    >
                        <IconPlus className="h-5 w-5 shrink-0" stroke={2} />
                        {compact ? null : product?.id ? "Edit Product" : "Add New Product"}
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{product?.id ? "Edit product" : "Create a new product"}</DialogTitle>
                    <DialogDescription>
                        {product?.id
                            ? "Update product details and optionally upload new images."
                            : "Upload images first, then the dialog will submit the returned storage URLs with the product create request."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <DialogBody className="space-y-8">
                        <section className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="SKU"
                                id="product-sku"
                                value={sku}
                                onChange={(event) => setSku(event.target.value)}
                                placeholder="AXO-001"
                            />
                            <Input
                                label="Name"
                                id="product-name"
                                value={name}
                                onChange={(event) => handleNameChange(event.target.value)}
                                placeholder="Rosie the Axolotl"
                            />
                            <Input
                                label="Slug"
                                id="product-slug"
                                value={slug}
                                onChange={(event) => setSlug(event.target.value)}
                                placeholder={generatedSlug || "rosie-the-axolotl"}
                                helperText="Used in URLs and internal lookup."
                            />
                            <Input
                                label="Base Price"
                                id="product-base-price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={basePrice}
                                onChange={(event) => setBasePrice(event.target.value)}
                                placeholder="64.00"
                            />
                            <Input
                                label="Customization Fee"
                                id="product-customization-fee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={customizationFee}
                                onChange={(event) => setCustomizationFee(event.target.value)}
                                placeholder="0.00"
                            />
                            <Input
                                label="Production Days Min"
                                id="product-production-min"
                                type="number"
                                min="0"
                                value={productionDaysMin}
                                onChange={(event) => setProductionDaysMin(event.target.value)}
                                placeholder="3"
                            />
                            <Input
                                label="Production Days Max"
                                id="product-production-max"
                                type="number"
                                min="0"
                                value={productionDaysMax}
                                onChange={(event) => setProductionDaysMax(event.target.value)}
                                placeholder="7"
                            />
                            <div className="space-y-2">
                                <span className="ml-1 block text-sm font-headline font-bold text-on-surface">
                                    Product Type
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="flex w-full items-center justify-between rounded-xl bg-surface-container-low px-6 py-4 font-body font-normal text-on-surface outline-none transition-all hover:bg-surface-container-highest"
                                        >
                                            <span>
                                                {productType === PRODUCT_TYPE.NORMAL ? "Normal" : "Add-ons"}
                                            </span>
                                            <IconChevronDown className="h-5 w-5 text-secondary" stroke={2} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
                                        className="bg-surface-container-highest border border-outline-variant rounded-xl shadow-lg p-1 z-[100]"
                                    >
                                        <DropdownMenuRadioGroup
                                            value={productType}
                                            onValueChange={(val) => setProductType(val as ProductType)}
                                        >
                                            <DropdownMenuRadioItem
                                                value={PRODUCT_TYPE.NORMAL}
                                                className="rounded-lg py-2 pl-8 pr-3 font-body text-sm cursor-pointer hover:bg-surface-container-low"
                                            >
                                                Normal
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem
                                                value={PRODUCT_TYPE.ADD_ONS}
                                                className="rounded-lg py-2 pl-8 pr-3 font-body text-sm cursor-pointer hover:bg-surface-container-low"
                                            >
                                                Add-ons
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </section>

                        <section className="space-y-2">
                            <label
                                htmlFor="product-description"
                                className="ml-1 block text-sm font-headline font-bold text-on-surface"
                            >
                                Description
                            </label>
                            <textarea
                                id="product-description"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                rows={5}
                                placeholder="Describe the product in detail..."
                                className="w-full rounded-xl border-none bg-surface-container-low px-6 py-4 font-body text-on-surface outline-none transition-all placeholder:text-secondary focus:bg-surface-container-highest focus:ring-2 focus:ring-primary"
                            />
                        </section>

                        <section className="space-y-2">
                            <label
                                htmlFor="product-short-description"
                                className="ml-1 block text-sm font-headline font-bold text-on-surface"
                            >
                                Short Description
                            </label>
                            <textarea
                                id="product-short-description"
                                value={shortDescription}
                                onChange={(event) => setShortDescription(event.target.value)}
                                rows={3}
                                placeholder="Optional short summary for cards and previews."
                                className="w-full rounded-xl border-none bg-surface-container-low px-6 py-4 font-body text-on-surface outline-none transition-all placeholder:text-secondary focus:bg-surface-container-highest focus:ring-2 focus:ring-primary"
                            />
                        </section>

                        <section className="space-y-3 rounded-[1.5rem] bg-surface-container-highest p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-headline text-lg font-black text-on-surface">Images</h3>
                                    <p className="text-sm text-secondary">
                                        Select one or more JPEG/PNG files. The API will upload them first.
                                    </p>
                                </div>
                            </div>
                            {existingImages.length > 0 && (
                                <div className="flex gap-3 overflow-x-auto py-2">
                                    {existingImages.map((img, idx) => (
                                        <div key={idx} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                                            <Image src={img.url} alt={img.alt_text ?? `image-${idx}`} fill className="object-cover" sizes="96px" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(idx)}
                                                className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-high text-secondary hover:bg-error hover:text-on-error"
                                                aria-label={`Remove image ${idx + 1}`}
                                            >
                                                <IconTrash className="h-4 w-4" stroke={2} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                multiple
                                onChange={(event) => handleFilesChange(event.target.files)}
                                className="block w-full rounded-xl border border-dashed border-outline-variant bg-surface px-4 py-4 text-sm text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-headline file:font-bold file:text-on-primary hover:file:bg-primary-container"
                            />
                            {imageFiles.length > 0 && (
                                <p className="text-sm text-secondary">{imageFiles.length} file(s) selected</p>
                            )}
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-headline text-lg font-black text-on-surface">Variants</h3>
                                    <p className="text-sm text-secondary">
                                        At least one variant is required by the backend.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={addVariant}
                                    className="rounded-full bg-surface-container-high px-4 py-2 text-sm hover:bg-surface-container-highest"
                                >
                                    Add Variant
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {variants.map((variant, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-4 rounded-[1.25rem] bg-surface-container-highest p-4 md:grid-cols-5"
                                    >
                                        <Input
                                            label="SKU Suffix"
                                            id={`variant-sku-${index}`}
                                            value={variant.sku_suffix}
                                            onChange={(event) =>
                                                handleVariantChange(index, "sku_suffix", event.target.value)
                                            }
                                            placeholder="001-A"
                                        />
                                        <Input
                                            label="Size"
                                            id={`variant-size-${index}`}
                                            value={variant.size}
                                            onChange={(event) => handleVariantChange(index, "size", event.target.value)}
                                            placeholder="M"
                                        />
                                        <Input
                                            label="Color"
                                            id={`variant-color-${index}`}
                                            value={variant.color_name}
                                            onChange={(event) =>
                                                handleVariantChange(index, "color_name", event.target.value)
                                            }
                                            placeholder="Blue"
                                        />
                                        <Input
                                            label="Additional Price"
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
                                                    label="Stock Qty"
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
                                                    aria-label={`Remove variant ${index + 1}`}
                                                >
                                                    <IconTrash className="h-4 w-4" stroke={2} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
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
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={isSubmitting || (Boolean(product?.id) && !hasChanges)}
                            className="rounded-full px-6 py-3 text-sm"
                        >
                            {isSubmitting ? (product?.id ? "Updating..." : "Creating...") : product?.id ? "Update Product" : "Create Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
