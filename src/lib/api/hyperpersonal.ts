import { clientFetch, clientMutation } from "@/lib/core/client";

export type NextBestActionType =
  | "bundle_saver"
  | "restock_favorite"
  | "abandoned_cart_rescue"
  | "category_upgrade"
  | "loyalty_milestone"
  | "first_time_shopper";

export interface NextBestAction {
  actionId: string;
  actionType: NextBestActionType;
  headline: string;
  subtext: string;
  badge: string;
  urgency: "high" | "medium" | "low";
  recommendedProduct?: {
    id: string;
    title: string;
    price: number;
    discountPrice?: number;
    image: string;
    category: string;
  };
  incentiveVoucher?: {
    code: string;
    discountPercent: number;
    expiresHours: number;
  };
  ctaText: string;
  ctaLink: string;
}

export interface CustomerGenomeProfile {
  userId: string;
  customerName: string;
  archetype: string;
  aestheticStyles: string[];
  topCategoryAffinities: Array<{
    category: string;
    affinityScore: number;
  }>;
  priceElasticity: "value_seeker" | "balanced" | "premium_buyer";
  journeyStage: "discovery" | "evaluation" | "intent" | "ready_to_buy" | "loyal_advocate";
  loyaltyScore: number;
  estimatedNextOrderWindowDays: number;
  lifetimePurchasesCount: number;
  totalSpentFormatted: string;
  privacyShieldStatus: "Active (PII Obfuscated & Edge-Hashed)";
}

export interface SentimentAdaptiveResponse {
  detectedSentiment: "frustrated" | "hesitant" | "neutral" | "delighted";
  sentimentConfidence: number;
  adaptedTone: "empathetic_supportive" | "reassuring_clarifying" | "enthusiastic_guiding";
  replyMessage: string;
  specialIncentiveOffered?: {
    code: string;
    discountPercent: number;
    message: string;
  };
}

export interface CulturalContextualizedProduct {
  productId: string;
  region: string;
  culturalContextLabel: string;
  adaptedTitle: string;
  adaptedDescription: string;
  lifestyleUseCases: string[];
  regionalSavingsHighlight: string;
  recommendedComplements: string[];
}

export async function getNextBestAction(): Promise<NextBestAction> {
  const res = await clientFetch<{ data: NextBestAction }>("/ai/hyperpersonal/next-best-action");
  return res.data;
}

export async function getCustomerGenome(): Promise<CustomerGenomeProfile> {
  const res = await clientFetch<{ data: CustomerGenomeProfile }>("/ai/hyperpersonal/genome");
  return res.data;
}

export async function sendSentimentChat(message: string): Promise<SentimentAdaptiveResponse> {
  const res = await clientMutation<{ data: SentimentAdaptiveResponse }>(
    "/ai/hyperpersonal/sentiment-chat",
    "POST",
    { message }
  );
  return res.data;
}

export async function getCulturalContext(productId: string, region?: string): Promise<CulturalContextualizedProduct> {
  const url = region
    ? `/ai/hyperpersonal/cultural-context/${productId}?region=${encodeURIComponent(region)}`
    : `/ai/hyperpersonal/cultural-context/${productId}`;
  const res = await clientFetch<{ data: CulturalContextualizedProduct }>(url);
  return res.data;
}
