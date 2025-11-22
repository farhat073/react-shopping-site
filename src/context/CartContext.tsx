import React, { createContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth'; // useAuth hook is exported from hooks directory
import { useCartStore, addItemToUserCart, removeItemFromUserCart, updateUserCartItem, clearUserCartWrapper } from '../stores/cartStore';
import type { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  isGuest: boolean;
  addToCart: (product: Product, quantity?: number, variantId?: string | null) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  buyNow: (product: Product) => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cartStore = useCartStore();

  // Initialize cart on mount and when auth state changes
  useEffect(() => {
    cartStore.initializeCart(user?.id || null);
  }, [user?.id, cartStore.initializeCart]);

  // Sync guest cart to user cart when user logs in
  useEffect(() => {
    if (user && cartStore.isGuest) {
      cartStore.syncGuestCartToUser(user.id);
    }
  }, [user, cartStore.isGuest, cartStore.syncGuestCartToUser]);

  const addToCart = useCallback(async (product: Product, quantity = 1, variantId: string | null = null) => {
    try {
      if (user) {
        await addItemToUserCart(user.id, product, quantity, variantId);
      } else {
        await cartStore.addItem(product, quantity, variantId);
      }
      toast.success(`${product.title} added to cart!`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add item to cart.';
      toast.error(message);
      throw error;
    }
  }, [user, cartStore]);

  const removeFromCart = useCallback(async (id: string) => {
    try {
      if (user) {
        // For authenticated users, we need to find the product ID from the cart item
        const item = cartStore.items.find(item => item.id === id);
        if (item) {
          await removeItemFromUserCart(user.id, item.product.id, item.variant?.id);
        }
      } else {
        await cartStore.removeItem(id);
      }
      toast.success('Item removed from cart!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove item from cart.';
      toast.error(message);
      throw error;
    }
  }, [user, cartStore]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(id);
        return;
      }

      if (user) {
        // For authenticated users, we need to find the product ID from the cart item
        const item = cartStore.items.find(item => item.id === id);
        if (item) {
          await updateUserCartItem(user.id, item.product.id, quantity, item.variant?.id);
        }
      } else {
        await cartStore.updateQuantity(id, quantity);
      }
      toast.success('Quantity updated!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update quantity.';
      toast.error(message);
      throw error;
    }
  }, [user, cartStore, removeFromCart]);

  const clearCart = useCallback(async () => {
    try {
      if (user) {
        await clearUserCartWrapper(user.id);
      } else {
        cartStore.clearCart();
      }
      toast.success('Cart cleared!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to clear cart.';
      toast.error(message);
      throw error;
    }
  }, [user, cartStore]);

  const buyNow = useCallback(async (product: Product) => {
    try {
      if (!user) {
        navigate('/login');
        toast.error('Please log in to continue');
        return;
      }

      await addToCart(product, 1);
      navigate('/checkout');
      toast.success('Proceeding to checkout!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to proceed to checkout.';
      toast.error(message);
      // Don't throw error here to prevent navigation issues
    }
  }, [user, navigate, addToCart]);

  const value: CartContextType = {
    items: cartStore.items,
    total: cartStore.total,
    itemCount: cartStore.itemCount,
    isGuest: cartStore.isGuest,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    buyNow,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
