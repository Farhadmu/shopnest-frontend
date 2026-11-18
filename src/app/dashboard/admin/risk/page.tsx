"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel, StatCard, EmptyState } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import { formatCurrency } from "@/lib/utils";
import {
  getSuspiciousOrders,
  getSellerRiskRanking,
  SuspiciousOrdersData,
  SellerRiskData,
} from "@/lib/api/admin-intelligence";
import { CustomerFraudRadar } from "@/components/admin/CustomerFraudRadar";

type TabType = "customers" | "orders" | "sellers";

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: "customers", label: "Fraud Customers", icon: "👤" },
  { id: "orders", label: "Suspicious Orders", icon: "📦" },
  { id: "sellers", label: "Seller Risk", icon: "🏪" },
];

export default function RiskFraudPage() {
  const [activeTab, setActiveTab] = useState<TabType>("customers");
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [suspiciousOrders, setSuspiciousOrders] = useState<SuspiciousOrdersData | null>(null);
  const [sellerRisk, setSellerRisk] = useState<SellerRiskData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tabId: TabType) => {
    if (tabId === activeTab) return;
    if (tabId !== "customers") setLoading(true);
    setActiveTab(tabId);
  };

  const handleRangeChange = (newRange: "7d" | "30d" | "90d") => {
    if (newRange === range) return;
    setLoading(true);
    setRange(newRange);
  };

  useEffect(() => {
    let isMounted = true;

    if (activeTab === "orders") {
      getSuspiciousOrders({ range, limit: 50 })
        .then((data) => {
          if (isMounted) setSuspiciousOrders(data);
        })
        .catch(() => {
          if (isMounted) setSuspiciousOrders(null);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else if (activeTab === "sellers") {
      getSellerRiskRanking()
        .then((data) => {
          if (isMounted) setSellerRisk(data);
        })
        .catch(() => {
          if (isMounted) setSellerRisk(null);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab, range]);

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

  return (
    <DashboardShell
      role="Administrator"
      title="Risk & Fraud Center"
      subtitle="Monitor suspicious activity, seller risk, transaction anomalies and customer fraud signals."
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
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:bg-muted-bg hover:text-text"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Customer Fraud Radar Tab */}
        {activeTab === "customers" && <CustomerFraudRadar />}

        {/* Suspicious Orders Tab */}
        {activeTab === "orders" && (
          <div className="grid gap-6">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-muted">Filter Horizon:</span>
              <div className="flex items-center gap-1 rounded-xl bg-muted-bg p-1 text-xs font-bold">
                {(["7d", "30d", "90d"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRangeChange(r)}
                    className={`rounded-lg px-3 py-1 transition ${range === r ? "bg-primary text-white shadow-sm" : "text-muted hover:text-text"}`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-48 animate-pulse rounded-2xl border border-border bg-surface" />
            ) : suspiciousOrders ? (
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
            {loading ? (
              <div className="h-48 animate-pulse rounded-2xl border border-border bg-surface" />
            ) : sellerRisk ? (
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
      </div>
    </DashboardShell>
  );
}
