import supabase from '../lib/supabase.js';

/**
 * Create a new order with stock validation
 * @param {Object} orderData - Order data
 * @param {string} orderData.user_id - User ID
 * @param {number} orderData.total_price - Total price
 * @param {Object} orderData.shipping_address - Shipping address
 * @param {Object} orderData.billing_address - Billing address
 * @param {Array} orderData.items - Order items
 * @returns {Promise<Object>} Created order with items
 */
export const createOrder = async (orderData) => {
  try {
    // Start a transaction by using RPC or multiple operations
    // First, validate stock for all items
    for (const item of orderData.items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, stock, title')
        .eq('id', item.product_id)
        .single();

      if (productError) throw new Error(`Product not found: ${item.product_id}`);
      if (!product) throw new Error(`Product not found: ${item.product_id}`);

      let availableStock = product.stock;

      // If variant specified, check variant stock
      if (item.variant_id) {
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('stock')
          .eq('id', item.variant_id)
          .single();

        if (variantError) throw new Error(`Variant not found: ${item.variant_id}`);
        if (variant.stock !== null) {
          availableStock = variant.stock;
        }
      }

      if (availableStock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title}. Available: ${availableStock}, Requested: ${item.quantity}`);
      }
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id,
        total_price: orderData.total_price,
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      quantity: item.quantity,
      price: item.price
    }));

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) throw itemsError;

    // Update product stock
    for (const item of orderData.items) {
      // Update main product stock
      const { error: updateProductError } = await supabase.rpc('decrement_stock', {
        product_id: item.product_id,
        quantity: item.quantity
      });

      if (updateProductError) {
        console.error('Error updating product stock:', updateProductError);
        // Continue with variant stock update
      }

      // Update variant stock if applicable
      if (item.variant_id) {
        const { error: updateVariantError } = await supabase
          .from('product_variants')
          .update({
            stock: supabase.raw('stock - ?', [item.quantity])
          })
          .eq('id', item.variant_id)
          .gt('stock', item.quantity - 1); // Ensure we don't go negative

        if (updateVariantError) {
          console.error('Error updating variant stock:', updateVariantError);
        }
      }
    }

    return {
      ...order,
      items: items
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get user's orders
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User's orders with items
 */
export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          id,
          quantity,
          price,
          created_at,
          product:products(
            id,
            title,
            slug,
            images:product_images(url, alt_text, is_primary)
          ),
          variant:product_variants(
            id,
            name,
            value,
            price_modifier
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (for security)
 * @returns {Promise<Object>} Order with items
 */
export const getOrderById = async (orderId, userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          id,
          quantity,
          price,
          created_at,
          product:products(
            id,
            title,
            slug,
            images:product_images(url, alt_text, is_primary)
          ),
          variant:product_variants(
            id,
            name,
            value,
            price_modifier
          )
        )
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

/**
 * Update order status (admin only)
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Fetch all orders (admin only)
 * @returns {Promise<Array>} All orders with items
 */
export const fetchAllOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          id,
          quantity,
          price,
          created_at,
          product:products(
            id,
            title,
            slug,
            images:product_images(url, alt_text, is_primary)
          ),
          variant:product_variants(
            id,
            name,
            value,
            price_modifier
          )
        ),
        user:users(
          id,
          email,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

/**
 * Cancel order (user can cancel pending orders)
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated order
 */
export const cancelOrder = async (orderId, userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;

    // TODO: Restore stock when order is cancelled
    // This would require storing original stock levels or implementing stock restoration logic

    return data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};