export interface Product {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  published: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  value: string;
  price_modifier: number;
  stock: number;
  sku?: string;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  sizes?: string[];
  colors?: string[];
  brands?: string[];
  inStock?: boolean;
  sort?: string;
}

export interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
  sizes: string[];
  colors: string[];
  brands: string[];
}