import type { Product } from '../types';

export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const generateProductSlug = (product: Product): string => {
  return `${product.id}-${product.title.toLowerCase().replace(/\s+/g, '-')}`;
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const getAssetUrl = (path: string): string => {
  // Supabase storage uses public bucket URLs
  // For now, return a placeholder - this should be updated based on your Supabase storage setup
  return path.startsWith('http') ? path : `/images/${path}`;
};

export const setRelatedProducts = (productId: string): Promise<Product[]> => {
  // Placeholder: fetch related products based on productId
  // This should be implemented to fetch from API
  return Promise.resolve([]);
};

export { getCartItemCount, getCartTotal } from '../services/cartService.ts';
