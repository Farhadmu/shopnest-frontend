import { clientFetch, clientMutation } from "@/lib/core/client";

export interface CopilotResponse {
  role: string;
  query: string;
  answer: string;
  suggestedActions: Array<{ label: string; action: string; targetUrl?: string }>;
  mode: string;
}

export interface IntentDetectionResult {
  extractedIntent: {
    occasion: string;
    recipient: string;
    detectedBudget: string;
    categoryFocus: string;
    rawQuery?: string;
  };
  matchingProducts: Array<{
    id: string;
    _id?: string;
    title: string;
    description?: string;
    price: number;
    discountPrice?: number;
    category: string;
    images: string[];
    ratingAvg: number;
    ratingCount?: number;
    stock?: number;
    sold?: number;
    tags?: string[];
  }>;
  recommendationSummary: string;
}

export interface NegotiationResult {
  originalPrice: number;
  bestEffectivePrice: number;
  totalSavings: number;
  savingsPercent: number;
  discountBreakdown: Array<{ type: string; amount: number; code?: string }>;
  negotiationStrategy: string;
}

export interface CommerceMemoryData {
  userId: string;
  memory: {
    preferences: string[];
    activeTheme: string;
    lastSearchIntent: string;
  };
  controls: {
    canReset: boolean;
    personalizationEnabled: boolean;
  };
}

export async function askCommerceCopilot(query: string, role: string, context?: Record<string, unknown>) {
  return clientMutation<CopilotResponse>("/ai/copilot", "POST", { query, role, context });
}

export async function detectShoppingIntent(prompt: string) {
  return clientMutation<IntentDetectionResult>("/ai/detect-intent", "POST", { prompt });
}

export async function negotiateDeal(productId?: string, cartSubtotal?: number) {
  return clientMutation<NegotiationResult>("/ai/negotiate", "POST", { productId, cartSubtotal });
}

export async function getCommerceMemory() {
  return clientFetch<CommerceMemoryData>("/ai/memory");
}

export async function clearCommerceMemory() {
  return clientMutation("/ai/memory", "DELETE");
}

export interface CompareResult {
  summary: string;
  verdict?: string;
  bestValueId?: string;
  comparisonTable?: Array<{
    feature: string;
    items: Record<string, string>;
  }>;
}

export async function compareProductsAI(productIds: string[]) {
  return clientMutation<CompareResult>("/ai/compare", "POST", { productIds });
}

export interface VisualSearchResult {
  detectedQuery: string;
  count: number;
  products: Array<{
    id: string;
    title: string;
    price: number;
    discountPrice?: number;
    category: string;
    images: string[];
    ratingAvg: number;
    stock: number;
  }>;
}

export async function visualSearchAI(imageUrl: string, searchQuery?: string) {
  return clientMutation<VisualSearchResult>("/ai/visual-search", "POST", { imageUrl, searchQuery });
}

export interface ReviewSummaryResult {
  summary: string;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  pros?: string[];
  cons?: string[];
}

export async function getReviewSummaryAI(productId: string) {
  return clientMutation<ReviewSummaryResult>("/ai/review-summary", "POST", { productId });
}

// Enhanced Copilot API (v2)
export interface AdminCopilotResponse {
  role: string;
  query: string;
  answer: string;
  data: any;
  suggestedActions: Array<{ label: string; action: string; targetUrl?: string }>;
  isFallback: boolean;
}

export async function askAdminCopilot(query: string, range: string = "30d") {
  return clientMutation<AdminCopilotResponse>("/ai/copilot-v2/admin", "POST", { query, range });
}

export async function askSellerCopilot(query: string) {
  return clientMutation<AdminCopilotResponse>("/ai/copilot-v2/seller", "POST", { query });
}

export async function askCustomerCopilot(query: string) {
  return clientMutation<AdminCopilotResponse>("/ai/copilot-v2/customer", "POST", { query });
}

