import type { Product } from './product';

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price_modifier: number;
  stock: number;
  sku?: string;
}

export interface CartItem {
  id: string;
  user?: string; // User ID (optional for guest cart)
  product: Product;
  quantity: number;
  variant?: ProductVariant | null;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}