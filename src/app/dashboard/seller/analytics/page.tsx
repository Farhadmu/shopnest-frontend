"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getSellerAnalytics, SellerAnalyticsData } from "@/lib/api/seller-intelligence";
import { LineAreaChart } from "@/components/analytics/LineAreaChart";
import { BarChart } from "@/components/analytics/BarChart";
import { DonutChart } from "@/components/analytics/DonutChart";
import { formatCurrency } from "@/lib/utils";
import { FaExclamationCircle } from "react-icons/fa";

export default function SellerAnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "3m" | "6m" | "1y">("30d");
  const [data, setData] = useState<SellerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = (selectedRange: string) => {
    setLoading(true);
    getSellerAnalytics(selectedRange)
      .then(setData)
      .catch(() => null)
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

  const donutChartData = (data?.categoryPerformance || []).map((c) => ({
    label: c.category,
    value: c.revenue,
  }));

  return (
    <DashboardShell
      role="Seller"
      title="Advanced Seller Commerce Analytics"
      subtitle="Interactive revenue intelligence, order growth trends, conversion rates, catalog performance, and category shares."
      links={sellerDashboardLinks}
    >
      <div className="grid gap-6">
        {/* Time Range Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-muted">Analysis Horizon:</span>
            <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-black text-primary">
              {range.toUpperCase()} Active
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-muted-bg p-1">
            {(["7d", "30d", "3m", "6m", "1y"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-muted-bg" />
                  <div className="h-4 w-24 rounded-lg bg-muted-bg" />
                </div>
                <div className="h-8 w-32 rounded-lg bg-muted-bg mb-2" />
                <div className="h-3 w-20 rounded-lg bg-muted-bg" />
              </div>
            ))}
          </div>
        ) : !data ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-surface">
            <div className="text-center">
              <span className="text-3xl">📊</span>
              <p className="mt-2 text-sm font-bold text-muted">No analytics data available</p>
              <p className="text-xs text-muted">Please try again later</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon="💰"
                label="Gross Store Revenue"
                value={formatCurrency(data.kpis?.totalRevenue || 0)}
                note="Platform GMV share"
                trend={data.kpis?.customerGrowth || "0%"}
              />
              <StatCard
                icon="📦"
                label="Total Orders Placed"
                value={data.kpis?.totalOrders || 0}
                note={`${data.kpis?.productsSold || 0} products sold`}
              />
              <StatCard
                icon="🎯"
                label="Store Conversion Rate"
                value={`${data.kpis?.conversionRate || 0}%`}
                note="Visitors to checkout ratio"
                trend="Live Metric"
              />
              <StatCard
                icon="🏷️"
                label="Average Order Value"
                value={formatCurrency(data.kpis?.avgOrderValue || 0)}
                note="Per transaction benchmark"
              />
            </div>

            {/* Interactive Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel
                title="Revenue Velocity & Trend"
                action={
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    Revenue (৳)
                  </span>
                }
              >
                <p className="mb-4 text-xs text-muted">
                  Gross sales revenue progression across the selected time horizon.
                </p>
                {lineChartData.length > 0 ? (
                  <LineAreaChart
                    data={lineChartData}
                    color="var(--color-chart-2)"
                    height={260}
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border">
                    <div className="text-center">
                      <span className="text-2xl">📈</span>
                      <p className="mt-2 text-xs text-muted">No revenue data for this period</p>
                    </div>
                  </div>
                )}
              </Panel>

              <Panel
                title="Order Volume Trajectory"
                action={
                  <span className="rounded-lg bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                    Order Count
                  </span>
                }
              >
                <p className="mb-4 text-xs text-muted">
                  Unit order volumes fulfilled during each reporting period.
                </p>
                {barChartData.length > 0 ? (
                  <BarChart
                    data={barChartData}
                    color="var(--color-chart-1)"
                    height={260}
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border">
                    <div className="text-center">
                      <span className="text-2xl">📦</span>
                      <p className="mt-2 text-xs text-muted">No order data for this period</p>
                    </div>
                  </div>
                )}
              </Panel>
            </div>

            {/* Category Share & Top Products */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <Panel title="Category Revenue Share">
                  <div className="flex flex-col items-center">
                    {donutChartData.length > 0 ? (
                      <>
                        <DonutChart
                          data={donutChartData}
                          size={200}
                        />
                        <div className="mt-4 grid w-full gap-2">
                          {(data.categoryPerformance || []).map((cat) => (
                            <div key={cat.category} className="flex items-center justify-between rounded-xl bg-muted-bg p-2.5 text-xs">
                              <span className="font-bold text-text">{cat.category}</span>
                              <span className="font-black text-success">
                                {formatCurrency(cat.revenue)} ({cat.share}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex h-48 items-center justify-center">
                        <div className="text-center">
                          <span className="text-2xl">🏷️</span>
                          <p className="mt-2 text-xs text-muted">No category data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Panel>
              </div>

              <div className="lg:col-span-2">
                <Panel title="Top Performing Catalog Items">
                  {data.topProducts && data.topProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted">
                            <th className="pb-3 font-bold">Product</th>
                            <th className="pb-3 font-bold">Price</th>
                            <th className="pb-3 font-bold">Sold</th>
                            <th className="pb-3 font-bold">Revenue</th>
                            <th className="pb-3 font-bold">Conversion</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {(data.topProducts || []).map((prod) => (
                            <tr key={prod.id} className="transition hover:bg-muted-bg/50">
                              <td className="py-3 font-bold text-text max-w-[220px] truncate">{prod.title}</td>
                              <td className="py-3 font-semibold text-text">{formatCurrency(prod.price)}</td>
                              <td className="py-3 font-black text-primary">{prod.sold} units</td>
                              <td className="py-3 font-black text-success">{formatCurrency(prod.revenue)}</td>
                              <td className="py-3">
                                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-bold text-success">
                                  {prod.conversion}
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
                        <span className="text-2xl">🏆</span>
                        <p className="mt-2 text-xs text-muted">No product data available</p>
                      </div>
                    </div>
                  )}
                </Panel>
              </div>
            </div>

            {/* Low Performing Products & Optimization Suggestions */}
            {data.lowPerformingProducts && data.lowPerformingProducts.length > 0 && (
              <Panel
                title="Catalog Optimization & Attention Required"
                action={
                  <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-warning">
                    Actionable Growth Leads
                  </span>
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {(data.lowPerformingProducts || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm"
                    >
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs font-black text-amber-500">
                            <FaExclamationCircle size={11} /> {item.issue}
                          </span>
                          <span className="text-xs font-bold text-muted">Stock: {item.stock}</span>
                        </div>
                        <h3 className="font-extrabold text-text">{item.title}</h3>
                        <p className="mt-1 text-xs text-muted">
                          Only {item.sold} sold ({item.views} views recorded)
                        </p>
                      </div>
                      <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs">
                        <p className="font-bold text-primary">AI Suggestion:</p>
                        <p className="mt-0.5 text-muted leading-relaxed">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
