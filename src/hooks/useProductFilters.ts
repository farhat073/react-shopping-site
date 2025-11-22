import { useState, useEffect } from 'react';
import { fetchCategories, getFilterOptionsAPI } from '../api/products';
import type { ProductFilters, FilterOptions, Category } from '../types/product';

export const useProductFilters = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sizes: [],
    colors: [],
    brands: [],
    inStock: false,
    sort: 'newest'
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null
          ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
          : String(error);

        console.error('Error loading categories:', errorMessage);
        console.error('Full error object:', error);
        // Set empty array on error to prevent UI crashes
        setCategories([]);
      }
    };

    const loadFilterOptions = async () => {
      try {
        const options = await getFilterOptionsAPI();
        setFilterOptions(options);
      } catch (error) {
        console.error('Error loading filter options:', error);
        // Set default options on error
        setFilterOptions({
          priceRange: { min: 0, max: 1000 },
          sizes: [],
          colors: [],
          brands: []
        });
      }
    };

    loadCategories();
    loadFilterOptions();
  }, []);

  const updateFilter = (key: keyof ProductFilters, value: ProductFilters[keyof ProductFilters]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'sizes' | 'colors' | 'brands', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key]?.includes(value)
        ? prev[key]!.filter(item => item !== value)
        : [...(prev[key] || []), value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sizes: [],
      colors: [],
      brands: [],
      inStock: false,
      sort: 'newest'
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.category ||
      filters.minPrice ||
      filters.maxPrice ||
      (filters.sizes && filters.sizes.length > 0) ||
      (filters.colors && filters.colors.length > 0) ||
      (filters.brands && filters.brands.length > 0) ||
      filters.inStock
    );
  };

  return {
    filters,
    categories,
    filterOptions,
    updateFilter,
    toggleArrayFilter,
    clearFilters,
    hasActiveFilters
  };
};