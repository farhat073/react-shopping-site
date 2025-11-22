import type { Product, Category, User } from '../types';

import {
  getDashboardMetrics,
  getRecentOrders,
  getLowStockProducts,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllUsers,
  updateUser,
  deleteUser
} from '../services/adminService.ts';

export const getAdminDashboardMetrics = async () => {
  return await getDashboardMetrics();
};

export const getAdminRecentOrders = async (limit?: number) => {
  return await getRecentOrders(limit);
};

export const getAdminLowStockProducts = async (threshold?: number) => {
  return await getLowStockProducts(threshold);
};

export const getAdminProducts = async () => {
  return await getAllProducts();
};

export const createAdminProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
  return await createProduct(productData);
};

export const updateAdminProduct = async (productId: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) => {
  return await updateProduct(productId, updates);
};

export const deleteAdminProduct = async (productId: string) => {
  return await deleteProduct(productId);
};

export const getAdminCategories = async () => {
  return await getAllCategories();
};

export const createAdminCategory = async (categoryData: Omit<Category, 'id'>) => {
  return await createCategory(categoryData);
};

export const updateAdminCategory = async (categoryId: string, updates: Partial<Omit<Category, 'id'>>) => {
  return await updateCategory(categoryId, updates);
};

export const deleteAdminCategory = async (categoryId: string) => {
  return await deleteCategory(categoryId);
};

export const getAdminUsers = async () => {
  return await getAllUsers();
};

export const updateAdminUser = async (userId: string, updates: Partial<Omit<User, 'id'>>) => {
  return await updateUser(userId, updates);
};

export const deleteAdminUser = async (userId: string) => {
  return await deleteUser(userId);
};