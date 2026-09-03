"use client";

import { useEffect, useState } from "react";
import {
  DashboardShell,
  Panel,
  StatCard,
} from "@/components/dashboard/DashboardUI";
import { EmptyState } from "@/components/dashboard/DashboardStates";
import {
  getPlatformAnalytics,
  PlatformAnalyticsData,
} from "@/lib/api/admin-intelligence";
import { LineAreaChart } from "@/components/analytics/LineAreaChart";
import { BarChart } from "@/components/analytics/BarChart";
import { DonutChart } from "@/components/analytics/DonutChart";
import { formatCurrency } from "@/lib/utils";

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

  const formatGrowth = (value: number | string) => {
    if (typeof value === "string") return value;

    return value >= 0 ? `+${value}%` : `${value}%`;
  };

  return (
    <DashboardShell
      role="Administrator"
      title="Macro Platform Growth & Commerce Analytics"
      subtitle="Nationwide marketplace GMV velocity, order trajectories, user and seller onboarding rates, and category distribution."
      showContinueShopping={false}
    >
      <div className="grid gap-6">
        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-muted">
              Platform Horizon:
            </span>

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
                  range === r
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-text"
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

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-border bg-surface p-5"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted-bg" />
                  <div className="h-4 w-24 rounded-lg bg-muted-bg" />
                </div>

                <div className="mb-2 h-8 w-32 rounded-lg bg-muted-bg" />
                <div className="h-3 w-20 rounded-lg bg-muted-bg" />
              </div>
            ))}
          </div>
        ) : !data ? (
          /* Empty State */
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
              {/* GMV Chart */}
              <Panel
                title="Marketplace GMV Progression"
                action={
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    National GMV (৳)
                  </span>
                }
              >
                <p className="mb-4 text-xs text-muted">
                  Aggregate transaction volume processed across all vendor
                  storefronts.
                </p>

                {lineChartData.length > 0 ? (
                  <LineAreaChart
                    data={lineChartData}
                    color="var(--color-chart-1)"
                    height={260}
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border">
                    <div className="text-center">
                      <span className="text-2xl">📈</span>
                      <p className="mt-2 text-xs text-muted">
                        No revenue data for this period
                      </p>
                    </div>
                  </div>
                )}
              </Panel>

              {/* Orders Chart */}
              <Panel
                title="Order Fulfillment Intake"
                action={
                  <span className="rounded-lg bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                    Order Volumes
                  </span>
                }
              >
                <p className="mb-4 text-xs text-muted">
                  Order volume trends across the selected time period.
                </p>

                {barChartData.length > 0 ? (
                  <BarChart
                    data={barChartData}
                    color="var(--color-chart-2)"
                    height={260}
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border">
                    <div className="text-center">
                      <span className="text-2xl">📦</span>
                      <p className="mt-2 text-xs text-muted">
                        No order data for this period
                      </p>
                    </div>
                  </div>
                )}
              </Panel>
            </div>

            {/* Category Distribution & Top Sellers Ranking */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Marketplace Category Share */}
              <div className="min-w-0 lg:col-span-1">
                <Panel title="Marketplace Category Share">
                  <div className="flex w-full min-w-0 flex-col items-center">
                    {data.categoryPerformance && data.categoryPerformance.length > 0 ? (
                      <>
                        {/* Responsive Donut Chart Container */}
                        <div className="relative flex w-full items-center justify-center py-2">
                          <DonutChart
                            data={data.categoryPerformance.map((c) => ({
                              label: c.category,
                              value: c.revenue,
                            }))}
                            size={180}
                          />
                        </div>

                        {/* Category List */}
                        <div className="mt-4 grid w-full min-w-0 gap-2 text-xs">
                          {data.categoryPerformance.map((cat, index) => {
                            const totalRevenue = data.categoryPerformance.reduce(
                              (sum, item) => sum + item.revenue,
                              0
                            );
                            const percentage =
                              totalRevenue > 0
                                ? ((cat.revenue / totalRevenue) * 100).toFixed(1)
                                : "0";

                            return (
                              <div
                                key={cat.category}
                                className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-muted-bg p-2.5"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{
                                      backgroundColor: `var(--color-chart-${Math.min(
                                        index + 1,
                                        5
                                      )})`,
                                    }}
                                  />
                                  <span className="truncate font-bold text-text">
                                    {cat.category}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] text-muted">
                                    ৳{cat.revenue.toLocaleString()}
                                  </span>
                                  <span className="shrink-0 font-black text-primary">
                                    {percentage}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex h-48 items-center justify-center">
                        <div className="text-center">
                          <span className="text-2xl">🏷️</span>
                          <p className="mt-2 text-xs text-muted">
                            No category data available
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Panel>
              </div>

              {/* Top Sellers Ranking */}
              <div className="min-w-0 lg:col-span-2">
                <Panel title="Top Verified Seller Rankings">
                  {data.topSellersRanking.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="pb-3 font-bold">Rank</th>
                            <th className="pb-3 font-bold">Merchant Name</th>
                            <th className="pb-3 font-bold">
                              Processed GMV
                            </th>
                            <th className="pb-3 font-bold">Orders</th>
                            <th className="pb-3 font-bold">Rating</th>
                            <th className="pb-3 font-bold">Return Rate</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-border/60">
                          {data.topSellersRanking.map((sel) => (
                            <tr
                              key={sel.rank}
                              className="transition hover:bg-muted-bg/50"
                            >
                              {/* Rank */}
                              <td className="py-3">
                                <span
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
                                    sel.rank === 1
                                      ? "bg-amber-500/20 text-amber-600"
                                      : sel.rank === 2
                                        ? "bg-gray-400/20 text-gray-500"
                                        : sel.rank === 3
                                          ? "bg-orange-500/20 text-orange-600"
                                          : "bg-muted-bg text-muted"
                                  }`}
                                >
                                  {sel.rank}
                                </span>
                              </td>

                              {/* Merchant Name */}
                              <td className="py-3 font-extrabold text-text">
                                {sel.name}
                              </td>

                              {/* GMV */}
                              <td className="py-3 font-black text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(sel.gmv)}
                              </td>

                              {/* Orders */}
                              <td className="py-3 font-semibold text-text">
                                {sel.orders.toLocaleString()}
                              </td>

                              {/* Rating */}
                              <td className="py-3 font-bold text-amber-500">
                                ★ {sel.rating}
                              </td>

                              {/* Return Rate */}
                              <td className="py-3">
                                <span
                                  className={`rounded-md px-2 py-0.5 font-bold ${
                                    sel.returnRate > 10
                                      ? "bg-error/10 text-error"
                                      : sel.returnRate > 5
                                        ? "bg-warning/10 text-warning"
                                        : "bg-success/10 text-success"
                                  }`}
                                >
                                  {sel.returnRate}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center">
                      <div className="text-center">
                        <span className="text-2xl">🏪</span>
                        <p className="mt-2 text-xs text-muted">
                          No seller rankings available
                        </p>
                      </div>
                    </div>
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