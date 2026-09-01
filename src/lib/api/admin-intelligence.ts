import { clientFetch, clientMutation } from "@/lib/core/client";

export interface CommandCenterData {
  marketplaceOverview: {
    users: number;
    sellers: number;
    products: number;
    orders: number;
    revenueGmv: number;
    pendingSellerApprovals: number;
    pendingProductModeration: number;
    systemHealthPercent: number;
    riskStatus: string;
  };
  liveStatus: {
    activeShoppersNow: number;
    checkoutSuccessRate: string;
    averageApiResponseTimeMs: number;
    securityAlertLevel: string;
  };
}

export interface MarketplaceMapData {
  selectedMetric: string;
  divisions: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
    sellers: number;
    customers: number;
    growth: string;
  }>;
  nationalHub: string;
  fastestGrowingRegion: string;
}

export interface AnomalyItem {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  anomalyType: string;
  severity: "low" | "medium" | "high" | "critical";
  riskScore: number;
  evidence: string;
  recommendedAction: string;
  status: "detected" | "under_review" | "resolved" | "dismissed";
  detectedAt: string;
}

export interface MarketplaceHealthData {
  overallHealth: number;
  pillars: {
    customerHealth: { score: number; weight: string; label: string; status: string };
    sellerHealth: { score: number; weight: string; label: string; status: string };
    orderReliability: { score: number; weight: string; label: string; status: string };
    securityIndex: { score: number; weight: string; label: string; status: string };
    platformStability: { score: number; weight: string; label: string; status: string };
  };
  historicalTrend: Array<{ day: string; score: number }>;
  evaluationNotice: string;
}

export interface RevenueLeakageData {
  totalRevenue: number;
  totalPotentialLeakage: number;
  leakageFormatted: string;
  leakagePercentage: number;
  recoveredThisMonth: string;
  leakageCategories: Array<{
    type: string;
    amount: number;
    count: number;
    severity: string;
    details: string;
  }>;
  orderSummary: {
    total: number;
    completed: number;
    cancelled: number;
    refunded: number;
  };
  automatedRemediation: string;
}

export interface SellerRiskItem {
  sellerId: string;
  storeId: string;
  storeName: string;
  rating: number;
  trustScore: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  cancellationRate: number;
  returnRate: number;
  totalProducts: number;
  rejectedProducts: number;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskFactors: string[];
  status: string;
  lastActivity: string;
}

export interface SellerRiskData {
  riskDistribution: {
    low: { count: number; percentage: number; label: string };
    medium: { count: number; percentage: number; label: string };
    high: { count: number; percentage: number; label: string };
    critical: { count: number; percentage: number; label: string };
  };
  averageRiskScore: number;
  totalSellers: number;
  flaggedSellers: Array<{
    sellerId: string;
    storeId: string;
    storeName: string;
    riskScore: number;
    riskLevel: string;
    reason: string;
    actionRequired: string;
  }>;
  allSellers: SellerRiskItem[];
}

export interface MarketplaceForecastData {
  horizon: string;
  metrics: {
    userGrowth: { expectedDelta: string; baseline: string; projected: string; confidence: string };
    orderGrowth: { expectedDelta: string; baseline: string; projected: string; confidence: string };
    revenueGmv: { expectedDelta: string; baseline: string; projected: string; confidence: string };
    returnRate: { expectedDelta: string; baseline: string; projected: string; confidence: string };
  };
  macroDrivers: string[];
}

export interface CategoryIntelligenceData {
  categories: Array<{
    name: string;
    growthRate: string;
    revenueShare: number;
    orderVolume: string;
    activeSellers: number;
    avgOrderValue: string;
  }>;
  topPerformer: string;
  fastestExpandingCatalog: string;
}

export interface SystemTelemetryData {
  overallStatus: string;
  uptime: string;
  p95LatencyMs: number;
  averageLatencyMs: number;
  endpoints: Array<{
    service: string;
    endpoint: string;
    responseTimeMs: number;
    status: string;
    errorRate: string;
    throughputRps: number;
  }>;
  recentIncidents: Array<{ time: string; message: string; status: string }>;
}

// API functions
export async function getCommandCenter() {
  return clientFetch<CommandCenterData>("/admin/command-center");
}

export async function getMarketplaceMap(metric = "orders") {
  return clientFetch<MarketplaceMapData>(`/admin/marketplace-map?metric=${metric}`);
}

