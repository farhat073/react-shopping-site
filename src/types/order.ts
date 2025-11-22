export interface Address {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: Address;
  billing_address: Address;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number; // Price at time of order
  created_at: string;
}

export interface CreateOrderData {
  user_id: string;
  total_price: number;
  shipping_address: Address;
  billing_address: Address;
  items: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
    price: number;
  }>;
}