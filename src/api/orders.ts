import { createOrder as createOrderService, getUserOrders, getOrderById, updateOrderStatus, cancelOrder, fetchAllOrders as fetchAllOrdersService } from '../services/orderService.js';
import type { Order, CreateOrderData } from '../types/order.js';

export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  return await createOrderService(orderData);
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  return await getUserOrders(userId);
};

export const getOrder = async (orderId: string, userId: string): Promise<Order> => {
  return await getOrderById(orderId, userId);
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  return await fetchAllOrdersService();
};

export const updateOrder = async (orderId: string, status: string): Promise<Order> => {
  return await updateOrderStatus(orderId, status);
};

export const cancelUserOrder = async (orderId: string, userId: string): Promise<Order> => {
  return await cancelOrder(orderId, userId);
};