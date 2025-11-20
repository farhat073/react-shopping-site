import type { Product } from './product';

export interface CartItem {
  id: string;
  user?: string; // Strapi user ID (optional for local cart) - placeholder
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}