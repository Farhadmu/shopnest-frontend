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
    products: number;
    activeSellers: number;
    orders: number;
    unitsSold: number;
    revenue: number;
    avgOrderValue: number;
    revenueShare: number;
    growthRate: number;
    avgRating: number;
    ratingCount: number;
  }>;
  topPerformer: string;
  fastestExpandingCatalog: string;
  totalRevenue: number;
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
    revenueGrowth: number;
    totalUsers: number;
    userGrowth: string;
    totalSellers: number;
    sellerGrowth: string;
    totalOrders: number;
    orderGrowth: string;
  };
  timeline: Array<{ label: string; revenue: number; orders: number; users: number; sellers: number }>;
  categoryPerformance: Array<{ category: string; revenue: number; share: number; orders: number }>;
  topSellersRanking: Array<{ rank: number; storeId: string; name: string; gmv: number; gmvFormatted: string; orders: number; rating: number; returnRate: number; products: number }>;
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
  range: string;
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

export async function getRiskMatrix(range: string = "30d") {
  return clientFetch<RiskMatrixData>(`/admin/risk-matrix?range=${range}`);
}

// 37b. SUSPICIOUS ORDERS
export interface SuspiciousOrderItem {
  orderId: string;
  userId: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  riskScore: number;
  riskLevel: string;
  reasons: string[];
  createdAt: string;
}

export interface SuspiciousOrdersData {
  orders: SuspiciousOrderItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export async function getSuspiciousOrders(params?: { range?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.range) query.append("range", params.range);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  const qStr = query.toString();
  return clientFetch<SuspiciousOrdersData>(`/admin/suspicious-orders${qStr ? `?${qStr}` : ""}`);
}

// 37c. FINANCIAL RISK
export interface FinancialRiskData {
  totalTransactionValue: number;
  cancelledOrderValue: number;
  refundedAmount: number;
  returnedOrderValue: number;
  potentialExposure: number;
  exposurePercentage: number;
}

export async function getFinancialRisk() {
  return clientFetch<FinancialRiskData>("/admin/financial-risk");
}

// 37d. FRAUD ALERTS
export interface FraudAlertItem {
  id: string;
  type: string;
  entityName: string;
  entityId: string;
  riskLevel: string;
  riskScore: number;
  reason: string;
  detectedAt: string;
  status: string;
}

export interface FraudAlertsData {
  alerts: FraudAlertItem[];
  total: number;
  byRiskLevel: { critical: number; high: number; medium: number; low: number };
}

export async function getFraudAlerts(range: string = "30d") {
  return clientFetch<FraudAlertsData>(`/admin/fraud-alerts?range=${range}`);
}

// 38. SECURITY INCIDENT MANAGEMENT
export interface SecurityIncidentItem {
  id: string;
  incidentCode: string;
  title: string;
<<<<<<< HEAD
=======
  description?: string;
  type: string;
  source: string;
>>>>>>> master
  entityType: "user" | "seller" | "order" | "system" | "ip_cluster";
  entityId: string;
  entityName: string;
  severity: "low" | "medium" | "high" | "critical";
<<<<<<< HEAD
  status: "new" | "investigating" | "resolved" | "dismissed";
  riskScore: number;
  signals: string[];
  notes: Array<{ authorId: string; authorName: string; note: string; createdAt: string }>;
  history: Array<{ action: string; changedBy: string; timestamp: string; details?: string }>;
  resolvedAt?: string;
  resolvedBy?: string;
=======
  status: "new" | "open" | "acknowledged" | "investigating" | "mitigated" | "resolved" | "closed" | "dismissed";
  riskScore: number;
  signals: string[];
  assignedAdmin?: { adminId: string; adminName: string; assignedAt: string };
  detectedAt: string;
  acknowledgedAt?: string;
  investigationStartedAt?: string;
  mitigatedAt?: string;
  mitigatedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionSummary?: string;
  closedAt?: string;
  closedBy?: string;
  closeReason?: string;
  notes: Array<{ authorId: string; authorName: string; note: string; createdAt: string }>;
  history: Array<{ action: string; changedBy: string; timestamp: string; details?: string }>;
  evidence: Array<{ description: string; reference: string; addedBy: string; addedAt: string }>;
  relatedSecurityEvents?: string[];
  relatedRiskSignals?: string[];
>>>>>>> master
  createdAt: string;
  updatedAt: string;
}

<<<<<<< HEAD
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

=======
export interface IncidentStats {
  total: number;
  open: number;
  investigating: number;
  mitigated: number;
  resolved: number;
  closed: number;
  dismissed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  bySeverity: { critical: number; high: number; medium: number; low: number };
  todayCreated: number;
  weekCreated: number;
  monthResolved: number;
  avgResolutionHours: number | null;
}

export interface IncidentListResponse {
  incidents: SecurityIncidentItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  stats: IncidentStats;
}

export interface IncidentTimelineItem {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
}

export interface IncidentQueryParams {
  status?: string;
  severity?: string;
  type?: string;
  source?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  limit?: number;
}

export async function getSecurityIncidents(params?: IncidentQueryParams): Promise<IncidentListResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.severity) query.append("severity", params.severity);
  if (params?.type) query.append("type", params.type);
  if (params?.source) query.append("source", params.source);
  if (params?.search) query.append("search", params.search);
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.sortDir) query.append("sortDir", params.sortDir);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  const qStr = query.toString();
  return clientFetch<IncidentListResponse>(`/admin/incidents${qStr ? `?${qStr}` : ""}`);
}

