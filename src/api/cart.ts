import { strapi } from './strapiClient';
import type { CartItem } from '../types';

export const getCartItemsFromDirectus = async (userId: string): Promise<CartItem[]> => {
  const response = await strapi.get('/cart-items', {
    'filters[user][id][$eq]': userId,
    populate: 'product,product.category,product.images',
  });

  return response.data?.map((item: any) => ({
    id: item.id.toString(),
    user: item.attributes.user?.data?.id?.toString(),
    product: {
      id: item.attributes.product.data.id.toString(),
      title: item.attributes.product.data.attributes.title,
      slug: item.attributes.product.data.attributes.slug,
      description: item.attributes.product.data.attributes.description,
      price: item.attributes.product.data.attributes.price,
      currency: item.attributes.product.data.attributes.currency || 'USD',
      stock: item.attributes.product.data.attributes.stock,
      published: item.attributes.product.data.attributes.published,
      images: item.attributes.product.data.attributes.images?.data || [],
      category: item.attributes.product.data.attributes.category?.data ? {
        id: item.attributes.product.data.attributes.category.data.id.toString(),
        name: item.attributes.product.data.attributes.category.data.attributes.name,
        slug: item.attributes.product.data.attributes.category.data.attributes.slug,
      } : undefined,
      created_at: item.attributes.product.data.attributes.createdAt,
    },
    quantity: item.attributes.quantity,
  })) || [];
};

export const addCartItemToDirectus = async (userId: string, productId: string, quantity: number = 1): Promise<CartItem> => {
  // First check if item already exists
  const existingResponse = await strapi.get('/cart-items', {
    'filters[user][id][$eq]': userId,
    'filters[product][id][$eq]': productId,
  });

  if (existingResponse.data && existingResponse.data.length > 0) {
    // Update existing item
    const existingItem = existingResponse.data[0];
    const newQuantity = existingItem.attributes.quantity + quantity;
    return updateCartItemInDirectus(existingItem.id.toString(), newQuantity);
  }

  // Create new item
  const response = await strapi.post('/cart-items', {
    data: {
      user: userId,
      product: productId,
      quantity,
    },
  });

  // Fetch the created item with populated data
  return getCartItemsFromDirectus(userId).then(items =>
    items.find(item => item.id === response.data.id.toString())
  ).then(item => {
    if (!item) throw new Error('Failed to create cart item');
    return item;
  });
};

export const updateCartItemInDirectus = async (cartItemId: string, quantity: number): Promise<CartItem> => {
  await strapi.put(`/cart-items/${cartItemId}`, {
    data: {
      quantity,
    },
  });

  // Return updated item - need to fetch with populated data
  const updatedResponse = await strapi.get(`/cart-items/${cartItemId}`, {
    populate: 'product,product.category,product.images',
  });

  const item = updatedResponse.data;
  return {
    id: item.id.toString(),
    user: item.attributes.user?.data?.id?.toString(),
    product: {
      id: item.attributes.product.data.id.toString(),
      title: item.attributes.product.data.attributes.title,
      slug: item.attributes.product.data.attributes.slug,
      description: item.attributes.product.data.attributes.description,
      price: item.attributes.product.data.attributes.price,
      currency: item.attributes.product.data.attributes.currency || 'USD',
      stock: item.attributes.product.data.attributes.stock,
      published: item.attributes.product.data.attributes.published,
      images: item.attributes.product.data.attributes.images?.data || [],
      category: item.attributes.product.data.attributes.category?.data ? {
        id: item.attributes.product.data.attributes.category.data.id.toString(),
        name: item.attributes.product.data.attributes.category.data.attributes.name,
        slug: item.attributes.product.data.attributes.category.data.attributes.slug,
      } : undefined,
      created_at: item.attributes.product.data.attributes.createdAt,
    },
    quantity: item.attributes.quantity,
  };
};

export const deleteCartItemFromDirectus = async (cartItemId: string): Promise<void> => {
  await strapi.delete(`/cart-items/${cartItemId}`);
};

export const clearUserCart = async (userId: string): Promise<void> => {
  const items = await getCartItemsFromDirectus(userId);
  await Promise.all(items.map(item => deleteCartItemFromDirectus(item.id)));
};