"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getSellerHealthScore,
  SellerHealthData,
  getSalesForecast,
  SalesForecastData,
  getDemandHeatmap,
  DemandHeatmapData,
  simulateGrowthScenario,
  GrowthSimulationResult,
  simulateCampaign,
  CampaignSimulationResult,
  getCustomerSegments,
  CustomerSegmentsData,
  getChurnPredictor,
  ChurnPredictorData,
  getProfitabilityAnalysis,
  ProfitabilityData,
  getSellerGoals,
  SellerGoalItem,
  createSellerGoal,
  deleteSellerGoal,
  getAbExperiments,
  AbExperimentData,
  createAbExperiment,
} from "@/lib/api/seller-intelligence";
import { getProducts, Product } from "@/lib/api/products";
import { useSession } from "@/lib/auth-client";
import { clientFetch } from "@/lib/core/client";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { ConfidenceForecastChart } from "@/components/analytics/ConfidenceForecastChart";
import { DemandHeatmapGrid } from "@/components/analytics/DemandHeatmapGrid";
import { DonutChart } from "@/components/analytics/DonutChart";
import { AiCommerceCopilot } from "@/components/ai/AiCommerceCopilot";
import {
  FaSyncAlt,
  FaChartLine,
  FaCalendarAlt,
  FaFlask,
  FaUsers,
  FaMoneyBillWave,
  FaBullseye,
  FaExchangeAlt,
  FaBoxOpen,
  FaArrowRight,
  FaPlus,
  FaTrashAlt,
  FaStore,
} from "react-icons/fa";

type ActiveTabType =
  | "overview"
  | "forecast"
  | "heatmap"
  | "simulator"
  | "segments"
  | "profitability"
  | "goals"
  | "ab_testing";

