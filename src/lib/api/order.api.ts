import client from '@/lib/api/client';

// ─── Types ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'in_production'
  | 'quality_check'
  | 'awaiting_remaining_payment'
  | 'ready_to_ship'
  | 'shipping'
  | 'completed'
  | 'cancelled';

export type PaymentOption = 'full' | 'deposit';

export type PaymentStage = 'deposit_pending' | 'deposit_paid' | 'fully_paid' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  product_name: string;
  product_sku: string;
  product_image_url: string | null;
  variant_label: string | null;
  unit_price: number;
  customization_fee: number;
  quantity: number;
  subtotal: number;
  total_amount: number;
  deposit_amount: number;
  remaining_amount: number;
  currency: string;
  payment_option: PaymentOption;
  payment_stage: PaymentStage;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: {
    address_line_1: string;
    city: string;
    country_code: string;
    label?: string;
  };
  customer_note: string | null;
  estimated_production_days: number;
  estimated_delivery: string;
  created_at: string;
  updated_at: string;
  // Detail fields (from getOrderById)
  status_logs?: StatusLog[];
  payments?: PaymentRecord[];
  order_items?: OrderItemDetail[];
}

export interface OrderItemDetail {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string;
  product_image_url: string | null;
  variant_label: string | null;
  design_mockup_url: string | null;
  design_summary: Record<string, unknown> | null;
  unit_price: number;
  customization_fee: number;
  quantity: number;
  subtotal: number;
  item_type: 'normal' | 'ai_personalization';
  created_at: string;
  updated_at: string;
}

export interface OrderSummary {
  id: string;
  order_number: string;
  status: OrderStatus;
  product_name: string;
  product_image_url: string | null;
  variant_label: string | null;
  total_amount: number;
  deposit_amount: number;
  remaining_amount: number;
  payment_option: PaymentOption;
  payment_stage: PaymentStage;
  created_at: string;
  estimated_delivery: string;
  recipient_name?: string;
  recipient_phone?: string;
  order_items?: {
    product_name: string;
    product_image_url: string | null;
    variant_label: string | null;
  }[];
}

export interface StatusLog {
  id: string;
  order_id: string;
  from_status: string | null;
  to_status: string;
  change_source: string;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  payment_type: string;
  amount: number;
  status: string;
  paid_at: string | null;
  qr_code_url: string | null;
  created_at: string;
}

export interface CreateOrderRequest {
  cartId: string;
  paymentOption: PaymentOption;
  addressId: string;
  note?: string;
}

export interface CreateOrderResponse {
  message: string;
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    depositAmount: number;
    remainingAmount: number;
    paymentOption: PaymentOption;
  };
  paymentLink: {
    checkoutUrl: string;
    qrCode: string | null;
  };
  orderCode: number;
}

export interface OrderListResponse {
  orders: OrderSummary[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface OrderDetailResponse {
  order: Order;
}

export interface PayRemainingResponse {
  message: string;
  paymentLink: {
    checkoutUrl: string;
    qrCode: string | null;
  };
  orderCode: number;
  amount: number;
}

export interface AdminOrderListParams {
  cursor?: string;
  limit?: number;
  status?: OrderStatus;
  paymentStage?: PaymentStage;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Create a new order from cart and get PayOS payment link
 */
export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
  const response = await client.post<CreateOrderResponse>('/orders', data);
  return response.data;
}

/**
 * List orders for authenticated user
 */
export async function getOrders(params?: {
  cursor?: string;
  limit?: number;
}): Promise<OrderListResponse> {
  const response = await client.get<OrderListResponse>('/orders', { params });
  return response.data;
}

/**
 * Get full order detail
 */
export async function getOrderById(id: string): Promise<OrderDetailResponse> {
  const response = await client.get<OrderDetailResponse>(`/orders/${id}`);
  return response.data;
}

/**
 * Cancel an order (only allowed for pending_payment status)
 */
export async function cancelOrder(id: string): Promise<{ message: string; order: Order }> {
  const response = await client.post<{ message: string; order: Order }>(`/orders/${id}/cancel`);
  return response.data;
}

/**
 * Create PayOS payment link for remaining 70% balance
 */
export async function payRemaining(id: string): Promise<PayRemainingResponse> {
  const response = await client.post<PayRemainingResponse>(`/orders/${id}/pay-remaining`);
  return response.data;
}

/**
 * List all orders in system (Admin only)
 */
export async function getAllOrdersAdmin(params?: AdminOrderListParams): Promise<OrderListResponse> {
  const response = await client.get<OrderListResponse>('/admin/orders', { params });
  return response.data;
}

/**
 * Update order status manually (Admin only)
 */
export async function updateOrderStatusAdmin(
  id: string,
  status: OrderStatus
): Promise<{ message: string; order: Order }> {
  const response = await client.patch<{ message: string; order: Order }>(`/admin/orders/${id}/status`, {
    status,
  });
  return response.data;
}

/**
 * Synchronize and confirm payment status with the backend after PayOS redirect
 */
export async function syncPayment(orderCode: number): Promise<{ success: boolean; orderId?: string; newStatus?: string }> {
  const response = await client.post<{ success: boolean; orderId?: string; newStatus?: string }>('/orders/sync-payment', { orderCode });
  return response.data;
}
