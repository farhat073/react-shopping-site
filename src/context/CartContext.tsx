import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getCartItemsFromDirectus,
  addCartItemToDirectus,
  updateCartItemInDirectus,
  deleteCartItemFromDirectus,
  clearUserCart
} from '../api/cart';
import type { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  buyNow: (product: Product) => Promise<void>;
  syncWithDirectus: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = 'guest_cart';

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing stored cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const syncWithDirectus = useCallback(async () => {
    if (!user) return;

    try {
      console.log("🔄 Syncing cart with Directus for:", user.id);

      // 1. Fetch cart_items where user = $CURRENT_USER
      const directusItems = await getCartItemsFromDirectus(user.id);

      // 2. Set items to Directus items
      setItems(directusItems);

      // 3. Delete localStorage cart
      localStorage.removeItem(CART_STORAGE_KEY);

      console.log("✅ Sync complete. Directus items:", directusItems);
    } catch (error) {
      console.error("❌ Error syncing cart:", error);
    }
  }, [user]);

  // Sync with Directus when user logs in
  useEffect(() => {
    if (user) {
      syncWithDirectus();
    } else {
      // When user logs out, clear cart
      setItems([]);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [user, syncWithDirectus]);

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    try {
      if (user) {
        // Add to Directus
        await addCartItemToDirectus(user.id, product.id, quantity);
        // Refresh local state
        const updatedItems = await getCartItemsFromDirectus(user.id);
        setItems(updatedItems);
      } else {
        // Add to local cart
        setItems(prevItems => {
          const existingItem = prevItems.find(item => item.product.id === product.id);
          if (existingItem) {
            return prevItems.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            const newItem: CartItem = {
              id: `${product.id}-${Date.now()}`,
              product,
              quantity,
            };
            return [...prevItems, newItem];
          }
        });
      }
      toast.success(`${product.title} added to cart!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add item to cart.');
      throw error;
    }
  }, [user]);

  const removeFromCart = useCallback(async (id: string) => {
    try {
      if (user) {
        await deleteCartItemFromDirectus(id);
        const updatedItems = await getCartItemsFromDirectus(user.id);
        setItems(updatedItems);
      } else {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
      }
      toast.success('Item removed from cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item from cart.');
      throw error;
    }
  }, [user]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(id);
        return;
      }

      if (user) {
        await updateCartItemInDirectus(id, quantity);
        const updatedItems = await getCartItemsFromDirectus(user.id);
        setItems(updatedItems);
      } else {
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        );
      }
      toast.success('Quantity updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity.');
      throw error;
    }
  }, [user, removeFromCart]);

  const clearCart = useCallback(async () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    if (user) {
      try {
        await clearUserCart(user.id);
      } catch (error) {
        console.error('Error clearing Directus cart:', error);
      }
    }
  }, [user]);

  const buyNow = useCallback(async (product: Product) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      await addToCart(product, 1);
      navigate('/checkout');
      toast.success('Proceeding to checkout!');
    } catch (error) {
      toast.error('Failed to proceed to checkout.');
      throw error;
    }
  }, [user, navigate, addToCart]);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    buyNow,
    syncWithDirectus,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
