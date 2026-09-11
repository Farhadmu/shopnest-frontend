"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { LoadingGrid, LoadingChart, ErrorState, EmptyState } from "@/components/dashboard/DashboardStates";
import {
  getSellerHealthScore,
  getSalesForecast,
  getProfitabilityAnalysis,
  getInventoryIntelligence,
  getCustomerInsights,
  getSellerAnalytics,
} from "@/lib/api/seller-intelligence";
import { getMyStore } from "@/lib/api/sellers";
import { clientFetch } from "@/lib/core/client";
import { LineAreaChart } from "@/components/analytics/LineAreaChart";
import { FaSyncAlt, FaStore, FaShieldAlt } from "react-icons/fa";

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
  const [profitData, setProfitData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        ordersRes,
        storeRes,
        trustRes,
        healthRes,
        profitRes,
        inventoryRes,
        customerRes,
        analyticsRes,
      ] = await Promise.allSettled([
        clientFetch<any[]>("/orders/seller/mine"),
        getMyStore(),
        clientFetch<any>("/trust/me"),
        getSellerHealthScore(),
        getProfitabilityAnalysis(),
        getInventoryIntelligence(),
        getCustomerInsights(),
        getSellerAnalytics("30d"),
      ]);

      const orders = ordersRes.status === "fulfilled" ? ((ordersRes.value as any)?.data ?? ordersRes.value ?? []) : [];
      const store = storeRes.status === "fulfilled" ? storeRes.value : null;
      const trust = trustRes.status === "fulfilled" ? ((trustRes.value as any)?.data ?? trustRes.value ?? null) : null;
      const health = healthRes.status === "fulfilled" ? healthRes.value : null;
      const inventory = inventoryRes.status === "fulfilled" ? inventoryRes.value : null;

      // Extract seller-isolated revenue & products sold
      const storeIdVariants = new Set([
        store?.id,
        store?._id,
        store?.slug,
        store?.ownerId,
      ].filter(Boolean));

      let totalRevenue = 0;
      let productsSold = 0;

      orders.forEach((o: any) => {
        (o.items || []).forEach((it: any) => {
          if (storeIdVariants.has(it.storeId) || storeIdVariants.has(it.sellerId)) {
            totalRevenue += (it.price || 0) * (it.quantity || 1);
            productsSold += it.quantity || 1;
          }
        });
      });

      const totalOrders = orders.length;
      const activeProducts = inventory?.summary?.totalItems || 0;
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
        storeRating: store?.rating || 5.0,
        trustScore: trust?.trustScore ?? (health?.overallHealth || 100),
      });

      if (health) setHealthData(health);
      if (profitRes.status === "fulfilled") setProfitData(profitRes.value);
      if (inventory) setInventoryData(inventory);
      if (customerRes.status === "fulfilled") setCustomerData(customerRes.value);
      if (analyticsRes.status === "fulfilled") setAnalyticsData(analyticsRes.value);
    } catch {
      setError("Failed to load command center telemetry. Please try again.");
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
      subtitle="Real-time multi-dimensional telemetry, order fulfillment pipeline, and automated inventory intelligence"
      links={sellerDashboardLinks}
    >
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-text">
              Real-Time Telemetry Live Sync
            </span>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted-bg px-3 py-1.5 text-xs font-bold text-text transition hover:border-primary/50 hover:text-primary disabled:opacity-50"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} size={11} /> Refresh Data
          </button>
        </div>

        {error && <ErrorState message={error} onRetry={loadData} />}

        {/* Key Metrics */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-wider text-muted mb-3">Core Performance KPIs</h2>
          {loading ? (
            <LoadingGrid count={6} />
          ) : metrics ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard icon="💰" value={`৳${metrics.totalRevenue.toLocaleString()}`} label="Store Revenue" note="From store items" color="success" />
              <StatCard icon="📦" value={String(metrics.totalOrders)} label="Total Orders" note="All-time orders" color="default" />
              <StatCard icon="🛍️" value={String(metrics.productsSold)} label="Units Dispatched" note="Sold products" color="accent" />
              <StatCard icon="📋" value={String(metrics.activeProducts)} label="Catalog Items" note="Monitored SKUs" color="secondary" />
              <StatCard icon="⭐" value={`${metrics.storeRating.toFixed(1)}/5.0`} label="Store Rating" note="Customer reviews" color="warning" />
              <StatCard icon="🛡️" value={`${metrics.trustScore}/100`} label="Trust Score" note="Platform verified" color="success" />
            </div>
          ) : (
            <EmptyState icon="📊" title="No data available" description="Start selling to see your metrics here." />
          )}
        </section>

        {/* Order Fulfillment Pipeline */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-wider text-muted mb-3">Fulfillment Pipeline</h2>
          {loading ? (
            <LoadingGrid count={4} />
          ) : metrics ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="⏳" value={String(metrics.pendingOrders)} label="Pending" note="Awaiting review" color="warning" />
              <StatCard icon="⚙️" value={String(metrics.processingOrders)} label="In Processing" note="Packaging & preparing" color="default" />
              <StatCard icon="✅" value={String(metrics.deliveredOrders)} label="Delivered" note="Completed orders" color="success" />
              <StatCard icon="❌" value={String(metrics.cancelledOrders)} label="Cancelled" note="Voided orders" color="error" />
            </div>
          ) : null}
        </section>

        {/* Analytics Charts */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-wider text-muted mb-3">30-Day Sales Velocity</h2>
          {loading ? (
            <LoadingChart />
          ) : analyticsData?.trendPoints && analyticsData.trendPoints.length > 0 ? (
            <Panel title="Revenue & Orders Trend (Last 30 Days)">
              <LineAreaChart
                data={analyticsData.trendPoints.map((p: any) => ({ label: p.label, value: p.revenue, secondary: p.orders }))}
              />
            </Panel>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-xs text-muted">
              30-day sales timeline will plot automatically as soon as customer checkouts occur.
            </div>
          )}
        </section>

        {/* Inventory Overview */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-wider text-muted mb-3">Stock & Catalog Health</h2>
          {loading ? (
            <LoadingGrid count={4} />
          ) : inventoryData?.summary ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="📦" value={String(inventoryData.summary.totalItems || 0)} label="Monitored SKUs" note="Catalog products" color="default" />
              <StatCard icon="⚠️" value={String(inventoryData.summary.lowStockCount || 0)} label="Low Stock Alert" note="<= 10 units remaining" color="warning" />
              <StatCard icon="🚫" value={String(inventoryData.summary.outOfStockCount || 0)} label="Stockout SKUs" note="Zero inventory" color="error" />
              <StatCard icon="✅" value={String(inventoryData.summary.healthyStockCount || 0)} label="Healthy Runway" note="Adequate stock" color="success" />
            </div>
          ) : (
            <EmptyState icon="📦" title="No inventory data" description="Add products to see inventory insights." />
          )}
        </section>

        {/* Customer Insights */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-wider text-muted mb-3">Buyer Insights & Retention</h2>
          {loading ? (
            <LoadingGrid count={3} />
          ) : customerData?.overview ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard icon="👥" value={String(customerData.overview.totalCustomers || 0)} label="Unique Buyers" note="Verified buyers" color="default" />
              <StatCard icon="🔄" value={String(customerData.overview.repeatPurchaseRate || "0%")} label="Repeat Purchase Rate" note="Loyal customers" color="success" />
              <StatCard icon="💳" value={String(customerData.overview.averageLifetimeValue || "৳0")} label="Average Buyer LTV" note="Lifetime customer value" color="accent" />
            </div>
          ) : (
            <EmptyState icon="👥" title="No customer data" description="Customer insights will appear after your first sales." />
          )}
        </section>

        {/* Profitability Overview */}
        {profitData?.summary && (
          <section>
            <h2 className="text-sm font-black uppercase tracking-wider text-muted mb-3">Profitability Analysis</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="💵" value={`৳${(profitData.summary.revenue || 0).toLocaleString()}`} label="Gross Revenue" note="Store sales volume" color="success" />
              <StatCard icon="📦" value={`৳${(profitData.summary.cogs || 0).toLocaleString()}`} label="Estimated COGS" note="Cost of goods (60%)" color="default" />
              <StatCard icon="📊" value={`৳${(profitData.summary.grossProfit || 0).toLocaleString()}`} label="Gross Margin" note="Revenue - COGS" color="warning" />
              <StatCard icon="📈" value={String(profitData.summary.netMarginPercent || "0%")} label="Net Margin" note="Estimated net return" color="accent" />
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}

