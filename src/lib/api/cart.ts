import { clientFetch, clientMutation } from "@/lib/core/client";

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
  return clientFetch<Cart>("/cart");
}

export async function addToCart(productId: string, quantity: number = 1) {
  return clientMutation<Cart>("/cart/items", "POST", { productId, quantity });
}

export async function updateCartItem(productId: string, quantity: number) {
  return clientMutation<Cart>(`/cart/items/${productId}`, "PATCH", { quantity });
}

export async function removeCartItem(productId: string) {
  return clientMutation<Cart>(`/cart/items/${productId}`, "DELETE");
}
