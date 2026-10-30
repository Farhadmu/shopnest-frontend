import { clientFetch, clientMutation } from "@/lib/core/client";

export interface VisualDetectedInfo {
  title: string;
  category: string;
  subcategory?: string;
  productType?: string;
  brand?: string;
  model?: string;
  marketPriceEstimate?: string;
  color?: string;
  colors?: string[];
  style?: string[];
  visualAttributes?: string[];
  features?: string[];
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
  sellerId?:
    | {
        _id?: string;
        name?: string;
        storeName?: string;
      }
    | string;
  matchScore?: number;
  matchBadge?: "Direct Match" | "Similar Style" | "Alternative" | string;
  matchGroup?: "HIGHLY SIMILAR" | "SIMILAR STYLE" | "ALTERNATIVE";
  visualSimilarity?: number;
  breakdown?: {
    visualSimilarity: number;
    productTypeMatch: boolean;
    categoryMatch: boolean;
    brandMatch: boolean;
    colorMatch: boolean;
    inStock: boolean;
  };
}

export interface VisualSearchResult {
  detected: VisualDetectedInfo;
  count: number;
  products: VisualSearchProduct[];
  isUnmetDemand: boolean;
  demandId: string | null;
  latencyMs?: number;
}

export interface VisualSearchHistoryItem {
  _id: string;
  imageUrl: string;
  detectedTitle: string;
  detectedCategory: string;
  detectedProductType?: string;
  resultCount: number;
  searchQuery?: string;
  createdAt: string;
}

export interface VisualSearchDemandItem {
  _id: string;
  imageUrl: string;
  searchQuery?: string;
  detectedTitle: string;
  detectedCategory: string;
  detectedBrand?: string;
  detectedModel?: string;
  marketPriceEstimate?: string;
  detectedColor?: string;
  detectedColors?: string[];
  detectedProductType?: string;
  detectedStyle?: string[];
  detectedAttributes?: string[];
  detectedFeatures?: string[];
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
    popularColors?: Array<{ color: string; count: number }>;
    trendingProductTypes?: Array<{ productType: string; count: number }>;
  };
  demands: VisualSearchDemandItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface VisualSearchCropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function uploadVisualSearchImage(file: File): Promise<{
  imageUrl: string;
  format?: string;
  width?: number;
  height?: number;
}> {
  const formData = new FormData();
  formData.append("image", file);
  return clientMutation<{ imageUrl: string; format?: string; width?: number; height?: number }>(
    "/ai/visual-search/upload",
    "POST",
    formData
  );
}

export async function searchByVisualAI(params: {
  imageUrl: string;
  searchQuery?: string;
  cropBox?: VisualSearchCropBox;
}): Promise<VisualSearchResult> {
  return clientMutation<VisualSearchResult>("/ai/visual-search", "POST", params);
}

export const executeVisualSearch = searchByVisualAI;

export async function getVisualSearchHistory(): Promise<VisualSearchHistoryItem[]> {
  return clientFetch<VisualSearchHistoryItem[]>("/ai/visual-search/history");
}

export async function clearVisualSearchHistory(): Promise<{ cleared: boolean }> {
  return clientMutation<{ cleared: boolean }>("/ai/visual-search/history", "DELETE");
}

export async function getSellerDemandTrends(
  period: "today" | "7d" | "30d" = "7d"
): Promise<{
  period: string;
  totalSearches: number;
  unmetSearches: number;
  matchedSearches: number;
  topCategories: Array<{ category: string; count: number }>;
  trendingKeywords: Array<{ tag: string; count: number }>;
  popularColors: Array<{ color: string; count: number }>;
  trendingProductTypes: Array<{ productType: string; count: number }>;
}> {
  return clientFetch("/ai/visual-search/trends", { params: { period } });
}

export async function getSellerDemandInsights(params?: {
  category?: string;
  status?: string;
  period?: "today" | "7d" | "30d" | "all";
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

export async function deleteVisualSearchDemand(demandId: string): Promise<{ id: string }> {
  return clientMutation<{ id: string }>(`/ai/visual-search/demands/${demandId}`, "DELETE");
}

export async function getVisualSearchDemandById(
  demandId: string
): Promise<VisualSearchDemandItem> {
  return clientFetch<VisualSearchDemandItem>(`/ai/visual-search/demands/${demandId}`);
}
