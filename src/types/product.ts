export interface DirectusFile {
  id: string;
  filename_disk: string;
  filename_download: string;
  title?: string;
  type: string;
  filesize: number;
  width?: number;
  height?: number;
}

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
  images?: DirectusFile[]; // Directus file objects
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}