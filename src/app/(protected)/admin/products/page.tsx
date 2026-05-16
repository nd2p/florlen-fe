'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { IconCircleCheck, IconDownload, IconEdit, IconTrash } from '@tabler/icons-react';
import DataTable, { TableColumn, TableAction } from '@/components/admin/data-table';
import ProductDialog from '@/components/admin/product-dialog';
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
};

const formatCurrency = (value: number) =>
    Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const formatType = (value?: ProductType | null) => {
    if (!value) return 'Unassigned';
    return value === 'ai_base' ? 'AI Base' : 'Normal';
};

const formatStatus = (isActive: boolean) =>
    isActive ? (
        <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-semibold text-on-primary-fixed">
            Active
        </span>
    ) : (
        <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-secondary">
            Inactive
        </span>
    );

const getPrimaryImage = (images?: ProductImage[]) => {
    if (!images || images.length === 0) return null;
    const primary = images.find((image) => image.is_primary);
    return primary?.url || images[0]?.url || null;
};

export default function ProductsPage() {
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

    const loadProducts = async () => {
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
            }));
            setProducts(rows);
        } catch (error) {
            console.error('Load products error:', error);
            const message = error instanceof Error ? error.message : 'Failed to load products.';
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadProducts();
    }, []);

    const filteredByType = selectedType
        ? products.filter((product) => product.type === selectedType)
        : products;

    const typeOptions = Array.from(
        new Set(products.map((product) => product.type).filter(Boolean))
    ) as ProductType[];

    const columns: TableColumn<ProductRow>[] = [
        {
            key: 'name',
            label: 'Product',
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
                                Stock: {row.stock ?? '-'}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'sku',
            label: 'SKU',
            render: (value) => <p className="font-mono text-sm text-on-surface">{value}</p>,
        },
        {
            key: 'price',
            label: 'Price',
            render: (value) => (
                <p className="font-semibold text-on-surface">{formatCurrency(value)}</p>
            ),
        },
        {
            key: 'type',
            label: 'Type',
            render: (value) => (
                <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-semibold text-on-primary-fixed">
                    {formatType(value)}
                </span>
            ),
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (value) => formatStatus(Boolean(value)),
        },
    ];

    const actions: TableAction<ProductRow>[] = [
        {
            label: 'Edit',
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
                });
                setDialogOpen(true);
            },
            className: 'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-primary',
        },
        {
            label: (row) => (row.isActive ? 'Delete' : 'Activate'),
            icon: (row) =>
                row.isActive ? (
                    <IconTrash className="h-4 w-4" stroke={2} />
                ) : (
                    <IconCircleCheck className="h-4 w-4" stroke={2} />
                ),
            onClick: (row) => {
                if (row.isActive) {
                    setProductToDelete(row);
                    return;
                }

                setProductToActivate(row);
            },
            className: (row) =>
                row.isActive
                    ? 'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-error'
                    : 'flex h-9 w-9 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed transition-colors hover:bg-primary-container hover:text-on-primary',
        },
    ];

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;

        setIsDeleting(true);

        try {
            await deleteProduct(productToDelete.id);
            await loadProducts();
            setProductToDelete(null);
        } catch (error) {
            console.error('Delete product error:', error);
            const message = error instanceof Error ? error.message : 'Failed to delete product.';
            setErrorMessage(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleActivateProduct = async () => {
        if (!productToActivate) return;

        setIsActivating(true);

        try {
            await updateProduct(productToActivate.id, {
                product: {
                    is_active: true,
                },
            });
            await loadProducts();
            setProductToActivate(null);
        } catch (error) {
            console.error('Activate product error:', error);
            const message = error instanceof Error ? error.message : 'Failed to activate product.';
            setErrorMessage(message);
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
                            Product Management
                        </h1>
                        <p className="max-w-2xl text-base text-secondary sm:text-lg">
                            Manage your product catalog, inventory, and pricing all in one place.
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
                    searchPlaceholder="Search by product name or SKU..."
                    searchableFields={['name', 'sku']}
                    filterOptions={{
                        label: 'Type',
                        options: [
                            { value: null, label: 'All Types' },
                            ...typeOptions.map((type) => ({
                                value: type,
                                label: formatType(type),
                            })),
                        ],
                        onFilter: (value) => setSelectedType(value as ProductType | null),
                    }}
                    itemsPerPage={10}
                />
            </section>

            {isLoading ? (
                <div className="text-sm text-secondary">Loading products...</div>
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
                    loadProducts();
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
                        <AlertDialogTitle>Delete product?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will soft delete <span className="font-semibold text-on-surface">{productToDelete?.name}</span>. Product images will be removed from storage and the product will be hidden from the catalog.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="rounded-full border-none bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface hover:bg-surface-container-highest"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                void handleDeleteProduct();
                            }}
                            disabled={isDeleting}
                            className="rounded-full bg-error px-5 py-3 text-sm font-bold text-on-error shadow-[0_10px_20px_-5px_rgba(164,0,21,0.3)] hover:bg-error/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
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
                        <AlertDialogTitle>Activate product?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will activate <span className="font-semibold text-on-surface">{productToActivate?.name}</span> and make it visible again in the catalog.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isActivating}
                            className="rounded-full border-none bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface hover:bg-surface-container-highest"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                void handleActivateProduct();
                            }}
                            disabled={isActivating}
                            className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-[0_10px_20px_-5px_rgba(0,104,74,0.3)] hover:bg-primary-container"
                        >
                            {isActivating ? 'Activating...' : 'Activate'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
