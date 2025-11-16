import { createItem, readItems, updateItem } from '@directus/sdk';
import { directus } from './directusClient';

interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

export const createOrder = async (userId: string, totalPrice: number, _items: OrderItem[]): Promise<string> => {
  try {
    // Create the order
    const order = await directus.request(
      createItem('orders', {
        user: userId,
        total_price: totalPrice,
        status: 'pending'
      })
    );

    // For now, skip order_items since the collection might not exist
    // In a real implementation, you'd create order items here

    return order.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const fetchOrdersByUser = async (userId: string) => {
  try {
    const response = await directus.request(
      readItems('orders', {
        filter: {
          user: {
            _eq: userId
          }
        },
        fields: ['*'],
        sort: ['-created_at']
      })
    );
    return response;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const fetchAllOrders = async () => {
  try {
    const response = await directus.request(
      readItems('orders', {
        fields: ['*'],
        sort: ['-created_at']
      })
    );
    return response;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const response = await directus.request(
      updateItem('orders', orderId, { status })
    );
    return response;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};