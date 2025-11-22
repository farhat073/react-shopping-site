import supabase from '../lib/supabase.ts';
import type { Product, Category, User, Order } from '../types';

// Additional types for admin service
interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: number;
  ordersByStatus: Record<string, number>;
}

type RecentOrder = Order & {
  user: Pick<User, 'id' | 'email' | 'first_name' | 'last_name'>;
};

type LowStockProduct = Product & {
  category: { id: string; name: string };
  images: Array<{ url: string; alt_text?: string; is_primary: boolean }>;
};

type CreateProductData = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'images' | 'variants' | 'category'> & {
  category_id?: string;
};

type UpdateProductData = Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'images' | 'variants' | 'category'>> & {
  category_id?: string;
};

type CreateCategoryData = Omit<Category, 'id'>;

type UpdateCategoryData = Partial<Omit<Category, 'id'>>;

type UpdateUserData = Partial<Omit<User, 'id'>>;

/**
 * Get dashboard metrics
 * @returns {Promise<DashboardMetrics>} Dashboard metrics
 */
export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  try {
    // Get total orders
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (ordersError) throw ordersError;

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('total_price')
      .eq('status', 'delivered');

    if (revenueError) throw revenueError;

    const totalRevenue = revenueData.reduce((sum, order) => sum + parseFloat(order.total_price), 0);

    // Get total products
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) throw productsError;

    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (recentOrdersError) throw recentOrdersError;

    // Get orders by status
    const { data: statusData, error: statusError } = await supabase
      .from('orders')
      .select('status');

    if (statusError) throw statusError;

    const ordersByStatus = statusData.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders: totalOrders!,
      totalRevenue,
      totalProducts: totalProducts!,
      totalUsers: totalUsers!,
      recentOrders: recentOrders!,
      ordersByStatus
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
};

/**
 * Get recent orders for dashboard
 * @param limit - Number of orders to fetch
 * @returns {Promise<RecentOrder[]>} Recent orders
 */
export const getRecentOrders = async (limit: number = 5): Promise<RecentOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(
          id,
          email,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

/**
 * Get low stock products
 * @param threshold - Stock threshold
 * @returns {Promise<LowStockProduct[]>} Low stock products
 */
export const getLowStockProducts = async (threshold: number = 10): Promise<LowStockProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name),
        images:product_images(url, alt_text, is_primary)
      `)
      .lte('stock', threshold)
      .eq('published', true)
      .order('stock', { ascending: true })
      .limit(10);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }
};

/**
 * Get all products for admin (including unpublished)
 * @returns {Promise<Product[]>} All products
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
};

/**
 * Create a new product
 * @param productData - Product data
 * @returns {Promise<Product>} Created product
 */
export const createProduct = async (productData: CreateProductData): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update a product
 * @param productId - Product ID
 * @param updates - Product updates
 * @returns {Promise<Product>} Updated product
 */
export const updateProduct = async (productId: string, updates: UpdateProductData): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product
 * @param productId - Product ID
 * @returns {Promise<void>}
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Get all categories
 * @returns {Promise<Category[]>} All categories
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Create a new category
 * @param categoryData - Category data
 * @returns {Promise<Category>} Created category
 */
export const createCategory = async (categoryData: CreateCategoryData): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Update a category
 * @param categoryId - Category ID
 * @param updates - Category updates
 * @returns {Promise<Category>} Updated category
 */
export const updateCategory = async (categoryId: string, updates: UpdateCategoryData): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Delete a category
 * @param categoryId - Category ID
 * @returns {Promise<void>}
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Get all users
 * @returns {Promise<User[]>} All users
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Update a user
 * @param userId - User ID
 * @param updates - User updates
 * @returns {Promise<User>} Updated user
 */
export const updateUser = async (userId: string, updates: UpdateUserData): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Delete a user
 * @param userId - User ID
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};