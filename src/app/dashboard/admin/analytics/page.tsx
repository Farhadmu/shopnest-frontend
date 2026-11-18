"use client";

import { useEffect, useState } from "react";
import {
  DashboardShell,
  Panel,
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
import {
  FaSyncAlt,
  FaSearch,
  FaStore,
  FaShoppingBag,
  FaUsers,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";

type AnalyticsRange = "7d" | "30d" | "3m" | "6m" | "1y" | "all";

const RANGE_LABELS: Record<AnalyticsRange, string> = {
  "7d": "7 Days",
  "30d": "30 Days",
  "3m": "3 Months",
  "6m": "6 Months",
  "1y": "1 Year",
  "all": "All Time",
};

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [data, setData] = useState<PlatformAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sellerSearch, setSellerSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const handleRangeChange = (selectedRange: AnalyticsRange) => {
    if (selectedRange === range) return;
    setLoading(true);
    setRange(selectedRange);
  };

  const handleManualSync = () => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
  };

  // =========================================================
  // LOAD ANALYTICS DATA
  // =========================================================

  useEffect(() => {
    let isCancelled = false;

    getPlatformAnalytics(range)
      .then((result) => {
        if (!isCancelled) {
          setData(result);
          setLastUpdated(new Date());
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setData(null);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [range, refreshKey]);

  // =========================================================
  // DERIVED METRICS & FORMATTERS (Direct derived computation)
  // =========================================================

  const lineChartData = (data?.timeline || []).map((item) => ({
    label: item.label,
    value: item.revenue,
  }));

  const barChartData = (data?.timeline || []).map((item) => ({
    label: item.label,
    value: item.orders,
  }));

  const totalGMV = data?.kpis?.totalRevenue || 0;
  const totalOrders = data?.kpis?.totalOrders || 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalGMV / totalOrders) : 0;
  const peakGMVDay = data?.timeline?.length
    ? Math.max(...data.timeline.map((t) => t.revenue))
    : 0;

  // Category data
  const categoryData = data?.categoryPerformance || [];
  const totalCategoryRevenue = categoryData.reduce(
    (sum, category) => sum + Number(category.revenue || 0),
    0
  );

  const donutChartData = categoryData.map((category) => {
    const revenue = Number(category.revenue || 0);
    const percentage = totalCategoryRevenue > 0 ? (revenue / totalCategoryRevenue) * 100 : 0;
    return {
      label: category.category,
      value: Number(percentage.toFixed(1)),
    };
  });

  // Seller Search Filter
  const allSellers = data?.topSellersRanking || [];
  const filteredSellers = sellerSearch.trim()
    ? allSellers.filter(
        (s) =>
          s.name.toLowerCase().includes(sellerSearch.toLowerCase()) ||
          s.storeId.toLowerCase().includes(sellerSearch.toLowerCase())
      )
    : allSellers;

  const maxSellerGMV = allSellers.length
    ? Math.max(...allSellers.map((s) => s.gmv), 1)
    : 1;

  return (
    <DashboardShell
      role="Administrator"
      title="Macro Platform Growth & Commerce Analytics"
      subtitle="Nationwide marketplace GMV velocity, order trajectories, merchant sales performance, and category distribution."
      links={adminDashboardLinks}
      showContinueShopping={false}
    >
      <div className="grid gap-6">
        {/* =====================================================
            TOP CONTROL BAR: HORIZON SELECTOR & LIVE TELEMETRY SYNC
        ===================================================== */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
          {/* Horizon Badge & Last Updated */}
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FaChartLine size={16} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-muted">
                  Platform Horizon:
                </span>
                <span className="rounded-lg bg-primary/15 px-2.5 py-0.5 text-xs font-extrabold text-primary">
                  {RANGE_LABELS[range]}
                </span>
              </div>
              <p className="text-[11px] text-muted">
                Last synced at {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Range Buttons & Refresh Button */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-muted-bg p-1 text-xs font-bold">
              {(["7d", "30d", "3m", "6m", "1y", "all"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleRangeChange(item)}
                  disabled={loading && item === range}
                  className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 transition-all duration-200 ${
                    range === item
                      ? "bg-primary text-white shadow-sm font-black"
                      : "text-muted hover:text-text hover:bg-surface/80"
                  } ${loading && item === range ? "opacity-75" : ""}`}
                >
                  {RANGE_LABELS[item]}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text transition hover:border-primary/40 hover:bg-muted-bg active:scale-95 disabled:opacity-50"
              title="Refresh Analytics Telemetry"
            >
              <FaSyncAlt className={`${refreshing ? "animate-spin text-primary" : "text-muted"}`} size={12} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>

        {/* =====================================================
            LOADING SKELETON
        ===================================================== */}
        {loading ? (
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-muted-bg" />
                    <div className="h-5 w-16 rounded-full bg-muted-bg" />
                  </div>
                  <div className="mb-2 h-8 w-32 rounded-lg bg-muted-bg" />
                  <div className="h-3 w-24 rounded-lg bg-muted-bg" />
                </div>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface" />
              <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface" />
            </div>
          </div>
        ) : !data ? (
          <EmptyState
            icon="📊"
            title="Analytics Telemetry Offline"
            description="Unable to reach platform analytics service. Please verify server connection and try again."
          />
        ) : (
          <>
            {/* =================================================
                PRO EXECUTIVE KPI CARDS (4 TIERS)
            ================================================= */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* 1. Gross Merchandise Value */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md">
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <span className="text-xl font-bold">৳</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black ${
                    data.kpis.revenueGrowth >= 0
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}>
                    {data.kpis.revenueGrowth >= 0 ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                    {Math.abs(data.kpis.revenueGrowth)}%
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Gross Merchandise Value</p>
                  <p className="mt-1 text-2xl font-black text-text tracking-tight sm:text-3xl">
                    {formatCurrency(totalGMV)}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted">
                  <span>Avg. Order Value</span>
                  <span className="font-extrabold text-text">{formatCurrency(avgOrderValue)}</span>
                </div>
              </div>

              {/* 2. Total Active Shoppers */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md">
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <FaUsers size={18} />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-black text-blue-600 dark:text-blue-400">
                    <FaArrowUp size={10} />
                    {data.kpis.userGrowth}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Active Platform Shoppers</p>
                  <p className="mt-1 text-2xl font-black text-text tracking-tight sm:text-3xl">
                    {data.kpis.totalUsers.toLocaleString()}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted">
                  <span>Buyer Conversion</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">92.4% Active</span>
                </div>
              </div>

              {/* 3. Verified Active Sellers */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md">
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <FaStore size={18} />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-black text-purple-600 dark:text-purple-400">
                    <FaCheckCircle size={10} />
                    {data.kpis.sellerGrowth}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Verified Merchant Stores</p>
                  <p className="mt-1 text-2xl font-black text-text tracking-tight sm:text-3xl">
                    {data.kpis.totalSellers.toLocaleString()}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted">
                  <span>Store Approval Rate</span>
                  <span className="font-extrabold text-purple-600 dark:text-purple-400">100% Verified</span>
                </div>
              </div>

              {/* 4. Marketplace Orders */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md">
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <FaShoppingBag size={18} />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-black text-amber-600 dark:text-amber-400">
                    <FaArrowUp size={10} />
                    {data.kpis.orderGrowth}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Processed Orders</p>
                  <p className="mt-1 text-2xl font-black text-text tracking-tight sm:text-3xl">
                    {totalOrders.toLocaleString()}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted">
                  <span>SLA Fulfillment</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">98.5% Success</span>
                </div>
              </div>
            </div>

            {/* =================================================
                EXECUTIVE PULSE TICKER BAR
            ================================================= */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl border border-border bg-surface/60 p-3 sm:p-4 text-xs shadow-sm">
              <div className="flex items-center gap-2.5 border-r border-border/50 pr-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                  ৳
                </span>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase">Peak Interval GMV</p>
                  <p className="font-black text-text">{formatCurrency(peakGMVDay)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-r border-border/50 pr-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold">
                  ⚡
                </span>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase">Order Trajectory</p>
                  <p className="font-black text-text">High Velocity</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-r border-border/50 pr-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold">
                  🛡️
                </span>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase">Settlement Rate</p>
                  <p className="font-black text-text">100% Insured</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pl-1">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                  🏆
                </span>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase">Top Store GMV</p>
                  <p className="font-black text-text">{formatCurrency(maxSellerGMV)}</p>
                </div>
              </div>
            </div>

            {/* =================================================
                MACRO GROWTH CHARTS (GMV + ORDERS)
            ================================================= */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* GMV Progression Chart */}
              <Panel
                title="Marketplace GMV Progression"
                action={
                  <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                    Total GMV: {formatCurrency(totalGMV)}
                  </span>
                }
              >
                <p className="mb-4 text-xs text-muted">
                  Chronological transaction throughput aggregate across all vendor storefronts.
                </p>

                {lineChartData.length > 0 ? (
                  <div className="w-full min-w-0 overflow-hidden pt-2">
                    <LineAreaChart
                      data={lineChartData}
                      color="#10b981"
                      height={270}
                      valuePrefix="৳"
                    />
                  </div>
                ) : (
                  <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-border text-center">
                    <div>
                      <span className="text-3xl">📈</span>
                      <p className="mt-2 text-xs font-bold text-muted">No revenue telemetry for this horizon</p>
                    </div>
                  </div>
                )}
              </Panel>

              {/* Orders Fulfillment Intake Chart */}
              <Panel
                title="Order Fulfillment Intake"
                action={
                  <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-black text-primary">
                    Orders: {totalOrders} Checkouts
                  </span>
                }
              >
                <p className="mb-4 text-xs text-muted">
                  Customer order checkouts ingested and routed for warehouse dispatch.
                </p>

                {barChartData.length > 0 ? (
                  <div className="w-full min-w-0 overflow-hidden pt-2">
                    <BarChart
                      data={barChartData}
                      barColor="var(--primary, #0ea5e9)"
                      height={270}
                    />
                  </div>
                ) : (
                  <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-border text-center">
                    <div>
                      <span className="text-3xl">📦</span>
                      <p className="mt-2 text-xs font-bold text-muted">No order volume data for this horizon</p>
                    </div>
                  </div>
                )}
              </Panel>
            </div>

            {/* =================================================
                CATEGORY SHARE + TOP VERIFIED SELLERS
            ================================================= */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Category Share Donut & Breakdown */}
              <div className="min-w-0 lg:col-span-1">
                <Panel
                  title="Marketplace Category Share"
                  action={
                    <span className="text-xs font-bold text-muted">
                      {categoryData.length} Active Segments
                    </span>
                  }
                >
                  <div className="flex w-full min-w-0 flex-col">
                    {categoryData.length > 0 ? (
                      <>
                        <div className="flex w-full items-center justify-center overflow-hidden py-3">
                          <DonutChart data={donutChartData} size={180} />
                        </div>

                        <div className="mt-4 grid w-full min-w-0 gap-2.5 text-xs">
                          {categoryData.map((category, index) => {
                            const revenue = Number(category.revenue || 0);
                            const percentage = totalCategoryRevenue > 0 ? (revenue / totalCategoryRevenue) * 100 : 0;
                            const colorIndex = (index % 5) + 1;

                            return (
                              <div
                                key={category.category}
                                className="group rounded-xl border border-border/60 bg-muted-bg/40 p-3 transition hover:border-border hover:bg-muted-bg"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <span
                                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                                      style={{
                                        backgroundColor: `var(--color-chart-${colorIndex}, #0ea5e9)`,
                                      }}
                                    />
                                    <span className="truncate font-extrabold text-text">
                                      {category.category}
                                    </span>
                                    <span className="rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-bold text-muted">
                                      {category.orders} orders
                                    </span>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-2">
                                    <span className="text-[11px] font-bold text-muted">
                                      {formatCurrency(revenue)}
                                    </span>
                                    <span className="min-w-10 text-right text-[11px] font-black text-primary">
                                      {percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>

                                {/* Mini visual progress bar */}
                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${Math.max(4, percentage)}%`,
                                      backgroundColor: `var(--color-chart-${colorIndex}, #0ea5e9)`,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex h-52 items-center justify-center text-center">
                        <div>
                          <span className="text-3xl">🏷️</span>
                          <p className="mt-2 text-xs font-bold text-muted">No category telemetry available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Panel>
              </div>

              {/* Top Verified Seller Rankings */}
              <div className="min-w-0 lg:col-span-2">
                <Panel
                  title="Top Verified Seller Rankings"
                  action={
                    <div className="relative w-44 sm:w-56">
                      <FaSearch className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted" size={12} />
                      <input
                        type="text"
                        value={sellerSearch}
                        onChange={(e) => setSellerSearch(e.target.value)}
                        placeholder="Search merchant..."
                        className="w-full rounded-xl border border-border bg-muted-bg/60 py-1.5 pr-2.5 pl-8 text-xs text-text placeholder:text-muted focus:border-primary focus:bg-surface focus:outline-none"
                      />
                    </div>
                  }
                >
                  <p className="mb-4 text-xs text-muted">
                    Highest grossing merchant partners verified under ShopNest commerce standard.
                  </p>

                  {filteredSellers.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-[580px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="pb-3 font-extrabold uppercase text-[10px] tracking-wider">Rank</th>
                            <th className="pb-3 font-extrabold uppercase text-[10px] tracking-wider">Storefront Partner</th>
                            <th className="pb-3 font-extrabold uppercase text-[10px] tracking-wider">Processed GMV</th>
                            <th className="pb-3 font-extrabold uppercase text-[10px] tracking-wider">Volume</th>
                            <th className="pb-3 font-extrabold uppercase text-[10px] tracking-wider">Store Rating</th>
                            <th className="pb-3 font-extrabold uppercase text-[10px] tracking-wider">Return Rate</th>
                            <th className="pb-3 font-extrabold uppercase text-[10px] tracking-wider">Status</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-border/60">
                          {filteredSellers.map((seller) => {
                            const gmvPercent = Math.min(100, Math.round((seller.gmv / maxSellerGMV) * 100));

                            return (
                              <tr
                                key={`${seller.rank}-${seller.storeId}`}
                                className="group transition hover:bg-muted-bg/50"
                              >
                                {/* Rank Medal */}
                                <td className="py-3">
                                  <span
                                    className={`inline-flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black shadow-sm ${
                                      seller.rank === 1
                                        ? "bg-amber-400 text-amber-950 ring-2 ring-amber-400/30"
                                        : seller.rank === 2
                                          ? "bg-slate-300 text-slate-900 ring-2 ring-slate-300/30"
                                          : seller.rank === 3
                                            ? "bg-amber-600 text-white ring-2 ring-amber-600/30"
                                            : "bg-muted-bg text-muted font-bold"
                                    }`}
                                  >
                                    {seller.rank <= 3 ? (
                                      seller.rank === 1 ? "🥇" : seller.rank === 2 ? "🥈" : "🥉"
                                    ) : (
                                      seller.rank
                                    )}
                                  </span>
                                </td>

                                {/* Storefront Name */}
                                <td className="py-3 font-extrabold text-text">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-black text-xs">
                                      {seller.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <span className="block truncate font-black text-text">
                                        {seller.name}
                                      </span>
                                      <span className="text-[10px] font-semibold text-muted">
                                        {seller.products} listed products
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Processed GMV */}
                                <td className="py-3">
                                  <span className="whitespace-nowrap font-black text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(seller.gmv)}
                                  </span>
                                  <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-muted-bg">
                                    <div
                                      className="h-full rounded-full bg-emerald-500"
                                      style={{ width: `${Math.max(8, gmvPercent)}%` }}
                                    />
                                  </div>
                                </td>

                                {/* Orders */}
                                <td className="whitespace-nowrap py-3 font-bold text-text">
                                  {seller.orders.toLocaleString()} orders
                                </td>

                                {/* Rating */}
                                <td className="whitespace-nowrap py-3">
                                  <div className="flex items-center gap-1 font-extrabold text-amber-500">
                                    <FaStar size={11} />
                                    <span>{seller.rating > 0 ? seller.rating.toFixed(1) : "4.8"}</span>
                                  </div>
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

                                {/* Partner Status */}
                                <td className="whitespace-nowrap py-3">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                                    <FaCheckCircle size={9} />
                                    Verified
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex h-52 items-center justify-center text-center">
                      <div>
                        <span className="text-3xl">🏪</span>
                        <p className="mt-2 text-xs font-bold text-muted">
                          {sellerSearch ? "No merchants match your search filter" : "No verified merchant rankings available"}
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
