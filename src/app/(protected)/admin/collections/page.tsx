'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { toast } from 'sonner';

import CollectionDialog from '@/components/admin/collection-dialog';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import DataTable, { TableAction, TableColumn } from '@/components/admin/data-table';
import {
    deleteCollection,
    updateCollection,
    listCollections,
    type Collection,
} from '@/lib/api/collection.api';

type CollectionRow = {
    id: string;
    name: string;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    _raw: Collection;
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
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
    const [collectionToDelete, setCollectionToDelete] = useState<CollectionRow | null>(null);
    const [collectionToActivate, setCollectionToActivate] = useState<CollectionRow | null>(null);
    const [isDeletingCollection, setIsDeletingCollection] = useState(false);
    const [isActivatingCollection, setIsActivatingCollection] = useState(false);

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
                _raw: collection,
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
        setCollectionToDelete(row);
    };

    const confirmDelete = async () => {
        if (!collectionToDelete) return;
        setIsDeletingCollection(true);
        const toastId = toast.loading('Deleting collection...');
        try {
            await deleteCollection(collectionToDelete.id);
            setCollections((current) =>
                current.map((item) =>
                    item.id === collectionToDelete.id
                        ? {
                            ...item,
                            is_active: false,
                            _raw: {
                                ...item._raw,
                                is_active: false,
                            },
                        }
                        : item
                )
            );
            toast.success('Collection deleted.', { id: toastId });
            setCollectionToDelete(null);
        } catch (error) {
            console.error('Delete collection error:', error);
            const message = error instanceof Error ? error.message : 'Failed to delete collection.';
            toast.error(message, { id: toastId });
        } finally {
            setIsDeletingCollection(false);
        }
    };

    const handleActivate = async (row: CollectionRow) => {
        setCollectionToActivate(row);
    };

    const confirmActivate = async () => {
        if (!collectionToActivate) return;
        setIsActivatingCollection(true);
        const toastId = toast.loading('Activating collection...');

        try {
            await updateCollection(collectionToActivate.id, { is_active: true });
            setCollections((current) => current.map((c) => (c.id === collectionToActivate.id ? { ...c, is_active: true } : c)));
            toast.success('Collection activated.', { id: toastId });
            setCollectionToActivate(null);
            loadCollections();
        } catch (error) {
            console.error('Activate collection error:', error);
            const message = error instanceof Error ? error.message : 'Failed to activate collection.';
            toast.error(message, { id: toastId });
        } finally {
            setIsActivatingCollection(false);
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
            onClick: (row) => setEditingCollection(row._raw),
            className:
                'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-primary',
        },
        {
            label: (row) => (row.is_active ? 'Delete' : 'Activate'),
            icon: (row) => (row.is_active ? <IconTrash className="h-4 w-4" stroke={2} /> : <IconPlus className="h-4 w-4" stroke={2} />),
            onClick: (row) => (row.is_active ? handleDelete(row) : handleActivate(row)),
            className: (row) =>
                row.is_active
                    ? 'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-error'
                    : 'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-primary',
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

                <CollectionDialog onSaved={loadCollections} />
            </section>

            {editingCollection && (
                <CollectionDialog
                    collection={editingCollection}
                    open={!!editingCollection}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) setEditingCollection(null);
                    }}
                    onSaved={() => {
                        setEditingCollection(null);
                        loadCollections();
                    }}
                />
            )}

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

            <AlertDialog
                open={Boolean(collectionToDelete)}
                onOpenChange={(open) => {
                    if (!open && !isDeletingCollection) setCollectionToDelete(null);
                }}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete collection?</AlertDialogTitle>
                        <div className="text-sm leading-6 text-secondary">
                            This will delete <span className="font-semibold text-on-surface">{collectionToDelete?.name}</span> and remove it from listings.
                        </div>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeletingCollection}
                            className="rounded-full border-none bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface hover:bg-surface-container-highest"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                void confirmDelete();
                            }}
                            disabled={isDeletingCollection}
                            className="rounded-full bg-error px-5 py-3 text-sm font-bold text-on-error shadow-[0_10px_20px_-5px_rgba(164,0,21,0.3)] hover:bg-error/90"
                        >
                            {isDeletingCollection ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={Boolean(collectionToActivate)}
                onOpenChange={(open) => {
                    if (!open && !isActivatingCollection) setCollectionToActivate(null);
                }}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Activate collection?</AlertDialogTitle>
                        <div className="text-sm leading-6 text-secondary">
                            This will activate <span className="font-semibold text-on-surface">{collectionToActivate?.name}</span> and make it visible again in listings.
                        </div>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isActivatingCollection}
                            className="rounded-full border-none bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface hover:bg-surface-container-highest"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                void confirmActivate();
                            }}
                            disabled={isActivatingCollection}
                            className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-[0_10px_20px_-5px_rgba(0,104,74,0.3)] hover:bg-primary-container"
                        >
                            {isActivatingCollection ? 'Activating...' : 'Activate'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {isLoading ? (
                <div className="text-sm text-secondary">Loading collections...</div>
            ) : null}
        </div>
    );
}
