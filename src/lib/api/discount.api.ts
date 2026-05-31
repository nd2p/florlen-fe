import client from './client';

export interface AssignedUser {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export interface Voucher {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount_value: number;
  start_date: string;
  end_date?: string | null;
  usage_limit?: number | null;
  limit_per_user?: number | null;
  used_count: number;
  is_active: boolean;
  user_ids?: string[];
  assigned_users?: AssignedUser[];
  created_at: string;
  updated_at: string;
}

export interface ListVouchersResponse {
  vouchers: Voucher[];
  hasMore: boolean;
  nextCursor?: string | null;
}

export interface SingleVoucherResponse {
  message: string;
  voucher: Voucher;
}

export interface ValidateVoucherPayload {
  code: string;
  subtotal: number;
}

export interface ValidateVoucherResponse {
  message: string;
  voucherId: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_shipping';
  discountValue: number;
  discountAmount: number;
}

/**
 * Fetch all vouchers in system (Admin only)
 */
export async function getAdminVouchers(search?: string, cursor?: string): Promise<ListVouchersResponse> {
  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (cursor) params.cursor = cursor;

  const res = await client.get<ListVouchersResponse>('/discounts', { params });
  return res.data;
}

/**
 * Create a new voucher (Admin only)
 */
export async function createVoucher(payload: Partial<Voucher>): Promise<SingleVoucherResponse> {
  const res = await client.post<SingleVoucherResponse>('/discounts', payload);
  return res.data;
}

/**
 * Update an existing voucher (Admin only)
 */
export async function updateVoucher(id: string, payload: Partial<Voucher>): Promise<SingleVoucherResponse> {
  const res = await client.patch<SingleVoucherResponse>(`/discounts/${id}`, payload);
  return res.data;
}

/**
 * Soft delete a voucher (Admin only)
 */
export async function deleteVoucher(id: string): Promise<{ message: string }> {
  const res = await client.delete<{ message: string }>(`/discounts/${id}`);
  return res.data;
}

/**
 * Validate voucher code at checkout
 */
export async function validateVoucher(code: string, subtotal: number): Promise<ValidateVoucherResponse> {
  const res = await client.post<ValidateVoucherResponse>('/discounts/validate', { code, subtotal });
  return res.data;
}

export interface AvailableVoucher {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount_value: number;
  end_date?: string | null;
  discountAmount: number;
}

/**
 * Fetch all vouchers available for the current authenticated user at checkout
 */
export async function getAvailableVouchers(subtotal: number): Promise<AvailableVoucher[]> {
  const res = await client.get<{ vouchers: AvailableVoucher[] }>('/discounts/available', {
    params: { subtotal },
  });
  return res.data.vouchers;
}
