import { protectedFetch, protectedMutation } from "@/lib/core/server";

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export async function getWishlist() {
  return protectedFetch<WishlistItem[]>("/wishlist");
}

export async function addToWishlist(productId: string) {
  return protectedMutation<WishlistItem[]>("/wishlist/items", "POST", { productId });
}

export async function removeFromWishlist(productId: string) {
  return protectedMutation<WishlistItem[]>(`/wishlist/items/${productId}`, "DELETE");
}
