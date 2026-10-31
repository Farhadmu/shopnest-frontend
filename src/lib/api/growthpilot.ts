import { clientFetch, clientMutation } from "@/lib/core/client";

export type MarketingChannel =
  | "instagram_reels"
  | "facebook_ads"
  | "linkedin_b2b"
  | "seo_blog"
  | "email_drip";

export interface GeneratedCampaign {
  channel: MarketingChannel;
  channelLabel: string;
  headline: string;
  primaryText: string;
  hookScript?: string;
  callToAction: string;
  hashtags: string[];
  targetAudience: string;
  projectedMetrics: {
    estimatedCac: string;
    projectedCtr: string;
    conversionLift: string;
  };
}

export interface ChurnRiskCustomer {
  customerId: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDaysAgo: number;
  cartItemCount: number;
  churnProbability: number;
  riskTier: "critical" | "high" | "medium";
  recommendedDiscountPercent: number;
  maxSafeDiscountPercent: number;
  projectedRecoveryProbability: number;
  recommendedIncentiveMessage: string;
}

export interface DynamicValueProp {
  referralSource: "google_search" | "facebook_ad" | "tiktok_viral" | "linkedin_b2b" | "direct";
  sourceLabel: string;
  visitorPersona: string;
  adaptedHeadline: string;
  adaptedSubheadline: string;
  urgencyBadge: string;
  personalizedOfferText: string;
  conversionBenefit: string;
}

export interface GrowthPilotOverview {
  storeName: string;
  estimatedCacReductionPercent: number;
  projectedConversionRateLiftPercent: number;
  totalAtRiskRevenue: number;
  highRiskChurnCount: number;
  totalCustomerLeadsScored: number;
  churnSegments: {
    critical: number;
    high: number;
    medium: number;
  };
  topProducts: Array<{
    id: string;
    title: string;
    category: string;
    price: number;
    discountPrice?: number;
    stock: number;
    sold: number;
    image?: string;
  }>;
  atRiskCustomers: ChurnRiskCustomer[];
  leadScoringQueue: Array<{
    customerId: string;
    name: string;
    email: string;
    intentScore: number;
    intentStage: "Hot Prospect" | "Warm Shopper" | "Cold / At-Risk";
    favoriteCategory: string;
    recommendedAction: string;
  }>;
}

export async function getGrowthPilotOverview(): Promise<GrowthPilotOverview> {
  const res = await clientFetch<{ data: GrowthPilotOverview }>("/api/v1/ai/growthpilot/overview");
  return res.data;
}

export async function orchestrateCampaign(
  productId: string,
  targetAudience?: string
): Promise<GeneratedCampaign[]> {
  const res = await clientMutation<{ data: GeneratedCampaign[] }>("/api/v1/ai/growthpilot/orchestrate-campaign", {
    method: "POST",
    body: JSON.stringify({ productId, targetAudience }),
  });
  return res.data;
}

export async function getDynamicValueProps(productId: string): Promise<DynamicValueProp[]> {
  const res = await clientFetch<{ data: DynamicValueProp[] }>(`/api/v1/ai/growthpilot/dynamic-value-props/${productId}`);
  return res.data;
}
