import supabase from '../lib/supabase.ts';
import type { CartItem } from '../types';

/**
 * Add or update item in user's cart
 * @param userId - User ID
 * @param productId - Product ID
 * @param quantity - Quantity to add/update
 * @param variantId - Variant ID (optional)
 * @returns Cart item
 */
export const addToCart = async (userId: string, productId: string, quantity: number, variantId: string | null = null) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: userId,
        product_id: productId,
        variant_id: variantId,
        quantity: quantity,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,product_id,variant_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param userId - User ID
 * @param productId - Product ID
 * @param quantity - New quantity
 * @param variantId - Variant ID (optional)
 * @returns Updated cart item
 */
export const updateCartItem = async (userId: string, productId: string, quantity: number, variantId: string | null = null) => {
  try {
    if (quantity <= 0) {
      return await removeFromCart(userId, productId, variantId);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('variant_id', variantId || null)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 * @param userId - User ID
 * @param productId - Product ID
 * @param variantId - Variant ID (optional)
 * @returns Success status
 */
export const removeFromCart = async (userId: string, productId: string, variantId: string | null = null) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('variant_id', variantId || null);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

/**
 * Get user's cart items with product details
 * @param userId - User ID
 * @returns Cart items with product data
 */
export const getCartItems = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        created_at,
        updated_at,
        product:products(
          id,
          title,
          slug,
          price,
          currency,
          stock,
          images:product_images(url, alt_text, is_primary)
        ),
        variant:product_variants(
          id,
          name,
          value,
          price_modifier,
          stock,
          sku
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Process the data to match CartItem interface
    return data.map(item => ({
      id: item.id,
      product: {
        ...item.product,
        images: item.images || [],
        variants: item.variant ? [item.variant] : []
      },
      quantity: item.quantity,
      variant: item.variant || null
    }));
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

/**
 * Clear user's entire cart
 * @param userId - User ID
 * @returns Success status
 */
export const clearCart = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Get cart item count for user
 * @param userId - User ID
 * @returns Total item count
 */
export const getCartItemCount = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', userId);

    if (error) throw error;

    return data.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart item count:', error);
    throw error;
  }
};

/**
 * Get cart total for user
 * @param userId - User ID
 * @returns Total price
 */
export const getCartTotal = async (userId: string): Promise<number> => {
  try {
    const items = await getCartItems(userId);

    return items.reduce((total, item) => {
      const basePrice = item.product.price;
      const variantModifier = item.variant?.price_modifier || 0;
      return total + ((basePrice + variantModifier) * item.quantity);
    }, 0);
  } catch (error) {
    console.error('Error calculating cart total:', error);
    throw error;
  }
};