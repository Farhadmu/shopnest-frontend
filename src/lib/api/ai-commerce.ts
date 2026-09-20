import { clientFetch, clientMutation } from "@/lib/core/client";

export interface IntentDetectionResult {
  extractedIntent: {
    occasion: string;
    recipient: string;
    detectedBudget: string;
    categoryFocus: string;
    rawQuery?: string;
  };
  matchingProducts: Array<{
    id?: string;
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
  winnerByValue?: string;
  winnerByPriority?: {
    criterion: string;
    productId: string;
    reason: string;
  } | null;
  table?: Array<{
    id: string;
    prosText: string;
    consText: string;
  }>;
  keyDifferences?: Array<{
    aspect: string;
    analysis: string;
  }>;
  tradeoffs?: Array<{
    productId: string;
    advantages: string[];
    disadvantages: string[];
  }>;
  suggestedQuestions?: string[];
  comparisonTable?: Array<{
    feature: string;
    items: Record<string, string>;
  }>;
  isFallback?: boolean;
}

export interface CompareAiInput {
  productIds: string[];
  userPrompt?: string;
  priority?: string;
  weights?: Record<string, number>;
}

export async function compareProductsAI(input: string[] | CompareAiInput) {
  const payload = Array.isArray(input) ? { productIds: input } : input;
  return clientMutation<CompareResult>("/ai/compare", "POST", payload);
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

