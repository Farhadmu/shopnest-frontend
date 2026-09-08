"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel, StatCard, EmptyState } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { BarChart } from "@/components/analytics/BarChart";
import { DonutChart } from "@/components/analytics/DonutChart";
import { formatCurrency } from "@/lib/utils";
import {
  getRiskMatrix,
  getSuspiciousOrders,
  getFinancialRisk,
  getFraudAlerts,
  getSellerRiskRanking,
  RiskMatrixData,
  SuspiciousOrdersData,
  FinancialRiskData,
  FraudAlertsData,
  SellerRiskData,
} from "@/lib/api/admin-intelligence";

type TabType = "overview" | "alerts" | "orders" | "sellers" | "financial";

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "🛡️" },
  { id: "alerts", label: "Fraud Alerts", icon: "🚨" },
  { id: "orders", label: "Suspicious Orders", icon: "📦" },
  { id: "sellers", label: "Seller Risk", icon: "🏪" },
  { id: "financial", label: "Financial Risk", icon: "💰" },
];

export default function RiskFraudPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [riskMatrix, setRiskMatrix] = useState<RiskMatrixData | null>(null);
  const [suspiciousOrders, setSuspiciousOrders] = useState<SuspiciousOrdersData | null>(null);
  const [financialRisk, setFinancialRisk] = useState<FinancialRiskData | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlertsData | null>(null);
  const [sellerRisk, setSellerRisk] = useState<SellerRiskData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRiskMatrix = useCallback(async (r: string) => {
    try {
      const data = await getRiskMatrix(r);
      setRiskMatrix(data);
    } catch {
      setRiskMatrix(null);
    }
  }, []);

  const loadSuspiciousOrders = useCallback(async (r: string) => {
    try {
      const data = await getSuspiciousOrders({ range: r, limit: 50 });
      setSuspiciousOrders(data);
    } catch {
      setSuspiciousOrders(null);
    }
  }, []);

  const loadFinancialRisk = useCallback(async () => {
    try {
      const data = await getFinancialRisk();
      setFinancialRisk(data);
    } catch {
      setFinancialRisk(null);
    }
  }, []);

  const loadFraudAlerts = useCallback(async (r: string) => {
    try {
      const data = await getFraudAlerts(r);
      setFraudAlerts(data);
    } catch {
      setFraudAlerts(null);
    }
  }, []);

  const loadSellerRisk = useCallback(async () => {
    try {
      const data = await getSellerRiskRanking();
      setSellerRisk(data);
    } catch {
      setSellerRisk(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadRiskMatrix(range).finally(() => setLoading(false));
    loadFraudAlerts(range);
  }, [range, loadRiskMatrix, loadFraudAlerts]);

  useEffect(() => {
    if (activeTab === "orders") loadSuspiciousOrders(range);
    if (activeTab === "financial") loadFinancialRisk();
    if (activeTab === "sellers") loadSellerRisk();
  }, [activeTab, range, loadSuspiciousOrders, loadFinancialRisk, loadSellerRisk]);

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "critical": return "bg-error/10 text-error";
      case "high": return "bg-warning/10 text-warning";
      case "medium": return "bg-amber-500/10 text-amber-500";
      case "low": return "bg-success/10 text-success";
      default: return "bg-muted-bg text-muted";
    }
  };

  const getRiskLevelBadge = (level: string) => {
    const color = getRiskLevelColor(level);
    return <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${color}`}>{level}</span>;
  };

  const totalRiskEvents = riskMatrix?.events?.length || 0;
  const highRiskOrders = suspiciousOrders?.orders?.length || 0;
  const highRiskSellers = sellerRisk?.allSellers?.filter((s) => s.riskLevel === "high" || s.riskLevel === "critical").length || 0;
  const suspiciousUsers = fraudAlerts?.alerts?.filter((a) => a.type === "Suspicious User").length || 0;
  const fraudAlertsCount = fraudAlerts?.total || 0;
  const financialExposure = financialRisk?.potentialExposure || 0;

  return (
    <DashboardShell
      role="Administrator"
      title="Risk & Fraud Center"
      subtitle="Monitor suspicious activity, seller risk, transaction anomalies and platform fraud signals."
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-5">
                    <div className="h-4 w-24 rounded-lg bg-muted-bg mb-3" />
                    <div className="h-8 w-16 rounded-lg bg-muted-bg" />
                  </div>
                ))}
              </div>
            ) : riskMatrix ? (
              <>
                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard
                    icon="⚠️"
                    label="Total Risk Events"
                    value={totalRiskEvents}
                    note="Detected risk events"
                    color={totalRiskEvents > 10 ? "warning" : "default"}
                  />
                  <StatCard
                    icon="📦"
                    label="High Risk Orders"
                    value={highRiskOrders}
                    note="Suspicious orders detected"
                    color={highRiskOrders > 5 ? "warning" : "success"}
                  />
                  <StatCard
                    icon="🏪"
                    label="High Risk Sellers"
                    value={highRiskSellers}
                    note="Sellers with elevated risk"
                    color={highRiskSellers > 0 ? "warning" : "success"}
                  />
                  <StatCard
                    icon="👤"
                    label="Suspicious Users"
                    value={suspiciousUsers}
                    note="Users flagged for review"
                    color={suspiciousUsers > 0 ? "warning" : "success"}
                  />
                  <StatCard
                    icon="🚨"
                    label="Fraud Alerts"
                    value={fraudAlertsCount}
                    note="Active fraud alerts"
                    color={fraudAlertsCount > 5 ? "error" : "default"}
                  />
                  <StatCard
                    icon="💰"
                    label="Financial Exposure"
                    value={formatCurrency(financialExposure)}
                    note="Potential risk exposure"
                    color={financialExposure > 100000 ? "error" : "default"}
                  />
                </div>

                {/* Risk Score & Distribution */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <Panel title="Platform Risk Score">
                    <div className="flex flex-col items-center py-4">
                      <GaugeMeter
                        score={riskMatrix.overallPlatformRiskScore}
                        title="Risk Score"
                        type={riskMatrix.overallPlatformRiskScore >= 50 ? "risk" : "health"}
                        size={180}
                      />
                      <p className="mt-3 text-sm font-bold text-text">{riskMatrix.overallRiskLevel} RISK</p>
                    </div>
                  </Panel>

                  <Panel title="Risk Distribution">
                    {riskMatrix.riskDistribution && (riskMatrix.riskDistribution.critical + riskMatrix.riskDistribution.high + riskMatrix.riskDistribution.medium + riskMatrix.riskDistribution.low) > 0 ? (
                      <div className="flex flex-col items-center">
                        <DonutChart
                          data={[
                            { label: "Critical", value: riskMatrix.riskDistribution.critical },
                            { label: "High", value: riskMatrix.riskDistribution.high },
                            { label: "Medium", value: riskMatrix.riskDistribution.medium },
                            { label: "Low", value: riskMatrix.riskDistribution.low },
                          ].filter((d) => d.value > 0)}
                          size={180}
                        />
                        <div className="mt-4 grid w-full grid-cols-2 gap-2">
                          {Object.entries(riskMatrix.riskDistribution).map(([level, count]) => (
                            <div key={level} className="flex items-center justify-between rounded-xl bg-muted-bg p-2.5">
                              <span className="text-xs font-bold text-text capitalize">{level}</span>
                              <span className="text-sm font-black text-primary">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-40 items-center justify-center text-sm text-muted">No risk events detected</div>
                    )}
                  </Panel>
                </div>

                {/* Rule Metrics */}
                <Panel title="Rule Engine Metrics">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border border-border p-4">
                      <p className="text-xs text-muted font-bold">Failed Logins</p>
                      <p className="mt-1 text-2xl font-black text-text">{riskMatrix.ruleMetrics.failedLoginDetections}</p>
                    </div>
                    <div className="rounded-xl border border-border p-4">
                      <p className="text-xs text-muted font-bold">Order Frequency</p>
                      <p className="mt-1 text-2xl font-black text-text">{riskMatrix.ruleMetrics.unusualOrderFrequency}</p>
                    </div>
                    <div className="rounded-xl border border-border p-4">
                      <p className="text-xs text-muted font-bold">Abnormal Values</p>
                      <p className="mt-1 text-2xl font-black text-text">{riskMatrix.ruleMetrics.abnormalBasketValues}</p>
                    </div>
                    <div className="rounded-xl border border-border p-4">
                      <p className="text-xs text-muted font-bold">Coupon Abuse</p>
                      <p className="mt-1 text-2xl font-black text-text">{riskMatrix.ruleMetrics.couponAbuseAttempts}</p>
                    </div>
                    <div className="rounded-xl border border-border p-4">
                      <p className="text-xs text-muted font-bold">Refund Anomalies</p>
                      <p className="mt-1 text-2xl font-black text-text">{riskMatrix.ruleMetrics.suspiciousRefundBehaviors}</p>
                    </div>
                  </div>
                </Panel>

                {/* Recent Events */}
                <Panel title="Recent Risk Events">
                  {riskMatrix.events.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="pb-3 font-bold">Event</th>
                            <th className="pb-3 font-bold">User</th>
                            <th className="pb-3 font-bold">Risk Score</th>
                            <th className="pb-3 font-bold">Level</th>
                            <th className="pb-3 font-bold">Status</th>
                            <th className="pb-3 font-bold">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {riskMatrix.events.slice(0, 10).map((event) => (
                            <tr key={event.id} className="hover:bg-muted-bg/50">
                              <td className="py-3 font-medium text-text max-w-[200px] truncate">{event.event}</td>
                              <td className="py-3 text-muted">{event.user}</td>
                              <td className="py-3 font-bold text-text">{event.riskScore}</td>
                              <td className="py-3">{getRiskLevelBadge(event.riskLevel)}</td>
                              <td className="py-3">
                                <span className="rounded-md bg-muted-bg px-2 py-0.5 font-bold text-muted">{event.status}</span>
                              </td>
                              <td className="py-3 text-muted">{new Date(event.timestamp).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted">No risk events detected</div>
                  )}
                </Panel>

                {/* Disclaimer */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <span className="font-bold">Disclaimer:</span> {riskMatrix.disclaimer}
                  </p>
                </div>
              </>
            ) : (
              <EmptyState icon="🛡️" title="Risk Data Unavailable" description="Unable to load risk matrix data. Please try again." />
            )}
          </div>
        )}

        {/* Fraud Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="grid gap-6">
            {fraudAlerts ? (
              <>
                <div className="grid gap-4 sm:grid-cols-4">
                  <StatCard icon="🔴" label="Critical" value={fraudAlerts.byRiskLevel.critical} note="Critical alerts" color="error" />
                  <StatCard icon="🟠" label="High" value={fraudAlerts.byRiskLevel.high} note="High priority" color="warning" />
                  <StatCard icon="🟡" label="Medium" value={fraudAlerts.byRiskLevel.medium} note="Medium priority" />
                  <StatCard icon="🟢" label="Low" value={fraudAlerts.byRiskLevel.low} note="Low priority" color="success" />
                </div>

                <Panel title="Fraud Alerts">
                  {fraudAlerts.alerts.length > 0 ? (
                    <div className="grid gap-3">
                      {fraudAlerts.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4 ${
                            alert.riskLevel === "critical" ? "border-error/20 bg-error/5" :
                            alert.riskLevel === "high" ? "border-warning/20 bg-warning/5" :
                            "border-border bg-muted-bg/50"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-text">{alert.type}</span>
                              {getRiskLevelBadge(alert.riskLevel)}
                            </div>
                            <p className="text-xs text-muted">{alert.entityName} — {alert.reason}</p>
                            <p className="text-xs text-muted mt-1">{new Date(alert.detectedAt).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text">Score: {alert.riskScore}</span>
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${alert.status === "resolved" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                              {alert.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted">No fraud alerts detected</div>
                  )}
                </Panel>
              </>
            ) : (
              <EmptyState icon="🚨" title="Fraud Alerts Unavailable" description="Unable to load fraud alerts." />
            )}
          </div>
        )}

        {/* Suspicious Orders Tab */}
        {activeTab === "orders" && (
          <div className="grid gap-6">
            {suspiciousOrders ? (
              <>
                <StatCard icon="📦" label="Suspicious Orders" value={suspiciousOrders.pagination.total} note="Orders flagged by risk engine" />

                <Panel title="Suspicious Orders">
                  {suspiciousOrders.orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="pb-3 font-bold">Order ID</th>
                            <th className="pb-3 font-bold">Amount</th>
                            <th className="pb-3 font-bold">Payment</th>
                            <th className="pb-3 font-bold">Status</th>
                            <th className="pb-3 font-bold">Risk Score</th>
                            <th className="pb-3 font-bold">Risk Level</th>
                            <th className="pb-3 font-bold">Reasons</th>
                            <th className="pb-3 font-bold">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {suspiciousOrders.orders.map((order) => (
                            <tr key={order.orderId} className="hover:bg-muted-bg/50">
                              <td className="py-3 font-mono text-muted">{order.orderId?.substring(0, 8)}...</td>
                              <td className="py-3 font-bold text-text">{formatCurrency(order.totalAmount)}</td>
                              <td className="py-3">
                                <span className={`rounded-md px-2 py-0.5 font-bold ${
                                  order.paymentStatus === "paid" ? "bg-success/10 text-success" :
                                  order.paymentStatus === "refunded" ? "bg-error/10 text-error" :
                                  "bg-warning/10 text-warning"
                                }`}>
                                  {order.paymentStatus}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className="rounded-md bg-muted-bg px-2 py-0.5 font-bold text-muted">{order.status}</span>
                              </td>
                              <td className="py-3 font-bold text-text">{order.riskScore}</td>
                              <td className="py-3">{getRiskLevelBadge(order.riskLevel)}</td>
                              <td className="py-3 text-muted max-w-[200px]">
                                <ul className="list-disc list-inside">
                                  {order.reasons.slice(0, 2).map((r, i) => (
                                    <li key={i} className="truncate">{r}</li>
                                  ))}
                                </ul>
                              </td>
                              <td className="py-3 text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted">No suspicious orders detected</div>
                  )}
                </Panel>
              </>
            ) : (
              <EmptyState icon="📦" title="Suspicious Orders Unavailable" description="Unable to load suspicious orders." />
            )}
          </div>
        )}

        {/* Seller Risk Tab */}
        {activeTab === "sellers" && (
          <div className="grid gap-6">
            {sellerRisk ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon="🏪" label="Total Sellers" value={sellerRisk.totalSellers} note="All sellers" />
                  <StatCard icon="🟢" label="Low Risk" value={sellerRisk.riskDistribution.low.count} note={`${sellerRisk.riskDistribution.low.percentage}%`} color="success" />
                  <StatCard icon="🟡" label="Medium Risk" value={sellerRisk.riskDistribution.medium.count} note={`${sellerRisk.riskDistribution.medium.percentage}%`} />
                  <StatCard icon="🔴" label="High/Critical" value={sellerRisk.riskDistribution.high.count + sellerRisk.riskDistribution.critical.count} note={`${sellerRisk.riskDistribution.high.percentage + sellerRisk.riskDistribution.critical.percentage}%`} color="error" />
                </div>

                <Panel title="Seller Risk Rankings">
                  {sellerRisk.allSellers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="pb-3 font-bold">Seller</th>
                            <th className="pb-3 font-bold">Store</th>
                            <th className="pb-3 font-bold">Risk Score</th>
                            <th className="pb-3 font-bold">Risk Level</th>
                            <th className="pb-3 font-bold">Orders</th>
                            <th className="pb-3 font-bold">Cancellation</th>
                            <th className="pb-3 font-bold">Return Rate</th>
                            <th className="pb-3 font-bold">Rating</th>
                            <th className="pb-3 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {sellerRisk.allSellers.map((seller) => (
                            <tr key={seller.sellerId} className="hover:bg-muted-bg/50">
                              <td className="py-3 font-medium text-text">{seller.storeName}</td>
                              <td className="py-3 text-muted">{seller.storeName}</td>
                              <td className="py-3 font-bold text-text">{seller.riskScore}</td>
                              <td className="py-3">{getRiskLevelBadge(seller.riskLevel)}</td>
                              <td className="py-3 text-text">{seller.totalOrders}</td>
                              <td className="py-3">
                                <span className={`font-bold ${seller.cancellationRate > 20 ? "text-error" : seller.cancellationRate > 10 ? "text-warning" : "text-success"}`}>
                                  {seller.cancellationRate}%
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`font-bold ${seller.returnRate > 15 ? "text-error" : seller.returnRate > 8 ? "text-warning" : "text-success"}`}>
                                  {seller.returnRate}%
                                </span>
                              </td>
                              <td className="py-3 text-amber-500 font-bold">★ {seller.rating}</td>
                              <td className="py-3">
                                <span className={`rounded-md px-2 py-0.5 font-bold ${getRiskLevelColor(seller.status)}`}>
                                  {seller.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted">No seller risk data available</div>
                  )}
                </Panel>
              </>
            ) : (
              <EmptyState icon="🏪" title="Seller Risk Unavailable" description="Unable to load seller risk data." />
            )}
          </div>
        )}

        {/* Financial Risk Tab */}
        {activeTab === "financial" && (
          <div className="grid gap-6">
            {financialRisk ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard icon="💰" label="Total Transactions" value={formatCurrency(financialRisk.totalTransactionValue)} note="30-day period" />
                  <StatCard icon="⚠️" label="Potential Exposure" value={formatCurrency(financialRisk.potentialExposure)} note={`${financialRisk.exposurePercentage}% of total`} color={financialRisk.exposurePercentage > 20 ? "error" : "warning"} />
                  <StatCard icon="📊" label="Exposure Rate" value={`${financialRisk.exposurePercentage}%`} note="Risk percentage" color={financialRisk.exposurePercentage > 20 ? "error" : "success"} />
                </div>

                <Panel title="Financial Risk Breakdown">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-error/10 text-lg">❌</span>
                        <div>
                          <p className="text-xs text-muted font-bold">Cancelled Orders</p>
                          <p className="text-xl font-black text-text">{formatCurrency(financialRisk.cancelledOrderValue)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted">Value of cancelled orders in last 30 days</p>
                    </div>

                    <div className="rounded-xl border border-border p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-warning/10 text-lg">💸</span>
                        <div>
                          <p className="text-xs text-muted font-bold">Refunded Amount</p>
                          <p className="text-xl font-black text-text">{formatCurrency(financialRisk.refundedAmount)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted">Total refunded amount in last 30 days</p>
                    </div>

                    <div className="rounded-xl border border-border p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-lg">🔄</span>
                        <div>
                          <p className="text-xs text-muted font-bold">Returned Orders</p>
                          <p className="text-xl font-black text-text">{formatCurrency(financialRisk.returnedOrderValue)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted">Value of returned orders in last 30 days</p>
                    </div>
                  </div>
                </Panel>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <span className="font-bold">Note:</span> Cancelled and refunded orders are risk indicators, not confirmed fraud. These metrics help identify potential areas requiring review.
                  </p>
                </div>
              </>
            ) : (
              <EmptyState icon="💰" title="Financial Risk Unavailable" description="Unable to load financial risk data." />
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
