export interface Order {
  id: string;
  user: string; // Strapi user ID - placeholder
  total_price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order: string; // Order ID
  product: string; // Product ID
  quantity: number;
  price: number; // Price at time of order
}