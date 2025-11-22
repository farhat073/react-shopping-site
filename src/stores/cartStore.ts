import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCartItems,
  clearCart as clearUserCart,
  getCartItemCount,
  getCartTotal
} from '../services/cartService';
import type { CartItem, CartState } from '../types';

interface CartStore extends CartState {
  addItem: (product: CartItem['product'], quantity?: number, variantId?: string | null) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  initializeCart: (userId?: string | null) => Promise<void>;
  syncGuestCartToUser: (userId: string) => Promise<void>;
  isGuest: boolean;
}

// Local storage keys
const GUEST_CART_KEY = 'guest_cart';

// Helper functions
const saveGuestCart = (items: CartItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const loadGuestCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading guest cart:', error);
    return [];
  }
};

const calculateTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => {
    const basePrice = item.product.price;
    const variantModifier = item.variant?.price_modifier || 0;
    return sum + ((basePrice + variantModifier) * item.quantity);
  }, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

export const useCartStore = create<CartStore>()(
  devtools(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      isGuest: true,

      addItem: async (product, quantity = 1, variantId = null) => {
        const { isGuest } = get();

        if (isGuest) {
          // Handle guest cart with localStorage
          const items = loadGuestCart();
          const existingItemIndex = items.findIndex(item =>
            item.product.id === product.id &&
            (!variantId || item.variant?.id === variantId)
          );

          if (existingItemIndex >= 0) {
            items[existingItemIndex].quantity += quantity;
          } else {
            const newItem: CartItem = {
              id: `${product.id}-${variantId || 'default'}-${Date.now()}`,
              product,
              quantity,
              variant: variantId ? { id: variantId, name: '', value: '', price_modifier: 0, stock: 0 } : null,
            };
            items.push(newItem);
          }

          saveGuestCart(items);
          const totals = calculateTotals(items);
          set({ items, ...totals });
        } else {
          // For authenticated users, this should be called with userId
          throw new Error('Authenticated cart operations require userId. Use addItemToUserCart instead.');
        }
      },

      removeItem: async (id) => {
        const { isGuest } = get();

        if (isGuest) {
          const items = loadGuestCart().filter(item => item.id !== id);
          saveGuestCart(items);
          const totals = calculateTotals(items);
          set({ items, ...totals });
        } else {
          // For authenticated users
          throw new Error('Authenticated cart operations require userId. Use removeItemFromUserCart instead.');
        }
      },

      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(id);
          return;
        }

        const { isGuest } = get();

        if (isGuest) {
          const items = loadGuestCart().map(item => {
            if (item.id === id) {
              return { ...item, quantity };
            }
            return item;
          });

          saveGuestCart(items);
          const totals = calculateTotals(items);
          set({ items, ...totals });
        } else {
          // For authenticated users
          throw new Error('Authenticated cart operations require userId. Use updateUserCartItem instead.');
        }
      },

      clearCart: () => {
        const { isGuest } = get();

        if (isGuest) {
          localStorage.removeItem(GUEST_CART_KEY);
        }

        set({ items: [], total: 0, itemCount: 0 });
      },

      initializeCart: async (userId = null) => {
        if (userId) {
          // Load authenticated user's cart
          try {
            const cartItems = await getCartItems(userId);
            const totals = calculateTotals(cartItems);
            set({ items: cartItems, ...totals, isGuest: false });
          } catch (error) {
            console.error('Error loading user cart:', error);
            // Fallback to empty cart
            set({ items: [], total: 0, itemCount: 0, isGuest: false });
          }
        } else {
          // Load guest cart from localStorage
          const items = loadGuestCart();
          const totals = calculateTotals(items);
          set({ items, ...totals, isGuest: true });
        }
      },

      syncGuestCartToUser: async (userId) => {
        const guestItems = loadGuestCart();

        if (guestItems.length === 0) {
          // No guest cart to sync
          await get().initializeCart(userId);
          return;
        }

        try {
          // Load existing user cart
          const userCartItems = await getCartItems(userId);

          // Merge guest cart with user cart
          const mergedItems = [...userCartItems];

          for (const guestItem of guestItems) {
            const existingIndex = mergedItems.findIndex(item =>
              item.product.id === guestItem.product.id &&
              (!guestItem.variant || item.variant?.id === guestItem.variant.id)
            );

            if (existingIndex >= 0) {
              // Update quantity if item exists
              await updateCartItem(userId, guestItem.product.id, mergedItems[existingIndex].quantity + guestItem.quantity, guestItem.variant?.id);
              mergedItems[existingIndex].quantity += guestItem.quantity;
            } else {
              // Add new item
              await addToCart(userId, guestItem.product.id, guestItem.quantity, guestItem.variant?.id);
              mergedItems.push(guestItem);
            }
          }

          // Clear guest cart
          localStorage.removeItem(GUEST_CART_KEY);

          // Update store
          const totals = calculateTotals(mergedItems);
          set({ items: mergedItems, ...totals, isGuest: false });

        } catch (error) {
          console.error('Error syncing guest cart to user:', error);
          // Fallback: just load user cart
          await get().initializeCart(userId);
        }
      },
    }),
    { name: 'cart-store' }
  )
);

// Additional methods for authenticated users (to be called from components with userId)
export const addItemToUserCart = async (userId: string, product: CartItem['product'], quantity = 1, variantId: string | null = null) => {
  try {
    await addToCart(userId, product.id, quantity, variantId);
    // Refresh cart in store
    const store = useCartStore.getState();
    await store.initializeCart(userId);
  } catch (error) {
    console.error('Error adding item to user cart:', error);
    throw error;
  }
};

export const removeItemFromUserCart = async (userId: string, productId: string, variantId: string | null = null) => {
  try {
    await removeFromCart(userId, productId, variantId);
    // Refresh cart in store
    const store = useCartStore.getState();
    await store.initializeCart(userId);
  } catch (error) {
    console.error('Error removing item from user cart:', error);
    throw error;
  }
};

export const updateUserCartItem = async (userId: string, productId: string, quantity: number, variantId: string | null = null) => {
  try {
    await updateCartItem(userId, productId, quantity, variantId);
    // Refresh cart in store
    const store = useCartStore.getState();
    await store.initializeCart(userId);
  } catch (error) {
    console.error('Error updating user cart item:', error);
    throw error;
  }
};

export const clearUserCartWrapper = async (userId: string) => {
  try {
    await clearUserCart(userId);
    // Refresh cart in store
    const store = useCartStore.getState();
    await store.initializeCart(userId);
  } catch (error) {
    console.error('Error clearing user cart:', error);
    throw error;
  }
};