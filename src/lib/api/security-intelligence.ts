import { clientFetch, clientMutation } from "@/lib/core/client";

export interface SecurityOverviewData {
  userId: string;
  securityScore: number;
  statusLevel: string;
  checklist: Array<{
    key: string;
    title: string;
    status: string;
    score: number;
    note: string;
  }>;
  recommendations: string[];
}

export interface DeviceSessionItem {
  id: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  locationCity: string;
  isCurrentSession: boolean;
  isTrusted: boolean;
  status: string;
  lastActiveAt: string;
}

export interface LoginRiskResult {
  riskScore: number;
  riskLevel: string;
  signals: string[];
  requiresAdditionalVerification: boolean;
  action: string;
}

export interface TransactionRiskResult {
  transactionRiskScore: number;
  riskLevel: string;
  signals: string[];
  status: string;
  fraudPreventionShield: string;
}

export interface SecurityTimelineItem {
  id: string;
  event: string;
  detail: string;
  timestamp: string;
  severity: string;
  icon: string;
}

export async function getSecurityOverview() {
  return clientFetch<SecurityOverviewData>("/security/overview");
}

export async function getActiveSessions() {
  return clientFetch<DeviceSessionItem[]>("/security/sessions");
}

export async function revokeSession(id: string) {
  return clientMutation(`/security/sessions/${id}`, "DELETE");
}

export async function revokeAllOtherSessions() {
  return clientMutation("/security/sessions/revoke-all", "POST");
}

export async function evaluateLoginRisk(data: { ip?: string; userAgent?: string }) {
  return clientMutation<LoginRiskResult>("/security/login-risk", "POST", data);
}

export async function evaluateTransactionRisk(data: { orderAmount: number; paymentMethod?: string; shippingCity?: string }) {
  return clientMutation<TransactionRiskResult>("/security/transaction-risk", "POST", data);
}

export async function getSecurityTimeline() {
  return clientFetch<SecurityTimelineItem[]>("/security/timeline");
}
