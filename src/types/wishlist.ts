export interface WishlistItem {
  id: string;
  created_at: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    stock: number;
    published: boolean;
    images?: Array<{
      url: string;
      alt_text?: string;
      is_primary: boolean;
    }>;
  };
}