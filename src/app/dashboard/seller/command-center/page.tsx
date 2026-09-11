"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  LoadingGrid,
  LoadingChart,
  LoadingTable,
  ErrorState,
  EmptyState,
  AiBadge,
} from "@/components/dashboard/DashboardStates";
import {
  getSellerCommandCenter,
  type CommandCenterData,
  type CommandCenterMetrics,
  type CommandCenterProductPerformance,
  type CommandCenterProfitIntelligence,
  type CommandCenterHealthScore,
  type CommandCenterPerformanceSnapshot,
  type CommandCenterTrendPoint,
  type CommandCenterCategoryPerformance,
} from "@/lib/api/seller-intelligence";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { LineAreaChart } from "@/components/analytics/LineAreaChart";
import { BarChart } from "@/components/analytics/BarChart";
import { DonutChart } from "@/components/analytics/DonutChart";
import {
  FaSyncAlt,
  FaArrowRight,
  FaStore,
  FaBoxOpen,
  FaShoppingCart,
  FaTags,
  FaBullhorn,
  FaChartLine,
  FaRobot,
  FaCog,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTruck,
  FaUndo,
  FaStar,
  FaExternalLinkAlt,
  FaPlus,
} from "react-icons/fa";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";


const RANGES = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "3m", label: "3 Months" },
  { key: "6m", label: "6 Months" },
  { key: "1y", label: "1 Year" },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatCurrency(value: number): string {
  return `৳${value.toLocaleString()}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getImpactBg(impact: string): string {
  switch (impact) {
    case "positive":
      return "bg-emerald-500/10 border-emerald-500/20";
    case "warning":
      return "bg-amber-500/10 border-amber-500/20";
    case "suggestion":
      return "bg-indigo-500/10 border-indigo-500/20";
    default:
      return "bg-muted-bg border-border";
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "critical":
      return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
    case "high":
      return "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20";
    case "warning":
      return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "info":
      return "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20";
    default:
      return "text-muted bg-muted-bg border-border";
  }
}

function getPriorityIcon(priority: string) {
  switch (priority) {
    case "critical":
      return <FaTimesCircle className="text-rose-500" />;
    case "high":
      return <FaExclamationTriangle className="text-orange-500" />;
    case "warning":
      return <FaExclamationTriangle className="text-amber-500" />;
    case "info":
      return <FaCheckCircle className="text-sky-500" />;
    default:
      return <FaClock className="text-muted" />;
  }
}

function getStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (["pending", "confirmed"].includes(s)) return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
  if (["processing", "packing"].includes(s)) return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20";
  if (["shipped", "out_for_delivery"].includes(s)) return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
  if (["delivered"].includes(s)) return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  if (["cancelled", "refunded"].includes(s)) return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
  if (["returned"].includes(s)) return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
  return "bg-muted-bg text-muted border-border";
}

function getStockStatusColor(stock: number): { text: string; bg: string; border: string } {
  if (stock === 0) return { text: "text-rose-700 dark:text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" };
  if (stock <= 10) return { text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  return { text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
}

export default function SellerCommandCenter() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CommandCenterData | null>(null);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await getSellerCommandCenter(range);
      setData(res);
    } catch {
      setError("Unable to load command center. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const metrics: CommandCenterMetrics | null = data?.metrics ?? null;
  const healthScore: CommandCenterHealthScore | null = data?.healthScore ?? null;
  const profitIntelligence: CommandCenterProfitIntelligence | null = data?.profitIntelligence ?? null;
  const performanceSnapshot: CommandCenterPerformanceSnapshot | null = data?.performanceSnapshot ?? null;
  const salesPerformance = data?.salesPerformance;
  const actionCenter = data?.actionCenter ?? [];
  const orderPipeline = data?.orderPipeline;
  const recentOrders = data?.recentOrders ?? [];
  const inventoryCommand = data?.inventoryCommand;
  const productPerformance = data?.productPerformance;
  const aiInsights = data?.aiInsights ?? [];
  const header = data?.header;

  const trendPoints: CommandCenterTrendPoint[] = salesPerformance?.trendPoints ?? [];
  const categoryPerformance: CommandCenterCategoryPerformance[] = salesPerformance?.categoryPerformance ?? [];

  const topProducts: CommandCenterProductPerformance["topProducts"] = productPerformance?.topProducts ?? [];
  const underperformingProducts: CommandCenterProductPerformance["underperformingProducts"] = productPerformance?.underperformingProducts ?? [];

  const todayRevenue = metrics?.todayRevenue ?? 0;
  const totalRevenue = metrics?.totalRevenue ?? 0;
  const rangeRevenue = metrics?.rangeRevenue ?? 0;
  const previousRangeRevenue = metrics?.previousRangeRevenue ?? 0;
  const revenueGrowthPct = metrics?.revenueGrowthPct ?? null;
  const rangeOrders = metrics?.rangeOrders ?? 0;
  const ordersGrowthPct = metrics?.ordersGrowthPct ?? null;
  const productsSold = metrics?.productsSold ?? 0;
  const avgOrderValue = metrics?.avgOrderValue ?? 0;
  const pendingOrders = metrics?.pendingOrders ?? 0;
  const totalProducts = metrics?.totalProducts ?? 0;
  const lowStockCount = metrics?.lowStockCount ?? 0;
  const outOfStockCount = metrics?.outOfStockCount ?? 0;
  const storeRating = metrics?.storeRating ?? 0;

  const hasOrders = rangeOrders > 0 || totalRevenue > 0;
  const hasProducts = totalProducts > 0;

  return (
    <DashboardShell
      role="Seller"
      title="Command Center"
      subtitle="Real-time store performance, order fulfillment, inventory intelligence, and AI-driven recommendations."
      links={sellerDashboardLinks}
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-text transition hover:border-primary/50 hover:text-primary disabled:opacity-50 cursor-pointer"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} size={11} />
            <span className="hidden sm:inline">{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>
          <Link
            href="/dashboard/seller/products/add"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm transition"
          >
            <FaPlus size={10} />
            <span className="hidden sm:inline">Add Product</span>
          </Link>
        </div>
      }
    >
      {error && <ErrorState message={error} onRetry={() => loadData()} />}

      {/* ==================== HEADER ==================== */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {header?.logo ? (
              <img src={header.logo} alt={header.storeName} className="h-12 w-12 rounded-xl object-cover border border-border" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl">
                <FaStore className="text-primary" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                {getGreeting()}, {header?.sellerName || "Seller"}
              </p>
              <h1 className="text-xl font-black text-text sm:text-2xl">{header?.storeName || "My ShopNest Store"}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                  header?.status === "approved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                  header?.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                  "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}>
                  {header?.status === "approved" && <FaCheckCircle size={10} />}
                  {header?.status || "pending"} store
                </span>
                {header?.rating && header.ratingCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
                    <FaStar size={10} /> {header.rating.toFixed(1)} ({header.ratingCount})
                  </span>
                )}
                <span className="text-[10px] font-bold text-muted">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { href: "/dashboard/seller/products/add", icon: FaPlus, label: "Add Product" },
              { href: "/dashboard/seller/orders", icon: FaShoppingCart, label: "Orders" },
              { href: "/dashboard/seller/inventory", icon: FaBoxOpen, label: "Inventory" },
              { href: "/dashboard/seller/coupons", icon: FaTags, label: "Coupons" },
              { href: "/dashboard/seller/campaigns", icon: FaBullhorn, label: "Campaigns" },
              { href: "/dashboard/seller/analytics", icon: FaChartLine, label: "Analytics" },
              { href: "/dashboard/seller/ai-tools", icon: FaRobot, label: "AI Tools" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-text transition hover:border-primary/40 hover:text-primary"
              >
                <action.icon size={11} />
                <span className="hidden md:inline">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">Range:</span>
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-background p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  range === r.key
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-text"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CORE KPIs ==================== */}
      <section className="mt-6">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted mb-3">Core Performance KPIs</h2>
        {loading ? (
          <LoadingGrid count={6} />
        ) : metrics ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon="৳"
              label="Today's Revenue"
              value={formatCurrency(todayRevenue)}
              note="Today"
              color="success"
            />
            <StatCard
              icon="💰"
              label="Total Revenue"
              value={formatCurrency(totalRevenue)}
              note={`${range === "today" ? "Today" : "All-time"} sales`}
              color="success"
            />
            <StatCard
              icon="📦"
              label="Orders"
              value={formatNumber(rangeOrders)}
              note={`${range === "today" ? "Today" : "Selected range"}`}
              color="default"
            />
            <StatCard
              icon="🛍️"
              label="Products Sold"
              value={formatNumber(productsSold)}
              note="Units dispatched"
              color="accent"
            />
            <StatCard
              icon="⏳"
              label="Pending Orders"
              value={formatNumber(pendingOrders)}
              note="Awaiting action"
              color="warning"
            />
            <StatCard
              icon="⚠️"
              label="Low Stock"
              value={formatNumber(lowStockCount + outOfStockCount)}
              note={`${outOfStockCount} out of stock`}
              color="error"
            />
          </div>
        ) : (
          <EmptyState
            icon="📊"
            title="No metrics available"
            description="Start selling to see your performance metrics here."
            action={
              <Link href="/dashboard/seller/products/add" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition">
                <FaPlus size={10} /> Add Your First Product
              </Link>
            }
          />
        )}
      </section>

      {/* ==================== REVENUE ANALYTICS ==================== */}
      {metrics && (
        <section className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <p className="text-xs font-bold text-muted uppercase">Revenue</p>
              <p className="mt-2 text-2xl font-black text-text">{formatCurrency(rangeRevenue)}</p>
              {revenueGrowthPct !== null && previousRangeRevenue > 0 && (
                <div className="mt-2 flex items-center gap-1">
{revenueGrowthPct >= 0 ? (
  <FiTrendingUp className="text-emerald-500" size={12} />
) : (
  <FiTrendingDown className="text-rose-500" size={12} />
)}
                  <span className={`text-xs font-bold ${revenueGrowthPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {revenueGrowthPct >= 0 ? "+" : ""}{revenueGrowthPct}%
                  </span>
                  <span className="text-[10px] text-muted">vs prior period</span>
                </div>
              )}
              {revenueGrowthPct === null && (
                <p className="mt-2 text-[10px] text-muted">Not enough historical data</p>
              )}
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <p className="text-xs font-bold text-muted uppercase">Orders</p>
              <p className="mt-2 text-2xl font-black text-text">{formatNumber(rangeOrders)}</p>
              {ordersGrowthPct !== null && metrics.previousRangeOrders > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  {ordersGrowthPct >= 0 ? (
                    <FiTrendingUp className="text-emerald-500" size={12} />
                  ) : (
                    <FiTrendingDown className="text-rose-500" size={12} />
                  )}
                  <span className={`text-xs font-bold ${ordersGrowthPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {ordersGrowthPct >= 0 ? "+" : ""}{ordersGrowthPct}%
                  </span>
                  <span className="text-[10px] text-muted">vs prior period</span>
                </div>
              )}
              {ordersGrowthPct === null && (
                <p className="mt-2 text-[10px] text-muted">Not enough historical data</p>
              )}
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <p className="text-xs font-bold text-muted uppercase">Avg Order Value</p>
              <p className="mt-2 text-2xl font-black text-text">{formatCurrency(avgOrderValue)}</p>
              <p className="mt-2 text-[10px] text-muted">Per order average</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <p className="text-xs font-bold text-muted uppercase">Store Rating</p>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-2xl font-black text-text">{storeRating.toFixed(1)}</p>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={14}
                      className={star <= Math.round(storeRating) ? "text-amber-500" : "text-muted/30"}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-[10px] text-muted">From customer reviews</p>
            </div>
          </div>
        </section>
      )}

      {/* ==================== SALES PERFORMANCE CHART ==================== */}
      <section className="mt-6">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted mb-3">Sales Performance</h2>
        {loading ? (
          <LoadingChart />
        ) : trendPoints.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Panel title="Revenue Trend">
                <LineAreaChart
                  data={trendPoints.map((p) => ({ label: p.label, value: p.revenue }))}
                  height={240}
                  valuePrefix="৳"
                  primaryLabel="Revenue"
                  color="var(--primary, #5b5cf0)"
                />
              </Panel>
            </div>
            <Panel title="Orders Trend">
              <BarChart
                data={trendPoints.map((p) => ({
                  label: p.label,
                  value: p.orders,
                  color: "var(--chart-2, #10b981)",
                }))}
                height={240}
                valuePrefix=""
                barColor="var(--chart-2, #10b981)"
              />
            </Panel>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <FaChartLine className="mx-auto mb-3 text-3xl text-muted/40" />
            <p className="text-sm font-bold text-text">Sales timeline will appear here</p>
            <p className="mt-1 text-xs text-muted">Once customer checkouts occur, your sales velocity chart will populate automatically.</p>
          </div>
        )}
      </section>

      {/* ==================== CATEGORY PERFORMANCE ==================== */}
      {categoryPerformance.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted mb-3">Category Performance</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Panel title="Revenue by Category">
                <div className="space-y-3">
                  {categoryPerformance.slice(0, 6).map((cat, i) => (
                    <div key={cat.category} className="flex items-center gap-3">
                      <span className="text-xs font-black text-muted w-6">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-text truncate">{cat.category}</span>
                          <span className="text-xs font-black text-text ml-2">{formatCurrency(cat.revenue)}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${cat.sharePercent}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-muted w-10 text-right">{cat.sharePercent}%</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
            <Panel title="Category Share">
              <DonutChart
                data={categoryPerformance.slice(0, 5).map((cat) => ({
                  label: cat.category,
                  value: cat.sharePercent,
                }))}
                size={180}
                centerLabel="Total"
                centerValue={`${categoryPerformance.length} cats`}
                valueSuffix="%"
              />
            </Panel>
          </div>
        </section>
      )}

      {/* ==================== ACTION CENTER ==================== */}
      {actionCenter.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted mb-3">Action Center</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actionCenter.map((action) => (
              <div
                key={action.id}
                className={`rounded-2xl border p-5 shadow-sm ${getPriorityColor(action.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getPriorityIcon(action.priority)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-text">{action.title}</h3>
                    <p className="mt-1 text-xs text-muted leading-relaxed">{action.description}</p>
                    <Link
                      href={action.actionHref}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-1.5 text-xs font-bold text-text border border-border hover:border-primary/40 transition"
                    >
                      {action.actionLabel} <FaArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== ORDER COMMAND ==================== */}
      {orderPipeline && (
        <section className="mt-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted mb-3">Order Command</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[
              { label: "Pending", count: orderPipeline.pending.count, icon: FaClock, color: "warning", href: "/dashboard/seller/orders" },
              { label: "Processing", count: orderPipeline.processing.count, icon: FaCog, color: "default", href: "/dashboard/seller/orders" },
              { label: "Shipped", count: orderPipeline.shipped.count, icon: FaTruck, color: "accent", href: "/dashboard/seller/orders" },
              { label: "Delivered", count: orderPipeline.delivered.count, icon: FaCheckCircle, color: "success", href: "/dashboard/seller/orders" },
              { label: "Cancelled", count: orderPipeline.cancelled.count, icon: FaTimesCircle, color: "error", href: "/dashboard/seller/orders" },
              { label: "Returned", count: orderPipeline.returned.count, icon: FaUndo, color: "warning", href: "/dashboard/seller/orders" },
            ].map((stage) => (
              <Link
                key={stage.label}
                href={stage.href}
                className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-${stage.color}/10 text-${stage.color}`}>
                    <stage.icon size={14} />
                  </span>
                  <span className="text-2xl font-black text-text">{formatNumber(stage.count)}</span>
                </div>
                <p className="mt-3 text-xs font-bold text-muted">{stage.label}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted">
              {pendingOrders > 0 ? (
                <span className="font-bold text-amber-600 dark:text-amber-400">{pendingOrders} order(s) need your attention</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">All orders are up to date</span>
              )}
            </p>
            <Link href="/dashboard/seller/orders" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              View Orders <FaArrowRight size={10} />
            </Link>
          </div>
        </section>
      )}

      {/* ==================== RECENT ORDERS ==================== */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted">Recent Orders</h2>
          <Link href="/dashboard/seller/orders" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            View All <FaArrowRight size={10} />
          </Link>
        </div>
        {loading ? (
          <LoadingTable rows={5} cols={5} />
        ) : recentOrders.length > 0 ? (
          <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted-bg/30">
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-muted">Order</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-muted">Product</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-muted">Customer</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-muted">Amount</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentOrders.slice(0, 8).map((order) => (
                    <tr key={order.orderId} className="transition hover:bg-muted-bg/20">
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-text">#{order.orderId.slice(-6)}</p>
                        <p className="text-[10px] text-muted">{formatDate(new Date(order.createdAt))}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {order.items[0]?.image ? (
                            <img src={order.items[0].image} alt="" className="h-8 w-8 rounded-lg object-cover border border-border" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted-bg text-xs">📦</div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text truncate max-w-[180px]">{order.items[0]?.title || "Multiple items"}</p>
                            <p className="text-[10px] text-muted">Qty: {order.itemCount}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-text">{order.customerName}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-xs font-black text-text">{formatCurrency(order.sellerSubtotal)}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border/50">
              {recentOrders.slice(0, 8).map((order) => (
                <div key={order.orderId} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {order.items[0]?.image ? (
                        <img src={order.items[0].image} alt="" className="h-10 w-10 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted-bg text-sm">📦</div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-text">#{order.orderId.slice(-6)}</p>
                        <p className="text-[10px] text-muted">{order.items[0]?.title || "Multiple items"}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted">{order.customerName} • {formatDate(new Date(order.createdAt))}</p>
                    <p className="text-sm font-black text-text">{formatCurrency(order.sellerSubtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon="📦"
            title="No orders yet"
            description="Orders will appear here once customers start purchasing your products."
          />
        )}
      </section>

      {/* ==================== INVENTORY COMMAND ==================== */}
      {inventoryCommand && (
        <section className="mt-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted mb-3">Inventory Command</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="✅"
              label="Healthy Stock"
              value={formatNumber(inventoryCommand.healthyCount)}
              note="Adequate inventory"
              color="success"
            />
            <StatCard
              icon="⚠️"
              label="Low Stock"
              value={formatNumber(inventoryCommand.lowStockCount)}
              note="<= 10 units"
              color="warning"
            />
            <StatCard
              icon="🚫"
              label="Out of Stock"
              value={formatNumber(inventoryCommand.outOfStockCount)}
              note="Zero inventory"
              color="error"
            />
            <StatCard
              icon="📊"
              label="Total Catalog Units"
              value={formatNumber(inventoryCommand.totalCatalogUnits)}
              note="Across all products"
              color="default"
            />
          </div>

          {inventoryCommand.topLowStock.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-bold text-muted uppercase mb-3">Low Stock Alerts</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inventoryCommand.topLowStock.slice(0, 6).map((product) => {
                  const stockColor = getStockStatusColor(product.stock);
                  return (
                    <div key={product.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img src={product.image} alt={product.title} className="h-10 w-10 rounded-lg object-cover border border-border" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted-bg text-sm">📦</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-text truncate">{product.title}</p>
                          <p className="text-[10px] text-muted">{product.category}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black ${stockColor.bg} ${stockColor.text} ${stockColor.border} border`}>
                          {product.stock === 0 ? "Out of Stock" : product.stock <= 10 ? "Low Stock" : "Healthy"}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-lg font-black text-text">{product.stock}</p>
                          <p className="text-[10px] text-muted">units remaining</p>
                        </div>
                        <Link
                          href={`/dashboard/seller/inventory`}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-[10px] font-bold text-text hover:border-primary/40 transition"
                        >
                          Manage <FaExternalLinkAlt size={8} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================== TOP PRODUCTS ==================== */}
      {topProducts.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted mb-3">Top Products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topProducts.slice(0, 6).map((product, index) => (
              <div key={product.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-black text-primary">
                    #{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-text truncate">{product.title}</p>
                    <p className="text-[10px] text-muted">{product.category}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-muted-bg p-2 border border-border/50">
                    <p className="text-[10px] text-muted font-bold">Revenue</p>
                    <p className="text-sm font-black text-text">{formatCurrency(product.revenue)}</p>
                  </div>
                  <div className="rounded-xl bg-muted-bg p-2 border border-border/50">
                    <p className="text-[10px] text-muted font-bold">Sold</p>
                    <p className="text-sm font-black text-text">{formatNumber(product.sold)}</p>
                  </div>
                  <div className="rounded-xl bg-muted-bg p-2 border border-border/50">
                    <p className="text-[10px] text-muted font-bold">Stock</p>
                    <p className="text-sm font-black text-text">{formatNumber(product.stock)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/dashboard/seller/products`}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[10px] font-bold text-text hover:border-primary/40 transition"
                  >
                    View Product <FaExternalLinkAlt size={8} />
                  </Link>
                  {product.ratingAvg > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
                      <FaStar size={8} /> {product.ratingAvg.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== UNDERPERFORMING PRODUCTS ==================== */}
      {underperformingProducts.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted mb-3">Underperforming Products</h2>
          <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-border bg-muted-bg/30">
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-muted">Product</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-muted">Sold</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-muted">Revenue</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-muted">Stock</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-muted">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {underperformingProducts.slice(0, 5).map((product) => (
                    <tr key={product.id} className="transition hover:bg-muted-bg/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {product.image ? (
                            <img src={product.image} alt="" className="h-8 w-8 rounded-lg object-cover border border-border" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted-bg text-xs">📦</div>
                          )}
                          <span className="text-xs font-bold text-text truncate max-w-[160px]">{product.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-black text-rose-600 dark:text-rose-400">{formatNumber(product.sold)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-bold text-text">{formatCurrency(product.revenue)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-bold text-text">{formatNumber(product.stock)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/seller/products`}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[10px] font-bold text-text hover:border-primary/40 transition"
                        >
                          Review <FaExternalLinkAlt size={8} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ==================== PROFIT INTELLIGENCE ==================== */}
      {profitIntelligence && (
        <section className="mt-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted mb-3">Profit Intelligence</h2>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl bg-muted-bg p-4 border border-border/50">
                <p className="text-[10px] font-bold text-muted uppercase">Gross Revenue</p>
                <p className="mt-1 text-xl font-black text-text">{formatCurrency(profitIntelligence.grossRevenue)}</p>
              </div>
              <div className="rounded-xl bg-muted-bg p-4 border border-border/50">
                <p className="text-[10px] font-bold text-muted uppercase">Discounts</p>
                <p className="mt-1 text-xl font-black text-rose-600 dark:text-rose-400">-{formatCurrency(profitIntelligence.totalDiscounts)}</p>
              </div>
              <div className="rounded-xl bg-muted-bg p-4 border border-border/50">
                <p className="text-[10px] font-bold text-muted uppercase">Platform Fee</p>
                <p className="mt-1 text-xl font-black text-muted">-{formatCurrency(profitIntelligence.estimatedPlatformFee)}</p>
              </div>
              <div className="rounded-xl bg-muted-bg p-4 border border-border/50">
                <p className="text-[10px] font-bold text-muted uppercase">Net Profit</p>
                <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(profitIntelligence.estimatedNetProfit)}</p>
              </div>
              <div className="rounded-xl bg-muted-bg p-4 border border-border/50">
                <p className="text-[10px] font-bold text-muted uppercase">Margin</p>
                <p className="mt-1 text-xl font-black text-text">{profitIntelligence.profitMarginPercent}%</p>
              </div>
            </div>
            {profitIntelligence.isEstimated && (
              <p className="mt-3 text-[10px] text-muted italic">{profitIntelligence.note}</p>
            )}
          </div>
        </section>
      )}

      {/* ==================== SELLER HEALTH SCORE ==================== */}
      {healthScore && (
        <section className="mt-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted mb-3">Seller Health Score</h2>
          <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm flex justify-center">
              <GaugeMeter
                score={healthScore.overallHealth}
                title="Overall Health"
                subtitle={`${healthScore.overallHealth}/100`}
                size={180}
                type="health"
              />
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="text-sm font-black text-text mb-4">Health Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: "Delivery Reliability", value: healthScore.deliveryReliability, max: 100 },
                  { label: "Customer Satisfaction", value: healthScore.customerSatisfaction, max: 100 },
                  { label: "Catalog Readiness", value: healthScore.catalogReadiness, max: 100 },
                  { label: "Return Rate", value: 100 - healthScore.returnRatePercent, max: 100, invert: true },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-muted">{metric.label}</span>
                      <span className="text-xs font-black text-text">{metric.value}{metric.max === 100 ? "%" : ""}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${metric.value >= (metric.invert ? 70 : 70) ? "bg-emerald-500" : metric.value >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                        style={{ width: `${Math.min(100, (metric.value / (metric.max || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== AI INSIGHTS & RECOMMENDATIONS ==================== */}
      {aiInsights.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <FaRobot className="text-primary" size={16} />
            <h2 className="text-xs font-black uppercase tracking-wider text-muted">AI Business Insights</h2>
            <AiBadge />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className={`rounded-2xl border p-5 shadow-sm ${getImpactBg(insight.impact)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">
                    {insight.impact === "positive" && <FiTrendingUp className="text-emerald-500" />}
                    {insight.impact === "warning" && <FaExclamationTriangle className="text-amber-500" />}
                    {insight.impact === "suggestion" && <FaRobot className="text-indigo-500" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-text">{insight.title}</h3>
                    <p className="mt-1 text-[10px] font-bold text-muted uppercase tracking-wider">{insight.category}</p>
                    <p className="mt-2 text-xs text-text leading-relaxed">{insight.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== PERFORMANCE SNAPSHOT ==================== */}
      {performanceSnapshot && (
        <section className="mt-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted mb-3">Performance Snapshot</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon="📈"
              label="Conversion Rate"
              value={`${performanceSnapshot.conversionRate}%`}
              note="Order conversion"
              color="success"
            />
            <StatCard
              icon="❌"
              label="Cancellation Rate"
              value={`${performanceSnapshot.cancellationRate}%`}
              note="Cancelled orders"
              color="error"
            />
            <StatCard
              icon="🔄"
              label="Return Rate"
              value={`${performanceSnapshot.returnRate}%`}
              note="Returned orders"
              color="warning"
            />
            <StatCard
              icon="⭐"
              label="Average Rating"
              value={performanceSnapshot.averageRating.toFixed(1)}
              note="Store rating"
              color="accent"
            />
            <StatCard
              icon="💰"
              label="Avg Order Value"
              value={formatCurrency(performanceSnapshot.averageOrderValue)}
              note="Per order"
              color="default"
            />
            <StatCard
              icon="👥"
              label="Repeat Customers"
              value={`${performanceSnapshot.repeatCustomerRate}%`}
              note="Returning buyers"
              color="secondary"
            />
          </div>
        </section>
      )}

      {/* ==================== EMPTY STATE FOR NEW SELLERS ==================== */}
      {!loading && !error && !hasOrders && !hasProducts && (
        <section className="mt-6">
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center sm:p-12">
            <FaStore className="mx-auto mb-4 text-4xl text-muted/40" />
            <h3 className="text-lg font-black text-text">Welcome to your Command Center</h3>
            <p className="mt-2 max-w-md mx-auto text-sm text-muted leading-relaxed">
              Your store is set up and ready. Start by adding products to see real-time analytics, sales performance, and AI-powered recommendations.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard/seller/products/add"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover shadow-sm transition"
              >
                <FaPlus size={12} /> Add Your First Product
              </Link>
              <Link
                href="/dashboard/seller/store-settings"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-bold text-text hover:border-primary/40 transition"
              >
                <FaCog size={12} /> Setup Store
              </Link>
            </div>
          </div>
        </section>
      )}
    </DashboardShell>
  );
}
