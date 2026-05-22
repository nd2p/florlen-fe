import client from '@/lib/api/client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserAddress {
  id: string;
  label: string | null;
  is_default: boolean;
  recipient_name: string;
  phone_number: string;
  address_line_1: string;
  city: string;
  country_code: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressRequest {
  recipientName: string;
  phone: string;
  addressLine1: string;
  city: string;
  countryCode?: string;
  label?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  recipientName?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  countryCode?: string;
  label?: string;
  isDefault?: boolean;
}

export interface AddressListResponse {
  message: string;
  addresses: UserAddress[];
}

export interface AddressSingleResponse {
  message: string;
  address: UserAddress;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * List all saved addresses for the authenticated user
 */
export async function getAddresses(): Promise<AddressListResponse> {
  const response = await client.get<AddressListResponse>('/addresses');
  return response.data;
}

/**
 * Get a single address by ID
 */
export async function getAddress(id: string): Promise<AddressSingleResponse> {
  const response = await client.get<AddressSingleResponse>(`/addresses/${id}`);
  return response.data;
}

/**
 * Create a new address
 */
export async function createAddress(
  data: CreateAddressRequest
): Promise<AddressSingleResponse> {
  const response = await client.post<AddressSingleResponse>('/addresses', data);
  return response.data;
}

/**
 * Partially update an address
 */
export async function updateAddress(
  id: string,
  data: UpdateAddressRequest
): Promise<AddressSingleResponse> {
  const response = await client.patch<AddressSingleResponse>(`/addresses/${id}`, data);
  return response.data;
}

/**
 * Delete an address
 */
export async function deleteAddress(id: string): Promise<{ message: string }> {
  const response = await client.delete(`/addresses/${id}`);
  return response.data;
}

/**
 * Set an address as the default shipping address
 */
export async function setDefaultAddress(id: string): Promise<AddressSingleResponse> {
  const response = await client.post<AddressSingleResponse>(`/addresses/${id}/set-default`);
  return response.data;
}
