"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { LoadingCard, LoadingGrid, LoadingChart, ErrorState, EmptyState } from "@/components/dashboard/DashboardStates";
import { getSellerHealthScore, getSalesForecast, getProfitabilityAnalysis, getInventoryIntelligence, getCustomerInsights, getSellerAnalytics } from "@/lib/api/seller-intelligence";
import { getSellerDashboardMetrics } from "@/lib/api/sellers";
import { getOrders } from "@/lib/api/orders";
import { getProducts } from "@/lib/api/products";
import { BarChart } from "@/components/analytics/BarChart";
import { DonutChart } from "@/components/analytics/DonutChart";
import { LineAreaChart } from "@/components/analytics/LineAreaChart";

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  productsSold: number;
  activeProducts: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
  storeRating: number;
  trustScore: number;
}

export default function SellerCommandCenter() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [profitData, setProfitData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, ordersRes, productsRes, healthRes, forecastRes, profitRes, inventoryRes, customerRes, analyticsRes] = await Promise.allSettled([
        getSellerDashboardMetrics(),
        getOrders(),
        getProducts(),
        getSellerHealthScore(),
        getSalesForecast(),
        getProfitabilityAnalysis(),
        getInventoryIntelligence(),
        getCustomerInsights(),
        getSellerAnalytics("30d"),
      ]);

      // Process orders for metrics
      const orders = ordersRes.status === "fulfilled" ? (ordersRes.value || []) : [];
      const products = productsRes.status === "fulfilled" ? (productsRes.value || []) : [];

      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const productsSold = orders.reduce((sum: number, o: any) => sum + ((o.items || []).reduce((s: number, i: any) => s + (i.quantity || 0), 0)), 0);
      const activeProducts = products.filter((p: any) => p.status === "approved" && !p.isDeleted).length;
      const pendingOrders = orders.filter((o: any) => o.status === "pending").length;
      const processingOrders = orders.filter((o: any) => o.status === "processing" || o.status === "confirmed").length;
      const deliveredOrders = orders.filter((o: any) => o.status === "delivered").length;
      const cancelledOrders = orders.filter((o: any) => o.status === "cancelled").length;
      const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      setMetrics({
        totalRevenue,
        totalOrders,
        productsSold,
        activeProducts,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        avgOrderValue,
        storeRating: 4.5,
        trustScore: healthRes.status === "fulfilled" ? (healthRes.value?.overallHealth || 85) : 85,
      });

      if (healthRes.status === "fulfilled") setHealthData(healthRes.value);
      if (forecastRes.status === "fulfilled") setForecastData(forecastRes.value);
      if (profitRes.status === "fulfilled") setProfitData(profitRes.value);
      if (inventoryRes.status === "fulfilled") setInventoryData(inventoryRes.value);
      if (customerRes.status === "fulfilled") setCustomerData(customerRes.value);
      if (analyticsRes.status === "fulfilled") setAnalyticsData(analyticsRes.value);
    } catch (err) {
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
      title="Seller Command Center"
      subtitle="Real-time insights, analytics, and AI-powered tools for your store"
      links={sellerDashboardLinks}
    >
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={loadData} />}

        {/* KPI Cards */}
        <section>
          <h2 className="text-lg font-bold text-text mb-4">Key Metrics</h2>
          {loading ? (
            <LoadingGrid count={6} />
          ) : metrics ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard icon="💰" value={`৳${metrics.totalRevenue.toLocaleString()}`} label="Total Revenue" note="From delivered orders" color="success" />
              <StatCard icon="📦" value={String(metrics.totalOrders)} label="Total Orders" note="All time" color="default" />
              <StatCard icon="🛍️" value={String(metrics.productsSold)} label="Products Sold" note="Units dispatched" color="accent" />
              <StatCard icon="📋" value={String(metrics.activeProducts)} label="Active Products" note="Live in store" color="secondary" />
              <StatCard icon="⏳" value={String(metrics.pendingOrders)} label="Pending Orders" note="Awaiting processing" color="warning" />
              <StatCard icon="🚚" value={String(metrics.deliveredOrders)} label="Delivered" note="Successfully completed" color="success" />
            </div>
          ) : (
            <EmptyState icon="📊" title="No data available" description="Start selling to see your metrics here." />
          )}
        </section>

        {/* Order Status Breakdown */}
        <section>
          <h2 className="text-lg font-bold text-text mb-4">Order Status</h2>
          {loading ? (
            <LoadingGrid count={4} />
          ) : metrics ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="⏳" value={String(metrics.pendingOrders)} label="Pending" note="Awaiting processing" color="warning" />
              <StatCard icon="⚙️" value={String(metrics.processingOrders)} label="Processing" note="In progress" color="default" />
              <StatCard icon="✅" value={String(metrics.deliveredOrders)} label="Delivered" note="Completed" color="success" />
              <StatCard icon="❌" value={String(metrics.cancelledOrders)} label="Cancelled" note="Order cancelled" color="error" />
            </div>
          ) : null}
        </section>

        {/* Analytics Charts */}
        <section>
          <h2 className="text-lg font-bold text-text mb-4">Sales Analytics (30 Days)</h2>
          {loading ? (
            <LoadingChart />
          ) : analyticsData?.trendPoints ? (
            <Panel title="Revenue & Orders Trend">
              <LineAreaChart
                data={analyticsData.trendPoints.map((p: any) => ({ label: p.label, value: p.revenue, secondary: p.orders }))}
              />
            </Panel>
          ) : (
            <EmptyState icon="📈" title="No analytics data" description="Not enough sales data to generate analytics yet." />
          )}
        </section>

        {/* Inventory Overview */}
        <section>
          <h2 className="text-lg font-bold text-text mb-4">Inventory Overview</h2>
          {loading ? (
            <LoadingGrid count={4} />
          ) : inventoryData?.summary ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="📦" value={String(inventoryData.summary.totalItems || 0)} label="Total Items" note="Active products" color="default" />
              <StatCard icon="⚠️" value={String(inventoryData.summary.lowStockCount || 0)} label="Low Stock" note="Needs restock" color="warning" />
              <StatCard icon="🚫" value={String(inventoryData.summary.outOfStockCount || 0)} label="Out of Stock" note="Unavailable" color="error" />
              <StatCard icon="✅" value={String(inventoryData.summary.healthyStockCount || 0)} label="Healthy Stock" note="Adequate stock" color="success" />
            </div>
          ) : (
            <EmptyState icon="📦" title="No inventory data" description="Add products to see inventory insights." />
          )}
        </section>

        {/* Customer Insights */}
        <section>
          <h2 className="text-lg font-bold text-text mb-4">Customer Insights</h2>
          {loading ? (
            <LoadingGrid count={3} />
          ) : customerData?.overview ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard icon="👥" value={String(customerData.overview.totalCustomers || 0)} label="Total Customers" note="All buyers" color="default" />
              <StatCard icon="🔄" value={`${customerData.overview.repeatPurchaseRate || 0}%`} label="Repeat Rate" note="Returning buyers" color="success" />
              <StatCard icon="💳" value={`৳${(customerData.overview.averageLifetimeValue || 0).toLocaleString()}`} label="Avg Lifetime Value" note="Per customer" color="accent" />
            </div>
          ) : (
            <EmptyState icon="👥" title="No customer data" description="Customer insights will appear after your first sales." />
          )}
        </section>

        {/* Profit Overview */}
        {profitData?.summary && (
          <section>
            <h2 className="text-lg font-bold text-text mb-4">Profit Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="💵" value={`৳${(profitData.summary.revenue || 0).toLocaleString()}`} label="Revenue" note="Gross revenue" color="success" />
              <StatCard icon="🏷️" value={`৳${(profitData.summary.totalDiscounts || 0).toLocaleString()}`} label="Discounts" note="Total discounts" color="warning" />
              <StatCard icon="📊" value={`৳${(profitData.summary.grossProfit || 0).toLocaleString()}`} label="Gross Profit" note="After COGS" color="default" />
              <StatCard icon="📈" value={`${profitData.summary.netMarginPercent || 0}%`} label="Net Margin" note="Profit margin" color="accent" />
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
