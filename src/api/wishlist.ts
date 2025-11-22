import type { WishlistItem } from '../types';
import { getUserWishlist as fetchUserWishlist, addToWishlist as addToWishlistService, removeFromWishlist as removeFromWishlistService, isInWishlist as checkInWishlist } from '../services/wishlistService';

export const getUserWishlist = async (userId: string): Promise<WishlistItem[]> => {
  return await fetchUserWishlist(userId);
};

export const addToWishlist = async (userId: string, productId: string): Promise<WishlistItem> => {
  return await addToWishlistService(userId, productId);
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<WishlistItem> => {
  return await removeFromWishlistService(userId, productId);
};

export const isInWishlist = async (userId: string, productId: string): Promise<boolean> => {
  return await checkInWishlist(userId, productId);
};