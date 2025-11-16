import type { Product } from './product';

export interface CartItem {
  id: string;
  user?: string; // Directus user ID (optional for local cart)
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}