import { clientFetch, clientMutation } from "@/lib/core/client";
import { getDeviceId } from "@/lib/device-id";

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
  activeSessions: number;
  totalSessions: number;
  revokedSessions: number;
  failedLogins: number;
  recentSecurityEvents: number;
}

export interface DeviceSessionItem {
  id: string;
  userId: string;
  deviceId?: string;
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

export interface SecurityTimelineItem {
  id: string;
  event: string;
  detail: string;
  timestamp: string;
  severity: string;
  icon: string;
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

export async function getSecurityOverview() {
  return clientFetch<SecurityOverviewData>("/security/overview");
}

export async function getActiveSessions() {
  return clientFetch<DeviceSessionItem[]>("/security/sessions");
}

/**
 * Registers this browser as a device for the signed-in user.
 *
 * Idempotent by design: the backend recognizes an already-known device and
 * only raises "New Device Detected" the first time a device is ever seen, so
 * this is safe to call on every login and page load.
 */
export async function recordSession() {
  const deviceId = getDeviceId();
  return clientMutation<{ status: string; deviceName?: string }>(
    "/security/sessions/record",
    "POST",
    {},
    deviceId ? { headers: { "x-device-id": deviceId } } : undefined
  );
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
