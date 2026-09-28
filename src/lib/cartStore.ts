import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Product } from "@/types";
import { api, type CartResponse } from "./api";

export type CartLine = { product: Product; quantity: number };
let lines: CartLine[] = [];
let hydrated = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); };

function saveCart(response: CartResponse) {
  // Cart rows returned by the server contain the current product data and price.
  lines = response.items.map((item) => ({
    product: {
      id: item.product_id, name: item.name, brand: item.brand, vertical: item.vertical,
      category_name: item.category_name || undefined, price: item.price, mrp: item.mrp,
      unit: item.unit, image: item.image, stock: item.stock, in_stock: item.stock > 0,
    },
    quantity: item.qty,
  }));
  void AsyncStorage.setItem("krikart_cart", JSON.stringify(lines)).catch(() => {});
  notify();
}

// Load the saved cart from PostgreSQL. Local storage keeps the last view available
// while offline, then the server response replaces it when the API is reachable.
void AsyncStorage.getItem("krikart_cart").then((raw) => {
  if (raw) {
    const stored = JSON.parse(raw) as CartLine[];
    lines = Array.isArray(stored) ? stored.filter((line) => line?.product?.id && line.quantity > 0) : [];
  }
}).catch(() => {}).finally(() => {
  hydrated = true;
  notify();
  void api.cart().then(saveCart).catch(() => {});
});

export const cartActions = {
  add(product: Product) {
    const found = lines.find((line) => line.product.id === product.id);
    lines = found
      ? lines.map((line) => line.product.id === product.id ? { ...line, product, quantity: line.quantity + 1 } : line)
      : [...lines, { product, quantity: 1 }];
    void AsyncStorage.setItem("krikart_cart", JSON.stringify(lines)).catch(() => {});
    notify();
    void api.addCartItem(product.id).then(saveCart).catch((error) => console.warn("Could not save cart item:", error.message));
  },
  setQuantity(id: string, quantity: number) {
    lines = quantity <= 0 ? lines.filter((line) => line.product.id !== id) : lines.map((line) => line.product.id === id ? { ...line, quantity } : line);
    void AsyncStorage.setItem("krikart_cart", JSON.stringify(lines)).catch(() => {});
    notify();
    void api.updateCartItem(id, quantity).then(saveCart).catch((error) => console.warn("Could not update cart:", error.message));
  },
  remove(id: string) {
    lines = lines.filter((line) => line.product.id !== id);
    void AsyncStorage.setItem("krikart_cart", JSON.stringify(lines)).catch(() => {});
    notify();
    void api.removeCartItem(id).then(saveCart).catch((error) => console.warn("Could not remove cart item:", error.message));
  },
  clear() {
    lines = [];
    void AsyncStorage.setItem("krikart_cart", "[]").catch(() => {});
    notify();
    void api.clearCart().then(saveCart).catch((error) => console.warn("Could not clear server cart:", error.message));
  },
};

export function useCartStore() {
  return useSyncExternalStore(subscribe, () => lines, () => lines);
}

export function useCartHydration() {
  return useSyncExternalStore(subscribe, () => hydrated, () => false);
}

export function getCartSummary() {
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + Number(line.product.price || 0) * line.quantity, 0);
  return { count, subtotal };
}
