import { clientFetch, clientMutation } from "@/lib/core/client";
import { notifyCommerceUpdated } from "@/lib/commerce-events";

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  title?: string;
  image?: string;
  images?: string[];
  category?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
}

export async function getCart() {
  return clientFetch<Cart>("/cart");
}

export async function addToCart(
  productId: string,
  quantity: number = 1
) {
  const res = await clientMutation<Cart>(
    "/cart/items",
    "POST",
    {
      productId,
      quantity,
    }
  );
  notifyCommerceUpdated();
  return res;
}

export async function updateCartItem(
  productId: string,
  quantity: number
) {
  const res = await clientMutation<Cart>(
    `/cart/items/${productId}`,
    "PATCH",
    {
      quantity,
    }
  );
  notifyCommerceUpdated();
  return res;
}

export async function removeCartItem(productId: string) {
  const res = await clientMutation<Cart>(
    `/cart/items/${productId}`,
    "DELETE"
  );
  notifyCommerceUpdated();
  return res;
}