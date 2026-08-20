import { protectedFetch, protectedMutation } from "@/lib/core/server";

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
}

export async function getCart() {
  return protectedFetch<Cart>("/cart");
}

export async function addToCart(productId: string, quantity: number = 1) {
  return protectedMutation<Cart>("/cart/items", "POST", { productId, quantity });
}

export async function updateCartItem(productId: string, quantity: number) {
  return protectedMutation<Cart>(`/cart/items/${productId}`, "PATCH", { quantity });
}

export async function removeCartItem(productId: string) {
  return protectedMutation<Cart>(`/cart/items/${productId}`, "DELETE");
}
