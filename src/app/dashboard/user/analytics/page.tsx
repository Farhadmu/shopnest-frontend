"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import {
  getComprehensiveSpendingAnalytics,
  getBudgetTracker,
  updateBudget,
  exportSpendingReport,
  ComprehensiveSpendingAnalytics,
  BudgetTrackerData,
} from "@/lib/api/customer-intelligence";
import { LineAreaChart } from "@/components/analytics/LineAreaChart";
import { BarChart } from "@/components/analytics/BarChart";
import { DonutChart } from "@/components/analytics/DonutChart";
import { formatCurrency } from "@/lib/utils";
import { LoadingCard, LoadingGrid, ErrorState, EmptyState } from "@/components/dashboard/DashboardStates";
import { FiDownload, FiTrendingUp, FiTrendingDown, FiMinus, FiEdit3, FiCheck, FiX } from "react-icons/fi";

const DATE_RANGES = [
  { value: "all", label: "All Time" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "last_6_months", label: "Last 6 Months" },
  { value: "last_12_months", label: "Last 12 Months" },
  { value: "this_year", label: "This Year" },
];

export default function SpendingAnalyticsPage() {
  const [analytics, setAnalytics] = useState<ComprehensiveSpendingAnalytics | null>(null);
  const [budget, setBudget] = useState<BudgetTrackerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("all");
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [savingBudget, setSavingBudget] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, budgetRes] = await Promise.all([
        getComprehensiveSpendingAnalytics(range).catch(() => null),
        getBudgetTracker().catch(() => null),
      ]);
      if (analyticsRes) setAnalytics(analyticsRes);
      if (budgetRes) setBudget(budgetRes);
      if (!analyticsRes && !budgetRes) {
        setError("Failed to load spending analytics");
      }
    } catch {
      setError("Failed to load spending analytics");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBudgetSave = async () => {
    const value = parseFloat(budgetInput);
    if (isNaN(value) || value < 0) return;
    setSavingBudget(true);
    try {
      const updated = await updateBudget(value);
      setBudget(updated);
      setShowBudgetEdit(false);
      setBudgetInput("");
      fetchData();
    } catch {
      // handled
    } finally {
      setSavingBudget(false);
    }
  };

  const handleExport = () => {
    exportSpendingReport(range);
  };

  const monthlyChartData = (analytics?.monthlySpending || []).map((m) => ({
    label: m.month,
    value: m.amount,
  }));

  const weeklyChartData = (analytics?.weeklySpending || []).map((w) => ({
    label: w.day,
    value: w.amount,
  }));

  const categoryChartData = (analytics?.categorySpending || []).map((c) => ({
    label: c.category,
    value: c.amount,
  }));

  const sellerChartData = (analytics?.sellerSpending || []).map((s) => ({
    label: s.name,
    value: s.amount,
  }));

  const trendIcon = analytics?.spendingTrend === "increasing" ? <FiTrendingUp className="text-error" /> : analytics?.spendingTrend === "decreasing" ? <FiTrendingDown className="text-success" /> : <FiMinus className="text-warning" />;

  return (
    <DashboardShell
      role="Customer"
      title="Spending Analytics"
      subtitle="Comprehensive insights into your spending patterns, trends, and budget tracking."
    >
      <div className="grid gap-6">
        {error && <ErrorState message={error} onRetry={fetchData} />}

        {/* Date Range Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-muted">Period:</span>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-xl border border-border bg-muted-bg px-3 py-1.5 text-xs font-bold text-text outline-none focus:border-primary"
            >
              {DATE_RANGES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text transition hover:border-primary/40 hover:text-primary"
          >
            <FiDownload size={12} /> Export CSV
          </button>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <LoadingGrid count={4} />
        ) : analytics ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon="💳"
              label="Total Spent"
              value={formatCurrency(analytics.totalSpent)}
              note={`${analytics.completedOrders} valid orders`}
              color="default"
            />
            <StatCard
              icon="📦"
              label="Total Orders"
              value={String(analytics.totalOrders)}
              note={`${analytics.completedOrders} completed`}
              color="default"
            />
            <StatCard
              icon="📊"
              label="Average Order Value"
              value={formatCurrency(analytics.averageOrderValue)}
              note={`From ${analytics.completedOrders} orders`}
              color="default"
            />
            <StatCard
              icon="💰"
              label="Total Savings"
              value={formatCurrency(analytics.totalSavings)}
              note={`Coupon: ${formatCurrency(analytics.couponSavings)}`}
              color="success"
            />
          </div>
        ) : null}

        {/* Spending Overview Charts */}
        {loading ? (
          <LoadingGrid count={2} height="h-72" />
        ) : analytics ? (
          <>
            {/* Monthly & Weekly Spending */}
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
              <Panel
                title="Monthly Spending"
                action={
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {monthlyChartData.length > 0 ? `${monthlyChartData.length} Months` : "No data"}
                  </span>
                }
              >
                {monthlyChartData.length > 0 ? (
                  <LineAreaChart data={monthlyChartData} color="var(--color-chart-1)" height={260} />
                ) : (
                  <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted-bg/40 text-sm text-muted">
                    No spending data for this period
                  </div>
                )}
              </Panel>

              <Panel
                title="Weekly Spending Pattern"
                action={
                  <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                    By Day
                  </span>
                }
              >
                {weeklyChartData.some((d) => d.value > 0) ? (
                  <BarChart data={weeklyChartData} color="var(--color-chart-4)" height={260} />
                ) : (
                  <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted-bg/40 text-sm text-muted">
                    No weekly data available
                  </div>
                )}
              </Panel>
            </div>

            {/* Category & Seller Spending */}
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
              <Panel
                title="Category Spending"
                action={
                  <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                    {categoryChartData.length} Categories
                  </span>
                }
              >
                {categoryChartData.length > 0 ? (
                  <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
                    <DonutChart data={categoryChartData} size={200} />
                    <div className="grid gap-2">
                      {analytics.categorySpending.slice(0, 6).map((cat) => (
                        <div key={cat.category} className="flex items-center justify-between rounded-xl bg-muted-bg p-2.5 text-xs">
                          <span className="font-bold text-text truncate max-w-[120px]">{cat.category}</span>
                          <span className="font-black text-primary">{formatCurrency(cat.amount)} ({cat.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted-bg/40 text-sm text-muted">
                    No category data available
                  </div>
                )}
              </Panel>

              <Panel
                title="Seller Spending"
                action={
                  <span className="rounded-lg bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                    {sellerChartData.length} Sellers
                  </span>
                }
              >
                {sellerChartData.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.sellerSpending.slice(0, 5).map((seller) => (
                      <div key={seller.sellerId} className="rounded-xl border border-border bg-muted-bg/50 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-text text-sm">{seller.name}</span>
                          <span className="font-black text-primary">{formatCurrency(seller.amount)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted-bg overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, (seller.amount / (analytics.sellerSpending[0]?.amount || 1)) * 100)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[10px] text-muted">{seller.orders} order{seller.orders !== 1 ? "s" : ""}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted-bg/40 text-sm text-muted">
                    No seller data available
                  </div>
                )}
              </Panel>
            </div>

            {/* Smart Insights & Budget */}
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
              <Panel
                title="Smart Spending Insights"
                action={
                  <span className="rounded-lg bg-warning/10 px-2.5 py-1 text-xs font-bold text-warning">
                    {analytics.insights.length} Insights
                  </span>
                }
              >
                {analytics.insights.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl bg-muted-bg/60 p-3">
                        <span className="mt-0.5 text-lg">
                          {insight.includes("more") ? "📈" : insight.includes("less") ? "📉" : insight.includes("saved") ? "💰" : insight.includes("category") ? "📦" : "💡"}
                        </span>
                        <p className="text-xs leading-relaxed text-text">{insight}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted-bg/40 p-6 text-center text-sm text-muted">
                    More insights will appear as you shop
                  </div>
                )}

                {analytics.highestSpendingMonth && (
                  <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Highest Spending Month</p>
                    <p className="mt-1 text-lg font-black text-text">{analytics.highestSpendingMonth.month}</p>
                    <p className="text-sm font-bold text-primary">{formatCurrency(analytics.highestSpendingMonth.amount)}</p>
                  </div>
                )}

                {analytics.spendingTrendPercent !== 0 && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted-bg p-3">
                    {trendIcon}
                    <span className="text-xs font-bold text-text">
                      Spending is {analytics.spendingTrend} by {Math.abs(analytics.spendingTrendPercent)}% vs last month
                    </span>
                  </div>
                )}
              </Panel>

              <Panel
                title="Monthly Budget Tracker"
                action={
                  <button
                    onClick={() => setShowBudgetEdit(!showBudgetEdit)}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    <FiEdit3 size={10} /> {showBudgetEdit ? "Cancel" : "Edit Budget"}
                  </button>
                }
              >
                {showBudgetEdit ? (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-muted">Set Monthly Budget (৳)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        placeholder={budget?.monthlyBudget?.toString() || "10000"}
                        className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleBudgetSave}
                        disabled={savingBudget}
                        className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
                      >
                        <FiCheck size={12} /> Save
                      </button>
                    </div>
                  </div>
                ) : budget ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-muted-bg p-3 text-center">
                        <p className="text-[10px] font-bold uppercase text-muted">Budget</p>
                        <p className="mt-1 text-sm font-black text-text">{formatCurrency(budget.monthlyBudget)}</p>
                      </div>
                      <div className="rounded-xl bg-muted-bg p-3 text-center">
                        <p className="text-[10px] font-bold uppercase text-muted">Spent</p>
                        <p className="mt-1 text-sm font-black text-primary">{formatCurrency(budget.spent)}</p>
                      </div>
                      <div className="rounded-xl bg-muted-bg p-3 text-center">
                        <p className="text-[10px] font-bold uppercase text-muted">Remaining</p>
                        <p className={`mt-1 text-sm font-black ${budget.status === "exceeded" ? "text-error" : "text-success"}`}>{formatCurrency(budget.remaining)}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-muted">Progress</span>
                        <span className={`text-xs font-black ${budget.status === "exceeded" ? "text-error" : budget.status === "near" ? "text-warning" : "text-success"}`}>
                          {budget.percentage}%
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-muted-bg overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${budget.status === "exceeded" ? "bg-error" : budget.status === "near" ? "bg-warning" : "bg-success"}`}
                          style={{ width: `${Math.min(100, budget.percentage)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted">
                        {budget.status === "exceeded"
                          ? "⚠️ You have exceeded your monthly budget!"
                          : budget.status === "near"
                          ? "⚡ You are near your budget limit."
                          : `✅ You have used ${budget.percentage}% of your monthly budget.`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted-bg/40 p-6 text-center text-sm text-muted">
                    Set a monthly budget to track your spending
                  </div>
                )}
              </Panel>
            </div>

            {/* Order Summary */}
            <Panel title="Order Summary">
              {loading ? (
                <LoadingCard height="h-24" />
              ) : analytics ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-muted-bg p-4 text-center">
                    <p className="text-2xl font-black text-text">{analytics.totalOrders}</p>
                    <p className="text-xs font-bold text-muted">Total Orders</p>
                  </div>
                  <div className="rounded-xl bg-success/10 p-4 text-center">
                    <p className="text-2xl font-black text-success">{analytics.completedOrders}</p>
                    <p className="text-xs font-bold text-muted">Completed</p>
                  </div>
                  <div className="rounded-xl bg-error/10 p-4 text-center">
                    <p className="text-2xl font-black text-error">{analytics.cancelledOrders}</p>
                    <p className="text-xs font-bold text-muted">Cancelled</p>
                  </div>
                  <div className="rounded-xl bg-warning/10 p-4 text-center">
                    <p className="text-2xl font-black text-warning">{analytics.returnedOrders}</p>
                    <p className="text-xs font-bold text-muted">Returned/Refunded</p>
                  </div>
                </div>
              ) : null}
            </Panel>
          </>
        ) : !error ? (
          <EmptyState
            icon="📊"
            title="No spending data yet"
            description="Start shopping on ShopNest to see your spending insights here."
            action={
              <a
                href="/products"
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-hover"
              >
                Explore Products
              </a>
            }
          />
        ) : null}
      </div>
    </DashboardShell>
  );
}
