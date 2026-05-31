'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import {
    IconCalendar,
    IconDownload,
    IconEye,
} from '@tabler/icons-react';
import { formatCurrency } from '@/lib/utils';
import DataTable, { TableColumn, TableAction } from '@/components/admin/data-table';
import Badge from '@/components/ui/badge';
import {
    getAllOrdersAdmin,
    type OrderSummary,
    type OrderStatus,
} from '@/lib/api/order.api';

// Format status labels elegantly
export function mapStatusToKey(status: OrderStatus): string {
    switch (status) {
        case 'pending_payment': return 'pendingPayment';
        case 'confirmed': return 'confirmed';
        case 'in_production': return 'inProduction';
        case 'quality_check': return 'qualityCheck';
        case 'awaiting_remaining_payment': return 'awaitingRemPayment';
        case 'ready_to_ship': return 'readyToShip';
        case 'shipping': return 'shipping';
        case 'completed': return 'completed';
        case 'cancelled': return 'cancelled';
        default: return status;
    }
}

// Format status labels elegantly
export function formatStatusLabel(status: OrderStatus, t?: (key: string) => string): string {
    if (t) {
        return t(`adminOrders.${mapStatusToKey(status)}`);
    }
    switch (status) {
        case 'pending_payment':
            return 'Pending Payment';
        case 'confirmed':
            return 'Confirmed';
        case 'in_production':
            return 'In Production';
        case 'quality_check':
            return 'Quality Check';
        case 'awaiting_remaining_payment':
            return 'Awaiting Rem. Payment';
        case 'ready_to_ship':
            return 'Ready to Ship';
        case 'shipping':
            return 'Shipping';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        default:
            return status;
    }
}

export default function OrdersPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);

    const loadOrders = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await getAllOrdersAdmin({ limit: 100 });
            setOrders(response.orders || []);
        } catch (error) {
            console.error('Load admin orders error:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch system orders.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        const fetchOrders = async () => {
            // Delay slightly or fetch asynchronously to prevent synchronous render state cascade
            try {
                const response = await getAllOrdersAdmin({ limit: 100 });
                if (active) {
                    setOrders(response.orders || []);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Load admin orders error:', error);
                if (active) {
                    setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch system orders.');
                    setIsLoading(false);
                }
            }
        };

        fetchOrders();
        return () => {
            active = false;
        };
    }, []);

    // Filter local data based on status selection
    const filteredOrders = selectedStatus
        ? orders.filter((order) => order.status === selectedStatus)
        : orders;

    const columns: TableColumn<OrderSummary>[] = [
        {
            key: 'order_number',
            label: t('adminOrders.table.order'),
            render: (value, row) => (
                <div>
                    <span className="font-mono text-sm font-black text-primary">#{value}</span>
                    <p className="text-xs text-secondary">
                        {new Date(row.created_at).toLocaleDateString('vi-VN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </p>
                </div>
            ),
        },
        {
            key: 'recipient_name',
            label: t('adminOrders.table.customer'),
            render: (value, row) => (
                <div>
                    <p className="font-bold text-on-surface">{value || 'Guest'}</p>
                    <p className="text-xs text-secondary">{row.recipient_phone || '-'}</p>
                </div>
            ),
        },
        {
            key: 'product_name',
            label: t('adminOrders.table.items'),
            render: (value, row) => {
                const count = row.order_items?.length || 1;
                return (
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-container-highest">
                            {row.product_image_url ? (
                                <Image
                                    src={row.product_image_url}
                                    alt={value}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-black text-secondary">
                                    📦
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="max-w-40 truncate font-semibold text-on-surface" title={value}>
                                {value}
                            </p>
                            <p className="text-xs text-secondary">
                                {row.variant_label || t('profile.orders.standard')} {count > 1 ? t('adminOrders.itemsCount', { count: count - 1 }) : ''}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'status',
            label: t('adminOrders.table.status'),
            render: (value) => {
                const status = value as OrderStatus;
                const isActive = ['confirmed', 'in_production', 'quality_check', 'ready_to_ship', 'shipping', 'completed'].includes(status);
                return (
                    <Badge variant={isActive ? 'active' : 'inactive'}>
                        {formatStatusLabel(status, t)}
                    </Badge>
                );
            },
        },
        {
            key: 'total_amount',
            label: t('adminOrders.table.total'),
            render: (value) => (
                <p className="font-bold text-on-surface">{formatCurrency(value)}</p>
            ),
        },
    ];

    const actions: TableAction<OrderSummary>[] = [
        {
            label: t('adminOrders.viewDetails'),
            icon: <IconEye className="h-4 w-4" stroke={2} />,
            onClick: (row) => {
                router.push(`/admin/orders/${row.id}`);
            },
            className: 'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-primary',
        },
    ];

    // Status filter options
    const statusOptions = useMemo(() => [
        { value: null, label: t('adminOrders.allStatuses') },
        { value: 'pending_payment', label: t('adminOrders.pendingPayment') },
        { value: 'confirmed', label: t('adminOrders.confirmed') },
        { value: 'in_production', label: t('adminOrders.inProduction') },
        { value: 'quality_check', label: t('adminOrders.qualityCheck') },
        { value: 'awaiting_remaining_payment', label: t('adminOrders.awaitingRemPayment') },
        { value: 'ready_to_ship', label: t('adminOrders.readyToShip') },
        { value: 'shipping', label: t('adminOrders.shipping') },
        { value: 'completed', label: t('adminOrders.completed') },
        { value: 'cancelled', label: t('adminOrders.cancelled') },
    ], [t]);

    return (
        <div className="space-y-8">
            <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                    <div className="space-y-2">
                        <h1 className="font-headline text-4xl font-black tracking-tight text-on-surface sm:text-5xl">
                            {t('adminOrders.title')}
                        </h1>
                        <p className="max-w-2xl text-base text-secondary sm:text-lg">
                            {t('adminOrders.subtitle')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => loadOrders()}
                        className="flex h-12 items-center gap-2 rounded-full bg-surface-container-high px-4 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
                    >
                        <IconCalendar className="h-4 w-4 text-secondary" stroke={2} />
                        {t('adminOrders.refresh')}
                    </button>
                    <button 
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary-container" 
                        aria-label="Download orders"
                    >
                        <IconDownload className="h-5 w-5" stroke={2} />
                    </button>
                </div>
            </section>

            {errorMessage ? (
                <section className="rounded-[1.5rem] bg-error/10 border border-error/20 p-5 text-sm text-error">
                    {errorMessage}
                </section>
            ) : null}

            <section className="space-y-4">
                {isLoading ? (
                    <div className="flex h-40 items-center justify-center rounded-[1.5rem] bg-surface-container-low text-secondary">
                        <span className="text-sm font-semibold">{t('adminOrders.loading')}</span>
                    </div>
                ) : (
                    <DataTable<OrderSummary>
                        columns={columns}
                        data={filteredOrders}
                        actions={actions}
                        searchPlaceholder={t('adminOrders.searchPlaceholder')}
                        searchableFields={['order_number', 'recipient_name', 'recipient_phone']}
                        filterOptions={{
                            label: t('adminOrders.statusFilter'),
                            options: statusOptions,
                            onFilter: (value) => setSelectedStatus(value as OrderStatus | null),
                        }}
                        itemsPerPage={10}
                    />
                )}
            </section>
        </div>
    );
}
