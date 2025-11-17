import type { Product } from '../types';
import type { DirectusFile } from '../types/product';

// TODO: Implement Directus SDK integration when API is available
// import { createDirectus, rest, readItems, readItem } from '@directus/sdk';
// const directus = VITE_DIRECTUS_URL ? createDirectus(VITE_DIRECTUS_URL).with(rest()) : null;

export const fetchProducts = async (): Promise<Product[]> => {
  // For now, return mock data
  // TODO: Replace with actual Directus API call
  const mockImage: DirectusFile = {
    id: '1',
    filename_disk: 'placeholder.jpg',
    filename_download: 'placeholder.jpg',
    type: 'image/jpeg',
    filesize: 0,
  };
  
  return [
    {
      id: '1',
      title: 'Sample Product 1',
      slug: 'sample-product-1',
      description: 'A great product for testing',
      price: 29.99,
      currency: 'USD',
      stock: 10,
      published: true,
      images: [mockImage],
      category: { id: '1', name: 'Electronics', slug: 'electronics' },
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Sample Product 2',
      slug: 'sample-product-2',
      description: 'Another amazing product',
      price: 49.99,
      currency: 'USD',
      stock: 5,
      published: true,
      images: [mockImage],
      category: { id: '2', name: 'Clothing', slug: 'clothing' },
      created_at: new Date().toISOString(),
    },
  ];
};

export const fetchProduct = async (id: string): Promise<Product> => {
  // For now, return mock data
  // TODO: Replace with actual Directus API call
  const mockImage: DirectusFile = {
    id: '1',
    filename_disk: 'placeholder.jpg',
    filename_download: 'placeholder.jpg',
    type: 'image/jpeg',
    filesize: 0,
  };
  
  const mockProduct: Product = {
    id,
    title: 'Sample Product',
    slug: 'sample-product',
    description: 'A detailed product description',
    price: 29.99,
    currency: 'USD',
    stock: 10,
    published: true,
    images: [mockImage],
    category: { id: '1', name: 'Electronics', slug: 'electronics' },
    created_at: new Date().toISOString(),
  };
  return mockProduct;
};