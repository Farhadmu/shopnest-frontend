import { clientFetch, clientMutation } from "@/lib/core/client";

// Types
export interface SecurityOverviewData {
  securityHealth: number;
  activeAlerts: number;
  criticalAlerts: number;
  suspiciousActivities: number;
  failedLoginAttempts: number;
  suspendedAccounts: number;
  blockedRequests: number;
  rateLimitViolations: number;
  recentSecurityEvents: number;
  totalUsers: number;
  totalActiveUsers: number;
  suspendedUsers: number;
  blockedUsers: number;
  totalSellers: number;
  suspendedSellers: number;
  pendingSellers: number;
  highRiskSellers: number;
  openIncidents: number;
  criticalIncidents: number;
}

export interface SecurityHealthData {
  overallScore: number;
  status: string;
  breakdown: {
    authenticationSecurity: { score: number; weight: number; factors: string[] };
    accountSecurity: { score: number; weight: number; factors: string[] };
    sellerSecurity: { score: number; weight: number; factors: string[] };
    apiSecurity: { score: number; weight: number; factors: string[] };
    incidentManagement: { score: number; weight: number; factors: string[] };
  };
  factors: string[];
}

export interface LoginSecurityData {
  range: string;
  failedLogins: number;
  prevFailedLogins: number;
  changePercent: number;
  timeline: Array<{ label: string; failed: number; success: number }>;
  roleBreakdown: Array<{ role: string; count: number }>;
  recentAttempts: Array<{
    id: string;
    userId: string;
    ip: string;
    message: string;
    severity: string;
    timestamp: string;
    resolved: boolean;
  }>;
}

export interface SuspiciousActivityData {
  activities: Array<{
    id: string;
    type: string;
    userId: string;
    ip: string;
    message: string;
    severity: string;
    timestamp: string;
    resolved: boolean;
    details?: any;
  }>;
  pagination: { total: number; page: number; limit: number; totalPages: number };
  severityBreakdown: Record<string, number>;
  typeBreakdown: Array<{ type: string; count: number }>;
}

export interface AccountSecurityData {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    hasSecurityActivity: boolean;
  }>;
  pagination: { total: number; page: number; limit: number; totalPages: number };
  stats: {
    total: number;
    suspended: number;
    blocked: number;
    active: number;
    recentRegistrations: number;
    flaggedForReview: number;
  };
}

