'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';

import CreateCollectionDialog from '@/components/admin/create-collection-dialog';
import DataTable, { TableAction, TableColumn } from '@/components/admin/data-table';
import {
    deleteCollection,
    listCollections,
    type Collection,
} from '@/lib/api/collection.api';

type CollectionRow = {
    id: string;
    name: string;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
};

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export default function CollectionsPage() {
    const router = useRouter();
    const [collections, setCollections] = useState<CollectionRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadCollections = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await listCollections({ limit: 100, sort_by: 'sort_order' });
            const rows = response.collections.map((collection: Collection) => ({
                id: collection.id,
                name: collection.name,
                starts_at: collection.starts_at ?? null,
                ends_at: collection.ends_at ?? null,
                is_active: Boolean(collection.is_active),
            }));
            setCollections(rows);
        } catch (error) {
            console.error('Load collections error:', error);
            const message = error instanceof Error ? error.message : 'Failed to load collections.';
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadCollections();
    }, []);

    const handleDelete = async (row: CollectionRow) => {
        const confirmed = window.confirm(`Delete collection "${row.name}"?`);
        if (!confirmed) return;

        const toastId = toast.loading('Deleting collection...');

        try {
            await deleteCollection(row.id);
            setCollections((current) => current.filter((item) => item.id !== row.id));
            toast.success('Collection deleted.', { id: toastId });
        } catch (error) {
            console.error('Delete collection error:', error);
            const message = error instanceof Error ? error.message : 'Failed to delete collection.';
            toast.error(message, { id: toastId });
        }
    };

    const columns = useMemo<TableColumn<CollectionRow>[]>(
        () => [
            {
                key: 'name',
                label: 'Collection',
                render: (value) => (
                    <p className="font-semibold text-on-surface">{value}</p>
                ),
            },
            {
                key: 'starts_at',
                label: 'Start',
                render: (value) => (
                    <span className="text-sm text-secondary">{formatDate(value)}</span>
                ),
            },
            {
                key: 'ends_at',
                label: 'End',
                render: (value) => (
                    <span className="text-sm text-secondary">{formatDate(value)}</span>
                ),
            },
            {
                key: 'is_active',
                label: 'Status',
                render: (value) => (
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${value
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : 'bg-surface-container-high text-secondary'
                            }`}
                    >
                        {value ? 'Active' : 'Inactive'}
                    </span>
                ),
            },
        ],
        []
    );

    const actions: TableAction<CollectionRow>[] = [
        {
            label: 'Edit',
            icon: <IconEdit className="h-4 w-4" stroke={2} />,
            onClick: (row) => router.push(`/admin/collections/${row.id}/edit`),
            className:
                'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-primary',
        },
        {
            label: 'Delete',
            icon: <IconTrash className="h-4 w-4" stroke={2} />,
            onClick: handleDelete,
            className:
                'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-error',
        },
    ];

    return (
        <div className="space-y-8">
            <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                    <div className="space-y-2">
                        <h1 className="font-headline text-4xl font-black tracking-tight text-on-surface sm:text-5xl">
                            Collection Management
                        </h1>
                        <p className="max-w-2xl text-base text-secondary sm:text-lg">
                            Curate seasonal drops, fandom collections, and featured showcases.
                        </p>
                    </div>
                </div>

                <CreateCollectionDialog onCreated={loadCollections} />
            </section>

            {errorMessage ? (
                <section className="rounded-[1.5rem] bg-surface-container-low p-4 text-sm text-error">
                    {errorMessage}
                </section>
            ) : null}

            <section>
                <DataTable<CollectionRow>
                    columns={columns}
                    data={collections}
                    actions={actions}
                    searchPlaceholder="Search collections..."
                    searchableFields={['name']}
                    itemsPerPage={10}
                />
            </section>

            {isLoading ? (
                <div className="text-sm text-secondary">Loading collections...</div>
            ) : null}
        </div>
    );
}
