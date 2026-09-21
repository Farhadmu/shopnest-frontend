import { clientFetch, clientMutation } from "@/lib/core/client";

export interface VisualDetectedInfo {
  title: string;
  category: string;
  subcategory?: string;
  brand?: string;
  color?: string;
  features: string[];
  keywords: string[];
  confidence: "high" | "medium" | "low";
}

export interface VisualSearchProduct {
  _id: string;
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: string[];
  ratingAvg?: number;
  ratingCount?: number;
  stock?: number;
  sold?: number;
  sellerId?: {
    _id?: string;
    name?: string;
    storeName?: string;
  } | string;
  matchScore?: number;
  matchBadge?: string;
}

export interface VisualSearchResult {
  detected: VisualDetectedInfo;
  count: number;
  products: VisualSearchProduct[];
  isUnmetDemand: boolean;
  demandId: string | null;
}

export interface VisualSearchDemandItem {
  _id: string;
  imageUrl: string;
  searchQuery?: string;
  detectedTitle: string;
  detectedCategory: string;
  detectedBrand?: string;
  detectedColor?: string;
  detectedFeatures: string[];
  detectedTags: string[];
  confidence: "high" | "medium" | "low";
  matchedCount: number;
  isUnmetDemand: boolean;
  userRole: "guest" | "customer";
  status: "new" | "reviewed" | "stocked";
  createdAt: string;
}

export interface SellerDemandInsightsResponse {
  metrics: {
    totalSearches: number;
    unmetSearches: number;
    matchedSearches: number;
    topCategories: Array<{ category: string; count: number }>;
    trendingKeywords: Array<{ tag: string; count: number }>;
  };
  demands: VisualSearchDemandItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function uploadVisualSearchImage(file: File): Promise<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append("image", file);
  return clientMutation<{ imageUrl: string }>("/ai/visual-search/upload", "POST", formData);
}

export async function searchByVisualAI(params: {
  imageUrl: string;
  searchQuery?: string;
}): Promise<VisualSearchResult> {
  return clientMutation<VisualSearchResult>("/ai/visual-search", "POST", params);
}

export const executeVisualSearch = searchByVisualAI;

export async function getSellerDemandInsights(params?: {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<SellerDemandInsightsResponse> {
  return clientFetch<SellerDemandInsightsResponse>("/ai/visual-search/demands", { params });
}

export async function updateDemandStatus(
  demandId: string,
  status: "new" | "reviewed" | "stocked"
): Promise<VisualSearchDemandItem> {
  return clientMutation<VisualSearchDemandItem>(
    `/ai/visual-search/demands/${demandId}/status`,
    "PATCH",
    { status }
  );
}
