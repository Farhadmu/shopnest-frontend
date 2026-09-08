"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel, StatCard, EmptyState } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { LineAreaChart } from "@/components/analytics/LineAreaChart";
import { BarChart } from "@/components/analytics/BarChart";
import { DonutChart } from "@/components/analytics/DonutChart";
import { formatCurrency } from "@/lib/utils";
import {
  getSecurityOverview,
  getSecurityHealth,
  getLoginSecurity,
  getSuspiciousActivity,
  getAccountSecurity,
  getSellerSecurity,
  getApiSecurity,
  getSecurityIncidents,
  getSecurityAlerts,
  getSecurityAuditLogs,
  getSecurityAnalytics,
  getSecurityRecommendations,
  SecurityOverviewData,
  SecurityHealthData,
  LoginSecurityData,
  SuspiciousActivityData,
  AccountSecurityData,
  SellerSecurityData,
  ApiSecurityData,
  SecurityIncidentsData,
  SecurityAlertsData,
  AuditLogsData,
  SecurityAnalyticsData,
  SecurityRecommendationsData,
} from "@/lib/api/security-center";

type TabType = "overview" | "health" | "logins" | "suspicious" | "accounts" | "sellers" | "api" | "incidents" | "alerts" | "audit" | "analytics";

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "🛡️" },
  { id: "health", label: "Health Score", icon: "💚" },
  { id: "logins", label: "Login Security", icon: "🔑" },
  { id: "suspicious", label: "Suspicious Activity", icon: "⚠️" },
  { id: "accounts", label: "Accounts", icon: "👥" },
  { id: "sellers", label: "Sellers", icon: "🏪" },
  { id: "api", label: "API Security", icon: "🔒" },
  { id: "incidents", label: "Incidents", icon: "🚨" },
  { id: "alerts", label: "Alerts", icon: "🔔" },
  { id: "audit", label: "Audit Log", icon: "📋" },
  { id: "analytics", label: "Analytics", icon: "📊" },
];

