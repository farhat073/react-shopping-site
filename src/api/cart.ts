import { readItems, createItem, updateItem, deleteItem } from '@directus/sdk';
import { directus } from './directusClient';
import type { CartItem } from '../types';

export const getCartItemsFromDirectus = async (userId: string): Promise<CartItem[]> => {
  try {
    console.log('Fetching cart items for user:', userId);
    const response = await directus.request(
      readItems('cart_items', {
        filter: {
          user: {
            _eq: userId
          }
        },
        fields: ['*', 'product.*', 'product.category.*', 'product.images.*']
      })
    );
    return response as CartItem[];
  } catch (error: any) {
    console.error('Error fetching user cart:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error.response?.status === 403) {
      throw new Error('Authentication required. Please log in to view your cart.');
    }
    throw error;
  }
};

export const addCartItemToDirectus = async (userId: string, productId: string, quantity: number = 1): Promise<CartItem> => {
  try {
    console.log('Adding to cart - user:', userId, 'product:', productId, 'quantity:', quantity);
    // Check if item already exists in cart
    const existingItems = await directus.request(
      readItems('cart_items', {
        filter: {
          user: { _eq: userId },
          product: { _eq: productId }
        },
        limit: 1
      })
    );

    if (existingItems.length > 0) {
      // Update quantity by adding the new quantity
      const updatedItem = await directus.request(
        updateItem('cart_items', existingItems[0].id, {
          quantity: existingItems[0].quantity + quantity
        })
      );
      return updatedItem as CartItem;
    } else {
      // Create new cart item
      const newItem = await directus.request(
        createItem('cart_items', {
          user: userId,
          product: productId,
          quantity
        })
      );
      return newItem as CartItem;
    }
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error.response?.status === 403) {
      throw new Error('Authentication required. Please log in to add items to your cart.');
    }
    throw error;
  }
};

export const updateCartItemInDirectus = async (cartItemId: string, quantity: number): Promise<CartItem> => {
  try {
    if (quantity <= 0) {
      await directus.request(deleteItem('cart_items', cartItemId));
      throw new Error('Item removed from cart');
    }

    const updatedItem = await directus.request(
      updateItem('cart_items', cartItemId, { quantity })
    );
    return updatedItem as CartItem;
  } catch (error: any) {
    console.error('Error updating cart item quantity:', error);
    if (error.response?.status === 403) {
      throw new Error('Authentication required. Please log in to update your cart.');
    }
    throw error;
  }
};

export const deleteCartItemFromDirectus = async (cartItemId: string): Promise<void> => {
  try {
    await directus.request(deleteItem('cart_items', cartItemId));
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    if (error.response?.status === 403) {
      throw new Error('Authentication required. Please log in to remove items from your cart.');
    }
    throw error;
  }
};

export const clearUserCart = async (userId: string): Promise<void> => {
  try {
    const cartItems = await directus.request(
      readItems('cart_items', {
        filter: {
          user: { _eq: userId }
        },
        fields: ['id']
      })
    );

    const deletePromises = cartItems.map(item =>
      directus.request(deleteItem('cart_items', item.id))
    );

    await Promise.all(deletePromises);
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    if (error.response?.status === 403) {
      throw new Error('Authentication required. Please log in to clear your cart.');
    }
    throw error;
  }
};