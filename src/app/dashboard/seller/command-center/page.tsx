"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { LoadingGrid, LoadingChart, ErrorState, EmptyState } from "@/components/dashboard/DashboardStates";
import { LineAreaChart } from "@/components/analytics/LineAreaChart";
import {
  getSellerHealthScore,
  getSalesForecast,
  getProfitabilityAnalysis,
  getInventoryIntelligence,
  getCustomerInsights,
  getSellerAnalytics,
  SellerHealthData,
  SalesForecastData,
  ProfitabilityData,
  InventoryIntelligenceData,
  CustomerInsightsData,
  SellerAnalyticsData,
} from "@/lib/api/seller-intelligence";

export default function SellerCommandCenter() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<SellerHealthData | null>(null);
  const [forecastData, setForecastData] = useState<SalesForecastData | null>(null);
  const [profitData, setProfitData] = useState<ProfitabilityData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryIntelligenceData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerInsightsData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<SellerAnalyticsData | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, forecastRes, profitRes, inventoryRes, customerRes, analyticsRes] = await Promise.allSettled([
        getSellerHealthScore(),
        getSalesForecast(),
        getProfitabilityAnalysis(),
        getInventoryIntelligence(),
        getCustomerInsights(),
        getSellerAnalytics("30d"),
      ]);

      if (healthRes.status === "fulfilled") setHealthData(healthRes.value);
      if (forecastRes.status === "fulfilled") setForecastData(forecastRes.value);
      if (profitRes.status === "fulfilled") setProfitData(profitRes.value);
      if (inventoryRes.status === "fulfilled") setInventoryData(inventoryRes.value);
      if (customerRes.status === "fulfilled") setCustomerData(customerRes.value);
      if (analyticsRes.status === "fulfilled") setAnalyticsData(analyticsRes.value);
    } catch {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <DashboardShell
      role="Seller"
      title="Store Overview"
      subtitle="Real-time analytics, forecasting, customer intelligence, profitability and growth tools for your store."
      links={sellerDashboardLinks}
    >
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={loadData} />}

        <section>
          <h2 className="text-lg font-bold text-text mb-4">Key Metrics</h2>
          {loading ? (
            <LoadingGrid count={4} />
          ) : analyticsData?.hasEnoughData ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="৳" value={`৳${analyticsData.kpis.totalRevenue.toLocaleString()}`} label="Total Revenue" note="From completed orders" color="success" />
              <StatCard icon="📦" value={String(analyticsData.kpis.totalOrders)} label="Total Orders" note="All time" color="default" />
              <StatCard icon="🛍️" value={String(analyticsData.kpis.productsSold)} label="Products Sold" note="Units dispatched" color="accent" />
              <StatCard icon="📊" value={`৳${analyticsData.kpis.avgOrderValue.toLocaleString()}`} label="Avg Order Value" note="Per order" color="secondary" />
            </div>
          ) : (
            <EmptyState icon="📊" title="No sales data yet" description="Add products and start receiving orders to see your metrics here." />
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold text-text mb-4">Store Health</h2>
          {loading ? (
            <LoadingGrid count={3} />
          ) : healthData?.hasEnoughData ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard icon="⭐" value={`${healthData.overallHealth}/100`} label="Health Score" note="Based on performance" color="success" />
              <StatCard icon="✅" value={`${healthData.metrics.deliveryReliability.score}%`} label="Delivery Reliability" note="On-time delivery" color="default" />
              <StatCard icon="🔄" value={`${healthData.metrics.returnRate.score}%`} label="Return Rate" note="Product returns" color="warning" />
            </div>
          ) : (
            <EmptyState icon="🏥" title="Not enough data" description={healthData?.recommendations?.[0] || "Start receiving orders to calculate your store health score."} />
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold text-text mb-4">Sales Trend (30 Days)</h2>
          {loading ? (
            <LoadingChart />
          ) : analyticsData?.trendPoints && analyticsData.trendPoints.length > 0 ? (
            <Panel title="Revenue & Orders Trend">
              <LineAreaChart data={analyticsData.trendPoints.map((p) => ({ label: p.label, value: p.revenue, secondary: p.orders }))} />
            </Panel>
          ) : (
            <EmptyState icon="📈" title="No analytics data" description="Not enough sales data to generate analytics yet." />
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold text-text mb-4">Inventory Overview</h2>
          {loading ? (
            <LoadingGrid count={4} />
          ) : inventoryData?.hasEnoughData ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="📦" value={String(inventoryData.summary.totalItems)} label="Total Items" note="Active products" color="default" />
              <StatCard icon="⚠️" value={String(inventoryData.summary.lowStockCount)} label="Low Stock" note="Needs restock" color="warning" />
              <StatCard icon="🚫" value={String(inventoryData.summary.outOfStockCount)} label="Out of Stock" note="Unavailable" color="error" />
              <StatCard icon="✅" value={String(inventoryData.summary.healthyStockCount)} label="Healthy Stock" note="Adequate stock" color="success" />
            </div>
          ) : (
            <EmptyState icon="📦" title="No inventory data" description="Add products to see inventory insights." />
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold text-text mb-4">Customer Insights</h2>
          {loading ? (
            <LoadingGrid count={3} />
          ) : customerData?.hasEnoughData ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard icon="👥" value={String(customerData.overview.totalCustomers)} label="Total Customers" note="All buyers" color="default" />
              <StatCard icon="🔄" value={`${customerData.overview.repeatPurchaseRate}%`} label="Repeat Rate" note="Returning buyers" color="success" />
              <StatCard icon="💳" value={`৳${customerData.overview.averageOrderValue.toLocaleString()}`} label="Avg Order Value" note="Per order" color="accent" />
            </div>
          ) : (
            <EmptyState icon="👥" title="No customer data" description="Customer insights will appear after your first sales." />
          )}
        </section>

        {profitData?.hasCostData && profitData.summary && (
          <section>
            <h2 className="text-lg font-bold text-text mb-4">Profit Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="💵" value={`৳${profitData.summary.revenue.toLocaleString()}`} label="Revenue" note="Gross revenue" color="success" />
              <StatCard icon="📉" value={`৳${profitData.summary.totalCost.toLocaleString()}`} label="Total Cost" note="Product costs" color="warning" />
              <StatCard icon="📊" value={`৳${profitData.summary.grossProfit.toLocaleString()}`} label="Gross Profit" note="After costs" color="default" />
              <StatCard icon="📈" value={profitData.summary.netMarginPercent} label="Net Margin" note="Profit margin" color="accent" />
            </div>
          </section>
        )}

        {forecastData?.hasEnoughData && (
          <section>
            <h2 className="text-lg font-bold text-text mb-4">30-Day Forecast</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard icon="💰" value={`৳${(forecastData.expectedRevenue || 0).toLocaleString()}`} label="Expected Revenue" note="Next 30 days" color="success" />
              <StatCard icon="📦" value={String(forecastData.expectedOrders || 0)} label="Expected Orders" note="Next 30 days" color="default" />
              <StatCard icon="🎯" value={`${forecastData.confidenceScore || 0}%`} label="Confidence" note="Forecast reliability" color="accent" />
            </div>
            <p className="mt-2 text-xs text-muted">Forecast is based on your store&apos;s historical order velocity. Actual results may vary.</p>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