export default function SecurityCenterPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [overview, setOverview] = useState<SecurityOverviewData | null>(null);
  const [health, setHealth] = useState<SecurityHealthData | null>(null);
  const [loginSecurity, setLoginSecurity] = useState<LoginSecurityData | null>(null);
  const [suspiciousActivity, setSuspiciousActivity] = useState<SuspiciousActivityData | null>(null);
  const [accountSecurity, setAccountSecurity] = useState<AccountSecurityData | null>(null);
  const [sellerSecurity, setSellerSecurity] = useState<SellerSecurityData | null>(null);
  const [apiSecurity, setApiSecurity] = useState<ApiSecurityData | null>(null);
  const [incidents, setIncidents] = useState<SecurityIncidentsData | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlertsData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogsData | null>(null);
  const [analytics, setAnalytics] = useState<SecurityAnalyticsData | null>(null);
  const [recommendations, setRecommendations] = useState<SecurityRecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    try {
      const data = await getSecurityOverview();
      setOverview(data);
    } catch {
      setOverview(null);
    }
  }, []);

  const loadHealth = useCallback(async () => {
    try {
      const data = await getSecurityHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    }
  }, []);

  const loadLoginSecurity = useCallback(async (range: string = "7d") => {
    try {
      const data = await getLoginSecurity(range);
      setLoginSecurity(data);
    } catch {
      setLoginSecurity(null);
    }
  }, []);

  const loadSuspiciousActivity = useCallback(async (range: string = "7d") => {
    try {
      const data = await getSuspiciousActivity({ range });
      setSuspiciousActivity(data);
    } catch {
      setSuspiciousActivity(null);
    }
  }, []);

  const loadAccountSecurity = useCallback(async () => {
    try {
      const data = await getAccountSecurity();
      setAccountSecurity(data);
    } catch {
      setAccountSecurity(null);
    }
  }, []);

  const loadSellerSecurity = useCallback(async () => {
    try {
      const data = await getSellerSecurity();
      setSellerSecurity(data);
    } catch {
      setSellerSecurity(null);
    }
  }, []);

  const loadApiSecurity = useCallback(async (range: string = "7d") => {
    try {
      const data = await getApiSecurity(range);
      setApiSecurity(data);
    } catch {
      setApiSecurity(null);
    }
  }, []);

  const loadIncidents = useCallback(async () => {
    try {
      const data = await getSecurityIncidents();
      setIncidents(data);
    } catch {
      setIncidents(null);
    }
  }, []);

  const loadAlerts = useCallback(async (range: string = "7d") => {
    try {
      const data = await getSecurityAlerts(range);
      setAlerts(data);
    } catch {
      setAlerts(null);
    }
  }, []);

  const loadAuditLogs = useCallback(async (range: string = "7d") => {
    try {
      const data = await getSecurityAuditLogs({ range });
      setAuditLogs(data);
    } catch {
      setAuditLogs(null);
    }
  }, []);

  const loadAnalytics = useCallback(async (range: string = "30d") => {
    try {
      const data = await getSecurityAnalytics(range);
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    }
  }, []);

  const loadRecommendations = useCallback(async () => {
    try {
      const data = await getSecurityRecommendations();
      setRecommendations(data);
    } catch {
      setRecommendations(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadOverview().finally(() => setLoading(false));
    loadRecommendations();
  }, [loadOverview, loadRecommendations]);

  useEffect(() => {
    if (activeTab === "health") loadHealth();
    if (activeTab === "logins") loadLoginSecurity();
    if (activeTab === "suspicious") loadSuspiciousActivity();
    if (activeTab === "accounts") loadAccountSecurity();
    if (activeTab === "sellers") loadSellerSecurity();
    if (activeTab === "api") loadApiSecurity();
    if (activeTab === "incidents") loadIncidents();
    if (activeTab === "alerts") loadAlerts();
    if (activeTab === "audit") loadAuditLogs();
    if (activeTab === "analytics") loadAnalytics();
  }, [activeTab, loadHealth, loadLoginSecurity, loadSuspiciousActivity, loadAccountSecurity, loadSellerSecurity, loadApiSecurity, loadIncidents, loadAlerts, loadAuditLogs, loadAnalytics]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-error/10 text-error";
      case "high": return "bg-warning/10 text-warning";
      case "medium": return "bg-amber-500/10 text-amber-500";
      case "low": return "bg-success/10 text-success";
      default: return "bg-muted-bg text-muted";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-error/10 text-error";
      case "investigating": return "bg-warning/10 text-warning";
      case "resolved": return "bg-success/10 text-success";
      case "dismissed": return "bg-muted-bg text-muted";
      case "active": return "bg-success/10 text-success";
      case "suspended": return "bg-error/10 text-error";
      case "blocked": return "bg-error/10 text-error";
      case "pending": return "bg-warning/10 text-warning";
      default: return "bg-muted-bg text-muted";
    }
  };

  return (
    <DashboardShell
      role="Administrator"
      title="Security Command Center"
      subtitle="Real-time security monitoring, threat detection, incident management, and audit trails."
      links={adminDashboardLinks}
      showContinueShopping={false}
    >
      <div className="grid gap-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 rounded-2xl border border-border bg-surface p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:bg-muted-bg hover:text-text"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid gap-6">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-5">
                    <div className="h-4 w-24 rounded-lg bg-muted-bg mb-3" />
                    <div className="h-8 w-16 rounded-lg bg-muted-bg" />
                  </div>
                ))}
              </div>
            ) : overview ? (
              <>
                {/* Security Health Score */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    icon="🛡️"
                    label="Security Health"
                    value={`${overview.securityHealth}/100`}
                    note={overview.securityHealth >= 75 ? "Good" : overview.securityHealth >= 50 ? "Warning" : "Critical"}
                    color={overview.securityHealth >= 75 ? "success" : overview.securityHealth >= 50 ? "warning" : "error"}
                  />
                  <StatCard
                    icon="🚨"
                    label="Active Alerts"
                    value={overview.activeAlerts}
                    note={`${overview.criticalAlerts} critical`}
                    color={overview.criticalAlerts > 0 ? "error" : "warning"}
                  />
                  <StatCard
                    icon="⚠️"
                    label="Suspicious Activities"
                    value={overview.suspiciousActivities}
                    note="Requires review"
                    color={overview.suspiciousActivities > 0 ? "warning" : "success"}
                  />
                  <StatCard
                    icon="🔑"
                    label="Failed Logins (24h)"
                    value={overview.failedLoginAttempts}
                    note="Last 24 hours"
                    color={overview.failedLoginAttempts > 10 ? "error" : "default"}
                  />
                </div>

                {/* Secondary Metrics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    icon="👥"
                    label="Suspended Accounts"
                    value={overview.suspendedAccounts}
                    note={`${overview.suspendedUsers} users, ${overview.suspendedSellers} sellers`}
                    color={overview.suspendedAccounts > 0 ? "warning" : "success"}
                  />
                  <StatCard
                    icon="🚫"
                    label="Blocked Requests"
                    value={overview.blockedRequests}
                    note="Rate limit breaches"
                    color="default"
                  />
                  <StatCard
                    icon="📊"
                    label="Open Incidents"
                    value={overview.openIncidents}
                    note={`${overview.criticalIncidents} critical`}
                    color={overview.criticalIncidents > 0 ? "error" : "default"}
                  />
                  <StatCard
                    icon="🏪"
                    label="High-Risk Sellers"
                    value={overview.highRiskSellers}
                    note="Trust score < 40"
                    color={overview.highRiskSellers > 0 ? "warning" : "success"}
                  />
                </div>

                {/* Recommendations */}
                {recommendations && recommendations.recommendations.length > 0 && (
                  <Panel title="💡 Security Recommendations">
                    <div className="grid gap-3">
                      {recommendations.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-3 rounded-xl border p-4 ${
                            rec.severity === "critical" ? "border-error/20 bg-error/5" :
                            rec.severity === "warning" ? "border-warning/20 bg-warning/5" :
                            rec.severity === "success" ? "border-success/20 bg-success/5" :
                            "border-border bg-muted-bg/50"
                          }`}
                        >
                          <span className="text-lg">
                            {rec.severity === "critical" ? "🚨" : rec.severity === "warning" ? "⚠️" : rec.severity === "success" ? "✅" : "ℹ️"}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-text">{rec.message}</p>
                            <p className="text-xs text-muted capitalize">{rec.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}
              </>
            ) : (
              <EmptyState icon="🛡️" title="Security Data Unavailable" description="Unable to load security overview. Please try again." />
            )}
          </div>
        )}

        {/* Health Score Tab */}
        {activeTab === "health" && (
          <div className="grid gap-6">
            {health ? (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  <Panel title="Overall Security Health">
                    <div className="flex flex-col items-center py-4">
                      <GaugeMeter
                        score={health.overallScore}
                        title="Security Score"
                        type={health.overallScore >= 75 ? "health" : "risk"}
                        size={200}
                      />
                      <p className="mt-4 text-sm font-bold text-text">{health.status}</p>
                    </div>
                  </Panel>

                  <Panel title="Score Factors">
                    <div className="grid gap-3">
                      {health.factors.length > 0 ? (
                        health.factors.map((factor, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-xl bg-muted-bg p-3">
                            <span className="h-2 w-2 rounded-full bg-warning" />
                            <span className="text-xs font-medium text-text">{factor}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted">No significant security factors detected.</p>
                      )}
                    </div>
                  </Panel>
                </div>

                <Panel title="Security Breakdown">
                  <div className="grid gap-4">
                    {Object.entries(health.breakdown).map(([key, data]) => (
                      <div key={key} className="rounded-xl border border-border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-text capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className={`text-lg font-black ${
                            data.score >= 75 ? "text-success" : data.score >= 50 ? "text-warning" : "text-error"
                          }`}>
                            {data.score}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted-bg overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              data.score >= 75 ? "bg-success" : data.score >= 50 ? "bg-warning" : "bg-error"
                            }`}
                            style={{ width: `${data.score}%` }}
                          />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {data.factors.map((factor, i) => (
                            <span key={i} className="text-xs text-muted">{factor}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </>
            ) : (
              <EmptyState icon="💚" title="Health Score Unavailable" description="Unable to load security health data." />
            )}
          </div>
        )}

        {/* Login Security Tab */}
        {activeTab === "logins" && (
          <div className="grid gap-6">
            {loginSecurity ? (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard icon="❌" label="Failed Logins" value={loginSecurity.failedLogins} note={`Previous: ${loginSecurity.prevFailedLogins}`} trend={`${loginSecurity.changePercent >= 0 ? "+" : ""}${loginSecurity.changePercent}%`} />
                  <StatCard icon="📈" label="Change" value={`${loginSecurity.changePercent >= 0 ? "+" : ""}${loginSecurity.changePercent}%`} note="vs previous period" color={loginSecurity.changePercent > 0 ? "error" : "success"} />
                  <StatCard icon="👤" label="Unique Users" value={loginSecurity.recentAttempts.length} note="With failed attempts" />
                </div>

                <Panel title="Failed Login Trend">
                  {loginSecurity.timeline.length > 0 ? (
                    <BarChart
                      data={loginSecurity.timeline.map((t) => ({ label: t.label, value: t.failed }))}
                      color="var(--color-error)"
                      height={200}
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted">No login data available</div>
                  )}
                </Panel>

                <Panel title="Recent Failed Login Attempts">
                  {loginSecurity.recentAttempts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="pb-3 font-bold">User</th>
                            <th className="pb-3 font-bold">IP</th>
                            <th className="pb-3 font-bold">Message</th>
                            <th className="pb-3 font-bold">Severity</th>
                            <th className="pb-3 font-bold">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {loginSecurity.recentAttempts.slice(0, 10).map((attempt) => (
                            <tr key={attempt.id} className="hover:bg-muted-bg/50">
                              <td className="py-3 font-medium text-text">{attempt.userId?.substring(0, 8)}...</td>
                              <td className="py-3 text-muted">{attempt.ip}</td>
                              <td className="py-3 text-text max-w-[200px] truncate">{attempt.message}</td>
                              <td className="py-3">
                                <span className={`rounded-md px-2 py-0.5 font-bold ${getSeverityColor(attempt.severity)}`}>
                                  {attempt.severity}
                                </span>
                              </td>
                              <td className="py-3 text-muted">{new Date(attempt.timestamp).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted">No failed login attempts</div>
                  )}
                </Panel>
              </>
            ) : (
              <EmptyState icon="🔑" title="Login Security Data Unavailable" description="Unable to load login security data." />
            )}
          </div>
        )}

        {/* Suspicious Activity Tab */}
        {activeTab === "suspicious" && (
          <div className="grid gap-6">
            {suspiciousActivity ? (
              <>
                <div className="grid gap-4 sm:grid-cols-4">
                  <StatCard icon="⚠️" label="Total Events" value={suspiciousActivity.pagination.total} note="Suspicious activities" />
                  <StatCard icon="🔴" label="Critical" value={suspiciousActivity.severityBreakdown.critical || 0} note="Critical severity" color="error" />
                  <StatCard icon="🟠" label="High" value={suspiciousActivity.severityBreakdown.high || 0} note="High severity" color="warning" />
                  <StatCard icon="🟡" label="Medium" value={suspiciousActivity.severityBreakdown.medium || 0} note="Medium severity" />
                </div>

                <Panel title="Suspicious Activity Events">
                  {suspiciousActivity.activities.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="pb-3 font-bold">Type</th>
                            <th className="pb-3 font-bold">User</th>
                            <th className="pb-3 font-bold">IP</th>
                            <th className="pb-3 font-bold">Message</th>
                            <th className="pb-3 font-bold">Severity</th>
                            <th className="pb-3 font-bold">Status</th>
                            <th className="pb-3 font-bold">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {suspiciousActivity.activities.map((activity) => (
                            <tr key={activity.id} className="hover:bg-muted-bg/50">
                              <td className="py-3 font-medium text-text">{activity.type}</td>
                              <td className="py-3 text-muted">{activity.userId?.substring(0, 8)}...</td>
                              <td className="py-3 text-muted">{activity.ip}</td>
                              <td className="py-3 text-text max-w-[200px] truncate">{activity.message}</td>
                              <td className="py-3">
                                <span className={`rounded-md px-2 py-0.5 font-bold ${getSeverityColor(activity.severity)}`}>
                                  {activity.severity}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`rounded-md px-2 py-0.5 font-bold ${activity.resolved ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                                  {activity.resolved ? "Resolved" : "Active"}
                                </span>
                              </td>
                              <td className="py-3 text-muted">{new Date(activity.timestamp).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted">No suspicious activity detected</div>
                  )}
                </Panel>
              </>
            ) : (
              <EmptyState icon="⚠️" title="Suspicious Activity Data Unavailable" description="Unable to load suspicious activity data." />
            )}
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === "accounts" && (
          <div className="grid gap-6">
            {accountSecurity ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon="👥" label="Total Users" value={accountSecurity.stats.total} note="All registered users" />
                  <StatCard icon="✅" label="Active" value={accountSecurity.stats.active} note="Active accounts" color="success" />
                  <StatCard icon="⏸️" label="Suspended" value={accountSecurity.stats.suspended} note="Suspended accounts" color="warning" />
                  <StatCard icon="🚫" label="Blocked" value={accountSecurity.stats.blocked} note="Blocked accounts" color="error" />
                </div>

                <Panel title="User Accounts">
                  {accountSecurity.users.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="pb-3 font-bold">Name</th>
                            <th className="pb-3 font-bold">Email</th>
                            <th className="pb-3 font-bold">Role</th>
                            <th className="pb-3 font-bold">Status</th>
                            <th className="pb-3 font-bold">Security</th>
                            <th className="pb-3 font-bold">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {accountSecurity.users.map((user) => (
                            <tr key={user.id} className="hover:bg-muted-bg/50">
                              <td className="py-3 font-medium text-text">{user.name}</td>
                              <td className="py-3 text-muted">{user.email}</td>
                              <td className="py-3">
                                <span className="rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary capitalize">{user.role}</span>
                              </td>
                              <td className="py-3">
                                <span className={`rounded-md px-2 py-0.5 font-bold ${getStatusColor(user.status)}`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="py-3">
                                {user.hasSecurityActivity ? (
                                  <span className="rounded-md bg-warning/10 px-2 py-0.5 font-bold text-warning">Flagged</span>
                                ) : (
                                  <span className="text-muted">Clear</span>
                                )}
                              </td>
                              <td className="py-3 text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted">No users found</div>
                  )}
                </Panel>
              </>
            ) : (
              <EmptyState icon="👥" title="Account Data Unavailable" description="Unable to load account security data." />
            )}
          </div>
        )}

        {/* Sellers Tab */}
        {activeTab === "sellers" && (
          <div className="grid gap-6">
            {sellerSecurity ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon="🏪" label="Verified" value={sellerSecurity.stats.verified} note="Active sellers" color="success" />
                  <StatCard icon="⏳" label="Pending" value={sellerSecurity.stats.pending} note="Awaiting approval" color="warning" />
                  <StatCard icon="⏸️" label="Suspended" value={sellerSecurity.stats.suspended} note="Suspended sellers" color="error" />
                  <StatCard icon="⚠️" label="High Risk" value={sellerSecurity.stats.highRisk} note="Trust score < 40" color="warning" />
                </div>

                <Panel title="Seller Security Status">
                  {sellerSecurity.sellers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="pb-3 font-bold">Store</th>
                            <th className="pb-3 font-bold">Status</th>
                            <th className="pb-3 font-bold">Trust Score</th>
                            <th className="pb-3 font-bold">Rating</th>
                            <th className="pb-3 font-bold">Risk Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {sellerSecurity.sellers.map((seller) => (
                            <tr key={seller.id} className="hover:bg-muted-bg/50">
                              <td className="py-3 font-medium text-text">{seller.storeName}</td>
                              <td className="py-3">
                                <span className={`rounded-md px-2 py-0.5 font-bold ${getStatusColor(seller.status)}`}>
                                  {seller.status}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-16 rounded-full bg-muted-bg overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${seller.trustScore >= 70 ? "bg-success" : seller.trustScore >= 40 ? "bg-warning" : "bg-error"}`}
                                      style={{ width: `${seller.trustScore}%` }}
                                    />
                                  </div>
                                  <span className="font-bold text-text">{seller.trustScore}</span>
                                </div>
                              </td>
                              <td className="py-3 text-amber-500 font-bold">★ {seller.rating}</td>
                              <td className="py-3">
                                <span className={`rounded-md px-2 py-0.5 font-bold ${getSeverityColor(seller.riskLevel)}`}>
                                  {seller.riskLevel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted">No sellers found</div>
                  )}
                </Panel>
              </>
            ) : (
              <EmptyState icon="🏪" title="Seller Data Unavailable" description="Unable to load seller security data." />
            )}
          </div>
        )}

        {/* API Security Tab */}
        {activeTab === "api" && (
          <div className="grid gap-6">
            {apiSecurity ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon="🚫" label="Rate Limit Breaches" value={apiSecurity.rateLimitBreaches} note="API violations" color="error" />
                  <StatCard icon="🔓" label="Unauthorized" value={apiSecurity.unauthorizedAttempts} note="Unauthorized attempts" color="warning" />
                  <StatCard icon="🛡️" label="Blocked Requests" value={apiSecurity.blockedRequests} note="Total blocked" />
                  <StatCard icon="📊" label="Period" value={apiSecurity.range} note="Current range" />
                </div>

                <Panel title="API Security Timeline">
                  {apiSecurity.timeline.length > 0 ? (
                    <LineAreaChart
                      data={apiSecurity.timeline.map((t) => ({ label: t.label, value: t.blocked }))}
                      color="var(--color-error)"
                      height={200}
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted">No API security events</div>
                  )}
                </Panel>
              </>
            ) : (
              <EmptyState icon="🔒" title="API Security Data Unavailable" description="Unable to load API security data." />
            )}
          </div>
        )}

        {/* Incidents Tab */}
        {activeTab === "incidents" && (
          <div className="grid gap-6">
            {incidents ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <StatCard icon="📋" label="Total" value={incidents.stats.total} note="All incidents" />
                  <StatCard icon="🆕" label="Open" value={incidents.stats.open} note="New + Investigating" color="warning" />
                  <StatCard icon="🔍" label="Investigating" value={incidents.stats.investigating} note="In progress" />
                  <StatCard icon="✅" label="Resolved" value={incidents.stats.resolved} note="Resolved incidents" color="success" />
                  <StatCard icon="🔴" label="Critical" value={incidents.stats.critical} note="Critical priority" color="error" />
                </div>

                <Panel title="Security Incidents">
                  {incidents.incidents.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="pb-3 font-bold">ID</th>
                            <th className="pb-3 font-bold">Title</th>
                            <th className="pb-3 font-bold">Entity</th>
                            <th className="pb-3 font-bold">Severity</th>
                            <th className="pb-3 font-bold">Status</th>
                            <th className="pb-3 font-bold">Risk Score</th>
                            <th className="pb-3 font-bold">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {incidents.incidents.map((incident) => (
                            <tr key={incident.id} className="hover:bg-muted-bg/50">
                              <td className="py-3 font-mono text-muted">{incident.incidentCode}</td>
                              <td className="py-3 font-medium text-text max-w-[200px] truncate">{incident.title}</td>
                              <td className="py-3 text-muted capitalize">{incident.entityType}</td>
                              <td className="py-3">
                                <span className={`rounded-md px-2 py-0.5 font-bold ${getSeverityColor(incident.severity)}`}>
                                  {incident.severity}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`rounded-md px-2 py-0.5 font-bold ${getStatusColor(incident.status)}`}>
                                  {incident.status}
                                </span>
                              </td>
                              <td className="py-3 font-bold text-text">{incident.riskScore}</td>
                              <td className="py-3 text-muted">{new Date(incident.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted">No incidents found</div>
                  )}
                </Panel>
              </>
            ) : (
              <EmptyState icon="🚨" title="Incidents Data Unavailable" description="Unable to load security incidents." />
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="grid gap-6">
            {alerts ? (
              <>
                <div className="grid gap-4 sm:grid-cols-4">
                  <StatCard icon="🔴" label="Critical" value={alerts.bySeverity.critical} note="Critical alerts" color="error" />
                  <StatCard icon="🟠" label="High" value={alerts.bySeverity.high} note="High priority" color="warning" />
                  <StatCard icon="🟡" label="Medium" value={alerts.bySeverity.medium} note="Medium priority" />
                  <StatCard icon="🟢" label="Low" value={alerts.bySeverity.low} note="Low priority" color="success" />
                </div>

                <Panel title="Security Alerts">
                  {alerts.alerts.length > 0 ? (
                    <div className="grid gap-3">
                      {alerts.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`flex items-start gap-3 rounded-xl border p-4 ${
                            alert.severity === "critical" ? "border-error/20 bg-error/5" :
                            alert.severity === "high" ? "border-warning/20 bg-warning/5" :
                            alert.severity === "medium" ? "border-amber-500/20 bg-amber-500/5" :
                            "border-border bg-muted-bg/50"
                          }`}
                        >
                          <span className="text-lg">
                            {alert.severity === "critical" ? "🚨" : alert.severity === "high" ? "⚠️" : alert.severity === "medium" ? "⚡" : "ℹ️"}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-text">{alert.message}</p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                              <span className={`rounded-md px-2 py-0.5 font-bold ${getSeverityColor(alert.severity)}`}>
                                {alert.severity}
                              </span>
                              <span>{new Date(alert.timestamp).toLocaleString()}</span>
                              {alert.resolved && <span className="text-success">Resolved</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted">No active alerts</div>
                  )}
                </Panel>
              </>
            ) : (
              <EmptyState icon="🔔" title="Alerts Data Unavailable" description="Unable to load security alerts." />
            )}
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === "audit" && (
          <div className="grid gap-6">
            {auditLogs ? (
              <Panel title="Security Audit Log">
                {auditLogs.logs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted">
                          <th className="pb-3 font-bold">Timestamp</th>
                          <th className="pb-3 font-bold">Admin</th>
                          <th className="pb-3 font-bold">Action</th>
                          <th className="pb-3 font-bold">Resource</th>
                          <th className="pb-3 font-bold">Status</th>
                          <th className="pb-3 font-bold">IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {auditLogs.logs.map((log) => (
                          <tr key={log.id} className="hover:bg-muted-bg/50">
                            <td className="py-3 text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="py-3 font-medium text-text">{log.actorName}</td>
                            <td className="py-3 text-text">{log.action}</td>
                            <td className="py-3 text-muted">{log.resource}</td>
                            <td className="py-3">
                              <span className={`rounded-md px-2 py-0.5 font-bold ${
                                log.status === "success" ? "bg-success/10 text-success" :
                                log.status === "warning" ? "bg-warning/10 text-warning" :
                                "bg-error/10 text-error"
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-3 text-muted">{log.ip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center text-sm text-muted">No audit logs found</div>
                )}
              </Panel>
            ) : (
              <EmptyState icon="📋" title="Audit Log Unavailable" description="Unable to load audit logs." />
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid gap-6">
            {analytics ? (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  <Panel title="Failed Login Trend">
                    {analytics.failedLoginTrend.length > 0 ? (
                      <LineAreaChart
                        data={analytics.failedLoginTrend.map((d) => ({ label: d.date, value: d.count }))}
                        color="var(--color-error)"
                        height={200}
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center text-sm text-muted">No data</div>
                    )}
                  </Panel>

                  <Panel title="Security Incident Trend">
                    {analytics.incidentTrend.length > 0 ? (
                      <LineAreaChart
                        data={analytics.incidentTrend.map((d) => ({ label: d.date, value: d.count }))}
                        color="var(--color-warning)"
                        height={200}
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center text-sm text-muted">No data</div>
                    )}
                  </Panel>
                </div>

                <Panel title="Risk Distribution">
                  {analytics.riskDistribution.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <DonutChart
                        data={analytics.riskDistribution.map((r) => ({ label: r.severity, value: r.count }))}
                        size={200}
                      />
                      <div className="mt-4 grid w-full grid-cols-2 gap-2">
                        {analytics.riskDistribution.map((r) => (
                          <div key={r.severity} className="flex items-center justify-between rounded-xl bg-muted-bg p-3">
                            <span className="text-xs font-bold text-text capitalize">{r.severity}</span>
                            <span className="text-sm font-black text-primary">{r.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted">No data</div>
                  )}
                </Panel>
              </>
            ) : (
              <EmptyState icon="📊" title="Analytics Data Unavailable" description="Unable to load security analytics." />
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
