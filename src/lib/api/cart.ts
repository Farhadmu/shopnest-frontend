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
  sellerId?: string;
  storeId?: string;
  variantName?: string;
  variantSku?: string;
  variantColor?: string;
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
  quantity: number = 1,
  variantName?: string
) {
  const res = await clientMutation<Cart>(
    "/cart/items",
    "POST",
    {
      productId,
      quantity,
      ...(variantName ? { variantName } : {}),
    }
  );
  notifyCommerceUpdated();
  return res;
}

export async function updateCartItem(
  productId: string,
  quantity: number,
  variantName?: string
) {
  const query = variantName ? `?variantName=${encodeURIComponent(variantName)}` : "";
  const res = await clientMutation<Cart>(
    `/cart/items/${productId}${query}`,
    "PATCH",
    {
      quantity,
    }
  );
  notifyCommerceUpdated();
  return res;
}

export async function removeCartItem(productId: string, variantName?: string) {
  const query = variantName ? `?variantName=${encodeURIComponent(variantName)}` : "";
  const res = await clientMutation<Cart>(
    `/cart/items/${productId}${query}`,
    "DELETE"
  );
  notifyCommerceUpdated();
  return res;
}