export async function getAnomalies() {
  return clientFetch<AnomalyItem[]>("/admin/anomalies");
}

export async function resolveAnomaly(id: string, notes?: string) {
  return clientMutation(`/admin/anomalies/${id}/resolve`, "PATCH", { notes });
}

export async function getMarketplaceHealth() {
  return clientFetch<MarketplaceHealthData>("/admin/marketplace-health");
}

export async function getRevenueLeakage() {
  return clientFetch<RevenueLeakageData>("/admin/revenue-leakage");
}

export async function getSellerRiskRanking() {
  return clientFetch<SellerRiskData>("/admin/seller-risk-ranking");
}

export async function getMarketplaceForecast() {
  return clientFetch<MarketplaceForecastData>("/admin/marketplace-forecast");
}

export async function getCategoryIntelligence() {
  return clientFetch<CategoryIntelligenceData>("/admin/category-intelligence");
}

export async function getSystemTelemetry() {
  return clientFetch<SystemTelemetryData>("/admin/system-telemetry");
}

// 36. PLATFORM ANALYTICS
export interface PlatformAnalyticsData {
  range: string;
  kpis: {
    totalRevenue: number;
    revenueGrowth: string;
    totalUsers: number;
    userGrowth: string;
    totalSellers: number;
    sellerGrowth: string;
    totalOrders: number;
    orderGrowth: string;
  };
  timeline: Array<{ label: string; revenue: number; orders: number; users: number; sellers: number }>;
  categoryPerformance: Array<{ category: string; revenue: number; share: number; growth: string }>;
  topSellersRanking: Array<{ rank: number; name: string; gmv: string; orders: number; rating: number; returnRate: string }>;
}

export async function getPlatformAnalytics(range: string = "30d") {
  return clientFetch<PlatformAnalyticsData>(`/admin/platform-analytics?range=${range}`);
}

// 37. RULE-BASED FRAUD & RISK DETECTION MATRIX
export interface RiskEventItem {
  id: string;
  user: string;
  event: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
  status: string;
  signals: string[];
  recommendation: string;
}

export interface RiskMatrixData {
  overallPlatformRiskScore: number;
  overallRiskLevel: string;
  riskDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  ruleMetrics: {
    failedLoginDetections: number;
    unusualOrderFrequency: number;
    abnormalBasketValues: number;
    couponAbuseAttempts: number;
    suspiciousRefundBehaviors: number;
  };
  disclaimer: string;
  events: RiskEventItem[];
}

export async function getRiskMatrix() {
  return clientFetch<RiskMatrixData>("/admin/risk-matrix");
}

// 38. SECURITY INCIDENT MANAGEMENT
export interface SecurityIncidentItem {
  id: string;
  incidentCode: string;
  title: string;
  entityType: "user" | "seller" | "order" | "system" | "ip_cluster";
  entityId: string;
  entityName: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "new" | "investigating" | "resolved" | "dismissed";
  riskScore: number;
  signals: string[];
  notes: Array<{ authorId: string; authorName: string; note: string; createdAt: string }>;
  history: Array<{ action: string; changedBy: string; timestamp: string; details?: string }>;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getSecurityIncidents(params?: { status?: string; severity?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.severity) query.append("severity", params.severity);
  const qStr = query.toString();
  return clientFetch<SecurityIncidentItem[]>(`/admin/incidents${qStr ? `?${qStr}` : ""}`);
}

export async function updateSecurityIncident(id: string, data: { status?: string; severity?: string; notes?: string }) {
  return clientMutation<SecurityIncidentItem>(`/admin/incidents/${id}`, "PATCH", data);
}

export async function addIncidentNote(id: string, note: string) {
  return clientMutation<SecurityIncidentItem>(`/admin/incidents/${id}/notes`, "POST", { note });
}

// 39. ADMIN AUDIT LOG
export interface AuditLogItem {
  id: string;
  actorId: string;
  actorName: string;
  role: "customer" | "seller" | "admin" | "system";
  action: string;
  resource: string;
  resourceId?: string;
  status: "success" | "warning" | "failure";
  ip?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export async function getAuditLogs(params?: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.append(k, v);
    });
  }
  const qStr = query.toString();
  return clientFetch<AuditLogItem[]>(`/admin/audit-logs${qStr ? `?${qStr}` : ""}`);
}

