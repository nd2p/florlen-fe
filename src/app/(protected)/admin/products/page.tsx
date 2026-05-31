'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { IconCircleCheck, IconDownload, IconEdit, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import DataTable, { TableColumn, TableAction } from '@/components/admin/data-table';
import ProductDialog from '@/components/admin/product-dialog';
import Badge from '@/components/ui/badge';
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
import {
    deleteProduct,
    listProducts,
    updateProduct,
    type ProductImage,
    type ProductListItem,
    type ProductVariant,
    type ProductType,
} from '@/lib/api/product.api';

type ProductRow = {
    id: string;
    name: string;
    sku: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    customizationFee: number;
    productionDaysMin: number;
    productionDaysMax: number;
    type: ProductType | null;
    isActive: boolean;
    images: ProductImage[] | null;
    variants: ProductVariant[] | null;
    stock: number | null;
    isFeatured: boolean;
};

const formatCurrency = (value: number) =>
    Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const formatType = (value?: ProductType | null, t?: (key: string) => string) => {
    if (!value) return t ? t('adminProducts.table.unassigned') : 'Unassigned';
    if (value === 'ai_base') return t ? t('adminProducts.table.aiBase') : 'AI Base';
    if (value === 'add_ons') return t ? t('adminProducts.table.addons') : 'Add-ons';
    return t ? t('adminProducts.table.normal') : 'Normal';
};

const formatStatus = (isActive: boolean, t?: (key: string) => string) =>
    isActive ? (
        <Badge variant="active">{t ? t('adminProducts.table.active') : 'Active'}</Badge>
    ) : (
        <Badge variant="inactive">{t ? t('adminProducts.table.inactive') : 'Inactive'}</Badge>
    );

const getPrimaryImage = (images?: ProductImage[]) => {
    if (!images || images.length === 0) return null;
    const primary = images.find((image) => image.is_primary);
    return primary?.url || images[0]?.url || null;
};

