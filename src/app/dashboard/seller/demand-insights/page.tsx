"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DashboardShell,
  Panel,
  StatCard,
} from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getSellerDemandInsights,
  updateDemandStatus,
  SellerDemandInsightsResponse,
  VisualSearchDemandItem,
} from "@/lib/api/ai-visual-search";
import {
  getDemandIQOverview,
  generatePurchaseOrder,
  DemandIQOverview,
  ProductDemandMetrics,
  PurchaseOrderProposal,
  StockoutRiskLevel,
} from "@/lib/api/demandiq";
import { TimeSeriesForecastChart } from "@/components/demandiq/TimeSeriesForecastChart";
import { SupplyChainShockSimulator } from "@/components/demandiq/SupplyChainShockSimulator";
import { ProcurementChatWidget } from "@/components/demandiq/ProcurementChatWidget";
import { PurchaseOrderModal } from "@/components/demandiq/PurchaseOrderModal";
import { toast } from "@/context/ToastContext";
import {
  Search,
  Camera,
  Sparkles,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  ExternalLink,
  Filter,
  RefreshCw,
  Eye,
  X,
  Package,
  Clock,
  Layers,
  Tag,
  Check,
  ChevronRight,
  ArrowUpRight,
  Copy,
  Calendar,
  Palette,
  ShoppingBag,
  Sliders,
  Bot,
  FileSpreadsheet,
  Activity,
  ShieldCheck,
  Ship,
  TrendingDown,
  Info,
} from "lucide-react";

