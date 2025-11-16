import { useState, useEffect } from 'react';
import { fetchCategories } from '../api/products';

export interface ProductFilters {
  search: string;
  category: string;
  minPrice: number | '';
  maxPrice: number | '';
  sort: string;
}

export const useProductFilters = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  });

  const [categories, setCategories] = useState<any[]>([]);

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
    loadCategories();
  }, []);

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest'
    });
  };

  return {
    filters,
    categories,
    updateFilter,
    clearFilters
  };
};