export default function SellerDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<ActiveTabType>("overview");

  // Core Data State
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [healthData, setHealthData] = useState<SellerHealthData | null>(null);
  const [forecastData, setForecastData] = useState<SalesForecastData | null>(null);
  const [heatmapData, setHeatmapData] = useState<DemandHeatmapData | null>(null);
  const [segmentsData, setSegmentsData] = useState<CustomerSegmentsData | null>(null);
  const [churnData, setChurnData] = useState<ChurnPredictorData | null>(null);
  const [profitData, setProfitData] = useState<ProfitabilityData | null>(null);
  const [goals, setGoals] = useState<SellerGoalItem[]>([]);
  const [experiments, setExperiments] = useState<AbExperimentData[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [heatmapTimeframe, setHeatmapTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  // Growth Simulator State
  const [selectedProdSim, setSelectedProdSim] = useState<string>("");
  const [simPrice, setSimPrice] = useState<number>(2500);
  const [simNewPrice, setSimNewPrice] = useState<number>(2250);
  const [simAdSpend, setSimAdSpend] = useState<number>(3000);
  const [simResult, setSimResult] = useState<GrowthSimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Campaign Simulator State
  const [campName, setCampName] = useState("Seasonal Flash Promo");
  const [campDiscount, setCampDiscount] = useState<number>(15);
  const [campDays, setCampDays] = useState<number>(7);
  const [campResult, setCampResult] = useState<CampaignSimulationResult | null>(null);
  const [campLoading, setCampLoading] = useState(false);

  // Goal Form State
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState<number>(50000);
  const [newGoalType, setNewGoalType] = useState<string>("revenue");
  const [goalSubmitting, setGoalSubmitting] = useState(false);

  // AB Test Form State
  const [abProduct, setAbProduct] = useState<string>("");
  const [abTitle, setAbTitle] = useState("");
  const [abType, setAbType] = useState<string>("title");
  const [abVariantA, setAbVariantA] = useState("");
  const [abVariantB, setAbVariantB] = useState("");
  const [abSubmitting, setAbSubmitting] = useState(false);

  // Fetch all live seller intelligence telemetry
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const currentUserId = (session?.user as any)?.id;

      // 1. Fetch seller orders & products in parallel
      const [ordersRes, prodsRes] = await Promise.allSettled([
        clientFetch<any[]>("/orders/seller/mine"),
        getProducts({ page: 1, limit: 100 }),
      ]);

      const resolvedOrders =
        ordersRes.status === "fulfilled"
          ? ((ordersRes.value as any)?.data ?? ordersRes.value ?? [])
          : [];
      setOrders(resolvedOrders);

      if (prodsRes.status === "fulfilled" && Array.isArray(prodsRes.value)) {
        const userProds = currentUserId
          ? prodsRes.value.filter((p) => !p.sellerId || p.sellerId === currentUserId)
          : prodsRes.value;
        const finalProds = userProds.length > 0 ? userProds : prodsRes.value;
        setProducts(finalProds);

        // Auto-select first product for simulators if not set
        if (finalProds.length > 0 && !selectedProdSim) {
          const first = finalProds[0];
          setSelectedProdSim(first.id);
          setSimPrice(first.discountPrice || first.price);
          setSimNewPrice(Math.round((first.discountPrice || first.price) * 0.9));
        }
      }

      // 2. Fetch Intelligence features
      const [
        healthRes,
        forecastRes,
        heatmapRes,
        segmentsRes,
        churnRes,
        profitRes,
        goalsRes,
        expRes,
      ] = await Promise.allSettled([
        getSellerHealthScore(),
        getSalesForecast(),
        getDemandHeatmap(heatmapTimeframe),
        getCustomerSegments(),
        getChurnPredictor(),
        getProfitabilityAnalysis(),
        getSellerGoals(),
        getAbExperiments(),
      ]);

      if (healthRes.status === "fulfilled" && healthRes.value) setHealthData(healthRes.value);
      if (forecastRes.status === "fulfilled" && forecastRes.value) setForecastData(forecastRes.value);
      if (heatmapRes.status === "fulfilled" && heatmapRes.value) setHeatmapData(heatmapRes.value);
      if (segmentsRes.status === "fulfilled" && segmentsRes.value) setSegmentsData(segmentsRes.value);
      if (churnRes.status === "fulfilled" && churnRes.value) setChurnData(churnRes.value);
      if (profitRes.status === "fulfilled" && profitRes.value) setProfitData(profitRes.value);
      if (goalsRes.status === "fulfilled" && Array.isArray(goalsRes.value)) setGoals(goalsRes.value);
      if (expRes.status === "fulfilled" && Array.isArray(expRes.value)) setExperiments(expRes.value);
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session, heatmapTimeframe, selectedProdSim]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Demand Heatmap Timeframe Change
  const handleTimeframeChange = async (tf: "7d" | "30d" | "90d") => {
    setHeatmapTimeframe(tf);
    try {
      const res = await getDemandHeatmap(tf);
      if (res) setHeatmapData(res);
    } catch {
      // Handled
    }
  };

  // Product Selection for Growth Simulator
  const handleProductSelectForSim = (prodId: string) => {
    setSelectedProdSim(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      const current = prod.discountPrice || prod.price;
      setSimPrice(current);
      setSimNewPrice(Math.round(current * 0.9));
    }
  };

  // Run Growth Simulation
  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    try {
      const res = await simulateGrowthScenario({
        productId: selectedProdSim,
        currentPrice: Number(simPrice),
        newPrice: Number(simNewPrice),
        adSpend: Number(simAdSpend),
        inventoryExpansion: 20,
      });
      setSimResult(res);
    } catch {
      // Handled
    } finally {
      setSimLoading(false);
    }
  };

  // Run Campaign Simulation
  const handleRunCampaignSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCampLoading(true);
    try {
      const res = await simulateCampaign({
        campaignName: campName,
        discountPercent: Number(campDiscount),
        durationDays: Number(campDays),
        targetSegment: "all",
      });
      setCampResult(res);
    } catch {
      // Handled
    } finally {
      setCampLoading(false);
    }
  };

  // Create Goal
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    setGoalSubmitting(true);
    try {
      const created = await createSellerGoal({
        title: newGoalTitle,
        metricType: newGoalType,
        targetValue: Number(newGoalTarget),
        deadline: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        unit: newGoalType === "revenue" ? "৳" : newGoalType === "rating" ? "★" : "units",
      });
      setGoals((prev) => [created, ...prev]);
      setNewGoalTitle("");
    } catch {
      // Handled
    } finally {
      setGoalSubmitting(false);
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteSellerGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch {
      // Handled
    }
  };

  // Create A/B Experiment
  const handleCreateAbExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!abTitle.trim() || !abVariantA.trim() || !abVariantB.trim()) return;
    setAbSubmitting(true);
    try {
      const created = await createAbExperiment({
        productId: abProduct || "catalog-item",
        productTitle: abTitle,
        testType: abType,
        variantAValue: abVariantA,
        variantBValue: abVariantB,
      });
      setExperiments((prev) => [created, ...prev]);
      setAbTitle("");
      setAbVariantA("");
      setAbVariantB("");
    } catch {
      // Handled
    } finally {
      setAbSubmitting(false);
    }
  };

  // Real KPI Aggregates
  const totalStoreRevenue = useMemo(() => {
    const currentUserId = (session?.user as any)?.id;
    return orders.reduce((sum, o) => {
      // If order has items breakdown, sum seller items
      if (Array.isArray(o.items) && o.items.length > 0) {
        const sellerItems = currentUserId
          ? o.items.filter((it: any) => it.sellerId === currentUserId)
          : o.items;
        const itemsTotal = (sellerItems.length > 0 ? sellerItems : o.items).reduce(
          (s: number, it: any) => s + (it.price || 0) * (it.quantity || 1),
          0
        );
        return sum + (itemsTotal || o.totalAmount || 0);
      }
      return sum + (o.totalAmount || 0);
    }, 0);
  }, [orders, session]);

  const deliveredOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "delivered").length,
    [orders]
  );
  const totalOrdersCount = orders.length;
  const pendingFulfillmentCount = useMemo(
    () =>
      orders.filter((o) =>
        ["pending", "confirmed", "processing", "shipped", "out_for_delivery"].includes(o.status)
      ).length,
    [orders]
  );
  const uniqueBuyersCount = useMemo(
    () => new Set(orders.map((o) => o.userId).filter(Boolean)).size,
    [orders]
  );

  const rawHealthScore = healthData?.overallHealth ?? 0;
  const healthTierNote =
    rawHealthScore >= 80
      ? "Optimal rating tier"
      : rawHealthScore >= 50
      ? "Ready for Growth"
      : "Store Setup Phase";

  return (
    <DashboardShell
      role="Seller"
      title="Seller Growth & Intelligence Hub"
      subtitle="Real-time telemetry, AI-driven sales forecasting, demand analytics, profit modeling, and active growth experiments."
      links={sellerDashboardLinks}
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-text hover:border-primary transition cursor-pointer disabled:opacity-50"
          >
            <FaSyncAlt className={`text-primary ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Live Sync"}</span>
          </button>
          <Link
            href="/dashboard/seller/products/new"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm transition"
          >
            <FaPlus size={10} />
            <span>Add Product</span>
          </Link>
        </div>
      }
    >
      {/* Interactive Tabs Navigation */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { id: "overview", label: "Store Overview", icon: <FaStore /> },
          { id: "forecast", label: "Sales Forecast", icon: <FaChartLine /> },
          { id: "heatmap", label: "Demand Heatmap", icon: <FaCalendarAlt /> },
          { id: "simulator", label: "Simulators", icon: <FaFlask /> },
          { id: "segments", label: "Segments & Churn", icon: <FaUsers /> },
          { id: "profitability", label: "Profitability", icon: <FaMoneyBillWave /> },
          { id: "goals", label: "Goals & KPIs", icon: <FaBullseye /> },
          { id: "ab_testing", label: "A/B Testing", icon: <FaExchangeAlt /> },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as ActiveTabType)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === t.id
                ? "bg-primary text-white shadow-md shadow-primary/25 font-black"
                : "bg-surface text-muted hover:bg-muted-bg hover:text-text border border-border"
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TOP SUMMARY STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard
          icon="৳"
          label="Total Store Revenue"
          value={`৳${totalStoreRevenue.toLocaleString()}`}
          note={`${totalOrdersCount} order(s) placed`}
        />
        <StatCard
          icon="📦"
          label="Orders Fulfilled"
          value={String(deliveredOrdersCount)}
          note={`${pendingFulfillmentCount} pending fulfillment`}
        />
        <StatCard
          icon="🛡️"
          label="Seller Health Index"
          value={`${rawHealthScore}/100`}
          note={healthTierNote}
        />
        <StatCard
          icon="👥"
          label="Active Store Buyers"
          value={uniqueBuyersCount > 0 ? `${uniqueBuyersCount} Customer(s)` : "0 Customers"}
          note={uniqueBuyersCount > 0 ? "Verified store buyers" : "Awaiting first order"}
        />
      </div>

      {/* TAB 1: STORE OVERVIEW & HEALTH */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            {/* Health Score Gauge & Breakdown */}
            <Panel title="🩺 Store Health Index">
              <div className="py-2">
                <GaugeMeter
                  score={rawHealthScore}
                  title="Store Health Index"
                  size={170}
                  type="health"
                />
              </div>

              <div className="mt-4 space-y-2">
                {healthData &&
                  Object.entries(healthData.metrics).map(([key, m]) => {
                    const formattedKey = key.replace(/([A-Z])/g, " $1");
                    const isOptimal = m.score >= m.target;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-xl border border-border bg-surface/50 p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              m.status === "unrated" || m.status === "pending_orders"
                                ? "bg-muted"
                                : isOptimal
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span className="text-muted capitalize">{formattedKey}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-text">
                            {m.score}
                            {m.unit}
                          </span>
                          <span className="text-[10px] text-muted">/ target {m.target}{m.unit}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Panel>

            {/* Actionable Blueprint & Next Steps */}
            <Panel title="Actionable Improvement Blueprint">
              <div className="space-y-3">
                {healthData?.recommendations && healthData.recommendations.length > 0 ? (
                  healthData.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-muted-bg/30 p-3.5 text-xs"
                    >
                      <span className="text-primary font-bold text-sm shrink-0">💡</span>
                      <p className="text-text font-medium leading-relaxed">{rec}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-border bg-muted-bg/20 p-5 text-center text-xs text-muted">
                    Your storefront profile is healthy and operational. Continue managing catalog inventory.
                  </div>
                )}
              </div>

              {/* Quick Actions Footer */}
              <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("simulator")}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer"
                >
                  <FaFlask size={11} />
                  <span>Launch Growth Simulator</span>
                  <FaArrowRight size={10} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("forecast")}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-text hover:border-primary transition cursor-pointer"
                >
                  <FaChartLine size={11} className="text-primary" />
                  <span>View 30-Day Forecast</span>
                </button>
                <Link
                  href="/dashboard/seller/inventory"
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-text hover:border-primary transition cursor-pointer"
                >
                  <FaBoxOpen size={11} className="text-muted" />
                  <span>Smart Inventory</span>
                </Link>
              </div>
            </Panel>
          </div>

          {/* Quick Catalog Snapshot */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-bold text-muted uppercase">Active Catalog Size</p>
              <p className="mt-1 text-xl font-black text-text">{products.length} Products</p>
              <p className="mt-1 text-[11px] text-muted">
                {products.length >= 5
                  ? "Catalog size provides strong discovery"
                  : "Add more items to boost sales velocity"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-bold text-muted uppercase">Pending Dispatch</p>
              <p className="mt-1 text-xl font-black text-amber-500">
                {pendingFulfillmentCount} Order(s)
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {pendingFulfillmentCount > 0 ? "Awaiting packing & shipping" : "All orders up to date"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-bold text-muted uppercase">Completed Deliveries</p>
              <p className="mt-1 text-xl font-black text-emerald-500">
                {deliveredOrdersCount} Delivered
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {deliveredOrdersCount > 0 ? "Successfully fulfilled orders" : "First delivery in progress"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI SALES FORECASTING */}
      {activeTab === "forecast" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Panel title="📈 AI 30-Day Sales & Revenue Forecasting">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary/10 border border-primary/20 p-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  Projection Summary
                </span>
                <h3 className="text-base font-black text-text">
                  Expected 30-Day Revenue: ৳{(forecastData?.expectedRevenue ?? 0).toLocaleString()} (
                  {forecastData?.growthRateProjected || "0%"})
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Expected Order Volume: {forecastData?.expectedOrders ?? 0} order(s)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-surface border border-border px-3 py-1 text-xs font-black text-primary shadow-xs">
                  {forecastData?.confidenceScore ?? 50}% Model Confidence
                </span>
              </div>
            </div>

            {forecastData?.forecastDaily && forecastData.forecastDaily.length > 0 ? (
              <ConfidenceForecastChart data={forecastData.forecastDaily} />
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 text-center">
                <FaChartLine className="text-3xl text-muted/50 mb-2" />
                <p className="text-xs font-bold text-text">Awaiting Initial Sales Velocity</p>
                <p className="text-[11px] text-muted max-w-sm mt-1">
                  Once your store records its first sales, the machine learning engine will generate daily confidence bands and growth trajectories.
                </p>
              </div>
            )}

            <div className="mt-4 rounded-xl bg-muted-bg p-3.5 text-xs text-muted space-y-1">
              <p className="font-semibold text-text">ℹ️ Model Methodology & Telemetry:</p>
              <p>{forecastData?.limitations || "Exponential smoothing projection with weekly seasonal weighting."}</p>
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 3: DEMAND HEATMAP */}
      {activeTab === "heatmap" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Panel
            title="🗓️ Weekly Demand & Category Saturation Heatmap"
            action={
              <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1 text-xs">
                {(["7d", "30d", "90d"] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => handleTimeframeChange(tf)}
                    className={`rounded-lg px-2.5 py-1 font-bold transition cursor-pointer ${
                      heatmapTimeframe === tf
                        ? "bg-primary text-white"
                        : "text-muted hover:text-text"
                    }`}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            }
          >
            {heatmapData?.heatmapData && heatmapData.heatmapData.length > 0 ? (
              <DemandHeatmapGrid
                data={heatmapData.heatmapData}
                days={heatmapData.days || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
              />
            ) : (
              <div className="flex h-40 items-center justify-center text-xs text-muted">
                Loading category demand matrix...
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-xs font-bold text-muted uppercase">Peak Shopping Windows</p>
                <p className="mt-1 text-sm font-black text-text">
                  {heatmapData?.peakDays || "Friday & Saturday (Weekend Evening Peaks)"}
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  Higher buyer checkout frequency observed during weekend evenings.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-xs font-bold text-muted uppercase">Top Demand Category</p>
                <p className="mt-1 text-sm font-black text-primary">
                  {heatmapData?.topCategory || "General Catalog"}
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  Highest engagement density category on marketplace.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 4: GROWTH & CAMPAIGN SIMULATORS */}
      {activeTab === "simulator" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Price & Growth Simulator */}
            <Panel title="🧪 'What-If' Price & Growth Simulator">
              <form onSubmit={handleRunSimulation} className="space-y-4">
                {products.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-text mb-1">Select Catalog Product</label>
                    <select
                      value={selectedProdSim}
                      onChange={(e) => handleProductSelectForSim(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text cursor-pointer"
                    >
                      <option value="">Custom Item (Enter values manually)</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} — Current: ৳{(p.discountPrice || p.price).toLocaleString()} (Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text mb-1">Current Price (৳)</label>
                    <input
                      type="number"
                      value={simPrice}
                      onChange={(e) => setSimPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text mb-1">Proposed New Price (৳)</label>
                    <input
                      type="number"
                      value={simNewPrice}
                      onChange={(e) => setSimNewPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-text"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">Allocated Ad Spend (৳)</label>
                  <input
                    type="number"
                    value={simAdSpend}
                    onChange={(e) => setSimAdSpend(Number(e.target.value))}
                    placeholder="e.g. 3000"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-text"
                  />
                </div>

                <button
                  type="submit"
                  disabled={simLoading}
                  className="w-full rounded-xl bg-primary py-2.5 text-xs font-black text-white hover:bg-primary-hover transition cursor-pointer disabled:opacity-50"
                >
                  {simLoading ? "Calculating Model..." : "Calculate Scenario Impact"}
                </button>
              </form>

              {simResult && (
                <div className="mt-5 rounded-2xl bg-muted-bg/60 border border-border p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-xs font-extrabold text-text">Projected Economic Lift</span>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      +{simResult.projectedImpact.estimatedExtraOrders} Extra Units
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-surface p-2.5 border border-border">
                      <p className="text-[10px] text-muted font-bold">Sales Volume</p>
                      <p className="text-sm font-black text-primary">{simResult.projectedImpact.salesVolumeChange}</p>
                    </div>
                    <div className="rounded-xl bg-surface p-2.5 border border-border">
                      <p className="text-[10px] text-muted font-bold">Revenue</p>
                      <p className="text-sm font-black text-emerald-500">{simResult.projectedImpact.revenueChange}</p>
                    </div>
                    <div className="rounded-xl bg-surface p-2.5 border border-border">
                      <p className="text-[10px] text-muted font-bold">Gross Margin</p>
                      <p className="text-sm font-black text-text">{simResult.projectedImpact.grossMarginImpact}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted leading-relaxed pt-1">💡 {simResult.strategicInsight}</p>
                </div>
              )}
            </Panel>

            {/* Campaign ROI Simulator */}
            <Panel title="📢 AI Campaign Impact Simulator">
              <form onSubmit={handleRunCampaignSimulation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Campaign Event Name</label>
                  <input
                    type="text"
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text mb-1">Discount (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={campDiscount}
                      onChange={(e) => setCampDiscount(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text mb-1">Duration (Days)</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={campDays}
                      onChange={(e) => setCampDays(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-text"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={campLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-primary py-2.5 text-xs font-black text-white hover:opacity-95 transition cursor-pointer disabled:opacity-50"
                >
                  {campLoading ? "Modeling ROI..." : "Estimate Campaign ROI"}
                </button>
              </form>

              {campResult && (
                <div className="mt-5 rounded-2xl bg-muted-bg/60 border border-border p-4 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-surface p-2.5 border border-border">
                      <span className="text-muted text-[10px]">Estimated Reach:</span>
                      <p className="font-black text-text">{campResult.estimatedReach}</p>
                    </div>
                    <div className="rounded-xl bg-surface p-2.5 border border-border">
                      <span className="text-muted text-[10px]">Expected Orders:</span>
                      <p className="font-black text-primary">{campResult.expectedOrders}</p>
                    </div>
                    <div className="rounded-xl bg-surface p-2.5 border border-border">
                      <span className="text-muted text-[10px]">Gross Revenue:</span>
                      <p className="font-black text-text">{campResult.grossRevenue}</p>
                    </div>
                    <div className="rounded-xl bg-surface p-2.5 border border-border">
                      <span className="text-muted text-[10px]">Net Revenue:</span>
                      <p className="font-black text-emerald-500">{campResult.netRevenue}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-text">
                    🛡️ {campResult.riskScore} • {campResult.recommendedDuration}
                  </p>
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* TAB 5: CUSTOMER SEGMENTS & CHURN */}
      {activeTab === "segments" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* RFM Segments */}
            <Panel title="👥 RFM Customer Segmentation">
              {segmentsData && segmentsData.totalCustomersTracked > 0 ? (
                <>
                  <DonutChart
                    data={
                      segmentsData.segments.map((s, i) => ({
                        label: s.name,
                        value: s.percentage,
                        color: ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"][i % 4],
                      })) || []
                    }
                    centerLabel="Total Buyers"
                    centerValue={String(segmentsData.totalCustomersTracked)}
                  />

                  <div className="mt-5 space-y-2">
                    {segmentsData.segments.map((seg, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-text">
                            {seg.name} ({seg.customerCount} buyer{seg.customerCount !== 1 ? "s" : ""})
                          </p>
                          <p className="text-[10px] text-muted">
                            AOV: {seg.avgOrderValue} • Repeat Freq: {seg.repeatFrequency}
                          </p>
                        </div>
                        <span className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                          {seg.recommendedAction}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-10 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <FaUsers size={24} />
                  </div>
                  <h4 className="text-sm font-black text-text">0 Active Buyers Recorded</h4>
                  <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                    Customer segmentation maps automatically into VIP Champions, Loyal Repeaters, and First-Timers as orders arrive.
                  </p>
                  <Link
                    href="/dashboard/seller/coupons"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm transition"
                  >
                    <span>Create Welcome Discount Coupon</span>
                    <FaArrowRight size={10} />
                  </Link>
                </div>
              )}
            </Panel>

            {/* Churn Risk Predictor */}
            <Panel title="⚠️ Customer Retention & Churn Risk">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5">
                  <p className="text-[10px] font-bold text-rose-500 uppercase">High Risk</p>
                  <p className="text-xl font-black text-rose-500">
                    {churnData?.riskTiers.highRisk.percentage ?? 0}%
                  </p>
                  <p className="text-[10px] text-muted mt-1">
                    {churnData?.riskTiers.highRisk.count ?? 0} buyer(s)
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                  <p className="text-[10px] font-bold text-amber-500 uppercase">Medium Risk</p>
                  <p className="text-xl font-black text-amber-500">
                    {churnData?.riskTiers.mediumRisk.percentage ?? 0}%
                  </p>
                  <p className="text-[10px] text-muted mt-1">
                    {churnData?.riskTiers.mediumRisk.count ?? 0} buyer(s)
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">Low Risk / Active</p>
                  <p className="text-xl font-black text-emerald-500">
                    {churnData?.riskTiers.lowRisk.percentage ?? 0}%
                  </p>
                  <p className="text-[10px] text-muted mt-1">
                    {churnData?.riskTiers.lowRisk.count ?? 0} buyer(s)
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <h4 className="text-xs font-bold uppercase text-muted">Recommended Retention Automations</h4>
                {churnData?.retentionTriggers && churnData.retentionTriggers.length > 0 ? (
                  churnData.retentionTriggers.map((trig, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-text">{trig.trigger}</p>
                        <p className="text-[10px] text-muted">{trig.targetCount} targeted account(s)</p>
                      </div>
                      <span className="font-black text-emerald-500">{trig.projectedWinBack}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted">No pending retention automations.</p>
                )}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* TAB 6: PROFITABILITY */}
      {activeTab === "profitability" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Panel title="💵 Store Net Profitability Waterfall">
            <div className="grid gap-4 sm:grid-cols-4 text-center">
              <div className="rounded-2xl bg-muted-bg border border-border p-4">
                <p className="text-[11px] font-semibold text-muted">Gross Revenue</p>
                <p className="mt-1 text-xl font-black text-text">
                  ৳{(profitData?.summary.revenue ?? totalStoreRevenue).toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl bg-muted-bg border border-border p-4">
                <p className="text-[11px] font-semibold text-muted">Estimated COGS (~60%)</p>
                <p className="mt-1 text-xl font-black text-rose-500">
                  -৳{(profitData?.summary.cogs ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl bg-muted-bg border border-border p-4">
                <p className="text-[11px] font-semibold text-muted">Platform & Delivery Fees</p>
                <p className="mt-1 text-xl font-black text-muted">
                  -৳{((profitData?.summary.deliveryCost ?? 0) + (profitData?.summary.marketingCost ?? 0)).toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4">
                <p className="text-[11px] font-semibold text-emerald-500">
                  Estimated Net Profit ({profitData?.summary.netMarginPercent || "0%"})
                </p>
                <p className="mt-1 text-xl font-black text-emerald-500">
                  ৳{(profitData?.summary.estimatedNetProfit ?? 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase text-muted mb-3">Top Margin Catalog Items</h4>
              {profitData?.topProfitableProducts && profitData.topProfitableProducts.length > 0 ? (
                <div className="space-y-3">
                  {profitData.topProfitableProducts.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface p-3.5 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">
                          #{i + 1}
                        </span>
                        <div>
                          <p className="font-bold text-text">{p.title}</p>
                          <p className="text-[11px] text-muted">
                            Sold: {p.sold || 0} unit(s) • Revenue: ৳{(p.revenue || 0).toLocaleString()} • Margin: {p.marginPercent}%
                          </p>
                        </div>
                      </div>
                      <span className="font-black text-emerald-500">
                        Net: +৳{(p.netProfit || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-muted-bg/30 p-6 text-center text-xs text-muted">
                  Add products to your catalog to analyze margin waterfall and profitability rankings.
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 7: GOALS & KPIS */}
      {activeTab === "goals" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Panel title="🎯 Seller Goals & KPI Tracking">
            <form
              onSubmit={handleCreateGoal}
              className="mb-6 grid gap-3 sm:grid-cols-4 rounded-2xl border border-border bg-muted-bg/30 p-4"
            >
              <input
                type="text"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Goal Title (e.g. Q3 Sales Milestone)"
                className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text"
              />
              <input
                type="number"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                placeholder="Target Value"
                className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-text"
              />
              <select
                value={newGoalType}
                onChange={(e) => setNewGoalType(e.target.value)}
                className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text cursor-pointer"
              >
                <option value="revenue">৳ Revenue Milestone</option>
                <option value="orders">📦 Orders Fulfilled</option>
                <option value="products">🛍️ Active Products</option>
                <option value="customers">👥 Unique Buyers</option>
                <option value="rating">⭐ Store Rating (1-5)</option>
              </select>
              <button
                type="submit"
                disabled={goalSubmitting}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer disabled:opacity-50"
              >
                {goalSubmitting ? "Adding..." : "+ Add KPI Goal"}
              </button>
            </form>

            {goals.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {goals.map((g) => {
                  const percent = Math.min(100, Math.round(((g.currentValue || 0) / (g.targetValue || 1)) * 100));
                  const isAchieved = percent >= 100;
                  return (
                    <div
                      key={g.id}
                      className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                            {g.metricType} goal
                          </span>
                          <h4 className="text-sm font-black text-text">{g.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                              isAchieved
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {isAchieved ? "Achieved" : `${percent}%`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteGoal(g.id)}
                            className="text-muted hover:text-rose-500 text-xs p-1 transition cursor-pointer"
                            title="Delete goal"
                          >
                            <FaTrashAlt size={11} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-muted">
                            {g.unit}
                            {(g.currentValue || 0).toLocaleString()} / {g.unit}
                            {(g.targetValue || 0).toLocaleString()}
                          </span>
                          <span className="text-primary font-black">{percent}%</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted-bg">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isAchieved ? "bg-emerald-500" : "bg-primary"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {g.recommendations && g.recommendations.length > 0 && (
                        <p className="text-[11px] text-muted pt-2 border-t border-border">
                          💡 {g.recommendations[0]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-muted-bg/20 p-8 text-center space-y-2">
                <FaBullseye className="mx-auto text-2xl text-muted" />
                <p className="text-xs font-bold text-text">No Custom KPI Goals Set</p>
                <p className="text-[11px] text-muted max-w-sm mx-auto">
                  Set revenue, order volume, or catalog expansion targets using the form above to track your progress.
                </p>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* TAB 8: A/B TESTING */}
      {activeTab === "ab_testing" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Panel title="🅰️🅱️ Product Presentation A/B Split Testing">
            <form
              onSubmit={handleCreateAbExperiment}
              className="mb-6 space-y-3 rounded-2xl border border-border bg-muted-bg/30 p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {products.length > 0 ? (
                  <select
                    value={abProduct}
                    onChange={(e) => {
                      setAbProduct(e.target.value);
                      const p = products.find((x) => x.id === e.target.value);
                      if (p) {
                        setAbTitle(p.title);
                        setAbVariantA(p.title);
                        setAbVariantB(`[AI Optimized] Premium ${p.title}`);
                      }
                    }}
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text cursor-pointer"
                  >
                    <option value="">Select Catalog Item to Test</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={abTitle}
                    onChange={(e) => setAbTitle(e.target.value)}
                    placeholder="Product Title for Split Test"
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-text"
                  />
                )}

                <select
                  value={abType}
                  onChange={(e) => setAbType(e.target.value)}
                  className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text cursor-pointer"
                >
                  <option value="title">Product Title Experiment</option>
                  <option value="description">Description Copy Split Test</option>
                  <option value="pricing">Price Elasticity Variant</option>
                  <option value="badge">Promotional Badge Test</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={abVariantA}
                  onChange={(e) => setAbVariantA(e.target.value)}
                  placeholder="Variant A (Original Text/Value)"
                  className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-text"
                />
                <input
                  type="text"
                  value={abVariantB}
                  onChange={(e) => setAbVariantB(e.target.value)}
                  placeholder="Variant B (AI Optimized Text/Value)"
                  className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-text"
                />
              </div>

              <button
                type="submit"
                disabled={abSubmitting}
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer disabled:opacity-50"
              >
                {abSubmitting ? "Launching..." : "+ Launch Split Test Experiment"}
              </button>
            </form>

            {experiments.length > 0 ? (
              <div className="grid gap-4">
                {experiments.map((exp) => (
                  <div
                    key={exp.id}
                    className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                          {exp.testType} experiment
                        </span>
                        <h4 className="text-sm font-black text-text">{exp.productTitle}</h4>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          exp.winner === "variantB" || exp.winner === "variantA"
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {exp.winner === "variantB"
                          ? `Winner: Variant B (+${(exp as any).liftPercent || 15}% Lift)`
                          : exp.winner === "variantA"
                          ? "Winner: Variant A (Baseline)"
                          : "Status: Live Experimenting"}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Variant A */}
                      <div className="rounded-xl border border-border p-3.5 bg-muted-bg/30 space-y-2">
                        <span className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-black text-muted uppercase">
                          Variant A (Original)
                        </span>
                        <p className="text-xs font-bold text-text truncate" title={exp.variantA.value}>
                          {exp.variantA.value}
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                          <div>
                            <p className="text-[10px] text-muted">Views</p>
                            <p className="font-black text-text">{(exp.variantA.views || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted">Orders</p>
                            <p className="font-black text-text">{exp.variantA.orders || 0}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted">Conv.</p>
                            <p className="font-black text-text">{exp.variantA.conversionRate || 0}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Variant B */}
                      <div className="rounded-xl border-2 border-primary/50 p-3.5 bg-primary/5 space-y-2">
                        <span className="rounded-md bg-primary text-white px-2 py-0.5 text-[10px] font-black uppercase">
                          Variant B (AI Optimized)
                        </span>
                        <p className="text-xs font-bold text-text truncate" title={exp.variantB.value}>
                          {exp.variantB.value}
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                          <div>
                            <p className="text-[10px] text-muted">Views</p>
                            <p className="font-black text-text">{(exp.variantB.views || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted">Orders</p>
                            <p className="font-black text-primary">{exp.variantB.orders || 0}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted">Conv.</p>
                            <p className="font-black text-emerald-500">{exp.variantB.conversionRate || 0}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-muted-bg/20 p-8 text-center space-y-2">
                <FaExchangeAlt className="mx-auto text-2xl text-muted" />
                <p className="text-xs font-bold text-text">No Active A/B Split Tests</p>
                <p className="text-[11px] text-muted max-w-sm mx-auto">
                  Launch a split test on product titles or descriptions to empirically increase your store conversion rate.
                </p>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* Floating AI Seller Business Copilot */}
      <AiCommerceCopilot role="seller" />
    </DashboardShell>
  );
}
