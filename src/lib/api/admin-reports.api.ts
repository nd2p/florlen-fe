import client from '@/lib/api/client';

export interface ReportsSummaryResponse {
  message: string;
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    totalCustomers: number;
  };
  charts: {
    dailyRevenueHistory: {
      date: string;
      amount: number;
    }[];
    orderStatusBreakdown: {
      status: string;
      count: number;
    }[];
    paymentMethodsBreakdown: {
      method: string;
      count: number;
      amount: number;
    }[];
    topSellingProducts: {
      name: string;
      quantity: number;
      amount: number;
    }[];
  };
}

export interface AdminTransactionListItem {
  id: string;
  user_id: string | null;
  payment_intent_id: string;
  payment_type: 'deposit' | 'remaining_balance' | 'full_payment';
  payment_method: 'payos_qr' | 'bank_transfer' | 'manual' | string;
  gateway: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
  paid_at: string | null;
  created_at: string;
  email: string | null;
  profiles: {
    full_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
    phone_number: string | null;
  } | null;
  orders: {
    order_number: string;
  } | null;
}

export interface AdminTransactionListParams {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface AdminTransactionListResponse {
  message: string;
  transactions: AdminTransactionListItem[];
  pagination: {
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Retrieve aggregated reports stats and chart metrics
 */
export async function getReportsSummaryAdmin(): Promise<ReportsSummaryResponse> {
  const response = await client.get<ReportsSummaryResponse>('/admin/reports/summary');
  return response.data;
}

/**
 * Retrieve transaction logs list
 */
export async function listTransactionsAdmin(
  params?: AdminTransactionListParams
): Promise<AdminTransactionListResponse> {
  const response = await client.get<AdminTransactionListResponse>('/admin/reports/transactions', {
    params,
  });
  return response.data;
}
