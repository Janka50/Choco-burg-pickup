export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'customer';
  phone?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string | null;
  image_url: string | null;
  stock_quantity: number;
  is_available: boolean;
  in_stock: boolean;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  price_snapshot: string;
  subtotal: string;
}

export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: number;
  user: number;
  user_email: string;
  status: OrderStatus;
  total_price: string;
  notes: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}

export interface InventorySummary {
  total_products: number;
  low_stock: number;
  out_of_stock: number;
  products: Product[];
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface PaginatedResponse<T> {
  count: number;
  results: T[];
}
