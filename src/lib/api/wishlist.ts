import { clientFetch, clientMutation } from "@/lib/core/client";

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export async function getWishlist() {
  return clientFetch<WishlistItem[]>("/wishlist");
}

export async function addToWishlist(productId: string) {
  return clientMutation<WishlistItem[]>("/wishlist/items", "POST", { productId });
}

export async function removeFromWishlist(productId: string) {
  return clientMutation<WishlistItem[]>(`/wishlist/items/${productId}`, "DELETE");
}
