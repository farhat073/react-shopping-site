import { strapi } from './strapiClient';
import type { Product, Category } from '../types';

export const getAssetUrl = (fileId: string): string => {
  const strapiUrl = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
  return `${strapiUrl}/uploads/${fileId}`;
};

export const fetchProducts = async (filters?: any): Promise<Product[]> => {
  const params: any = {
    populate: '*',
    'filters[published][$eq]': true,
  };

  if (filters?.category) {
    params['filters[category][slug][$eq]'] = filters.category;
  }

  if (filters?.minPrice !== undefined) {
    params['filters[price][$gte]'] = filters.minPrice;
  }

  if (filters?.maxPrice !== undefined) {
    params['filters[price][$lte]'] = filters.maxPrice;
  }

  if (filters?.inStock) {
    params['filters[stock][$gt]'] = 0;
  }

  const response = await strapi.get('/products', params);
  return response.data?.map((item: any) => ({
    id: item.id.toString(),
    title: item.attributes.title,
    slug: item.attributes.slug,
    description: item.attributes.description,
    price: item.attributes.price,
    currency: item.attributes.currency || 'USD',
    stock: item.attributes.stock,
    published: item.attributes.published,
    images: item.attributes.images?.data || [],
    category: item.attributes.category?.data ? {
      id: item.attributes.category.data.id.toString(),
      name: item.attributes.category.data.attributes.name,
      slug: item.attributes.category.data.attributes.slug,
    } : undefined,
    created_at: item.attributes.createdAt,
  })) || [];
};

export const fetchProductBySlug = async (slug: string): Promise<Product> => {
  const response = await strapi.get('/products', {
    'filters[slug][$eq]': slug,
    populate: '*',
  });

  if (!response.data || response.data.length === 0) {
    throw new Error('Product not found');
  }

  const item = response.data[0];
  return {
    id: item.id.toString(),
    title: item.attributes.title,
    slug: item.attributes.slug,
    description: item.attributes.description,
    price: item.attributes.price,
    currency: item.attributes.currency || 'USD',
    stock: item.attributes.stock,
    published: item.attributes.published,
    images: item.attributes.images?.data || [],
    category: item.attributes.category?.data ? {
      id: item.attributes.category.data.id.toString(),
      name: item.attributes.category.data.attributes.name,
      slug: item.attributes.category.data.attributes.slug,
    } : undefined,
    created_at: item.attributes.createdAt,
  };
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await strapi.get(`/products/${id}`, {
    populate: '*',
  });

  const item = response.data;
  return {
    id: item.id.toString(),
    title: item.attributes.title,
    slug: item.attributes.slug,
    description: item.attributes.description,
    price: item.attributes.price,
    currency: item.attributes.currency || 'USD',
    stock: item.attributes.stock,
    published: item.attributes.published,
    images: item.attributes.images?.data || [],
    category: item.attributes.category?.data ? {
      id: item.attributes.category.data.id.toString(),
      name: item.attributes.category.data.attributes.name,
      slug: item.attributes.category.data.attributes.slug,
    } : undefined,
    created_at: item.attributes.createdAt,
  };
};

export const fetchRelatedProducts = async (categoryId: string, excludeProductId: string): Promise<Product[]> => {
  const response = await strapi.get('/products', {
    'filters[category][id][$eq]': categoryId,
    'filters[id][$ne]': excludeProductId,
    'filters[published][$eq]': true,
    populate: '*',
    pagination: { limit: 4 },
  });

  return response.data?.map((item: any) => ({
    id: item.id.toString(),
    title: item.attributes.title,
    slug: item.attributes.slug,
    description: item.attributes.description,
    price: item.attributes.price,
    currency: item.attributes.currency || 'USD',
    stock: item.attributes.stock,
    published: item.attributes.published,
    images: item.attributes.images?.data || [],
    category: item.attributes.category?.data ? {
      id: item.attributes.category.data.id.toString(),
      name: item.attributes.category.data.attributes.name,
      slug: item.attributes.category.data.attributes.slug,
    } : undefined,
    created_at: item.attributes.createdAt,
  })) || [];
};

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await strapi.get('/categories', {
    populate: '*',
  });

  return response.data?.map((item: any) => ({
    id: item.id.toString(),
    name: item.attributes.name,
    slug: item.attributes.slug,
  })) || [];
};