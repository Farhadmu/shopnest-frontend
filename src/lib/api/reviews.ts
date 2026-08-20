import { publicFetch, protectedMutation } from "@/lib/core/server";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export async function getProductReviews(productId: string) {
  return publicFetch<Review[]>(`/products/${productId}/reviews`);
}

export async function addProductReview(productId: string, data: { rating: number; comment: string }) {
  return protectedMutation<Review>(`/products/${productId}/reviews`, "POST", data);
}
