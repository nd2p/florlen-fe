'use client';

import { useState } from 'react';
import Image from 'next/image';
import { IconDownload, IconEdit, IconTrash } from '@tabler/icons-react';
import DataTable, { TableColumn, TableAction } from '@/components/admin/data-table';

type Product = {
    id: string;
    name: string;
    sku: string;
    price: number;
    collection: string;
    image: string;
    stock: number;
};

const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Rosie the Axolotl',
        sku: 'AXO-001',
        price: 64.0,
        collection: 'Water Creatures',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEVVC9lGd86TKlhuFEfyMdq4dcY8P-8NGTZU83F7bgLAqEwh7O8wsJfmMZ92ep0o6lm8quxkUDLfwYa-tiCnGVQLhVh2_fmFYNL-RY2avGAEfG9UPnTc6Jsfs75yX8t5eDv4G7i9HhelDxVG0K2xnmD6iQir_6HVFHo_NZ8h81fMVWoJBOB48ps-ssAU37IpMi7qblF4h2w7xn2JljyLmbLt6Gx-tw_8M7XXgYuhIvW7OTWhCFgMn0W7n9kSzHyHMkP5U5mhAyoFI',
        stock: 45,
    },
    {
        id: '2',
        name: 'Mossy Guardian',
        sku: 'MSS-002',
        price: 48.0,
        collection: 'Forest Friends',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABnB2ovQDMVwk6VZ3-7h7aN0X4X7R932Z7-XQen2RukCUFdGJY6-fpuqqYUdaD4SjQYYdnpzrgcHsbyMx9geryVuRy17Ygi47ogG1Gyjfu-GwAWfgJdvHGDQEdLmDffS9XrwLTHFaQtyGC3y0xSM4LwaUYmLZmF6x2cSCgjirO50OaB6mh35LzFlXpIWFk3DIfjzlkjHc5urQvmZjoPX-btIatDO2k3S9mwrZlJrW5FY0SKCmVe0WeuA9cgnyyloqAJdVv9t07_1Q',
        stock: 28,
    },
    {
        id: '3',
        name: 'Cinder the Dragon',
        sku: 'DRG-003',
        price: 145.0,
        collection: 'Pokemon Inspired',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBz5sLJkZ5A8PysdtiSgSfXmY2JeihENjtQRKHC_Sx9fSRXDKVD8kSgT8WEH5Wwj4RgRBiQU871mD115YBuEvPwO32b_itz564sxRg8XqpcYfG4RSguGN3GhJOtPr-UyRZJUEnXtwi7hSGtl1mce-sbQdpmISXeumIVXGMDGSA-vtUSa7caODvUeEDDwJLkASQRsWE8tGIxeHfzmjmCc6p2Jp_b9R-bGO07TjyVyPQcYouA_YEGZaYqy-nVcbiJ9ZQEDVQcmwXH2Kc',
        stock: 12,
    },
    {
        id: '4',
        name: 'Boo-Tie Phantom',
        sku: 'GHT-004',
        price: 45.0,
        collection: 'Gothic Kawaii',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRg4o01OaUs-Bpfpx6Xrr8aGW8VALFQDxzhqAmqvptgRG9FRCuLbxeG6AInrhKYu9P7bBFQtK7ugcnVWjYjPEWgYF8WF8ork7DIgqgdnPchTd_Q5pDMrHFsMEuvrD6IbMPLZIxfHzn2p2AZpUZqk6omgUcNZdT9uI8KksjNLPCRU3mITrCmED-nkjbmACUV5caaBUd1BD2eklB-s7ffxCdgJqh-Xz2zapGn7kswVG4gknZbroPYHRqTdpfG2kuiMPdDczJ4IAFCJ4',
        stock: 67,
    },
    {
        id: '5',
        name: 'Living Yarn Succulent',
        sku: 'SUC-005',
        price: 38.0,
        collection: 'Evergreens',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQ290JZ48hZykPxsQHaYuax42cb3jnmbv_1yaskresansUluKqfgamwmpAZOUmeABn42dxtITVnpq3oBZemrYriY9Q4SCqQ2PEFcdBEVKLieRy65pdlvtaaX995FCaKBri_WREOqSi84Q0GhqC1IVLKx3tA25tJluaqr1hbkpwMzCGAm6JXyqU_sVkVXZbwzOIEBI3edWvlNh1ORaS-kykFUXNB_9OWXUecgBw_QtfD_FsGMvPe4g4BoW2oxo9Ty_KoxxWIHCsvn0',
        stock: 54,
    },
];

export default function ProductsPage() {
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

    const filteredByCollection = selectedCollection
        ? mockProducts.filter((p) => p.collection === selectedCollection)
        : mockProducts;

    const collections = Array.from(new Set(mockProducts.map((p) => p.collection)));

    const columns: TableColumn<Product>[] = [
        {
            key: 'name',
            label: 'Product',
            render: (_, row) => (
                <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-container-highest">
                        <Image
                            src={row.image}
                            alt={row.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-on-surface">{row.name}</p>
                        <p className="text-xs text-secondary">Stock: {row.stock}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'sku',
            label: 'SKU',
            render: (value) => <p className="font-mono text-sm text-on-surface">{value}</p>,
        },
        {
            key: 'price',
            label: 'Price',
            render: (value) => <p className="font-semibold text-on-surface">{Number(value).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>,
        },
        {
            key: 'collection',
            label: 'Collection',
            render: (value) => (
                <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-semibold text-on-primary-fixed">
                    {value}
                </span>
            ),
        },
    ];

    const actions: TableAction<Product>[] = [
        {
            label: 'Edit',
            icon: <IconEdit className="h-4 w-4" stroke={2} />,
            onClick: (row) => console.log('Edit:', row),
            className: 'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-primary',
        },
        {
            label: 'Delete',
            icon: <IconTrash className="h-4 w-4" stroke={2} />,
            onClick: (row) => console.log('Delete:', row),
            className: 'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-error',
        },
    ];

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

            <section>
                <DataTable<Product>
                    columns={columns}
                    data={filteredByCollection}
                    actions={actions}
                    searchPlaceholder="Search by product name or SKU..."
                    searchableFields={['name', 'sku']}
                    filterOptions={{
                        label: 'Collection',
                        options: [
                            { value: null, label: 'All Collections' },
                            ...collections.map((c) => ({ value: c, label: c })),
                        ],
                        onFilter: (value) => setSelectedCollection(value),
                    }}
                    itemsPerPage={10}
                />
            </section>
        </div>
    );
}
