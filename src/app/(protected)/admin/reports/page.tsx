'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconArrowUpRight,
  IconShoppingBag,
  IconUsers,
  IconChartBar,
  IconCash,
} from '@tabler/icons-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

import DataTable, { TableColumn } from '@/components/admin/data-table';
import Badge from '@/components/ui/badge';
import {
  getReportsSummaryAdmin,
  listTransactionsAdmin,
  type ReportsSummaryResponse,
  type AdminTransactionListItem,
} from '@/lib/api/admin-reports.api';

// Harmonized colors tailored for a premium theme
const STATUS_COLORS = [
  '#00684a', // confirmed/active (emerald)
  '#0284c7', // shipping (sky)
  '#b45309', // pending (amber)
  '#be123c', // cancelled/banned (rose)
  '#6b7280', // other (gray)
  '#8b5cf6', // purple
  '#f59e0b', // yellow
];

const METHOD_COLORS = {
  payos_qr: '#00684a',
  bank_transfer: '#0284c7',
  manual: '#8b5cf6',
  other: '#6b7280',
};

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

export default function AdminReportsPage() {
  const { t, i18n } = useTranslation('common');

  // Reports data states
  const [summary, setSummary] = useState<ReportsSummaryResponse | null>(null);
  const [transactions, setTransactions] = useState<AdminTransactionListItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingTxns, setIsLoadingTxns] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Load summary and aggregations
  const loadSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const data = await getReportsSummaryAdmin();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load reports summary:', err);
      setErrorText(err instanceof Error ? err.message : 'Failed to retrieve reports data.');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Load transaction list
  const loadTransactions = async () => {
    setIsLoadingTxns(true);
    try {
      const data = await listTransactionsAdmin({ limit: 1000 });
      setTransactions(data.transactions);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoadingTxns(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadSummary();
      void loadTransactions();
    });
  }, []);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filtered transactions by status
  const filteredTransactions = selectedStatus
    ? transactions.filter((t) => t.status === selectedStatus)
    : transactions;

  // Render Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return (
          <Badge variant="active" className="font-bold">
            {t('profile.payments.statuses.succeeded')}
          </Badge>
        );
      case 'pending':
      case 'processing':
        return (
          <Badge variant="inactive" className="bg-amber-100 text-amber-800 border-none font-bold">
            {t('profile.payments.statuses.pending')}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="inactive" className="bg-red-100 text-red-800 border-none font-bold">
            {t('profile.payments.statuses.failed')}
          </Badge>
        );
      case 'refunded':
      case 'partially_refunded':
        return (
          <Badge variant="secondary" className="font-bold">
            {t('profile.payments.statuses.refunded')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-bold">
            {status}
          </Badge>
        );
    }
  };

  // Render payment type label
  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return t('profile.payments.types.deposit');
      case 'remaining_balance':
        return t('profile.payments.types.remaining_balance');
      case 'full_payment':
        return t('profile.payments.types.full_payment');
      default:
        return type;
    }
  };

  // Table columns definition
  const columns: TableColumn<AdminTransactionListItem>[] = [
    {
      key: 'payment_intent_id',
      label: t('adminReports.transactions.table.id'),
      render: (value, row) => (
        <div>
          <p className="font-mono text-sm font-bold text-on-surface">#{value}</p>
          {row.orders?.order_number ? (
            <p className="text-[10px] text-secondary font-bold">
              {t('adminOrders.table.order')}: {row.orders.order_number}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'profiles',
      label: t('adminReports.transactions.table.user'),
      render: (_, row) => {
        const initials = (row.profiles?.full_name || row.profiles?.display_name || row.email || '?')
          .slice(0, 1)
          .toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm shrink-0">
              {row.profiles?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.profiles.avatar_url}
                  alt="Avatar"
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm">
                {row.profiles?.full_name ||
                  row.profiles?.display_name ||
                  t('adminReports.transactions.guestCustomer')}
              </p>
              {row.email ? (
                <p className="text-[10px] text-secondary font-semibold">{row.email}</p>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      key: 'payment_type',
      label: t('adminReports.transactions.table.type'),
      render: (value) => (
        <span className="text-xs font-bold text-on-surface">{getPaymentTypeLabel(value)}</span>
      ),
    },
    {
      key: 'payment_method',
      label: t('adminReports.transactions.table.method'),
      render: (value) => (
        <span className="text-xs font-bold text-secondary uppercase font-headline">
          {t('profile.payments.methods.' + value) || String(value).replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'amount',
      label: t('adminReports.transactions.table.amount'),
      render: (value) => (
        <p className="font-black text-on-surface text-sm">{formatCurrency(Number(value))}</p>
      ),
    },
    {
      key: 'status',
      label: t('adminReports.transactions.table.status'),
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'created_at',
      label: t('adminReports.transactions.table.date'),
      render: (value, row) => (
        <p className="text-[11px] text-secondary font-semibold">
          {formatDate(row.paid_at || value)}
        </p>
      ),
    },
  ];

  // Dynamic values
  const totalRevenue = summary?.metrics.totalRevenue || 0;
  const totalOrders = summary?.metrics.totalOrders || 0;
  const completedOrders = summary?.metrics.completedOrders || 0;
  const totalCustomers = summary?.metrics.totalCustomers || 0;

  // Chart data preparing
  const salesHistory = summary?.charts.dailyRevenueHistory || [];
  const statusPieData = summary?.charts.orderStatusBreakdown || [];
  const methodBarData = summary?.charts.paymentMethodsBreakdown || [];
  const topProducts = summary?.charts.topSellingProducts || [];

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <section className="flex flex-col gap-3">
        <h1 className="font-headline text-4xl font-black tracking-tight text-on-surface sm:text-5xl">
          {t('adminReports.title')}
        </h1>
        <p className="max-w-3xl text-base text-secondary sm:text-lg leading-relaxed">
          {t('adminReports.subtitle')}
        </p>
      </section>

      {/* Error notification */}
      {errorText ? (
        <section className="rounded-[1.5rem] bg-red-50 border border-red-200/50 p-4 text-sm text-red-800 font-medium">
          {errorText}
        </section>
      ) : null}

      {/* Summary Metrics Cards */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-[1.5rem] bg-surface-container-low border border-outline/5 p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-secondary">
              {t('adminReports.metrics.revenue')}
            </span>
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <IconCash className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black font-headline text-on-surface truncate">
              {isLoadingSummary ? '...' : formatCurrency(totalRevenue)}
            </h3>
            <p className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
              <IconArrowUpRight className="h-3.5 w-3.5 shrink-0" />
              {t('adminReports.metrics.succeededPayments')}
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-[1.5rem] bg-surface-container-low border border-outline/5 p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-secondary">
              {t('adminReports.metrics.orders')}
            </span>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <IconShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black font-headline text-on-surface">
              {isLoadingSummary ? '...' : totalOrders}
            </h3>
            <p className="text-[10px] text-secondary font-bold">
              {t('adminReports.metrics.createdOrdersExcludeDrafts')}
            </p>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="rounded-[1.5rem] bg-surface-container-low border border-outline/5 p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-secondary">
              {t('adminReports.metrics.completed')}
            </span>
            <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-800">
              <IconChartBar className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black font-headline text-on-surface">
              {isLoadingSummary ? '...' : completedOrders}
            </h3>
            <p className="text-[10px] text-sky-800 font-bold">
              {totalOrders > 0
                ? t('adminReports.metrics.completionRate', {
                    percent: Math.round((completedOrders / totalOrders) * 100),
                  })
                : t('adminReports.metrics.completionRate', { percent: 0 })}
            </p>
          </div>
        </div>

        {/* Total Customers */}
        <div className="rounded-[1.5rem] bg-surface-container-low border border-outline/5 p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-secondary">
              {t('adminReports.metrics.customers')}
            </span>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-800">
              <IconUsers className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black font-headline text-on-surface">
              {isLoadingSummary ? '...' : totalCustomers}
            </h3>
            <p className="text-[10px] text-secondary font-bold">
              {t('adminReports.metrics.customerAccounts')}
            </p>
          </div>
        </div>
      </section>

      {/* Analytics Charts Grid */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daily Revenue Area Chart (Line / Trend) */}
        <div className="rounded-[1.5rem] bg-surface-container-low border border-outline/5 p-6 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-lg font-black font-headline text-on-surface">
            {t('adminReports.charts.revenueTitle')}
          </h3>
          <div className="h-72 w-full">
            {isLoadingSummary ? (
              <div className="h-full w-full flex items-center justify-center text-sm text-secondary animate-pulse">
                {t('adminReports.charts.loadingTrend')}
              </div>
            ) : salesHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00684a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00684a" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${Number(val) / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      t('adminReports.charts.sales'),
                    ]}
                    labelFormatter={(label) =>
                      i18n.language === 'vi' ? `Ngày ${label}` : `Date ${label}`
                    }
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.05)',
                      fontFamily: 'inherit',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#00684a"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-secondary">
                {t('adminReports.charts.noRevenue30Days')}
              </div>
            )}
          </div>
        </div>

        {/* Order Status Pie Chart Breakdown */}
        <div className="rounded-[1.5rem] bg-surface-container-low border border-outline/5 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-black font-headline text-on-surface">
            {t('adminReports.charts.statusTitle')}
          </h3>
          <div className="h-56 w-full flex items-center justify-center relative">
            {isLoadingSummary ? (
              <div className="text-sm text-secondary animate-pulse">
                {t('adminReports.charts.loadingBreakdown')}
              </div>
            ) : statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      t('adminReports.charts.orderCount', { count: value }),
                      t('adminReports.charts.qty'),
                    ]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-secondary">{t('adminReports.charts.noOrders')}</div>
            )}
          </div>

          {/* Pie Chart Legend indicators list */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold max-h-24 overflow-y-auto pr-1">
            {statusPieData.map((entry, index) => (
              <div key={entry.status} className="flex items-center gap-1.5 truncate">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}
                />
                <span className="text-secondary truncate uppercase text-[10px] tracking-wider">
                  {t('profile.orders.status.' + entry.status) || entry.status.replace('_', ' ')}
                </span>
                <span className="text-on-surface font-black ml-auto">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Selling Products List */}
        <div className="rounded-[1.5rem] bg-surface-container-low p-6 shadow-sm lg:col-span-2 space-y-4 flex flex-col justify-between">
          <h3 className="text-lg font-black font-headline text-on-surface">
            {t('adminReports.charts.productsTitle')}
          </h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {isLoadingSummary ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-surface-container-high rounded-xl" />
                ))}
              </div>
            ) : topProducts.length > 0 ? (
              topProducts.map((p, idx) => {
                const maxQty = topProducts[0]?.quantity || 1;
                const percentage = Math.round((p.quantity / maxQty) * 100);
                return (
                  <div key={p.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-on-surface truncate pr-4">
                        {idx + 1}. {p.name}
                      </span>
                      <span className="text-secondary shrink-0">
                        {p.quantity} {t('profile.orders.items')} ({formatCurrency(p.amount)})
                      </span>
                    </div>
                    {/* Visual Progress bar indicator */}
                    <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500 shadow-[0_0_8px_rgba(0,104,74,0.3)]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-secondary text-center py-10">
                {t('adminReports.charts.noItemsSold')}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Transaction Logs Table */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-black font-headline text-on-surface">
            {t('adminReports.transactions.title')}
          </h3>
        </div>

        <DataTable<AdminTransactionListItem>
          columns={columns}
          data={filteredTransactions}
          searchPlaceholder={t('adminReports.transactions.searchPlaceholder')}
          searchableFields={['payment_intent_id', 'payment_method', 'email']}
          itemsPerPage={10}
        />
      </section>

      {/* Secondary filter by status */}
      <div className="flex items-center gap-2 mt-[-1rem] text-sm text-secondary font-semibold pl-1">
        <span>{t('adminOrders.statusFilter')}</span>
        <button
          onClick={() => setSelectedStatus(null)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            !selectedStatus
              ? 'bg-primary text-on-primary shadow-md'
              : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
          }`}
        >
          {t('adminReports.transactions.all')}
        </button>
        <button
          onClick={() => setSelectedStatus('succeeded')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            selectedStatus === 'succeeded'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
          }`}
        >
          {t('profile.payments.statuses.succeeded')}
        </button>
        <button
          onClick={() => setSelectedStatus('pending')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            selectedStatus === 'pending'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
          }`}
        >
          {t('profile.payments.statuses.pending')}
        </button>
        <button
          onClick={() => setSelectedStatus('failed')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            selectedStatus === 'failed'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
          }`}
        >
          {t('profile.payments.statuses.failed')}
        </button>
      </div>

      {isLoadingTxns ? (
        <div className="text-sm text-secondary text-center py-6 animate-pulse">
          {t('adminReports.transactions.loading')}
        </div>
      ) : null}
    </div>
  );
}
