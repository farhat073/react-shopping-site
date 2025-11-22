import { fetchProducts, fetchProductBySlug, fetchProductsByCategory, searchProducts, fetchFilteredProducts, getFilterOptions } from '../services/productService.js';
import type { Product, ProductFilters, FilterOptions as FilterOptionsType } from '../types/product.js';
import supabase from '../lib/supabase.js';

export const getProducts = async (): Promise<Product[]> => {
  return await fetchProducts();
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  return await fetchProductBySlug(slug);
};

export const getProductsByCategory = async (categorySlug: string): Promise<Product[]> => {
  return await fetchProductsByCategory(categorySlug);
};

export const searchProductsAPI = async (query: string): Promise<Product[]> => {
  return await searchProducts(query);
};

export const getFilteredProducts = async (filters: ProductFilters): Promise<Product[]> => {
  return await fetchFilteredProducts(filters);
};

export const fetchCategories = async () => {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return categories;
};

export const getFilterOptionsAPI = async (): Promise<FilterOptionsType> => {
  return await getFilterOptions();
};