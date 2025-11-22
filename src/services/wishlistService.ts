import supabase from '../lib/supabase';
import type { WishlistItem } from '../types';

/**
 * Get user's wishlist with product details
 * @param userId - User ID
 * @returns User's wishlist items with product details
 */
export const getUserWishlist = async (userId: string): Promise<WishlistItem[]> => {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        created_at,
        product:products(
          id,
          title,
          slug,
          price,
          currency,
          stock,
          published,
          images:product_images(url, alt_text, is_primary)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as unknown as WishlistItem[];
  } catch (error) {
    console.error('Error fetching user wishlist:', error);
    throw error;
  }
};

/**
 * Add product to user's wishlist
 * @param userId - User ID
 * @param productId - Product ID
 * @returns Created wishlist item with product details
 */
export const addToWishlist = async (userId: string, productId: string): Promise<WishlistItem> => {
  try {
    // Check if already in wishlist
    const { data: existing, error: checkError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existing) {
      throw new Error('Product already in wishlist');
    }

    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        product_id: productId,
      })
      .select(`
        id,
        created_at,
        product:products(
          id,
          title,
          slug,
          price,
          currency,
          stock,
          published,
          images:product_images(url, alt_text, is_primary)
        )
      `)
      .single();

    if (error) throw error;
    return data as unknown as WishlistItem;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

/**
 * Remove product from user's wishlist
 * @param userId - User ID
 * @param productId - Product ID
 * @returns Deleted wishlist item with product details
 */
export const removeFromWishlist = async (userId: string, productId: string): Promise<WishlistItem> => {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select(`
        id,
        created_at,
        product:products(
          id,
          title,
          slug,
          price,
          currency,
          stock,
          published,
          images:product_images(url, alt_text, is_primary)
        )
      `)
      .single();

    if (error) throw error;
    return data as unknown as WishlistItem;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

/**
 * Check if product is in user's wishlist
 * @param userId - User ID
 * @param productId - Product ID
 * @returns Whether product is in wishlist
 */
export const isInWishlist = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    throw error;
  }
};