export interface SellerSecurityData {
  sellers: Array<{
    id: string;
    storeName: string;
    ownerId: string;
    status: string;
    trustScore: number;
    rating: number;
    riskLevel: string;
  }>;
  pagination: { total: number; page: number; limit: number; totalPages: number };
  stats: {
    total: number;
    verified: number;
    pending: number;
    suspended: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
}

export interface ApiSecurityData {
  range: string;
  rateLimitBreaches: number;
  unauthorizedAttempts: number;
  blockedRequests: number;
  timeline: Array<{ label: string; blocked: number; unauthorized: number }>;
}

export interface SecurityIncidentItem {
  id: string;
  incidentCode: string;
  title: string;
  entityType: string;
  entityName: string;
  severity: string;
  status: string;
  riskScore: number;
  signals: string[];
  notes: Array<{ authorId: string; authorName: string; note: string; createdAt: string }>;
  history: Array<{ action: string; changedBy: string; timestamp: string; details?: string }>;
  createdAt: string;
  resolvedAt?: string;
}

export interface SecurityIncidentsData {
  incidents: SecurityIncidentItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  stats: { total: number; open: number; investigating: number; resolved: number; critical: number };
}

export interface SecurityAlertItem {
  id: string;
  type: string;
  message: string;
  severity: string;
  timestamp: string;
  resolved: boolean;
}

export interface SecurityAlertsData {
  alerts: SecurityAlertItem[];
  total: number;
  bySeverity: { critical: number; high: number; medium: number; low: number };
}

export interface AuditLogItem {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: string;
  ip?: string;
  details?: any;
  timestamp: string;
}

export interface AuditLogsData {
  logs: AuditLogItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface SecurityAnalyticsData {
  range: string;
  failedLoginTrend: Array<{ date: string; count: number }>;
  incidentTrend: Array<{ date: string; count: number }>;
  suspiciousActivityTrend: Array<{ date: string; count: number }>;
  riskDistribution: Array<{ severity: string; count: number; percentage: number }>;
}

export interface SecurityRecommendation {
  type: string;
  message: string;
  severity: string;
}

export interface SecurityRecommendationsData {
  recommendations: SecurityRecommendation[];
}

// API functions
export async function getSecurityOverview() {
  return clientFetch<SecurityOverviewData>("/admin/security-center/overview");
}

export async function getSecurityHealth() {
  return clientFetch<SecurityHealthData>("/admin/security-center/health");
}

export async function getLoginSecurity(range: string = "7d") {
  return clientFetch<LoginSecurityData>(`/admin/security-center/logins?range=${range}`);
}

export async function getSuspiciousActivity(params?: { range?: string; severity?: string; status?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.range) query.append("range", params.range);
  if (params?.severity) query.append("severity", params.severity);
  if (params?.status) query.append("status", params.status);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  const qStr = query.toString();
  return clientFetch<SuspiciousActivityData>(`/admin/security-center/suspicious-activity${qStr ? `?${qStr}` : ""}`);
}

export async function getAccountSecurity(params?: { status?: string; search?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  const qStr = query.toString();
  return clientFetch<AccountSecurityData>(`/admin/security-center/users${qStr ? `?${qStr}` : ""}`);
}

export async function updateUserStatus(id: string, status: string, reason?: string) {
  return clientMutation(`/admin/security-center/users/${id}/status`, "PATCH", { status, reason });
}

export async function getSellerSecurity(params?: { status?: string; riskLevel?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.riskLevel) query.append("riskLevel", params.riskLevel);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  const qStr = query.toString();
  return clientFetch<SellerSecurityData>(`/admin/security-center/sellers${qStr ? `?${qStr}` : ""}`);
}

export async function getApiSecurity(range: string = "7d") {
  return clientFetch<ApiSecurityData>(`/admin/security-center/api-security?range=${range}`);
}

export async function getSecurityIncidents(params?: { status?: string; severity?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.severity) query.append("severity", params.severity);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  const qStr = query.toString();
  return clientFetch<SecurityIncidentsData>(`/admin/security-center/incidents${qStr ? `?${qStr}` : ""}`);
}

export async function updateIncidentStatus(id: string, status: string, notes?: string) {
  return clientMutation(`/admin/security-center/incidents/${id}`, "PATCH", { status, notes });
}

export async function getSecurityAlerts(range: string = "7d", severity?: string) {
  const query = new URLSearchParams();
  query.append("range", range);
  if (severity) query.append("severity", severity);
  return clientFetch<SecurityAlertsData>(`/admin/security-center/alerts?${query.toString()}`);
}

export async function resolveAlert(id: string) {
  return clientMutation(`/admin/security-center/alerts/${id}/resolve`, "PATCH", {});
}

export async function getSecurityAuditLogs(params?: { range?: string; action?: string; status?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.range) query.append("range", params.range);
  if (params?.action) query.append("action", params.action);
  if (params?.status) query.append("status", params.status);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  const qStr = query.toString();
  return clientFetch<AuditLogsData>(`/admin/security-center/audit-logs${qStr ? `?${qStr}` : ""}`);
}

export async function getSecurityAnalytics(range: string = "30d") {
  return clientFetch<SecurityAnalyticsData>(`/admin/security-center/analytics?range=${range}`);
}

export async function getSecurityRecommendations() {
  return clientFetch<SecurityRecommendationsData>("/admin/security-center/recommendations");
}
