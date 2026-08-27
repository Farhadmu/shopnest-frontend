"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
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
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { ConfidenceForecastChart } from "@/components/analytics/ConfidenceForecastChart";
import { DemandHeatmapGrid } from "@/components/analytics/DemandHeatmapGrid";
import { DonutChart } from "@/components/analytics/DonutChart";
import { BarChart } from "@/components/analytics/BarChart";
import { AiCommerceCopilot } from "@/components/ai/AiCommerceCopilot";

import { clientFetch } from "@/lib/core/client";

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "forecast" | "heatmap" | "simulator" | "segments" | "profitability" | "goals" | "ab_testing"
  >("overview");

  // State
  const [orders, setOrders] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<SellerHealthData | null>(null);
  const [forecastData, setForecastData] = useState<SalesForecastData | null>(null);
  const [heatmapData, setHeatmapData] = useState<DemandHeatmapData | null>(null);
  const [segmentsData, setSegmentsData] = useState<CustomerSegmentsData | null>(null);
  const [churnData, setChurnData] = useState<ChurnPredictorData | null>(null);
  const [profitData, setProfitData] = useState<ProfitabilityData | null>(null);
  const [goals, setGoals] = useState<SellerGoalItem[]>([]);
  const [experiments, setExperiments] = useState<AbExperimentData[]>([]);

  // Simulator Form State
  const [simPrice, setSimPrice] = useState(2500);
  const [simNewPrice, setSimNewPrice] = useState(2300);
  const [simAdSpend, setSimAdSpend] = useState(5000);
  const [simResult, setSimResult] = useState<GrowthSimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Campaign Form State
  const [campDiscount, setCampDiscount] = useState(15);
  const [campDays, setCampDays] = useState(7);
  const [campResult, setCampResult] = useState<CampaignSimulationResult | null>(null);

  // Goal Form State
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState(500000);
  const [newGoalType, setNewGoalType] = useState("revenue");

  // AB Test Form State
  const [abTitle, setAbTitle] = useState("");
  const [abVariantA, setAbVariantA] = useState("");
  const [abVariantB, setAbVariantB] = useState("");

  useEffect(() => {
    clientFetch<any[]>("/orders/seller/mine")
      .then((r) => setOrders((r as any).data ?? r ?? []))
      .catch(() => setOrders([]));

    Promise.all([
      getSellerHealthScore().catch(() => null),
      getSalesForecast().catch(() => null),
      getDemandHeatmap("30d").catch(() => null),
      getCustomerSegments().catch(() => null),
      getChurnPredictor().catch(() => null),
      getProfitabilityAnalysis().catch(() => null),
      getSellerGoals().catch(() => []),
      getAbExperiments().catch(() => []),
    ]).then(([healthRes, foreRes, heatRes, segRes, churnRes, profRes, goalsRes, expRes]) => {
      if (healthRes) setHealthData(healthRes);
      if (foreRes) setForecastData(foreRes);
      if (heatRes) setHeatmapData(heatRes);
      if (segRes) setSegmentsData(segRes);
      if (churnRes) setChurnData(churnRes);
      if (profRes) setProfitData(profRes);
      if (goalsRes) setGoals(goalsRes);
      if (expRes) setExperiments(expRes);
    });
  }, []);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    try {
      const res = await simulateGrowthScenario({
        currentPrice: simPrice,
        newPrice: simNewPrice,
        adSpend: simAdSpend,
        inventoryExpansion: 20,
      });
      setSimResult(res);
    } catch {
      // handled
    } finally {
      setSimLoading(false);
    }
  };

  const handleRunCampaignSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await simulateCampaign({
        campaignName: "Seasonal Flash Event",
        discountPercent: campDiscount,
        durationDays: campDays,
        targetSegment: "all",
      });
      setCampResult(res);
    } catch {
      // handled
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    try {
      const created = await createSellerGoal({
        title: newGoalTitle,
        metricType: newGoalType,
        targetValue: Number(newGoalTarget),
        deadline: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        unit: newGoalType === "revenue" ? "৳" : "units",
      });
      setGoals((prev) => [created, ...prev]);
      setNewGoalTitle("");
    } catch {
      // handled
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteSellerGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch {
      // handled
    }
  };

  const handleCreateAbExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!abTitle.trim() || !abVariantA.trim() || !abVariantB.trim()) return;
    try {
      const created = await createAbExperiment({
        productId: "prod-ab",
        productTitle: abTitle,
        testType: "title",
        variantAValue: abVariantA,
        variantBValue: abVariantB,
      });
      setExperiments((prev) => [created, ...prev]);
      setAbTitle("");
      setAbVariantA("");
      setAbVariantB("");
    } catch {
      // handled
    }
  };

  const links = [
    { label: "Store Overview", href: "#overview", icon: "📊", description: "Health score and performance summary." },
    { label: "Advanced Analytics", href: "/seller/analytics", icon: "📈", description: "Multi-range sales & conversion." },
    { label: "Sales Forecasting", href: "/seller/forecast", icon: "🔮", description: "Predictive revenue projections." },
    { label: "Smart Inventory", href: "/seller/inventory", icon: "📦", description: "Stockout risk & restock priorities." },
    { label: "Store Health", href: "/seller/store-health", icon: "🩺", description: "87/100 performance telemetry." },
    { label: "Customer Insights", href: "/seller/customers", icon: "👥", description: "New vs repeat customer metrics." },
    { label: "Demand Heatmap", href: "#heatmap", icon: "🗓️", description: "Day-of-week intensity matrix." },
    { label: "Growth Simulators", href: "#simulator", icon: "🧪", description: "Price elasticity & campaign ROI." },
    { label: "Customer Segments", href: "#segments", icon: "👥", description: "RFM distribution & churn risk." },
    { label: "Profitability", href: "#profitability", icon: "💵", description: "Gross & net margin breakdown." },
    { label: "Goals & KPIs", href: "#goals", icon: "🎯", description: "Monthly revenue & order milestones." },
    { label: "A/B Experiments", href: "#ab_testing", icon: "🅰️", description: "Split-test titles and pricing." },
  ];

  return (
    <DashboardShell
      role="Seller"
      title="Seller Growth & Intelligence Hub"
      subtitle="Supercharge your storefront with AI forecasting, demand heatmaps, business simulators, profit analyzers, and automated A/B experimentation."
      links={links}
    >
      {/* Interactive Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { id: "overview", label: "📊 Store Overview" },
          { id: "forecast", label: "📈 Sales Forecast" },
          { id: "heatmap", label: "🗓️ Demand Heatmap" },
          { id: "simulator", label: "🧪 Simulators" },
          { id: "segments", label: "👥 Segments & Churn" },
          { id: "profitability", label: "💵 Profitability" },
          { id: "goals", label: "🎯 Goals & KPIs" },
          { id: "ab_testing", label: "🅰️🅱️ A/B Testing" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === t.id
                ? "bg-primary text-white shadow-md shadow-primary/25"
                : "bg-surface text-muted hover:bg-muted-bg hover:text-text border border-border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: STORE OVERVIEW & HEALTH */}
      {activeTab === "overview" && (() => {
        const totalStoreRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const deliveredOrdersCount = orders.filter((o) => o.status === "delivered").length;
        const totalOrdersCount = orders.length;
        const pendingFulfillmentCount = orders.filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "processing" || o.status === "shipped").length;
        const uniqueBuyersCount = new Set(orders.map((o) => o.userId)).size;

        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                label="Seller Health"
                value={`${healthData?.overallHealth || 90}/100`}
                note="Optimal rating tier"
              />
              <StatCard
                icon="👥"
                label="Active Buyers"
                value={uniqueBuyersCount > 0 ? `${uniqueBuyersCount} Customer(s)` : "0 Customers"}
                note={uniqueBuyersCount > 0 ? "Verified store buyers" : "Awaiting first order"}
              />
            </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            {/* Health Score Gauge & Breakdown */}
            <Panel title="🩺 Store Health Score">
              <GaugeMeter score={healthData?.overallHealth || 87} title="Store Health Index" size={170} type="health" />

              <div className="mt-4 space-y-2">
                {healthData &&
                  Object.entries(healthData.metrics).map(([key, m]) => (
                    <div key={key} className="flex items-center justify-between rounded-xl border border-border p-2.5 text-xs">
                      <span className="text-muted capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <span className="font-bold text-text">
                        {m.score}
                        {m.unit}
                      </span>
                    </div>
                  ))}
              </div>
            </Panel>

            {/* Recommendations & Quick Actions */}
            <Panel title="Actionable Improvement Blueprint">
              <div className="space-y-3">
                {healthData?.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-muted-bg/30 p-3.5 text-xs">
                    <span className="text-primary font-bold text-sm">💡</span>
                    <p className="text-text font-medium leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("simulator")}
                  className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer"
                >
                  Launch Growth Simulator →
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("forecast")}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text hover:border-primary transition cursor-pointer"
                >
                  View 30-Day Forecast →
                </button>
              </div>
            </Panel>
          </div>
        </div>
        );
      })()}

      {/* TAB 2: AI SALES FORECASTING */}
      {activeTab === "forecast" && (
        <div className="space-y-6">
          <Panel title="📈 AI 30-Day Sales & Revenue Forecasting">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary/10 border border-primary/20 p-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Projection Summary</span>
                <h3 className="text-base font-black text-text">
                  Expected Revenue: ৳{(forecastData?.expectedRevenue || 420000).toLocaleString()} ({forecastData?.growthRateProjected || "+14.2%"})
                </h3>
              </div>
              <span className="rounded-xl bg-surface px-3 py-1 text-xs font-black text-primary shadow-xs">
                {forecastData?.confidenceScore || 88}% Confidence Model
              </span>
            </div>

            <ConfidenceForecastChart data={forecastData?.forecastDaily || []} />

            <p className="mt-4 rounded-xl bg-muted-bg p-3 text-[11px] text-muted">
              ℹ️ {forecastData?.limitations || "Forecast model uses exponential smoothing over recent 90-day order velocity."}
            </p>
          </Panel>
        </div>
      )}

      {/* TAB 3: DEMAND HEATMAP */}
      {activeTab === "heatmap" && (
        <div className="space-y-6">
          <Panel title="🗓️ Weekly Demand & Category Saturation Heatmap">
            <DemandHeatmapGrid
              data={heatmapData?.heatmapData || []}
              days={heatmapData?.days || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-xs font-bold text-muted uppercase">Peak Shopping Windows</p>
                <p className="mt-1 text-sm font-black text-text">{heatmapData?.peakDays || "Friday & Saturday (Weekend Evenings)"}</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-xs font-bold text-muted uppercase">Top Demand Category</p>
                <p className="mt-1 text-sm font-black text-primary">{heatmapData?.topCategory || "Fashion & Lifestyle"}</p>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 4: GROWTH & CAMPAIGN SIMULATORS */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Price & Growth Simulator */}
            <Panel title="🧪 'What-If' Growth Simulator">
              <form onSubmit={handleRunSimulation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Current Item Price (৳)</label>
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
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Allocated Ad Spend (৳)</label>
                  <input
                    type="number"
                    value={simAdSpend}
                    onChange={(e) => setSimAdSpend(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-text"
                  />
                </div>
                <button
                  type="submit"
                  disabled={simLoading}
                  className="w-full rounded-xl bg-primary py-2.5 text-xs font-black text-white hover:bg-primary-hover transition cursor-pointer"
                >
                  {simLoading ? "Simulating..." : "Calculate Scenario Impact"}
                </button>
              </form>

              {simResult && (
                <div className="mt-5 rounded-2xl bg-muted-bg p-4 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-surface p-2.5">
                      <p className="text-[10px] text-muted font-bold">Sales Volume</p>
                      <p className="text-sm font-black text-primary">{simResult.projectedImpact.salesVolumeChange}</p>
                    </div>
                    <div className="rounded-xl bg-surface p-2.5">
                      <p className="text-[10px] text-muted font-bold">Revenue</p>
                      <p className="text-sm font-black text-success">{simResult.projectedImpact.revenueChange}</p>
                    </div>
                    <div className="rounded-xl bg-surface p-2.5">
                      <p className="text-[10px] text-muted font-bold">Gross Margin</p>
                      <p className="text-sm font-black text-text">{simResult.projectedImpact.grossMarginImpact}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{simResult.strategicInsight}</p>
                </div>
              )}
            </Panel>

            {/* Campaign ROI Simulator */}
            <Panel title="📢 AI Campaign Impact Simulator">
              <form onSubmit={handleRunCampaignSimulation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Discount Percentage (%)</label>
                  <input
                    type="number"
                    value={campDiscount}
                    onChange={(e) => setCampDiscount(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Campaign Duration (Days)</label>
                  <input
                    type="number"
                    value={campDays}
                    onChange={(e) => setCampDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-text"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-primary py-2.5 text-xs font-black text-white hover:opacity-90 transition cursor-pointer"
                >
                  Estimate Campaign ROI
                </button>
              </form>

              {campResult && (
                <div className="mt-5 rounded-2xl bg-muted-bg p-4 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-surface p-2.5">
                      <span className="text-muted text-[10px]">Estimated Reach:</span>
                      <p className="font-black text-text">{campResult.estimatedReach}</p>
                    </div>
                    <div className="rounded-xl bg-surface p-2.5">
                      <span className="text-muted text-[10px]">Expected Orders:</span>
                      <p className="font-black text-primary">{campResult.expectedOrders}</p>
                    </div>
                    <div className="rounded-xl bg-surface p-2.5">
                      <span className="text-muted text-[10px]">Gross Revenue:</span>
                      <p className="font-black text-text">{campResult.grossRevenue}</p>
                    </div>
                    <div className="rounded-xl bg-surface p-2.5">
                      <span className="text-muted text-[10px]">Net Revenue:</span>
                      <p className="font-black text-success">{campResult.netRevenue}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-text">🛡️ {campResult.riskScore} • {campResult.recommendedDuration}</p>
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* TAB 5: CUSTOMER SEGMENTS & CHURN */}
      {activeTab === "segments" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* RFM Segments */}
            <Panel title="👥 RFM Customer Segmentation">
              <DonutChart
                data={
                  segmentsData?.segments.map((s, i) => ({
                    label: s.name,
                    value: s.percentage,
                    color: ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"][i % 4],
                  })) || []
                }
                centerLabel="Total Buyers"
                centerValue="1,420"
              />

              <div className="mt-5 space-y-2">
                {segmentsData?.segments.map((seg, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-border p-3 text-xs">
                    <div>
                      <p className="font-bold text-text">{seg.name} ({seg.customerCount} buyers)</p>
                      <p className="text-[10px] text-muted">AOV: {seg.avgOrderValue} • {seg.repeatFrequency}</p>
                    </div>
                    <span className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                      {seg.recommendedAction}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Churn Risk Predictor */}
            <Panel title="⚠️ Customer Churn Risk Tiers">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded-2xl border border-error/30 bg-error/10 p-3.5">
                  <p className="text-[10px] font-bold text-error uppercase">High Risk</p>
                  <p className="text-xl font-black text-error">{churnData?.riskTiers.highRisk.percentage || 12}%</p>
                  <p className="text-[10px] text-muted mt-1">{churnData?.riskTiers.highRisk.count || 170} buyers</p>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                  <p className="text-[10px] font-bold text-amber-600 uppercase">Medium Risk</p>
                  <p className="text-xl font-black text-amber-600">{churnData?.riskTiers.mediumRisk.percentage || 28}%</p>
                  <p className="text-[10px] text-muted mt-1">{churnData?.riskTiers.mediumRisk.count || 398} buyers</p>
                </div>
                <div className="rounded-2xl border border-success/30 bg-success/10 p-3.5">
                  <p className="text-[10px] font-bold text-success uppercase">Low Risk</p>
                  <p className="text-xl font-black text-success">{churnData?.riskTiers.lowRisk.percentage || 60}%</p>
                  <p className="text-[10px] text-muted mt-1">{churnData?.riskTiers.lowRisk.count || 852} buyers</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <h4 className="text-xs font-bold uppercase text-muted">Recommended Retention Automations</h4>
                {churnData?.retentionTriggers.map((trig, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-border p-3 text-xs">
                    <div>
                      <p className="font-bold text-text">{trig.trigger}</p>
                      <p className="text-[10px] text-muted">{trig.targetCount} targeted accounts</p>
                    </div>
                    <span className="font-black text-success">{trig.projectedWinBack}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* TAB 6: PROFITABILITY */}
      {activeTab === "profitability" && (
        <div className="space-y-6">
          <Panel title="💵 Store Net Profitability Waterfall">
            <div className="grid gap-4 sm:grid-cols-4 text-center">
              <div className="rounded-2xl bg-muted-bg p-4">
                <p className="text-[11px] font-semibold text-muted">Gross Revenue</p>
                <p className="mt-1 text-xl font-black text-text">৳{(profitData?.summary.revenue || 480000).toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-muted-bg p-4">
                <p className="text-[11px] font-semibold text-muted">Product Cost (COGS)</p>
                <p className="mt-1 text-xl font-black text-error">৳{(profitData?.summary.cogs || 295000).toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-muted-bg p-4">
                <p className="text-[11px] font-semibold text-muted">Shipping & Marketing</p>
                <p className="mt-1 text-xl font-black text-muted">৳50,000</p>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4">
                <p className="text-[11px] font-semibold text-emerald-600">Net Profit ({profitData?.summary.netMarginPercent || "18%"})</p>
                <p className="mt-1 text-xl font-black text-emerald-600">৳{(profitData?.summary.estimatedNetProfit || 85000).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase text-muted mb-3">Top Margin Generators</h4>
              <div className="space-y-3">
                {profitData?.topProfitableProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-border p-3.5 text-xs">
                    <div>
                      <p className="font-bold text-text">{p.title}</p>
                      <p className="text-[11px] text-muted">Gross: ৳{p.revenue.toLocaleString()} • Margin: {p.marginPercent}%</p>
                    </div>
                    <span className="font-black text-emerald-600">Net: +৳{p.netProfit.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 7: GOALS & KPIS */}
      {activeTab === "goals" && (
        <div className="space-y-6">
          <Panel title="🎯 Seller Goals & KPI Tracking">
            <form onSubmit={handleCreateGoal} className="mb-6 grid gap-3 sm:grid-cols-4 rounded-2xl border border-border bg-muted-bg/30 p-4">
              <input
                type="text"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Goal Title (e.g. Q3 Sales Milestone)"
                className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text"
              />
              <input
                type="number"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                placeholder="Target Value"
                className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text"
              />
              <select
                value={newGoalType}
                onChange={(e) => setNewGoalType(e.target.value)}
                className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text"
              >
                <option value="revenue">Revenue Goal</option>
                <option value="orders">Orders Goal</option>
                <option value="rating">Rating Goal</option>
              </select>
              <button
                type="submit"
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer"
              >
                + Add KPI Goal
              </button>
            </form>

            <div className="grid gap-4 sm:grid-cols-2">
              {goals.map((g) => {
                const percent = Math.min(100, Math.round((g.currentValue / (g.targetValue || 1)) * 100));
                return (
                  <div key={g.id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-primary">{g.metricType}</span>
                        <h4 className="text-sm font-black text-text">{g.title}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteGoal(g.id)}
                        className="text-muted hover:text-error text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-muted">
                          {g.unit}
                          {g.currentValue.toLocaleString()} / {g.unit}
                          {g.targetValue.toLocaleString()}
                        </span>
                        <span className="text-primary">{percent}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    {g.recommendations && g.recommendations.length > 0 && (
                      <p className="text-[11px] text-muted pt-2 border-t border-border">💡 {g.recommendations[0]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 8: A/B EXPERIMENTS */}
      {activeTab === "ab_testing" && (
        <div className="space-y-6">
          <Panel title="🅰️🅱️ Product Presentation A/B Testing">
            <form onSubmit={handleCreateAbExperiment} className="mb-6 space-y-3 rounded-2xl border border-border bg-muted-bg/30 p-4">
              <input
                type="text"
                value={abTitle}
                onChange={(e) => setAbTitle(e.target.value)}
                placeholder="Product Name for Experiment"
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-text"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={abVariantA}
                  onChange={(e) => setAbVariantA(e.target.value)}
                  placeholder="Variant A (Original Title/Text)"
                  className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-text"
                />
                <input
                  type="text"
                  value={abVariantB}
                  onChange={(e) => setAbVariantB(e.target.value)}
                  placeholder="Variant B (AI Optimized Title/Text)"
                  className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-text"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer"
              >
                + Launch Split Test Experiment
              </button>
            </form>

            <div className="grid gap-4">
              {experiments.map((exp) => (
                <div key={exp.id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">A/B Test</span>
                      <h4 className="text-sm font-black text-text">{exp.productTitle}</h4>
                    </div>
                    <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
                      Winner: {exp.winner === "variantB" ? "Variant B (+63% Conversion Lift)" : "In Progress"}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Variant A */}
                    <div className="rounded-xl border border-border p-3.5 bg-muted-bg/30">
                      <span className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-black text-muted uppercase">Variant A</span>
                      <p className="mt-1 text-xs font-bold text-text">{exp.variantA.value}</p>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <p className="text-[10px] text-muted">Views</p>
                          <p className="font-black text-text">{exp.variantA.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted">Orders</p>
                          <p className="font-black text-text">{exp.variantA.orders}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted">Conv.</p>
                          <p className="font-black text-text">{exp.variantA.conversionRate}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Variant B */}
                    <div className="rounded-xl border-2 border-primary/50 p-3.5 bg-primary/5">
                      <span className="rounded-md bg-primary text-white px-2 py-0.5 text-[10px] font-black uppercase">Variant B (AI)</span>
                      <p className="mt-1 text-xs font-bold text-text">{exp.variantB.value}</p>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <p className="text-[10px] text-muted">Views</p>
                          <p className="font-black text-text">{exp.variantB.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted">Orders</p>
                          <p className="font-black text-primary">{exp.variantB.orders}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted">Conv.</p>
                          <p className="font-black text-emerald-600">{exp.variantB.conversionRate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* Floating AI Seller Business Copilot */}
      <AiCommerceCopilot role="seller" />
    </DashboardShell>
  );
}
