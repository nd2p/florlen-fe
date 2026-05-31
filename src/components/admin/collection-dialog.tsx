"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Form from "next/form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { IconPlus, IconTrash, IconSearch, IconX, IconCrop } from "@tabler/icons-react";
import ImageCropper from "./image-cropper";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Checkbox from "@/components/ui/checkbox";
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
    type Collection,
    createCollection,
    updateCollection,
    uploadCollectionImages,
    syncCollectionProducts,
} from "@/lib/api/collection.api";
import { listProducts, type ProductListItem } from "@/lib/api/product.api";

// Helper hook for debouncing search input
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const CreateCollectionSchema = z.object({
    name: z.string().min(1, { message: "adminCollections.dialog.nameRequired" }),
    slug: z.string().min(1, { message: "adminCollections.dialog.slugRequired" }),
    description: z.string().optional(),
    collection_type: z.enum(["seasonal", "fandom", "event_drop", "permanent"]),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    is_featured: z.boolean(),
});

type CreateCollectionValues = z.infer<typeof CreateCollectionSchema>;

type CreateCollectionDialogProps = {
    compact?: boolean;
    collection?: Collection | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSaved?: () => void | Promise<void>;
    onCreated?: () => void; // Deprecated but kept for backwards comp
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const toIsoString = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
};