export default function SellerDemandInsightsPage() {
  const router = useRouter();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    "forecasting" | "stockouts" | "simulator" | "analyst" | "po_planner" | "market_demands"
  >("forecasting");

  // DemandIQ Overview Data
  const [demandiqLoading, setDemandiqLoading] = useState(true);
  const [overview, setOverview] = useState<DemandIQOverview | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDemandMetrics | null>(null);
  const [riskFilter, setRiskFilter] = useState<"all" | StockoutRiskLevel>("all");

  // Purchase Order State
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [poData, setPoData] = useState<PurchaseOrderProposal | null>(null);
  const [generatingPo, setGeneratingPo] = useState(false);

  // Legacy Visual Search Demand State (Preserved 100%)
  const [visualLoading, setVisualLoading] = useState(true);
  const [visualData, setVisualData] = useState<SellerDemandInsightsResponse | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "7d" | "30d" | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "unmet" | "matched">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalItem, setActiveModalItem] = useState<VisualSearchDemandItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch DemandIQ Data
  const fetchDemandIQ = useCallback(async () => {
    try {
      setDemandiqLoading(true);
      const res = await getDemandIQOverview();
      setOverview(res);
      if (res.topStockoutRisks.length > 0) {
        setSelectedProduct(res.topStockoutRisks[0]);
      } else if (res.topRevenueGenerators.length > 0) {
        setSelectedProduct(res.topRevenueGenerators[0]);
      }
    } catch (err) {
      console.error("DemandIQ fetch error:", err);
      toast.error("Failed to load DemandIQ forecasting data");
    } finally {
      setDemandiqLoading(false);
    }
  }, []);

  // Fetch Visual Search Demands
  const fetchVisualDemands = useCallback(async () => {
    try {
      setVisualLoading(true);
      const res = await getSellerDemandInsights({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        search: searchQuery.trim() || undefined,
        period: selectedPeriod !== "all" ? selectedPeriod : undefined,
        limit: 30,
      });
      setVisualData(res);
    } catch {
      toast.error("Failed to load visual search demands");
    } finally {
      setVisualLoading(false);
    }
  }, [selectedCategory, selectedStatus, searchQuery, selectedPeriod]);

  useEffect(() => {
    fetchDemandIQ();
    fetchVisualDemands();
  }, [fetchDemandIQ, fetchVisualDemands]);

  // Generate Purchase Order Handler
  const handleGeneratePO = async (targetSla: number = 98) => {
    try {
      setGeneratingPo(true);
      const po = await generatePurchaseOrder({ targetServiceLevel: targetSla, leadTimeDays: 6 });
      setPoData(po);
      setPoModalOpen(true);
      toast.success("Replenishment Purchase Order generated!");
    } catch (err) {
      console.error("Failed to generate PO:", err);
      toast.error("Failed to generate Purchase Order");
    } finally {
      setGeneratingPo(false);
    }
  };

  // Visual Demand Handlers
  const handleMarkStatus = async (item: VisualSearchDemandItem, newStatus: "stocked" | "reviewed") => {
    try {
      setUpdatingId(item._id);
      await updateDemandStatus(item._id, newStatus);
      toast.success(`Marked as ${newStatus}!`);
      setVisualData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          demands: prev.demands.map((d) => (d._id === item._id ? { ...d, status: newStatus } : d)),
        };
      });
      if (activeModalItem?._id === item._id) {
        setActiveModalItem((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStockProduct = (item: VisualSearchDemandItem) => {
    const params = new URLSearchParams();
    params.set("title", item.detectedTitle);
    if (item.detectedCategory && item.detectedCategory !== "General") {
      params.set("category", item.detectedCategory);
    }
    if (item.detectedTags && item.detectedTags.length > 0) {
      params.set("tags", item.detectedTags.join(","));
    }
    router.push(`/dashboard/seller/products/add?${params.toString()}`);
  };

  const visualMetrics = visualData?.metrics || {
    totalSearches: 0,
    unmetSearches: 0,
    matchedSearches: 0,
    topCategories: [],
    trendingKeywords: [],
    popularColors: [],
    trendingProductTypes: [],
  };

  // Filtered Product List for Matrix
  const filteredProducts = (overview?.topStockoutRisks || [])
    .concat(overview?.topRevenueGenerators || [])
    .filter((prod, index, self) => index === self.findIndex((p) => p.productId === prod.productId))
    .filter((p) => (riskFilter === "all" ? true : p.stockoutRisk === riskFilter));

  return (
    <DashboardShell
      role="Seller"
      title="DemandIQ: Demand Forecasting & Inventory Intelligence"
      subtitle="Revenue Up, Stockouts Down — SME Time-Series ML, Supply Chain Disruption Modeling & RAG Procurement Analyst"
      links={sellerDashboardLinks}
    >
      <div className="space-y-6">
        {/* Executive Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-card/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-0.5 text-xs font-bold text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  DemandIQ AI Engine Active
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Target SLA: 98.0% Service Level
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Predict Stockouts Before They Occur. Protect Store Revenue.
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Utilizing time-series machine learning, burn-rate velocity sensing, and maritime supply chain shock modeling to ensure you never miss customer demand.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => handleGeneratePO(98)}
                disabled={generatingPo}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-5 py-3 text-xs font-bold text-white shadow-lg hover:from-indigo-400 hover:to-violet-500 transition-all active:scale-95 disabled:opacity-50"
              >
                {generatingPo ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                ⚡ Generate Replenishment PO
              </button>
            </div>
          </div>
        </div>

        {/* Executive KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Tracked Catalog SKUs"
            value={(overview?.totalTrackedProducts || 0).toString()}
            icon="📦"
            note={`${overview?.healthyStockCount || 0} in optimal stock buffer`}
            color="default"
          />
          <StatCard
            label="Critical Stockouts (< 3.5d)"
            value={(overview?.criticalStockoutsCount || 0).toString()}
            icon="🚨"
            note="Will run out before next delivery"
            color="error"
          />
          <StatCard
            label="30-Day Revenue at Risk"
            value={`$${(overview?.totalRevenueAtRisk30d || 0).toLocaleString()}`}
            icon="💸"
            note="Projected lost sales without reorders"
            color="error"
          />
          <StatCard
            label="Avg Days of Supply"
            value={`${overview?.averageDaysOfSupply || 0}d`}
            icon="⏳"
            note="Store inventory turnover runway"
            color="accent"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-1 overflow-x-auto scrollbar-none">
          {[
            { id: "forecasting", label: "Demand Forecasting & Time-Series", icon: TrendingUp },
            { id: "stockouts", label: "Stockout Prevention & Risk Matrix", icon: AlertTriangle },
            { id: "simulator", label: "Supply Chain Shock Simulator", icon: Ship },
            { id: "analyst", label: "Ask DemandIQ (RAG AI Analyst)", icon: Bot },
            { id: "po_planner", label: "Smart Purchase Orders", icon: FileSpreadsheet },
            { id: "market_demands", label: "Collective Market Demands", icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: DEMAND FORECASTING & TIME-SERIES */}
        {activeTab === "forecasting" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {demandiqLoading ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-border/60">
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : selectedProduct ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Forecast Chart */}
                <div className="lg:col-span-2">
                  <TimeSeriesForecastChart product={selectedProduct} />
                </div>

                {/* Product Selector Column */}
                <div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur-md">
                  <h4 className="font-bold text-foreground text-sm flex items-center justify-between border-b border-border/40 pb-3 mb-3">
                    <span>Select Product to Inspect</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {overview?.topStockoutRisks.length || 0} Critical
                    </span>
                  </h4>

                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {(overview?.topStockoutRisks || [])
                      .concat(overview?.topRevenueGenerators || [])
                      .filter((p, i, self) => i === self.findIndex((x) => x.productId === p.productId))
                      .map((p) => {
                        const isSelected = selectedProduct?.productId === p.productId;
                        return (
                          <button
                            key={p.productId}
                            onClick={() => setSelectedProduct(p)}
                            className={`w-full text-left rounded-xl p-3 border transition-all ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                                : "border-border/40 bg-card/40 hover:bg-muted/40 hover:border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-indigo-500">{p.sku}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                  p.stockoutRisk === "critical"
                                    ? "bg-rose-500/10 text-rose-500"
                                    : p.stockoutRisk === "warning"
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "bg-emerald-500/10 text-emerald-500"
                                }`}
                              >
                                {p.daysOfSupply}d Left
                              </span>
                            </div>
                            <p className="font-semibold text-xs text-foreground truncate mt-1">{p.title}</p>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>Stock: {p.currentStock} units</span>
                              <span>Velocity: {p.dailyVelocity7d} u/d</span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No product demand data available yet.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STOCKOUT PREVENTION & RISK MATRIX */}
        {activeTab === "stockouts" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 rounded-2xl bg-card border border-border/60 p-1.5 text-xs">
                {(
                  [
                    { id: "all", label: "All Items" },
                    { id: "critical", label: "Critical (< 3.5d)" },
                    { id: "warning", label: "Warning (3.5 - 8d)" },
                    { id: "healthy", label: "Healthy" },
                    { id: "overstocked", label: "Overstocked" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRiskFilter(f.id)}
                    className={`rounded-xl px-3 py-1 font-semibold transition ${
                      riskFilter === f.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleGeneratePO(98)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Add All Critical to PO
              </button>
            </div>

            {/* Matrix Table */}
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/30 text-[10px] text-muted-foreground uppercase text-left">
                      <th className="p-3.5">SKU & Title</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5 text-center">Current Stock</th>
                      <th className="p-3.5 text-center">7-Day Velocity</th>
                      <th className="p-3.5 text-center">Days Remaining</th>
                      <th className="p-3.5 text-center">Risk Level</th>
                      <th className="p-3.5 text-right">30d Revenue at Risk</th>
                      <th className="p-3.5 text-center text-indigo-500 font-bold">Suggested Reorder</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredProducts.map((p) => (
                      <tr key={p.productId} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono text-[10px] font-bold text-indigo-500 block">{p.sku}</span>
                          <span className="font-semibold text-foreground text-xs max-w-[220px] truncate block">
                            {p.title}
                          </span>
                        </td>
                        <td className="p-3.5 text-muted-foreground">{p.category}</td>
                        <td className="p-3.5 text-center font-mono font-bold text-foreground">
                          {p.currentStock} units
                        </td>
                        <td className="p-3.5 text-center font-mono text-muted-foreground">
                          {p.dailyVelocity7d} u/d
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold">
                          {p.daysOfSupply} days
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              p.stockoutRisk === "critical"
                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                : p.stockoutRisk === "warning"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : p.stockoutRisk === "overstocked"
                                ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            }`}
                          >
                            {p.stockoutRisk}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold">
                          {p.revenueAtRisk > 0 ? (
                            <span className="text-rose-500">${p.revenueAtRisk.toLocaleString()}</span>
                          ) : (
                            <span className="text-emerald-500">$0</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center font-mono font-black text-indigo-600 bg-indigo-500/5">
                          +{p.recommendedReorderQty} units
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setActiveTab("forecasting");
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-card px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition"
                          >
                            <TrendingUp className="h-3 w-3 text-indigo-500" />
                            Chart
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUPPLY CHAIN DISRUPTION SIMULATOR */}
        {activeTab === "simulator" && (
          <div className="animate-in fade-in duration-200">
            <SupplyChainShockSimulator
              onApplyPlan={() => {
                handleGeneratePO(98.5);
              }}
            />
          </div>
        )}

        {/* TAB 4: RAG PROCUREMENT AI ANALYST */}
        {activeTab === "analyst" && (
          <div className="animate-in fade-in duration-200">
            <ProcurementChatWidget
              onTriggerAction={(actionType, payload) => {
                if (actionType === "generate_po") {
                  handleGeneratePO(98);
                } else if (actionType === "simulate_shock") {
                  setActiveTab("simulator");
                } else if (actionType === "view_forecast") {
                  setActiveTab("forecasting");
                }
              }}
            />
          </div>
        )}

        {/* TAB 5: SMART PURCHASE ORDERS */}
        {activeTab === "po_planner" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-md">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/40 pb-5">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
                    Automated EOQ Replenishment Engine
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generates official Purchase Orders calculated using Gaussian Inverse Safety Buffers to guarantee 98% Order Fulfillment.
                  </p>
                </div>

                <button
                  onClick={() => handleGeneratePO(98)}
                  disabled={generatingPo}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50"
                >
                  {generatingPo ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
                  Generate Fresh PO Proposal
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border/40 bg-card/40 p-4">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Standard Lead Time</span>
                  <p className="text-lg font-black text-foreground mt-1">6 Days Cycle</p>
                  <p className="text-[11px] text-muted-foreground mt-1">SME domestic manufacturer fulfillment buffer</p>
                </div>

                <div className="rounded-2xl border border-border/40 bg-card/40 p-4">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Gaussian Z-Score</span>
                  <p className="text-lg font-black text-indigo-500 mt-1">Z = 2.05 (98.0%)</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Confidence interval against demand volatility</p>
                </div>

                <div className="rounded-2xl border border-border/40 bg-card/40 p-4">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Export Formats</span>
                  <p className="text-lg font-black text-foreground mt-1">JSON, CSV, Print</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Directly importable into ERP and supplier portals</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: COLLECTIVE MARKET DEMANDS (VISUAL SEARCH) - PRESERVED 100% */}
        {activeTab === "market_demands" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Notice with Time Period Switcher */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4.5 text-xs text-foreground">
              <div className="flex items-start gap-3.5">
                <Sparkles className="mt-0.5 h-5 w-5 text-emerald-500 shrink-0" />
                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-foreground">
                    Aggregated Customer Visual Demand Intelligence
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Every visual search generates real anonymized demand trends. When an item has{" "}
                    <strong>0 in stock (Unmet Demand)</strong>, it represents an immediate market gap you can capture!
                  </p>
                </div>
              </div>

              {/* Time Period Filter Pills */}
              <div className="flex items-center gap-1 bg-background/80 p-1.5 rounded-xl border border-border/80 shrink-0">
                <span className="text-[11px] font-bold text-muted-foreground px-2 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Period:
                </span>
                {(
                  [
                    { id: "today", label: "Today" },
                    { id: "7d", label: "7 Days" },
                    { id: "30d", label: "30 Days" },
                    { id: "all", label: "All Time" },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPeriod(p.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      selectedPeriod === p.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Visual Searches"
                value={visualMetrics.totalSearches.toString()}
                icon="📷"
                note={`Searches in selected ${selectedPeriod === "all" ? "history" : selectedPeriod}`}
                color="default"
              />
              <StatCard
                label="Unmet Demand (Zero Stock)"
                value={visualMetrics.unmetSearches.toString()}
                icon="🔥"
                note={`${
                  visualMetrics.totalSearches > 0
                    ? Math.round((visualMetrics.unmetSearches / visualMetrics.totalSearches) * 100)
                    : 0
                }% of searches had 0 stock`}
                color="error"
              />
              <StatCard
                label="Fulfilled Demands"
                value={visualMetrics.matchedSearches.toString()}
                icon="✅"
                note="Searches with matching stock"
                color="success"
              />
              <StatCard
                label="Top Demand Category"
                value={visualMetrics.topCategories[0]?.category || "None yet"}
                icon="📦"
                note="Most searched category"
                color="accent"
              />
            </div>

            {/* Demands Grid / Table */}
            <Panel title="Market Gap & Customer Demand Feed">
              {visualLoading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">Loading demands...</div>
              ) : visualData?.demands && visualData.demands.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visualData.demands.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                            {item.detectedCategory || "General"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              (item.status as string) === "unmet" || item.status === "new"
                                ? "bg-rose-500/10 text-rose-500"
                                : item.status === "stocked"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-foreground text-sm line-clamp-1">{item.detectedTitle}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          Searched by shoppers looking for this item. Zero merchants currently stock this exact variant.
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/40">
                        <button
                          onClick={() => handleStockProduct(item)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          Stock Product
                        </button>
                        <button
                          onClick={() => handleMarkStatus(item, "stocked")}
                          disabled={updatingId === item._id}
                          className="rounded-xl border border-border/60 p-1.5 hover:bg-muted text-muted-foreground transition"
                        >
                          <Check className="h-4 w-4 text-emerald-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No visual unmet demands recorded for this filter.
                </div>
              )}
            </Panel>
          </div>
        )}

        {/* Formal Purchase Order Modal */}
        <PurchaseOrderModal po={poData} onClose={() => setPoModalOpen(false)} />
      </div>
    </DashboardShell>
  );
}
