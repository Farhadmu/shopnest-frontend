import { clientFetch } from "@/lib/core/client";

/**
 * Public platform-wide social-proof aggregates used by the homepage
 * ProofSection. Unauthenticated — safe to call from client components.
 */

export interface PlatformSampleReview {
  id: string;
  userId: string;
  userName: string;

  avatarUrl?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PlatformStats {
  avgRating: number;
  totalReviews: number;
  verifiedReviews: number;
  distribution: Record<number, number>;
  sampleReviews: PlatformSampleReview[];
}

export async function getPlatformStats(): Promise<PlatformStats> {
  return clientFetch<PlatformStats>("/platform-stats");
}