export default function CollectionDialog({
    compact = false,
    collection = null,
    open,
    onOpenChange,
    onSaved,
    onCreated,
}: CreateCollectionDialogProps) {
    const { t } = useTranslation("common");
    const router = useRouter();
    const [internalOpen, setInternalOpen] = useState(false);
    const controlled = typeof open === "boolean" && typeof onOpenChange === "function";

    const actualOpen = controlled ? open! : internalOpen;
    const setActualOpen = (v: boolean) => {
        if (controlled) onOpenChange!(v);
        else setInternalOpen(v);
    };

    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [existingCover, setExistingCover] = useState<string | null>(null);
    const [existingBanner, setExistingBanner] = useState<string | null>(null);

    // Cropper & preview states
    const [croppingType, setCroppingType] = useState<"cover" | "banner" | null>(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
    const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (coverFile) {
            const url = URL.createObjectURL(coverFile);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCoverPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setCoverPreviewUrl(existingCover);
            return undefined;
        }
    }, [coverFile, existingCover]);

    useEffect(() => {
        if (bannerFile) {
            const url = URL.createObjectURL(bannerFile);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBannerPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setBannerPreviewUrl(existingBanner);
            return undefined;
        }
    }, [bannerFile, existingBanner]);

    const cropperImageUrl = useMemo(() => {
        if (croppingType === "cover") return coverPreviewUrl;
        if (croppingType === "banner") return bannerPreviewUrl;
        return null;
    }, [croppingType, coverPreviewUrl, bannerPreviewUrl]);

    const handleCrop = (croppedFile: File) => {
        if (croppingType === "cover") {
            setCoverFile(croppedFile);
        } else if (croppingType === "banner") {
            setBannerFile(croppedFile);
        }
        setCroppingType(null);
    };

    const removeCover = () => {
        setCoverFile(null);
        setExistingCover(null);
    };

    const removeBanner = () => {
        setBannerFile(null);
        setExistingBanner(null);
    };

    // Products Selection State
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [searchResults, setSearchResults] = useState<ProductListItem[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<ProductListItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // For disabling save if no changes
    const [editSnapshot, setEditSnapshot] = useState<Record<string, unknown> | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<CreateCollectionValues>({
        resolver: zodResolver(CreateCollectionSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            collection_type: "seasonal",
            starts_at: "",
            ends_at: "",
            is_featured: false,
        },
    });

    useEffect(() => {
        if (!collection) {
            queueMicrotask(() => {
                setEditSnapshot(null);
                reset();
                setExistingCover(null);
                setExistingBanner(null);
                setSelectedProducts([]);
                setCoverFile(null);
                setBannerFile(null);
                setSearchQuery("");
                setCroppingType(null);
            });
            return;
        }

        const initialProducts = collection.collection_products?.map((cp) => cp.products).filter(Boolean) || [];

        queueMicrotask(() => {
            setValue("name", collection.name || "");
            setValue("slug", collection.slug || "");
            setValue("description", collection.description || "");
            setValue("collection_type", (collection.collection_type as import("@/lib/api/collection.api").CollectionType) || "seasonal");
            setValue("starts_at", collection.starts_at ? new Date(collection.starts_at).toISOString().slice(0, 16) : "");
            setValue("ends_at", collection.ends_at ? new Date(collection.ends_at).toISOString().slice(0, 16) : "");
            setValue("is_featured", collection.is_featured ?? false);

            setExistingCover(collection.cover_image_url || null);
            setExistingBanner(collection.banner_image_url || null);
            setSelectedProducts(initialProducts);
            setCoverFile(null);
            setBannerFile(null);
            setSearchQuery("");

            setEditSnapshot({
                name: collection.name || "",
                description: collection.description || "",
                collection_type: collection.collection_type || "seasonal",
                starts_at: collection.starts_at ? new Date(collection.starts_at).toISOString().slice(0, 16) : "",
                ends_at: collection.ends_at ? new Date(collection.ends_at).toISOString().slice(0, 16) : "",
                is_featured: collection.is_featured ?? false,
                existingCover: collection.cover_image_url || null,
                existingBanner: collection.banner_image_url || null,
                productIds: initialProducts.map((p) => p.id),
            });
        });
    }, [collection, reset, setValue]);

    const watchedValues = useWatch({ control });

    // Auto-generate slug when name changes for new collections
    const nameValue = watchedValues.name;
    const generatedSlug = useMemo(() => slugify(nameValue || ""), [nameValue]);

    const nameRegister = register("name", {
        onChange: (event) => {
            const nextName = event.target.value as string;
            if (!collection?.id) {
                setValue("slug", slugify(nextName), { shouldValidate: true });
            }
        },
    });

    const hasChanges = useMemo(() => {
        if (!collection?.id || !editSnapshot) return true;

        if (coverFile || bannerFile) return true;

        const currentSnapshot = {
            name: watchedValues.name,
            description: watchedValues.description || "",
            collection_type: watchedValues.collection_type,
            starts_at: watchedValues.starts_at || "",
            ends_at: watchedValues.ends_at || "",
            is_featured: watchedValues.is_featured,
            existingCover,
            existingBanner,
            productIds: selectedProducts.map(p => p.id),
        };

        return JSON.stringify(currentSnapshot) !== JSON.stringify(editSnapshot);
    }, [collection?.id, editSnapshot, watchedValues, existingCover, existingBanner, coverFile, bannerFile, selectedProducts]);

    useEffect(() => {
        if (!debouncedSearchQuery.trim()) {
            queueMicrotask(() => {
                setSearchResults([]);
            });
            return;
        }

        const fetchResults = async () => {
            setIsSearching(true);
            try {
                const response = await listProducts({ q: debouncedSearchQuery, limit: 10 });
                setSearchResults(response.products || []);
            } catch (error) {
                console.error("Failed to search products", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        fetchResults();
    }, [debouncedSearchQuery]);

    const addProduct = (product: ProductListItem) => {
        if (!selectedProducts.find((p) => p.id === product.id)) {
            setSelectedProducts((prev) => [...prev, product]);
        }
        setSearchQuery("");
    };

    const removeProduct = (id: string) => {
        setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
    };

    const onSubmit = async (values: CreateCollectionValues) => {
        const toastId = toast.loading(collection?.id ? t("adminCollections.dialog.updating") : t("adminCollections.dialog.creating"));

        try {
            let coverUrl: string | null = existingCover;
            let bannerUrl: string | null = existingBanner;

            if (coverFile) {
                const uploaded = await uploadCollectionImages([coverFile]);
                coverUrl = uploaded[0]?.url || null;
            }

            if (bannerFile) {
                const uploaded = await uploadCollectionImages([bannerFile]);
                bannerUrl = uploaded[0]?.url || null;
            }

            let savedId = collection?.id;

            if (savedId) {
                await updateCollection(savedId, {
                    name: values.name.trim(),
                    description: values.description?.trim() || undefined,
                    collection_type: values.collection_type,
                    is_featured: values.is_featured,
                    starts_at: toIsoString(values.starts_at) || undefined,
                    ends_at: toIsoString(values.ends_at) || undefined,
                    cover_image_url: coverUrl,
                    banner_image_url: bannerUrl,
                });
            } else {
                const response = await createCollection({
                    name: values.name.trim(),
                    slug: values.slug.trim(),
                    description: values.description?.trim() || undefined,
                    collection_type: values.collection_type,
                    is_featured: values.is_featured,
                    starts_at: toIsoString(values.starts_at) || undefined,
                    ends_at: toIsoString(values.ends_at) || undefined,
                    cover_image_url: coverUrl || undefined,
                    banner_image_url: bannerUrl || undefined,
                });
                savedId = response.collection?.id;
            }

            if (savedId) {
                await syncCollectionProducts(savedId, selectedProducts.map(p => p.id));
            }

            toast.success(collection?.id ? t("adminCollections.dialog.updated") : t("adminCollections.dialog.created"), { id: toastId });

            if (!collection?.id) {
                reset();
                setCoverFile(null);
                setBannerFile(null);
                setExistingCover(null);
                setExistingBanner(null);
                setSelectedProducts([]);
            }

            setActualOpen(false);

            if (onSaved) {
                await onSaved();
            } else {
                onCreated?.();
                router.refresh();
            }
        } catch (error) {
            console.error("Save collection error:", error);
            const message = error instanceof Error ? error.message : t("address.errorGeneric");
            toast.error(message, { id: toastId });
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
                        className={`rounded-full py-3 text-sm ${compact ? "px-3" : "px-5"}`}
                    >
                        <IconPlus className="h-4 w-4 shrink-0" stroke={2} />
                        {compact ? null : collection?.id ? t("adminCollections.dialog.editCollection") : t("adminCollections.dialog.newCollection")}
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{collection?.id ? t("adminCollections.dialog.editCollection") : t("adminCollections.dialog.createCollection")}</DialogTitle>
                    <DialogDescription>
                        {collection?.id ? t("adminCollections.dialog.editDesc") : t("adminCollections.dialog.createDesc")}
                    </DialogDescription>
                </DialogHeader>

                <Form action="#" onSubmit={handleSubmit(onSubmit)}>
                    <DialogBody className="space-y-8">
                        <section className="grid gap-4 md:grid-cols-2">
                            <Input
                                label={t("adminCollections.dialog.name")}
                                id="collection-name"
                                placeholder="Summer Drop 2026"
                                error={errors.name?.message ? t(errors.name.message) : undefined}
                                {...nameRegister}
                            />
                            <Input
                                label={t("adminCollections.dialog.slug")}
                                id="collection-slug"
                                placeholder={generatedSlug || "summer-drop-2026"}
                                helperText={collection?.id ? t("adminCollections.dialog.slugLocked") : t("adminCollections.dialog.slugDesc")}
                                error={errors.slug?.message ? t(errors.slug.message) : undefined}
                                disabled={!!collection?.id}
                                {...register("slug")}
                            />
                            <div className="space-y-2">
                                <label
                                    htmlFor="collection-type"
                                    className="ml-1 block text-sm font-headline font-bold text-on-surface"
                                >
                                    {t("adminCollections.dialog.type")}
                                </label>
                                <select
                                    id="collection-type"
                                    {...register("collection_type")}
                                    className="w-full rounded-xl border-none bg-surface-container-low px-6 py-4 font-body text-on-surface outline-none transition-all focus:bg-surface-container-highest focus:ring-2 focus:ring-primary"
                                >
                                    <option value="seasonal">{t("adminCollections.dialog.typeOptions.seasonal")}</option>
                                    <option value="fandom">{t("adminCollections.dialog.typeOptions.fandom")}</option>
                                    <option value="event_drop">{t("adminCollections.dialog.typeOptions.event_drop")}</option>
                                    <option value="permanent">{t("adminCollections.dialog.typeOptions.permanent")}</option>
                                </select>
                            </div>
                            <div className="hidden md:block" />
                            <Input
                                label={t("adminCollections.table.start")}
                                id="collection-start"
                                type="datetime-local"
                                error={errors.starts_at?.message ? t(errors.starts_at.message) : undefined}
                                {...register("starts_at")}
                            />
                            <Input
                                label={t("adminCollections.table.end")}
                                id="collection-end"
                                type="datetime-local"
                                error={errors.ends_at?.message ? t(errors.ends_at.message) : undefined}
                                {...register("ends_at")}
                            />
                        </section>

                        <section className="space-y-2">
                                <label
                                    htmlFor="collection-description"
                                    className="ml-1 block text-sm font-headline font-bold text-on-surface"
                                >
                                    {t("adminCollections.dialog.description")}
                                </label>
                                <textarea
                                    id="collection-description"
                                    rows={4}
                                    placeholder={t("adminCollections.dialog.descriptionPlaceholder")}
                                    className="w-full rounded-xl border-none bg-surface-container-low px-6 py-4 font-body text-on-surface outline-none transition-all placeholder:text-secondary focus:bg-surface-container-highest focus:ring-2 focus:ring-primary"
                                    {...register("description")}
                                />
                            </section>

                        <section className="grid gap-4 md:grid-cols-2">
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3 text-sm text-secondary">
                                <span className="relative flex h-4 w-4 items-center justify-center rounded-sm bg-surface-container-highest">
                                    <Checkbox {...register("is_featured")} />
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
                                <span>{t("adminCollections.dialog.featured")}</span>
                            </label>
                        </section>

                        <section className="space-y-3 rounded-[1.5rem] bg-surface-container-highest p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-headline text-lg font-black text-on-surface">{t("adminCollections.dialog.coverImage")}</h3>
                                    <p className="text-sm text-secondary">{t("adminCollections.dialog.coverDesc")}</p>
                                </div>
                            </div>
                            {coverPreviewUrl ? (
                                <div className="group relative h-32 w-48 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low transition-all hover:shadow-md">
                                    <Image src={coverPreviewUrl} alt="Cover Preview" fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="192px" />
                                    
                                    {/* Remove Button */}
                                    <button
                                        type="button"
                                        onClick={removeCover}
                                        className="absolute right-1.5 top-1.5 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-high/80 text-secondary hover:bg-error hover:text-on-error backdrop-blur-sm shadow-sm transition-all"
                                        aria-label={t("adminCollections.actions.delete")}
                                    >
                                        <IconTrash className="h-3.5 w-3.5" stroke={2} />
                                    </button>

                                    {/* Hover Crop Trigger */}
                                    <button
                                        type="button"
                                        onClick={() => setCroppingType("cover")}
                                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-headline text-[10px] font-bold gap-1 cursor-pointer"
                                    >
                                        <IconCrop className="h-5 w-5 text-white animate-pulse" stroke={2} />
                                        <span>{t("adminProducts.dialog.cropTitle")}</span>
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                                    className="block w-full rounded-xl border border-dashed border-outline-variant bg-surface px-4 py-4 text-sm text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-headline file:font-bold file:text-on-primary hover:file:bg-primary-container"
                                />
                            )}
                        </section>

                        <section className="space-y-3 rounded-[1.5rem] bg-surface-container-highest p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-headline text-lg font-black text-on-surface">{t("adminCollections.dialog.bannerImage")}</h3>
                                    <p className="text-sm text-secondary">{t("adminCollections.dialog.bannerDesc")}</p>
                                </div>
                            </div>
                            {bannerPreviewUrl ? (
                                <div className="group relative h-32 w-48 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low transition-all hover:shadow-md">
                                    <Image src={bannerPreviewUrl} alt="Banner Preview" fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="192px" />
                                    
                                    {/* Remove Button */}
                                    <button
                                        type="button"
                                        onClick={removeBanner}
                                        className="absolute right-1.5 top-1.5 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-high/80 text-secondary hover:bg-error hover:text-on-error backdrop-blur-sm shadow-sm transition-all"
                                        aria-label={t("adminCollections.actions.delete")}
                                    >
                                        <IconTrash className="h-3.5 w-3.5" stroke={2} />
                                    </button>

                                    {/* Hover Crop Trigger */}
                                    <button
                                        type="button"
                                        onClick={() => setCroppingType("banner")}
                                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-headline text-[10px] font-bold gap-1 cursor-pointer"
                                    >
                                        <IconCrop className="h-5 w-5 text-white animate-pulse" stroke={2} />
                                        <span>{t("adminProducts.dialog.cropTitle")}</span>
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={(event) => setBannerFile(event.target.files?.[0] || null)}
                                    className="block w-full rounded-xl border border-dashed border-outline-variant bg-surface px-4 py-4 text-sm text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-headline file:font-bold file:text-on-primary hover:file:bg-primary-container"
                                />
                            )}
                        </section>

                        <section className="space-y-3 rounded-[1.5rem] bg-surface-container-highest p-4">
                            <div>
                                <h3 className="font-headline text-lg font-black text-on-surface">{t("adminCollections.dialog.products")}</h3>
                                <p className="text-sm text-secondary">{t("adminCollections.dialog.productsDesc")}</p>
                            </div>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <IconSearch className="h-5 w-5 text-secondary" />
                                </div>
                                <input
                                    type="text"
                                    placeholder={t("adminCollections.dialog.searchPlaceholder")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-xl border-none bg-surface px-11 py-4 font-body text-on-surface outline-none transition-all placeholder:text-secondary focus:bg-surface-container-low focus:ring-2 focus:ring-primary"
                                />
                                {isSearching && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <span className="flex h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    </div>
                                )}
                            </div>

                            {searchResults.length > 0 && searchQuery && (
                                <div className="mt-2 divide-y divide-outline-variant overflow-hidden rounded-xl border border-outline-variant bg-surface">
                                    {searchResults.map((product) => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => addProduct(product)}
                                            className="flex w-full items-center justify-between p-3 text-left hover:bg-surface-container-low"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-headline text-sm font-bold text-on-surface">{product.name}</span>
                                                <span className="text-xs text-secondary">{product.sku}</span>
                                            </div>
                                            <IconPlus className="h-4 w-4 text-primary" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {selectedProducts.length > 0 && (
                                <div className="mt-4 flex flex-col gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">{t("adminCollections.dialog.selected", { count: selectedProducts.length })}</span>
                                    <div className="divide-y divide-outline-variant rounded-xl border border-outline-variant bg-surface">
                                        {selectedProducts.map((product) => (
                                            <div key={product.id} className="flex items-center justify-between p-3">
                                                <div className="flex flex-col">
                                                    <span className="font-headline text-sm font-bold text-on-surface">{product.name}</span>
                                                    <span className="text-xs text-secondary">{product.sku}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeProduct(product.id)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full text-secondary hover:bg-error/10 hover:text-error"
                                                >
                                                    <IconX className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    </DialogBody>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => setActualOpen(false)}
                            className="rounded-full px-6 py-3 text-sm"
                        >
                            {t("form.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={isSubmitting || (!!collection?.id && !hasChanges)}
                            className="rounded-full px-6 py-3 text-sm"
                        >
                            {isSubmitting ? (collection?.id ? t("adminCollections.dialog.updating") : t("adminCollections.dialog.creating")) : collection?.id ? t("adminCollections.dialog.editCollection") : t("adminCollections.dialog.newCollection")}
                        </Button>
                    </DialogFooter>
                </Form>
                {/* Absolute overlay ImageCropper to prevent Radix Dialog portal overlaps */}
                {croppingType !== null && (
                    <div className="absolute inset-0 z-50 bg-surface p-6 flex flex-col rounded-2xl animate-fade-in">
                        <ImageCropper
                            imageUrl={cropperImageUrl}
                            aspectRatio={16 / 9}
                            onCancel={() => setCroppingType(null)}
                            onCrop={handleCrop}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
