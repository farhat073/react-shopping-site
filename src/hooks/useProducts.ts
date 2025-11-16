import { useEffect } from 'react';
import { useProductStore } from '../stores/productStore';
import type { ProductFilters } from '../types';

export const useProducts = () => {
  const {
    products,
    loading,
    error,
    filters,
    fetchProducts,
    setFilters,
    getFilteredProducts,
  } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = getFilteredProducts();

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    products: filteredProducts,
    allProducts: products,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch: fetchProducts,
  };
};