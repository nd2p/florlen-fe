import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  mergeCart,
  Cart,
  CartItem,
  AddItemRequest,
} from '@/lib/api/cart.api';
import { getOrCreateSessionId, clearSessionId } from '@/lib/session';

export const isCartItemActive = (item: CartItem) => {
  if (item.products === undefined) return true;
  if (item.products === null) return false;

  if (item.products.is_active === false || item.products.deleted_at) {
    return false;
  }

  if (item.variant_id && item.product_variants) {
    if (item.product_variants.is_active === false) {
      return false;
    }
  }

  return true;
};

interface CartState {
  cart: Cart | null;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (data: AddItemRequest) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  mergeCartAfterLogin: () => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      items: [],
      totalQuantity: 0,
      totalAmount: 0,
      isLoading: false,
      error: null,

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await getCart();
          const items = cart.cart_items || [];
          const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
          const totalAmount = items.reduce(
            (acc, item) => acc + (isCartItemActive(item) ? item.line_total : 0),
            0
          );

          set({ cart, items, totalQuantity, totalAmount, isLoading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error('Failed to fetch cart:', error);
          set({ error: message, isLoading: false });
        }
      },

      addItem: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { items } = get();
          const existingItem = items.find(
            (item) =>
              item.product_id === data.product_id &&
              item.variant_id === (data.variant_id || null) &&
              item.item_type === data.item_type
          );

          if (existingItem) {
            // Aggregate: Update quantity of existing item
            await updateCartItem(existingItem.id, existingItem.quantity + (data.quantity || 1));
          } else {
            // New item
            await addCartItem(data);
          }

          await get().fetchCart(); // Refresh cart data
          toast.success(existingItem ? 'Updated quantity in cart' : 'Added to cart');
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to add item to cart';
          console.error('Failed to add item to cart:', error);
          toast.error(message);
          set({ error: message, isLoading: false });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        set({ isLoading: true, error: null });
        try {
          await updateCartItem(itemId, quantity);
          await get().fetchCart();
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to update quantity';
          console.error('Failed to update quantity:', error);
          toast.error('Failed to update quantity');
          set({ error: message, isLoading: false });
        }
      },

      removeItem: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
          await removeCartItem(itemId);
          await get().fetchCart();
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to remove item';
          console.error('Failed to remove item:', error);
          toast.error('Failed to remove item');
          set({ error: message, isLoading: false });
        }
      },

      mergeCartAfterLogin: async () => {
        const sessionId = getOrCreateSessionId();
        if (!sessionId) return;

        set({ isLoading: true });
        try {
          const result = await mergeCart(sessionId);
          if (result.merged > 0) {
            toast.success(`Merged ${result.merged} items from guest cart`);
          }
          clearSessionId(); // Session is now merged
          await get().fetchCart(); // Fetch the user's new cart
        } catch (error: unknown) {
          console.error('Failed to merge cart:', error);
          // Don't toast error here, usually it's silent if guest cart was empty or already gone
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => {
        set({ cart: null, items: [], totalQuantity: 0, totalAmount: 0 });
      },
    }),
    {
      name: 'florlen-cart-storage',
      partialize: (state) => ({
        // Persist only essential info if needed, but we mostly rely on backend
        totalQuantity: state.totalQuantity,
      }),
    }
  )
);
