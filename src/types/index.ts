export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "CUSTOMER" | "STORE_MANAGER" | "RIDER" | "ADMIN" | string;
  is_plus_member?: boolean;
  wallet_balance?: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  slug?: string;
  price: number;
  mrp?: number;
  original_price?: number;
  unit?: string;
  badge?: string;
  image?: string;
  image_url?: string;
  category_id?: string;
  category_name?: string;
  vertical?: "grocery" | "food" | string;
  stock?: number;
  in_stock?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  vertical?: "grocery" | "food" | string;
  icon?: string | null;
  sort_order?: number;
  product_count?: number;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  street: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  instructions?: string;
  is_default: boolean;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  grand_total: number;
  subtotal?: number;
  delivery_fee?: number;
  handling_fee?: number;
  payment_method?: string;
  payment_status?: string;
  delivery_otp?: string;
  delivery_instructions?: string;
  rider_location?: { latitude: number; longitude: number; speed_kmh?: number; heading?: number } | null;
  items: OrderItem[];
  created_at: string;
}

export interface AuthResponse { token: string; user: User }
export interface ApiError extends Error { status?: number; details?: unknown }
