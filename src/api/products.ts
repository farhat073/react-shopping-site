import { readItems, readItem } from '@directus/sdk';
import { directus } from './directusClient';
import { DIRECTUS_URL } from '../config';
import type { Product } from '../types';
import type { ProductFilters } from '../hooks/useProductFilters';

export const getAssetUrl = (fileId: string): string => {
  return `${DIRECTUS_URL}/assets/${fileId}`;
};

export const fetchProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  console.log('Directus URL:', DIRECTUS_URL);
  try {
    console.log('Attempting to fetch products from Directus...');

    const filter: any = {
      published: {
        _eq: true
      }
    };

    // Apply search filter
    if (filters?.search) {
      filter.title = {
        _icontains: filters.search
      };
    }

    // Apply category filter
    if (filters?.category) {
      filter.category = {
        _eq: filters.category
      };
    }

    // Apply price filters
    if (filters?.minPrice !== '' && filters?.minPrice !== undefined) {
      filter.price = {
        ...filter.price,
        _gte: filters.minPrice
      };
    }
    if (filters?.maxPrice !== '' && filters?.maxPrice !== undefined) {
      filter.price = {
        ...filter.price,
        _lte: filters.maxPrice
      };
    }

    // Determine sort order
    let sort: string[] = ['-created_at'];
    if (filters?.sort) {
      switch (filters.sort) {
        case 'price-low':
          sort = ['price'];
          break;
        case 'price-high':
          sort = ['-price'];
          break;
        case 'newest':
        default:
          sort = ['-created_at'];
          break;
      }
    }

    const response = await directus.request(
      readItems('products', {
        filter,
        fields: ['*', 'category.*', 'images.*'],
        sort
      })
    );
    console.log('Products fetched successfully:', response);
    return response as Product[];
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'object' && error !== null
      ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      : String(error);
    
    console.error('Error fetching products:', errorMessage);
    console.error('Full error object:', error);
    console.error('Directus URL used:', DIRECTUS_URL);
    
    // Re-throw with a more descriptive error
    throw new Error(`Failed to fetch products: ${errorMessage}`);
  }
};

export const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const response = await directus.request(
      readItems('products', {
        filter: {
          slug: {
            _eq: slug
          },
          published: {
            _eq: true
          }
        },
        fields: ['*', 'category.*', 'images.*'],
        limit: 1
      })
    );
    return response.length > 0 ? (response[0] as Product) : null;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'object' && error !== null
      ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      : String(error);
    
    console.error('Error fetching product by slug:', errorMessage);
    console.error('Full error object:', error);
    throw new Error(`Failed to fetch product by slug: ${errorMessage}`);
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await directus.request(
      readItem('products', id, {
        fields: ['*', 'category.*', 'images.*']
      })
    );
    return response as Product;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'object' && error !== null
      ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      : String(error);
    
    console.error('Error fetching product by ID:', errorMessage);
    console.error('Full error object:', error);
    throw new Error(`Failed to fetch product by ID: ${errorMessage}`);
  }
};

export const fetchRelatedProducts = async (categoryId: string, excludeProductId: string): Promise<Product[]> => {
  try {
    const response = await directus.request(
      readItems('products', {
        filter: {
          category: {
            _eq: categoryId
          },
          id: {
            _neq: excludeProductId
          },
          published: {
            _eq: true
          }
        },
        fields: ['*', 'category.*', 'images.*'],
        sort: ['-created_at'],
        limit: 4
      })
    );
    return response as Product[];
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'object' && error !== null
      ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      : String(error);
    
    console.error('Error fetching related products:', errorMessage);
    console.error('Full error object:', error);
    throw new Error(`Failed to fetch related products: ${errorMessage}`);
  }
};

export const fetchCategories = async () => {
  try {
    console.log('Fetching categories from Directus...');
    console.log('Directus URL:', DIRECTUS_URL);
    const response = await directus.request(
      readItems('categories', {
        fields: ['*'],
        sort: ['name']
      })
    );
    console.log('Categories fetched successfully:', response);
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'object' && error !== null
      ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      : String(error);
    
    console.error('Error fetching categories:', errorMessage);
    console.error('Full error object:', error);
    console.error('Directus URL used:', DIRECTUS_URL);
    throw new Error(`Failed to fetch categories: ${errorMessage}`);
  }
};