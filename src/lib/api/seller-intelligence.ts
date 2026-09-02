import { clientFetch, clientMutation } from "@/lib/core/client";

// Updated types to match new backend response format
export interface SellerHealthData {
  storeName: string;
  overallHealth: number | null;
  hasEnoughData: boolean;
  metrics: {
    customerSatisfaction: { score: number | null; unit: string; status: string };
    deliveryReliability: { score: number | null; unit: string; status: string };
    returnRate: { score: number | null; unit: string; status: string };
  };
  recommendations: string[];
}

export interface SalesForecastData {
  storeId?: string;
  period?: string;
  hasEnoughData: boolean;
  message?: string;
  expectedRevenue: number | null;
  expectedOrders: number | null;
  confidenceScore: number | null;
  growthRateProjected?: string | null;
  forecastDaily: Array<{
    day: number;
    date: string;
    expectedRevenue: number;
    lowerBand: number;
    upperBand: number;
    expectedOrders: number;
  }>;
  limitations?: string;
}

export interface DemandHeatmapData {
  hasEnoughData: boolean;
  message?: string;
  timeframe: string;
  heatmapData: Array<{
    division: string;
    orders: number;
    revenue: number;
    intensity: number;
  }>;
  totalOrders?: number;
  topDivision?: string | null;
}

export interface GrowthSimulationResult {
  currentBaseline: {
    avgPrice: number;
    monthlyOrders: number;
    monthlyRevenue: number;
  };
  simulatedScenario: {
    newPrice: number;
    adSpend: number;
    inventoryExpansion: number;
  };
  projectedImpact: {
    salesVolumeChange: string;
    revenueChange: string;
    estimatedOrdersChange: number;
  };
  isSimulation: boolean;
  disclaimer: string;
}

export interface CampaignSimulationResult {
  hasEnoughData: boolean;
  message?: string;
  campaignName?: string;
  discountPercent?: number;
  durationDays?: number;
  currentBaseline?: {
    avgDailyOrders: number;
    avgOrderValue: number;
  };
  simulation?: {
    estimatedOrders: number;
    grossRevenue: number;
    discountCost: number;
    netRevenue: number;
  };
  isSimulation?: boolean;
  disclaimer?: string;
}

export interface CustomerSegmentsData {
  hasEnoughData: boolean;
  message?: string;
  totalCustomersTracked: number;
  totalOrders?: number;
  segments: Array<{
    name: string;
    count: number;
    percentage: number;
    description: string;
  }>;
}

export interface ChurnPredictorData {
  hasEnoughData: boolean;
  message?: string;
  riskTiers: {
    highRisk: { count: number; percentage: number; description: string };
    mediumRisk: { count: number; percentage: number; description: string };
    lowRisk: { count: number; percentage: number; description: string };
  };
  inactiveThresholdDays?: number;
}

export interface ProfitabilityData {
  hasEnoughData: boolean;
  message?: string;
  revenue: number;
  orderCount?: number;
  hasCostData: boolean;
  summary?: {
    revenue: number;
    totalCost: number;
    grossProfit: number;
    netMarginPercent: string;
  };
  productCount?: number;
}

export interface SellerGoalItem {
  id: string;
  _id?: string;
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
  _id?: string;
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

export async function simulateGrowthScenario(data: { currentPrice?: number; newPrice?: number; adSpend?: number; inventoryExpansion?: number }) {
  return clientMutation<GrowthSimulationResult>("/sellers/simulator/growth", "POST", data);
}

export async function simulateCampaign(data: { campaignName?: string; discountPercent?: number; durationDays?: number }) {
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

export async function createSellerGoal(data: { title: string; metricType: string; targetValue: number; unit?: string; deadline: string; period?: string }) {
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
  hasEnoughData: boolean;
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    productsSold: number;
    avgOrderValue: number;
  };
  trendPoints: Array<{ label: string; revenue: number; orders: number }>;
  topProducts: Array<{ id: string; title: string; price: number; sold: number; revenue: number }>;
  productCount: number;
}

export async function getSellerAnalytics(range: string = "30d") {
  return clientFetch<SellerAnalyticsData>(`/sellers/analytics?range=${range}`);
}

// 22. SMART INVENTORY INTELLIGENCE
export interface InventoryIntelligenceData {
  hasEnoughData: boolean;
  message?: string;
  inventoryHealthScore: number | null;
  summary: {
    totalItems: number;
    healthyStockCount: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  items: Array<{
    id: string;
    title: string;
    currentStock: number;
    price: number;
    category: string;
    sold: number;
    stockOutRisk: "Critical" | "High" | "Medium" | "Low";
    restockPriority: string;
    estimatedDaysRemaining: number | null;
  }>;
}

export async function getInventoryIntelligence() {
  return clientFetch<InventoryIntelligenceData>("/sellers/inventory-intelligence");
}

// 23. CUSTOMER INSIGHTS & RETENTION
export interface CustomerInsightsData {
  hasEnoughData: boolean;
  message?: string;
  overview: {
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    returningCustomers: number;
    repeatPurchaseRate: number;
    averageOrderValue: number;
  };
}

export async function getCustomerInsights() {
  return clientFetch<CustomerInsightsData>("/sellers/customer-insights");
}
