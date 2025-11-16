import type { Product } from '../types';
import { DIRECTUS_URL } from '../config';

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

export const getAssetUrl = (fileId: string): string => {
  return `${DIRECTUS_URL}/assets/${fileId}`;
};

export const handleDirectusError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
    } catch {
      return String(error);
    }
  }
  return String(error);
};

export const formatErrorForLogging = (error: unknown): { message: string; fullError: unknown } => {
  const message = handleDirectusError(error);
  return {
    message,
    fullError: error,
  };
};