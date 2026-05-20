import client from '@/lib/api/client';

export type CartItemType = 'normal' | 'ai_personalization';

export interface CartItem {
  id: string;
  cart_id: string;
  item_type: CartItemType;
  product_id: string;
  variant_id?: string | null;
  design_id?: string | null;
  quantity: number;
  unit_price: number;
  customization_fee: number;
  line_total: number;
  product_name: string;
  product_snapshot: {
    sku: string;
    name: string;
    slug: string;
    product_type: string;
    base_price: number;
    customization_fee: number;
    image_url: string | null;
    variant_label: string | null;
    variant_sku_suffix: string | null;
  };
  products?: {
    is_active?: boolean | null;
    deleted_at?: string | null;
  } | null;
  added_at: string;
}

export interface Cart {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  cart_items: CartItem[];
  created_at: string;
  updated_at: string;
  expires_at?: string | null;
}

export interface AddItemRequest {
  item_type: CartItemType;
  product_id: string;
  variant_id?: string;
  quantity?: number;
  design_id?: string;
}

export interface CartResponse {
  cart: Cart;
}

/**
 * Fetch the current cart (guest or authenticated)
 */
export async function getCart(): Promise<Cart> {
  const response = await client.get<CartResponse>('/cart');
  return response.data.cart;
}

/**
 * Add an item to the cart
 */
export async function addCartItem(data: AddItemRequest): Promise<CartItem> {
  const response = await client.post<CartItem>('/cart/items', data);
  return response.data;
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(itemId: string, quantity: number): Promise<CartItem> {
  const response = await client.patch<CartItem>(`/cart/items/${itemId}`, { quantity });
  return response.data;
}

/**
 * Remove an item from the cart
 */
export async function removeCartItem(itemId: string): Promise<void> {
  await client.delete(`/cart/items/${itemId}`);
}

/**
 * Merge guest cart into user cart after login
 */
export async function mergeCart(sessionId: string): Promise<{ merged: number }> {
  const response = await client.post<{ merged: number }>('/cart/merge', { sessionId });
  return response.data;
}