export async function getSecurityIncidentById(id: string): Promise<SecurityIncidentItem> {
  return clientFetch<SecurityIncidentItem>(`/admin/incidents/${id}`);
}

export async function getIncidentStats(): Promise<IncidentStats> {
  return clientFetch<IncidentStats>(`/admin/incidents/stats`);
}

export async function updateIncidentStatus(id: string, status: string, notes?: string): Promise<SecurityIncidentItem> {
  return clientMutation<SecurityIncidentItem>(`/admin/incidents/${id}/status`, "PATCH", { status, notes });
}

export async function updateIncidentSeverity(id: string, severity: string, reason?: string): Promise<SecurityIncidentItem> {
  return clientMutation<SecurityIncidentItem>(`/admin/incidents/${id}/severity`, "PATCH", { severity, reason });
}

export async function assignIncident(id: string, adminId: string, adminName: string): Promise<SecurityIncidentItem> {
  return clientMutation<SecurityIncidentItem>(`/admin/incidents/${id}/assign`, "PATCH", { adminId, adminName });
}

export async function unassignIncident(id: string): Promise<SecurityIncidentItem> {
  return clientMutation<SecurityIncidentItem>(`/admin/incidents/${id}/unassign`, "PATCH", {});
}

export async function addIncidentNote(id: string, note: string): Promise<SecurityIncidentItem> {
  return clientMutation<SecurityIncidentItem>(`/admin/incidents/${id}/notes`, "POST", { note });
}

export async function resolveIncident(id: string, resolutionSummary: string): Promise<SecurityIncidentItem> {
  return clientMutation<SecurityIncidentItem>(`/admin/incidents/${id}/resolve`, "POST", { resolutionSummary });
}

export async function closeIncident(id: string, closeReason: string): Promise<SecurityIncidentItem> {
  return clientMutation<SecurityIncidentItem>(`/admin/incidents/${id}/close`, "POST", { closeReason });
}

export async function reopenIncident(id: string, reason: string, targetStatus?: string): Promise<SecurityIncidentItem> {
  return clientMutation<SecurityIncidentItem>(`/admin/incidents/${id}/reopen`, "POST", { reason, targetStatus: targetStatus || "investigating" });
}

export async function getIncidentTimeline(id: string): Promise<IncidentTimelineItem[]> {
  return clientFetch<IncidentTimelineItem[]>(`/admin/incidents/${id}/timeline`);
}

export async function getRelatedSecurityEvents(id: string) {
  return clientFetch<any[]>(`/admin/incidents/${id}/security-events`);
}

export async function getRelatedRiskSignals(id: string) {
  return clientFetch<any[]>(`/admin/incidents/${id}/risk-signals`);
}

>>>>>>> master
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

