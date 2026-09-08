import { clientFetch, clientMutation } from "@/lib/core/client";

export interface SellerHealthData {
  storeName: string;
  overallHealth: number;
  metrics: {
    customerSatisfaction: { score: number; unit: string; target: number; status: string };
    responseRate: { score: number; unit: string; target: number; status: string };
    deliveryReliability: { score: number; unit: string; target: number; status: string };
    productQuality: { score: number; unit: string; target: number; status: string };
    returnRate: { score: number; unit: string; target: number; status: string };
  };
  recommendations: string[];
}

export interface SalesForecastData {
  storeId: string;
  period: string;
  expectedRevenue: number;
  expectedOrders: number;
  confidenceScore: number;
  growthRateProjected: string;
  forecastDaily: Array<{
    day: number;
    date: string;
    expectedRevenue: number;
    lowerBand: number;
    upperBand: number;
    expectedOrders: number;
  }>;
  limitations: string;
}

export interface DemandHeatmapData {
  timeframe: string;
  categories: string[];
  days: string[];
  heatmapData: Array<{
    category: string;
    days: Array<{ day: string; intensity: number; level: string; orderVolume: number }>;
  }>;
  peakDays: string;
  topCategory: string;
}

export interface GrowthSimulationResult {
  scenario: { currentPrice: number; newPrice: number; adSpend: number; inventoryExpansion: number };
  projectedImpact: {
    salesVolumeChange: string;
    revenueChange: string;
    grossMarginImpact: string;
    estimatedExtraOrders: number;
  };
  strategicInsight: string;
}

export interface CampaignSimulationResult {
  campaignName: string;
  discountPercent: number;
  durationDays: number;
  targetSegment: string;
  estimatedReach: string;
  estimatedConversionRate: string;
  expectedOrders: string;
  grossRevenue: string;
  discountCost: string;
  netRevenue: string;
  recommendedDuration: string;
  riskScore: string;
}

export interface CustomerSegmentsData {
  totalCustomersTracked: number;
  segments: Array<{
    name: string;
    percentage: number;
    customerCount: number;
    avgOrderValue: string;
    repeatFrequency: string;
    recommendedAction: string;
  }>;
}

export interface ChurnPredictorData {
  riskTiers: {
    highRisk: { percentage: number; count: number; description: string };
    mediumRisk: { percentage: number; count: number; description: string };
    lowRisk: { percentage: number; count: number; description: string };
  };
  retentionTriggers: Array<{
    trigger: string;
    targetCount: number;
    projectedWinBack: string;
  }>;
}

export interface ProfitabilityData {
  summary: {
    revenue: number;
    cogs: number;
    deliveryCost: number;
    marketingCost: number;
    returnLosses: number;
    grossProfit: number;
    estimatedNetProfit: number;
    netMarginPercent: string;
  };
  topProfitableProducts: Array<{
    title: string;
    revenue: number;
    marginPercent: number;
    netProfit: number;
  }>;
}

export interface SellerGoalItem {
  id: string;
  title: string;
  metricType: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  period: string;
  deadline: string;
  status: "in_progress" | "achieved" | "missed";
  recommendations: string[];
}

export interface AbExperimentData {
  id: string;
  productId: string;
  productTitle: string;
  testType: string;
  variantA: { name: string; value: string; views: number; clicks: number; cartAdds: number; orders: number; revenue: number; conversionRate: number };
  variantB: { name: string; value: string; views: number; clicks: number; cartAdds: number; orders: number; revenue: number; conversionRate: number };
  status: "active" | "paused" | "completed";
  winner?: "variantA" | "variantB" | "inconclusive";
  confidenceScore: number;
  startDate: string;
}

// API functions
export async function getSellerHealthScore() {
  return clientFetch<SellerHealthData>("/sellers/health-score");
}

export async function getSalesForecast() {
  return clientFetch<SalesForecastData>("/sellers/sales-forecast");
}

export async function getDemandHeatmap(timeframe = "30d") {
  return clientFetch<DemandHeatmapData>(`/sellers/demand-heatmap?timeframe=${timeframe}`);
}

export async function simulateGrowthScenario(data: { currentPrice: number; newPrice: number; adSpend: number; inventoryExpansion: number }) {
  return clientMutation<GrowthSimulationResult>("/sellers/simulator/growth", "POST", data);
}

export async function simulateCampaign(data: { campaignName: string; discountPercent: number; durationDays: number; targetSegment: string }) {
  return clientMutation<CampaignSimulationResult>("/sellers/simulator/campaign", "POST", data);
}

export async function getCustomerSegments() {
  return clientFetch<CustomerSegmentsData>("/sellers/segments");
}

export async function getChurnPredictor() {
  return clientFetch<ChurnPredictorData>("/sellers/churn-risk");
}

export async function getProfitabilityAnalysis() {
  return clientFetch<ProfitabilityData>("/sellers/profitability");
}

export async function getSellerGoals() {
  return clientFetch<SellerGoalItem[]>("/sellers/goals");
}

export async function createSellerGoal(data: Partial<SellerGoalItem>) {
  return clientMutation<SellerGoalItem>("/sellers/goals", "POST", data);
}

export async function deleteSellerGoal(id: string) {
  return clientMutation(`/sellers/goals/${id}`, "DELETE");
}

export async function getAbExperiments() {
  return clientFetch<AbExperimentData[]>("/sellers/experiments");
}

export async function createAbExperiment(data: { productId: string; productTitle: string; testType: string; variantAValue: string; variantBValue: string }) {
  return clientMutation<AbExperimentData>("/sellers/experiments", "POST", data);
}

// 21. ADVANCED SELLER ANALYTICS
export interface SellerAnalyticsData {
  range: string;
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    productsSold: number;
    conversionRate: number;
    customerGrowth: string;
    avgOrderValue: number;
  };
  trendPoints: Array<{ label: string; revenue: number; orders: number; visitors: number }>;
  topProducts: Array<{ id: string; title: string; price: number; sold: number; revenue: number; conversion: string }>;
  lowPerformingProducts: Array<{ id: string; title: string; price: number; stock: number; sold: number; views: number; issue: string; action: string }>;
  categoryPerformance: Array<{ category: string; revenue: number; share: number; growth: string }>;
}

export async function getSellerAnalytics(range: string = "30d") {
  return clientFetch<SellerAnalyticsData>(`/sellers/analytics?range=${range}`);
}

// 22. SMART INVENTORY INTELLIGENCE
export interface InventoryIntelligenceData {
  inventoryHealthScore: number;
  summary: {
    totalItems: number;
    healthyStockCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    overstockCount: number;
  };
  items: Array<{
    id: string;
    title: string;
    currentStock: number;
    price: number;
    category: string;
    demandTrend: string;
    stockOutRisk: "Critical" | "High" | "Medium" | "Low";
    restockPriority: string;
    velocity: string;
    estimatedDaysRemaining: number;
  }>;
  alerts: string[];
}

export async function getInventoryIntelligence() {
  return clientFetch<InventoryIntelligenceData>("/sellers/inventory-intelligence");
}

// 23. CUSTOMER INSIGHTS & RETENTION
export interface CustomerInsightsData {
  overview: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    repeatPurchaseRate: string;
    customerSatisfaction: string;
    averageLifetimeValue: string;
  };
  topCustomerSegments: Array<{ segment: string; count: number; avgSpend: string; ltv: string }>;
  recentActivity: Array<{ customer: string; action: string; time: string; amount: string }>;
}

export async function getCustomerInsights() {
  return clientFetch<CustomerInsightsData>("/sellers/customer-insights");
}

