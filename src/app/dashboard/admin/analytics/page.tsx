"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel, StatCard, EmptyState } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getPlatformAnalytics, PlatformAnalyticsData } from "@/lib/api/admin-intelligence";
import { LineAreaChart } from "@/components/analytics/LineAreaChart";
import { BarChart } from "@/components/analytics/BarChart";
import { DonutChart } from "@/components/analytics/DonutChart";
import { formatCurrency } from "@/lib/utils";
import { FaGlobe, FaUsers, FaStore, FaShoppingBag, FaDollarSign } from "react-icons/fa";

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "3m" | "6m" | "1y">("30d");
  const [data, setData] = useState<PlatformAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = (selectedRange: string) => {
    setLoading(true);
    getPlatformAnalytics(selectedRange)
      .then(setData)
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData(range);
  }, [range]);

  const lineChartData = (data?.timeline || []).map((t) => ({
    label: t.label,
    value: t.revenue,
  }));

  const barChartData = (data?.timeline || []).map((t) => ({
    label: t.label,
    value: t.orders,
  }));

  const donutChartData = (data?.categoryPerformance || []).map((c) => ({
    label: c.category,
    value: c.revenue,
  }));

  const formatGrowth = (value: number | string) => {
    if (typeof value === "string") return value;
    return value >= 0 ? `+${value}%` : `${value}%`;
  };

  return (
    <DashboardShell
      role="Administrator"
      title="Macro Platform Growth & Commerce Analytics"
      subtitle="Nationwide marketplace GMV velocity, order trajectories, user and seller onboarding rates, and category distribution."
      links={adminDashboardLinks}
      showContinueShopping={false}
    >
      <div className="grid gap-6">
        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-muted">Platform Horizon:</span>
            <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-black text-primary">
              {range.toUpperCase()} Selected
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-muted-bg p-1 text-xs font-bold">
            {(["7d", "30d", "3m", "6m", "1y"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-1.5 transition ${
                  range === r ? "bg-primary text-white shadow-sm" : "text-muted hover:text-text"
                }`}
              >
                {r === "7d"
                  ? "7 Days"
                  : r === "30d"
                  ? "30 Days"
                  : r === "3m"
                  ? "3 Months"
                  : r === "6m"
                  ? "6 Months"
                  : "1 Year"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-surface">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="text-sm font-bold text-muted">Loading analytics...</span>
            </div>
          </div>
        ) : !data ? (
          <EmptyState
            icon="📊"
            title="No Analytics Data"
            description="Unable to load platform analytics. Please try again later."
          />
        ) : (
          <>
            {/* Macro KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon="🌐"
                label="Gross Merchandise Value"
                value={formatCurrency(data.kpis.totalRevenue)}
                note="Platform GMV total"
                trend={formatGrowth(data.kpis.revenueGrowth)}
              />
              <StatCard
                icon="👥"
                label="Total Active Shoppers"
                value={data.kpis.totalUsers.toLocaleString()}
                note="Registered customer accounts"
                trend={data.kpis.userGrowth}
              />
              <StatCard
                icon="🏪"
                label="Verified Active Sellers"
                value={data.kpis.totalSellers.toLocaleString()}
                note="Active merchant storefronts"
                trend={data.kpis.sellerGrowth}
              />
              <StatCard
                icon="📦"
                label="Marketplace Orders"
                value={data.kpis.totalOrders.toLocaleString()}
                note="Total processed checkouts"
                trend={data.kpis.orderGrowth}
              />
            </div>

            {/* Macro Growth Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel
                title="Marketplace GMV Progression"
                action={
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    National GMV (৳)
                  </span>
                }
              >
                <p className="mb-4 text-xs text-muted">
                  Aggregate transaction volume processed across all vendor storefronts.
                </p>
                {lineChartData.length > 0 ? (
                  <LineAreaChart
                    data={lineChartData}
                    color="var(--color-chart-1)"
                    height={260}
                  />
                ) : (
                  <EmptyState
                    icon="📈"
                    title="No Revenue Data"
                    description="No orders found in this time period."
                  />
                )}
              </Panel>

              <Panel
                title="Order Fulfillment Intake"
                action={
                  <span className="rounded-lg bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                    Order Volumes
                  </span>
                }
              >
                <p className="mb-4 text-xs text-muted">
                  Order count distribution across divisional fulfillment corridors.
                </p>
                {barChartData.length > 0 ? (
                  <BarChart
                    data={barChartData}
                    color="var(--color-chart-2)"
                    height={260}
                  />
                ) : (
                  <EmptyState
                    icon="📦"
                    title="No Order Data"
                    description="No orders found in this time period."
                  />
                )}
              </Panel>
            </div>

            {/* Category Distribution & Top Sellers Ranking */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <Panel title="Marketplace Category Share">
                  <div className="flex flex-col items-center">
                    {donutChartData.length > 0 ? (
                      <>
                        <DonutChart
                          data={donutChartData}
                          size={200}
                        />
                        <div className="mt-4 grid w-full gap-2 text-xs">
                          {data.categoryPerformance.map((cat) => (
                            <div key={cat.category} className="flex items-center justify-between rounded-xl bg-muted-bg p-2.5">
                              <span className="font-bold text-text">{cat.category}</span>
                              <span className="font-black text-primary">
                                {formatCurrency(cat.revenue)} ({cat.share}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <EmptyState
                        icon="🏷️"
                        title="No Category Data"
                        description="No categorized orders found."
                      />
                    )}
                  </div>
                </Panel>
              </div>

              <div className="lg:col-span-2">
                <Panel title="Top Verified Seller Rankings">
                  {data.topSellersRanking.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="pb-3 font-bold">Rank</th>
                            <th className="pb-3 font-bold">Merchant Name</th>
                            <th className="pb-3 font-bold">Processed GMV</th>
                            <th className="pb-3 font-bold">Orders</th>
                            <th className="pb-3 font-bold">Rating</th>
                            <th className="pb-3 font-bold">Return Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {data.topSellersRanking.map((sel) => (
                            <tr key={sel.rank} className="transition hover:bg-muted-bg/50">
                              <td className="py-3 font-black text-primary">#{sel.rank}</td>
                              <td className="py-3 font-extrabold text-text">{sel.name}</td>
                              <td className="py-3 font-black text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(sel.gmv)}
                              </td>
                              <td className="py-3 font-semibold text-text">{sel.orders.toLocaleString()}</td>
                              <td className="py-3 font-bold text-amber-500">★ {sel.rating}</td>
                              <td className="py-3 text-muted">{sel.returnRate}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      icon="🏪"
                      title="No Seller Data"
                      description="No seller rankings available for this period."
                    />
                  )}
                </Panel>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
