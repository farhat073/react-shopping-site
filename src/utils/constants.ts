export const SITE_CONFIG = {
  name: 'ShopName',
  description: 'Your stylish shopping destination',
  url: import.meta.env.VITE_SITE_URL || "https://example.com",
} as const;

export const API_ENDPOINTS = {
  products: '/items/products',
  categories: '/items/categories',
} as const;

export const ROUTES = {
  home: '/',
  product: '/product/:id',
  cart: '/cart',
  about: '/about',
  admin: '/admin',
} as const;