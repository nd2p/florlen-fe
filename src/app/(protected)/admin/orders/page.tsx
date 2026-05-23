'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
export function formatStatusLabel(status: OrderStatus): string {
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
            label: 'Order',
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
            label: 'Customer',
            render: (value, row) => (
                <div>
                    <p className="font-bold text-on-surface">{value || 'Guest'}</p>
                    <p className="text-xs text-secondary">{row.recipient_phone || '-'}</p>
                </div>
            ),
        },
        {
            key: 'product_name',
            label: 'Items',
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
                                {row.variant_label || 'Standard'} {count > 1 ? `· +${count - 1} item${count > 2 ? 's' : ''}` : ''}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => {
                const status = value as OrderStatus;
                const isActive = ['confirmed', 'in_production', 'quality_check', 'ready_to_ship', 'shipping', 'completed'].includes(status);
                return (
                    <Badge variant={isActive ? 'active' : 'inactive'}>
                        {formatStatusLabel(status)}
                    </Badge>
                );
            },
        },
        {
            key: 'total_amount',
            label: 'Total',
            render: (value) => (
                <p className="font-bold text-on-surface">{formatCurrency(value)}</p>
            ),
        },
    ];

    const actions: TableAction<OrderSummary>[] = [
        {
            label: 'View Details',
            icon: <IconEye className="h-4 w-4" stroke={2} />,
            onClick: (row) => {
                router.push(`/admin/orders/${row.id}`);
            },
            className: 'flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-primary',
        },
    ];

    // Status filter options
    const statusOptions: { value: OrderStatus | null; label: string }[] = [
        { value: null, label: 'All Statuses' },
        { value: 'pending_payment', label: 'Pending Payment' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'in_production', label: 'In Production' },
        { value: 'quality_check', label: 'Quality Check' },
        { value: 'awaiting_remaining_payment', label: 'Awaiting Rem. Payment' },
        { value: 'ready_to_ship', label: 'Ready to Ship' },
        { value: 'shipping', label: 'Shipping' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <div className="space-y-8">
            <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                    <div className="space-y-2">
                        <h1 className="font-headline text-4xl font-black tracking-tight text-on-surface sm:text-5xl">
                            Order Management
                        </h1>
                        <p className="max-w-2xl text-base text-secondary sm:text-lg">
                            Review, update, and manage customer plushie orders.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => loadOrders()}
                        className="flex h-12 items-center gap-2 rounded-full bg-surface-container-high px-4 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
                    >
                        <IconCalendar className="h-4 w-4 text-secondary" stroke={2} />
                        Refresh Queue
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
                        <span className="text-sm font-semibold">Loading orders queue...</span>
                    </div>
                ) : (
                    <DataTable<OrderSummary>
                        columns={columns}
                        data={filteredOrders}
                        actions={actions}
                        searchPlaceholder="Search by customer, order number..."
                        searchableFields={['order_number', 'recipient_name', 'recipient_phone']}
                        filterOptions={{
                            label: 'Status',
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
