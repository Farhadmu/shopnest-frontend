import { clientFetch, clientMutation } from "@/lib/core/client";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export async function getProductReviews(productId: string) {
  return clientFetch<Review[]>(`/products/${productId}/reviews`);
}

export async function addProductReview(
  productId: string,
  data: { rating: number; comment: string }
) {
  return clientMutation<Review>(`/products/${productId}/reviews`, "POST", data);
}
