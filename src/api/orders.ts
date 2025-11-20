import { strapi } from './strapiClient';
import type { Order } from '../types';

interface OrderItemInput {
  product: string;
  quantity: number;
  price: number;
}

export const createOrder = async (userId: string, totalPrice: number, items: OrderItemInput[]): Promise<string> => {
  const response = await strapi.post('/orders', {
    data: {
      user: userId,
      total_price: totalPrice,
      status: 'pending',
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
    },
  });

  return response.data.id.toString();
};

export const fetchOrdersByUser = async (userId: string): Promise<Order[]> => {
  const response = await strapi.get('/orders', {
    'filters[user][id][$eq]': userId,
    populate: '*',
    sort: 'createdAt:desc',
  });

  return response.data?.map((item: any) => ({
    id: item.id.toString(),
    user: item.attributes.user?.data?.id?.toString() || userId,
    total_price: item.attributes.total_price,
    status: item.attributes.status,
    created_at: item.attributes.createdAt,
  })) || [];
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  const response = await strapi.get('/orders', {
    populate: 'user',
    sort: 'createdAt:desc',
  });

  return response.data?.map((item: any) => ({
    id: item.id.toString(),
    user: item.attributes.user?.data?.id?.toString() || '',
    total_price: item.attributes.total_price,
    status: item.attributes.status,
    created_at: item.attributes.createdAt,
  })) || [];
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  await strapi.put(`/orders/${orderId}`, {
    data: {
      status,
    },
  });
};