export default function ProductsPage() {
    const { t } = useTranslation('common');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<ProductListItem> | null>(null);
    const [productToDelete, setProductToDelete] = useState<ProductRow | null>(null);
    const [productToActivate, setProductToActivate] = useState<ProductRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [selectedType, setSelectedType] = useState<ProductType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await listProducts({ limit: 100 });
            const rows = response.products.map((product: ProductListItem) => ({
                id: product.id,
                name: product.name,
                sku: product.sku,
                slug: product.slug ?? '',
                description: product.description ?? '',
                shortDescription: product.short_description ?? '',
                price: Number(product.base_price || 0),
                customizationFee: Number(product.customization_fee || 0),
                productionDaysMin: Number(product.production_days_min || 0),
                productionDaysMax: Number(product.production_days_max || 0),
                type: product.product_type ?? null,
                isActive: Boolean(product.is_active),
                images: product.product_images ?? null,
                variants: product.product_variants ?? null,
                stock:
                    typeof product.available_stock === 'number'
                        ? product.available_stock
                        : null,
                isFeatured: Boolean(product.is_featured),
            }));
            setProducts(rows);
        } catch (error) {
            console.error('Load products error:', error);
            const message = error instanceof Error ? error.message : t('adminProducts.dialog.loadError');
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadProducts();
    }, [loadProducts]);

    const filteredByType = selectedType
        ? products.filter((product) => product.type === selectedType)
        : products;

    const typeOptions = Array.from(
        new Set(products.map((product) => product.type).filter(Boolean))
    ) as ProductType[];

    const columns: TableColumn<ProductRow>[] = [
        {
            key: 'name',
            label: t('adminProducts.table.product'),
            render: (_, row) => {
                const primary = getPrimaryImage(row.images ?? undefined);
                return (
                    <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-container-highest">
                            {primary ? (
                                <Image
                                    src={primary}
                                    alt={row.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                    unoptimized
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-secondary">
                                    {row.name.slice(0, 1).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-on-surface">{row.name}</p>
                            <p className="text-xs text-secondary">
                                {t('adminProducts.dialog.stockQty')}: {row.stock ?? '-'}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'sku',
            label: t('adminProducts.table.sku'),
            render: (value) => <p className="font-mono text-sm text-on-surface">{value}</p>,
        },
        {
            key: 'price',
            label: t('adminProducts.table.price'),
            render: (value) => (
                <p className="font-semibold text-on-surface">{formatCurrency(value)}</p>
            ),
        },
        {
            key: 'type',
            label: t('adminProducts.table.type'),
            render: (value) => (
                <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-semibold text-on-primary-fixed">
                    {formatType(value, t)}
                </span>
            ),
        },
        {
            key: 'isActive',
            label: t('adminProducts.table.status'),
            render: (value) => formatStatus(Boolean(value), t),
        },
    ];

    const actions: TableAction<ProductRow>[] = [
        {
            label: t('adminProducts.actions.edit'),
            icon: <IconEdit className="h-4 w-4" stroke={2} />,
            onClick: (row) => {
                console.log(row);
                setEditingProduct({
                    id: row.id,
                    name: row.name,
                    sku: row.sku,
                    slug: row.slug,
                    description: row.description,
                    short_description: row.shortDescription,
                    base_price: row.price,
                    customization_fee: row.customizationFee,
                    production_days_min: row.productionDaysMin,
                    production_days_max: row.productionDaysMax,
                    product_type: row.type ?? undefined,
                    product_images: row.images ?? [],
                    product_variants: row.variants ?? [],
                    is_featured: row.isFeatured,
                });
                setDialogOpen(true);
            },
            className: 'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-primary',
        },
        {
            label: (row) => (row.isActive ? t('adminProducts.actions.delete') : t('adminProducts.actions.activate')),
            icon: (row) =>
                row.isActive ? (
                    <IconTrash className="h-4 w-4" stroke={2} />
                ) : (
                    <IconCircleCheck className="h-4 w-4" stroke={2} />
                ),
            onClick: (row) => {
                if (row.type === 'ai_base') {
                    toast.error(t('adminProducts.dialog.aiBaseNoEdit') || 'AI Base products cannot be modified.');
                    return;
                }
                if (row.isActive) {
                    setProductToDelete(row);
                    return;
                }

                setProductToActivate(row);
            },
            className: (row) => {
                if (row.type === 'ai_base') {
                    return 'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-secondary/30 cursor-not-allowed opacity-50';
                }
                return row.isActive
                    ? 'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-error'
                    : 'flex h-9 w-9 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed transition-colors hover:bg-primary-container hover:text-on-primary';
            }
        },
    ];

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;

        setIsDeleting(true);
        const toastId = toast.loading(t('adminProducts.dialog.deleting'));

        try {
            await deleteProduct(productToDelete.id);
            await loadProducts();
            setProductToDelete(null);
            toast.success(t('adminProducts.dialog.deleted'), { id: toastId });
        } catch (error) {
            console.error('Delete product error:', error);
            const message = error instanceof Error ? error.message : t('address.errorGeneric');
            setErrorMessage(message);
            toast.error(message, { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleActivateProduct = async () => {
        if (!productToActivate) return;

        setIsActivating(true);
        const toastId = toast.loading(t('adminProducts.dialog.activating'));

        try {
            await updateProduct(productToActivate.id, {
                product: {
                    is_active: true,
                },
            });
            await loadProducts();
            setProductToActivate(null);
            toast.success(t('adminProducts.dialog.activated'), { id: toastId });
        } catch (error) {
            console.error('Activate product error:', error);
            const message = error instanceof Error ? error.message : t('address.errorGeneric');
            setErrorMessage(message);
            toast.error(message, { id: toastId });
        } finally {
            setIsActivating(false);
        }
    };

    return (
        <div className="space-y-8">
            <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                    <div className="space-y-2">
                        <h1 className="font-headline text-4xl font-black tracking-tight text-on-surface sm:text-5xl">
                            {t('adminProducts.title')}
                        </h1>
                        <p className="max-w-2xl text-base text-secondary sm:text-lg">
                            {t('adminProducts.subtitle')}
                        </p>
                    </div>
                </div>

                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary-container" aria-label="Download products">
                    <IconDownload className="h-5 w-5" stroke={2} />
                </button>
            </section>

            {errorMessage ? (
                <section className="rounded-[1.5rem] bg-surface-container-low p-4 text-sm text-error">
                    {errorMessage}
                </section>
            ) : null}

            <section>
                <DataTable<ProductRow>
                    columns={columns}
                    data={filteredByType}
                    actions={actions}
                    searchPlaceholder={t('adminProducts.searchPlaceholder')}
                    searchableFields={['name', 'sku']}
                    filterOptions={{
                        label: t('adminProducts.table.type'),
                        options: [
                            { value: null, label: t('adminProducts.table.allTypes') },
                            ...typeOptions.map((type) => ({
                                value: type,
                                label: formatType(type, t),
                            })),
                        ],
                        onFilter: (value) => setSelectedType(value as ProductType | null),
                    }}
                    itemsPerPage={10}
                />
            </section>

            {isLoading ? (
                <div className="text-sm text-secondary">{t('adminProducts.dialog.loading')}</div>
            ) : null}

            <ProductDialog
                product={editingProduct ?? null}
                open={dialogOpen}
                onOpenChange={(v) => {
                    if (!v) setEditingProduct(null);
                    setDialogOpen(v);
                }}
                onSaved={() => {
                    setDialogOpen(false);
                    setEditingProduct(null);
                    void loadProducts();
                }}
            />

            <AlertDialog
                open={Boolean(productToDelete)}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) setProductToDelete(null);
                }}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('adminProducts.dialog.deleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('adminProducts.dialog.deleteDesc', { name: productToDelete?.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="rounded-full border-none bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface hover:bg-surface-container-highest"
                        >
                            {t('address.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                void handleDeleteProduct();
                            }}
                            disabled={isDeleting}
                            className="rounded-full bg-error px-5 py-3 text-sm font-bold text-on-error shadow-[0_10px_20px_-5px_rgba(164,0,21,0.3)] hover:bg-error/90"
                        >
                            {isDeleting ? t('adminProducts.dialog.deleting') : t('adminProducts.actions.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={Boolean(productToActivate)}
                onOpenChange={(open) => {
                    if (!open && !isActivating) setProductToActivate(null);
                }}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('adminProducts.dialog.activateTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('adminProducts.dialog.activateDesc', { name: productToActivate?.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isActivating}
                            className="rounded-full border-none bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface hover:bg-surface-container-highest"
                        >
                            {t('address.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                void handleActivateProduct();
                            }}
                            disabled={isActivating}
                            className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-[0_10px_20px_-5px_rgba(0,104,74,0.3)] hover:bg-primary-container"
                        >
                            {isActivating ? t('adminProducts.dialog.activating') : t('adminProducts.actions.activate')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
