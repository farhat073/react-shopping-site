import { useEffect } from 'react';
import { useProductStore } from '../stores/productStore.js';

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

  const updateFilters = (newFilters) => {
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