"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getSellerAnalytics, SellerAnalyticsData } from "@/lib/api/seller-intelligence";
import { LineAreaChart } from "@/components/analytics/LineAreaChart";
import { BarChart } from "@/components/analytics/BarChart";
import { DonutChart } from "@/components/analytics/DonutChart";
import { formatCurrency } from "@/lib/utils";
import { EmptyState, ErrorState, LoadingGrid, LoadingChart } from "@/components/dashboard/DashboardStates";

export default function SellerAnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [data, setData] = useState<SellerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = (selectedRange: string) => {
    setLoading(true);
    setError(null);
    getSellerAnalytics(selectedRange)
      .then(setData)
      .catch(() => setError("Failed to load analytics data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData(range);
  }, [range]);

  const lineChartData = (data?.trendPoints || []).map((p) => ({
    label: p.label,
    value: p.revenue,
  }));

  const barChartData = (data?.trendPoints || []).map((p) => ({
    label: p.label,
    value: p.orders,
  }));

  return (
    <DashboardShell
      role="Seller"
      title="Sales Analytics"
      subtitle="Revenue, orders, and product performance for your store."
      links={sellerDashboardLinks}
    >
      <div className="grid gap-6">
        {/* Time Range Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4">
          <span className="text-xs font-bold uppercase text-muted">Time Period</span>
          <div className="flex items-center gap-1 rounded-xl bg-muted-bg p-1">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  range === r ? "bg-primary text-white shadow-sm" : "text-muted hover:text-text"
                }`}
              >
                {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={() => loadData(range)} />}

        {/* KPI Cards */}
        <section>
          {loading ? (
            <LoadingGrid count={4} />
          ) : data?.hasEnoughData ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="💰" label="Revenue" value={formatCurrency(data.kpis.totalRevenue)} note="Gross revenue" color="success" />
              <StatCard icon="📦" label="Orders" value={String(data.kpis.totalOrders)} note="Total orders" color="default" />
              <StatCard icon="🛍️" label="Units Sold" value={String(data.kpis.productsSold)} note="Products dispatched" color="accent" />
              <StatCard icon="📊" label="Avg Order Value" value={formatCurrency(data.kpis.avgOrderValue)} note="Per order" color="secondary" />
            </div>
          ) : (
            <EmptyState icon="📊" title="No sales data" description="Start receiving orders to see your analytics here." />
          )}
        </section>

        {/* Charts */}
        {data?.hasEnoughData && (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Revenue Trend">
                {lineChartData.length > 0 ? (
                  <LineAreaChart data={lineChartData} color="var(--color-chart-2)" height={260} />
                ) : (
                  <div className="flex h-48 items-center justify-center text-xs text-muted">No revenue data</div>
                )}
              </Panel>
              <Panel title="Order Volume">
                {barChartData.length > 0 ? (
                  <BarChart data={barChartData} color="var(--color-chart-1)" height={260} />
                ) : (
                  <div className="flex h-48 items-center justify-center text-xs text-muted">No order data</div>
                )}
              </Panel>
            </div>

            {/* Top Products */}
            {data.topProducts && data.topProducts.length > 0 && (
              <Panel title="Top Products">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th className="pb-3 font-bold">Product</th>
                        <th className="pb-3 font-bold">Price</th>
                        <th className="pb-3 font-bold">Sold</th>
                        <th className="pb-3 font-bold">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {data.topProducts.map((prod) => (
                        <tr key={prod.id} className="transition hover:bg-muted-bg/50">
                          <td className="py-3 font-bold text-text max-w-[220px] truncate">{prod.title}</td>
                          <td className="py-3 font-semibold text-text">{formatCurrency(prod.price)}</td>
                          <td className="py-3 font-black text-primary">{prod.sold} units</td>
                          <td className="py-3 font-black text-success">{formatCurrency(prod.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
