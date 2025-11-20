import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
// TODO: Import Strapi cart functions
// import { addCartItemToStrapi as apiAddToCart, getCartItemsFromStrapi as fetchUserCart } from '../api/cart';
import type { CartItem, CartState } from '../types';

interface CartStore extends CartState {
  addItem: (product: CartItem['product'], quantity?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  syncWithBackend: (userId: string) => Promise<void>;
  loadFromBackend: (userId: string) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  devtools(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: async (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.product.id === product.id);

        if (existingItem) {
          await get().updateQuantity(product.id, existingItem.quantity + quantity);
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity,
          };
          set(state => ({
            items: [...state.items, newItem],
            itemCount: state.itemCount + quantity,
            total: state.total + (product.price * quantity),
          }));
        }
      },

      removeItem: async (id) => {
        set(state => {
          const itemToRemove = state.items.find(item => item.id === id);
          if (!itemToRemove) return state;

          const newItems = state.items.filter(item => item.id !== id);
          return {
            items: newItems,
            itemCount: state.itemCount - itemToRemove.quantity,
            total: state.total - (itemToRemove.product.price * itemToRemove.quantity),
          };
        });
      },

      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(id);
          return;
        }

        set(state => {
          const newItems = state.items.map(item => {
            if (item.id === id) {
              return { ...item, quantity };
            }
            return item;
          });

          const updatedItem = newItems.find(item => item.id === id);
          if (!updatedItem) return state;

          const totalDiff = (updatedItem.product.price * quantity) - (updatedItem.product.price * state.items.find(i => i.id === id)!.quantity);

          return {
            items: newItems,
            itemCount: state.itemCount + (quantity - state.items.find(i => i.id === id)!.quantity),
            total: state.total + totalDiff,
          };
        });
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 });
      },

      syncWithBackend: async (userId: string) => {
        // TODO: Sync local cart to Strapi backend
        // const { items } = get();
        // for (const item of items) {
        //   try {
        //     await apiAddToCart(userId, item.product.id, item.quantity);
        //   } catch (error) {
        //     console.error('Error syncing cart item:', error);
        //   }
        // }
      },

      loadFromBackend: async (userId: string) => {
        // TODO: Load cart from Strapi backend
        // try {
        //   const backendItems = await fetchUserCart(userId);
        //   // Convert backend items to local format
        //   const localItems: CartItem[] = backendItems.map((item: any) => ({
        //     id: item.id,
        //     product: item.product,
        //     quantity: item.quantity,
        //   }));

        //   const total = localItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        //   const itemCount = localItems.reduce((sum, item) => sum + item.quantity, 0);

        //   set({
        //     items: localItems,
        //     total,
        //     itemCount,
        //   });
        // } catch (error) {
        //   console.error('Error loading cart from backend:', error);
        // }
      },
    }),
    { name: 'cart-store' }
  )
);