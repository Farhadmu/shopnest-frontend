"use client";

import { useEffect, useState } from "react";
import {
  DashboardShell,
  Panel,
  StatCard,
  EmptyState,
} from "@/components/dashboard/DashboardUI";

import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";

import {
  getPlatformAnalytics,
  PlatformAnalyticsData,
} from "@/lib/api/admin-intelligence";

import { LineAreaChart } from "@/components/analytics/LineAreaChart";
import { BarChart } from "@/components/analytics/BarChart";
import { DonutChart } from "@/components/analytics/DonutChart";

import { formatCurrency } from "@/lib/utils";

type AnalyticsRange = "7d" | "30d" | "3m" | "6m" | "1y";

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [data, setData] = useState<PlatformAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // RANGE CHANGE
  // =========================================================

  const handleRangeChange = (selectedRange: AnalyticsRange) => {
    if (selectedRange === range) return;

    setLoading(true);
    setData(null);
    setRange(selectedRange);
  };

  // =========================================================
  // LOAD ANALYTICS DATA
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchAnalytics = async () => {
      try {
        const result = await getPlatformAnalytics(range);

        if (!cancelled) {
          setData(result);
        }
      } catch {
        if (!cancelled) {
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, [range]);

  // =========================================================
  // CHART DATA
  // =========================================================

  const lineChartData = (data?.timeline || []).map((item) => ({
    label: item.label,
    value: item.revenue,
  }));

  const barChartData = (data?.timeline || []).map((item) => ({
    label: item.label,
    value: item.orders,
  }));

  // =========================================================
  // GROWTH FORMATTER
  // =========================================================

  const formatGrowth = (value: number | string) => {
    if (typeof value === "string") {
      return value;
    }

    return value >= 0 ? `+${value}%` : `${value}%`;
  };

  // =========================================================
  // CATEGORY DATA
  // =========================================================

  const categoryData = data?.categoryPerformance || [];

  const totalCategoryRevenue = categoryData.reduce(
    (sum, category) => sum + Number(category.revenue || 0),
    0
  );

  /*
   * IMPORTANT:
   *
   * DonutChart should receive percentage values,
   * not raw revenue values.
   *
   * Example:
   *
   * cycle    = 19898
   * Beauty   = 10000
   * Mobile   = 6000
   *
   * Total = 42498
   *
   * cycle percentage =
   * 19898 / 42498 * 100 = 46.8%
   */

  const donutChartData = categoryData.map((category) => {
    const revenue = Number(category.revenue || 0);

    const percentage =
      totalCategoryRevenue > 0
        ? (revenue / totalCategoryRevenue) * 100
        : 0;

    return {
      label: category.category,
      value: Number(percentage.toFixed(2)),
    };
  });

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <DashboardShell
      role="Administrator"
      title="Macro Platform Growth & Commerce Analytics"
      subtitle="Nationwide marketplace GMV velocity, order trajectories, user and seller onboarding rates, and category distribution."
      links={adminDashboardLinks}
      showContinueShopping={false}
    >
      <div className="grid gap-6">
        {/* =====================================================
            DATE FILTER BAR
        ===================================================== */}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4">
          {/* Platform Horizon */}

          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-muted">
              Platform Horizon:
            </span>

            <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-black text-primary">
              {range.toUpperCase()} Selected
            </span>
          </div>

          {/* Range Buttons */}

          <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-muted-bg p-1 text-xs font-bold">
            {(["7d", "30d", "3m", "6m", "1y"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleRangeChange(item)}
                disabled={loading && item === range}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 transition ${
                  range === item
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-text"
                } ${
                  loading && item === range
                    ? "cursor-wait opacity-80"
                    : ""
                }`}
              >
                {item === "7d"
                  ? "7 Days"
                  : item === "30d"
                    ? "30 Days"
                    : item === "3m"
                      ? "3 Months"
                      : item === "6m"
                        ? "6 Months"
                        : "1 Year"}
              </button>
            ))}
          </div>
        </div>

        {/* =====================================================
            LOADING STATE
        ===================================================== */}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
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
          /* =====================================================
             EMPTY STATE
          ===================================================== */

          <EmptyState
            icon="📊"
            title="No Analytics Data"
            description="Unable to load platform analytics. Please try again later."
          />
        ) : (
          <>
            {/* =================================================
                MACRO KPI CARDS
            ================================================= */}

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

            {/* =================================================
                MACRO GROWTH CHARTS
            ================================================= */}

            <div className="grid gap-6 lg:grid-cols-2">
              {/* =================================================
                  GMV CHART
              ================================================= */}

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
                  <div className="w-full min-w-0 overflow-hidden">
                    <LineAreaChart
                      data={lineChartData}
                      color="var(--color-chart-1)"
                      height={260}
                    />
                  </div>
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

              {/* =================================================
                  ORDERS CHART
              ================================================= */}

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
                  <div className="w-full min-w-0 overflow-hidden">
                    <BarChart
                      data={barChartData}
                      color="var(--color-chart-2)"
                      height={260}
                    />
                  </div>
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

            {/* =================================================
                CATEGORY + SELLERS
            ================================================= */}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* =================================================
                  MARKETPLACE CATEGORY SHARE
              ================================================= */}

              <div className="min-w-0 lg:col-span-1">
                <Panel title="Marketplace Category Share">
                  <div className="flex w-full min-w-0 flex-col">
                    {categoryData.length > 0 ? (
                      <>
                        {/* ========================================
                            DONUT CHART
                        ======================================== */}

                        <div className="flex w-full items-center justify-center overflow-hidden py-3">
                          <div className="max-w-full">
                            <DonutChart
                              data={donutChartData}
                              size={180}
                            />
                          </div>
                        </div>

                        {/* ========================================
                            CATEGORY LIST
                        ======================================== */}

                        <div className="mt-4 grid w-full min-w-0 gap-2 text-xs">
                          {categoryData.map((category, index) => {
                            const revenue = Number(category.revenue || 0);

                            const percentage =
                              totalCategoryRevenue > 0
                                ? (revenue / totalCategoryRevenue) * 100
                                : 0;

                            return (
                              <div
                                key={category.category}
                                className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-muted-bg p-2.5"
                              >
                                {/* Category Name */}

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
                                    {category.category}
                                  </span>
                                </div>

                                {/* Revenue + Percentage */}

                                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                                  <span className="text-[11px] text-muted">
                                    {formatCurrency(revenue)}
                                  </span>

                                  <span className="min-w-10.5 text-right text-[11px] font-black text-primary">
                                    {percentage.toFixed(1)}%
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

              {/* =================================================
                  TOP SELLERS RANKING
              ================================================= */}

              <div className="min-w-0 lg:col-span-2">
                <Panel title="Top Verified Seller Rankings">
                  {data.topSellersRanking.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-162.5 text-left text-xs">
                        {/* ======================================
                            TABLE HEADER
                        ====================================== */}

                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="pb-3 font-bold">Rank</th>

                            <th className="pb-3 font-bold">
                              Merchant Name
                            </th>

                            <th className="pb-3 font-bold">
                              Processed GMV
                            </th>

                            <th className="pb-3 font-bold">Orders</th>

                            <th className="pb-3 font-bold">Rating</th>

                            <th className="pb-3 font-bold">
                              Return Rate
                            </th>
                          </tr>
                        </thead>

                        {/* ======================================
                            TABLE BODY
                        ====================================== */}

                        <tbody className="divide-y divide-border/60">
                          {data.topSellersRanking.map((seller) => (
                            <tr
                              key={`${seller.rank}-${seller.name}`}
                              className="transition hover:bg-muted-bg/50"
                            >
                              {/* Rank */}

                              <td className="py-3">
                                <span
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
                                    seller.rank === 1
                                      ? "bg-amber-500/20 text-amber-600"
                                      : seller.rank === 2
                                        ? "bg-gray-400/20 text-gray-500"
                                        : seller.rank === 3
                                          ? "bg-orange-500/20 text-orange-600"
                                          : "bg-muted-bg text-muted"
                                  }`}
                                >
                                  {seller.rank}
                                </span>
                              </td>

                              {/* Merchant Name */}

                              <td className="max-w-55 py-3 font-extrabold text-text">
                                <span className="block truncate">
                                  {seller.name}
                                </span>
                              </td>

                              {/* GMV */}

                              <td className="whitespace-nowrap py-3 font-black text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(seller.gmv)}
                              </td>

                              {/* Orders */}

                              <td className="whitespace-nowrap py-3 font-semibold text-text">
                                {seller.orders.toLocaleString()}
                              </td>

                              {/* Rating */}

                              <td className="whitespace-nowrap py-3 font-bold text-amber-500">
                                ★ {seller.rating}
                              </td>

                              {/* Return Rate */}

                              <td className="whitespace-nowrap py-3">
                                <span
                                  className={`rounded-md px-2 py-0.5 font-bold ${
                                    seller.returnRate > 10
                                      ? "bg-error/10 text-error"
                                      : seller.returnRate > 5
                                        ? "bg-warning/10 text-warning"
                                        : "bg-success/10 text-success"
                                  }`}
                                >
                                  {seller.returnRate}%
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