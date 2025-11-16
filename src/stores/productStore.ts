import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fetchProducts as apiFetchProducts } from '../api/products';
import type { Product, ProductFilters } from '../types';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  fetchProducts: () => Promise<void>;
  setFilters: (filters: Partial<ProductFilters>) => void;
  getFilteredProducts: () => Product[];
}

export const useProductStore = create<ProductState>()(
  devtools(
    (set, get) => ({
      products: [],
      loading: false,
      error: null,
      filters: {},

      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          const products = await apiFetchProducts();
          set({ products, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch products',
            loading: false
          });
        }
      },

      setFilters: (newFilters) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },

      getFilteredProducts: () => {
        const { products, filters } = get();
        return products.filter(product => {
          if (filters.category && product.category?.slug !== filters.category) return false;
          if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
          if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
          if (filters.inStock !== undefined && (product.stock > 0) !== filters.inStock) return false;
          return true;
        });
      },
    }),
    { name: 'product-store' }
  )
);