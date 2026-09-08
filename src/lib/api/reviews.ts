import { clientFetch, clientMutation } from "@/lib/core/client";

export interface Review {
  id: string;
  productId: string;
  userId: string;
<<<<<<< HEAD
  rating: number;
  comment: string;
  title?: string;
  userName?: string;
  verifiedPurchase?: boolean;
  images?: string[];
  createdAt: string;
=======
  userName?: string;
  rating: number;
  comment: string;
  title?: string;
  verifiedPurchase?: boolean;
  images?: string[];
  helpfulCount?: number;
  reported?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  avgRating: number;
  verifiedReviews: number;
  reportedReviews: number;
  distribution: Record<number, number>;
}

export interface ReviewListResponse {
  reviews: Review[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export async function getReviewStats() {
  return clientFetch<ReviewStats>("/reviews/stats");
}

export async function searchAdminReviews(params: {
  q?: string;
  reported?: string;
  verified?: string;
  rating?: string;
  productId?: string;
  userId?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.q) query.append("q", params.q);
  if (params.reported) query.append("reported", params.reported);
  if (params.verified) query.append("verified", params.verified);
  if (params.rating) query.append("rating", params.rating);
  if (params.productId) query.append("productId", params.productId);
  if (params.userId) query.append("userId", params.userId);
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.sortDir) query.append("sortDir", params.sortDir);
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));
  const qStr = query.toString();
  return clientFetch<ReviewListResponse>(`/reviews/search${qStr ? `?${qStr}` : ""}`);
}

export async function dismissReport(id: string) {
  return clientMutation<Review>(`/reviews/${id}/dismiss`, "PATCH");
}

export async function hideReview(id: string) {
  return clientMutation<Review>(`/reviews/${id}/hide`, "PATCH");
}

export async function removeReviewAdmin(id: string) {
  return clientMutation<{ success: boolean }>(`/reviews/${id}`, "DELETE");
>>>>>>> master
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
