import { getToken, clearToken } from "./tokenStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Address, ApiError, AuthResponse, Category, Order, Product, User } from "@/types";

const API_URL = "http://10.185.71.207:5000";
const API_BASE = `${API_URL}/api`;
let guestCartIdPromise: Promise<string> | undefined;

async function getGuestCartId() {
  guestCartIdPromise ||= AsyncStorage.getItem("krikart_guest_cart_id").then(async (saved) => {
    if (saved) return saved;
    const created = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem("krikart_guest_cart_id", created);
    return created;
  });
  return guestCartIdPromise;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const guestCartId = await getGuestCartId();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Guest-Cart-Id": guestCartId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  // console.log("---response|", response);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) await clearToken();
    const error = new Error(data.detail || data.message || `Request failed (${response.status})`) as Error & ApiError;
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data as T;
}

const json = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });

export const api = {
  health: () => request<{ status: string; razorpay_configured: boolean }>("/health"),
  login: (email: string, password: string) => request<AuthResponse>("/auth/login", json({ email, password })),
  register: (input: { name: string; email: string; phone: string; password: string }) => request<AuthResponse>("/auth/register", json(input)),
  profile: () => request<{ user: User }>("/auth/me"),
  addresses: () => request<{ addresses: Address[] }>("/user/addresses"),
  createAddress: (input: Omit<Address, "id" | "is_default">) => request<{ address: Address }>("/user/addresses", json(input)),
  setDefaultAddress: (id: string) => request<{ success: boolean }>(`/user/addresses/${encodeURIComponent(id)}/default`, { method: "PATCH" }),
  deleteAddress: (id: string) => request<{ success: boolean }>(`/user/addresses/${encodeURIComponent(id)}`, { method: "DELETE" }),
  products: (params: { search?: string; category_id?: string; vertical?: string; limit?: number } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    return request<{ products: Product[] }>(`/products?${query.toString()}`);
  },
  product: (id: string) => request<{ product: Product }>(`/products/${encodeURIComponent(id)}`),
  categories: async (vertical?: string): Promise<Category[]> => (await request<{ categories: Category[] }>(`/categories${vertical ? `?vertical=${encodeURIComponent(vertical)}` : ""}`)).categories,
  home: (vertical?: string) => request<{ eta_minutes: number; banners: unknown[]; categories: Category[]; rails: { key: string; title: string; products: Product[] }[] }>(`/home${vertical ? `?vertical=${encodeURIComponent(vertical)}` : ""}`),
  cart: () => request<CartResponse>("/cart"),
  addCartItem: (productId: string, qty = 1) => request<CartResponse>("/cart/items", json({ product_id: productId, qty })),
  updateCartItem: (productId: string, qty: number) => request<CartResponse>(`/cart/items/${encodeURIComponent(productId)}`, { method: "PATCH", body: JSON.stringify({ qty }) }),
  removeCartItem: (productId: string) => request<CartResponse>(`/cart/items/${encodeURIComponent(productId)}`, { method: "DELETE" }),
  clearCart: () => request<CartResponse>("/cart", { method: "DELETE" }),
  checkout: (input: { items: { product_id: string; qty: number }[]; payment_method: "COD" | "RAZORPAY"; tip?: number; delivery_instructions?: string; address_id?: string | null }) => request<CheckoutResponse>("/checkout/initiate", json(input)),
  verifyPayment: (input: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => request<{ success: boolean; order_id?: string }>("/checkout/verify", json(input)),
  orders: () => request<{ orders: Order[] }>("/orders"),
  order: (id: string) => request<{ order: Order }>(`/orders/${encodeURIComponent(id)}`),
};

export interface CartResponse {
  items: { product_id: string; name: string; brand?: string; vertical?: string; category_name?: string | null; price: number; mrp: number; unit?: string; image?: string; stock: number; qty: number }[];
  fees: { items_subtotal: number; grand_total: number; delivery_fee: number; handling_fee: number; savings: number };
}

export interface CheckoutResponse {
  order_id: string;
  order_number: string;
  grand_total: number;
  grand_total_paise: number;
  currency: string;
  payment_method: "COD" | "RAZORPAY";
  razorpay: null | { order_id: string; key_id: string; is_live: boolean };
}

export function getApiBaseUrl() { return API_BASE; }
