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
  };
  matchingProducts: Array<{
    id: string;
    title: string;
    price: number;
    discountPrice?: number;
    category: string;
    images: string[];
    ratingAvg: number;
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

export async function visualSearchAI(imageUrl: string) {
  return clientMutation<VisualSearchResult>("/ai/visual-search", "POST", { imageUrl });
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

