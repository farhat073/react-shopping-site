import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export const useCart = () => {
  const {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    buyNow,
  } = useContext(CartContext)!;

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    await updateQuantity(itemId, quantity);
  };

  const isInCart = (productId: string) => {
    return items.some(item => item.product.id === productId);
  };

  const getCartItem = (productId: string) => {
    return items.find(item => item.product.id === productId);
  };

  return {
    items,
    total,
    itemCount,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    buyNow,
    isInCart,
    getCartItem,
  };
};