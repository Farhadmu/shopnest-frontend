"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
import { DemandIQGuideModal } from "@/components/demandiq/DemandIQGuideModal";
import { InfoTooltip } from "@/components/demandiq/InfoTooltip";
import { toast } from "@/context/ToastContext";
import {
  Search,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  RefreshCw,
  X,
  Check,
  Calendar,
  Bot,
  FileSpreadsheet,
  ShieldCheck,
  Ship,
  Info,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";

type TabId =
  | "forecasting"
  | "stockouts"
  | "simulator"
  | "analyst"
  | "po_planner"
  | "market_demands";

export default function SellerDemandInsightsPage() {
  const router = useRouter();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<TabId>("forecasting");

  // Guide Modal State
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // DemandIQ Overview Data
  const [demandiqLoading, setDemandiqLoading] = useState(true);
  const [overview, setOverview] = useState<DemandIQOverview | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDemandMetrics | null>(null);
  const [riskFilter, setRiskFilter] = useState<"all" | StockoutRiskLevel>("all");
  const [productSearch, setProductSearch] = useState("");

  // Purchase Order State
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [poData, setPoData] = useState<PurchaseOrderProposal | null>(null);
  const [generatingPo, setGeneratingPo] = useState(false);

  // Visual Search Demand State
  const [visualLoading, setVisualLoading] = useState(true);
  const [visualData, setVisualData] = useState<SellerDemandInsightsResponse | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "7d" | "30d" | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "unmet" | "matched">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Scroll management for responsive tab navigation bar
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = useCallback(() => {
    if (!tabsContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkScrollButtons]);

  const handleScroll = (direction: "left" | "right") => {
    if (!tabsContainerRef.current) return;
    const distance = 260;
    tabsContainerRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
    setTimeout(checkScrollButtons, 350);
  };

  const handleTabsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (tabsContainerRef.current && Math.abs(e.deltaY) > 0) {
      tabsContainerRef.current.scrollLeft += e.deltaY;
      checkScrollButtons();
    }
  };

  // Fetch DemandIQ & Visual Demands data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [demandRes, visualRes] = await Promise.all([
          getDemandIQOverview(),
          getSellerDemandInsights({
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            status: selectedStatus !== "all" ? selectedStatus : undefined,
            search: searchQuery.trim() || undefined,
            period: selectedPeriod !== "all" ? selectedPeriod : undefined,
            limit: 30,
          }),
        ]);

        if (isMounted) {
          setOverview(demandRes);
          if (demandRes.allProducts && demandRes.allProducts.length > 0) {
            setSelectedProduct(demandRes.topStockoutRisks[0] || demandRes.allProducts[0]);
          } else if (demandRes.topStockoutRisks.length > 0) {
            setSelectedProduct(demandRes.topStockoutRisks[0]);
          } else if (demandRes.topRevenueGenerators.length > 0) {
            setSelectedProduct(demandRes.topRevenueGenerators[0]);
          }
          setVisualData(visualRes);
        }
      } catch (err) {
        console.error("DemandIQ fetch error:", err);
        toast.error("Failed to load DemandIQ data");
      } finally {
        if (isMounted) {
          setDemandiqLoading(false);
          setVisualLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedStatus, searchQuery, selectedPeriod]);

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

  // Filtered Product List for Matrix & Selector
  const allAvailableProducts = useMemo(() => {
    if (overview?.allProducts && overview.allProducts.length > 0) {
      return overview.allProducts;
    }
    return (overview?.topStockoutRisks || []).concat(overview?.topRevenueGenerators || []);
  }, [overview]);

  const uniqueProducts = useMemo(() => {
    return allAvailableProducts.filter(
      (prod, index, self) => index === self.findIndex((p) => p.productId === prod.productId)
    );
  }, [allAvailableProducts]);

  const filteredProducts = useMemo(() => {
    return uniqueProducts.filter((p) => (riskFilter === "all" ? true : p.stockoutRisk === riskFilter));
  }, [uniqueProducts, riskFilter]);

  const searchedSelectorProducts = useMemo(() => {
    if (!productSearch.trim()) return uniqueProducts;
    const term = productSearch.toLowerCase();
    return uniqueProducts.filter(
      (p) => p.title.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
    );
  }, [uniqueProducts, productSearch]);

  const tabDescriptions: Record<TabId, { title: string; subtitle: string; tip: string }> = {
    forecasting: {
      title: "14-Day Sales Velocity & AI Time-Series Forecast",
      subtitle: "Observe daily demand trends and 95% confidence intervals to plan stock with pinpoint accuracy.",
      tip: "Select any SKU from the right column to inspect its sales velocity curve and safety buffer.",
    },
    stockouts: {
      title: "Stockout Prevention Matrix & SKU Runway",
      subtitle: "Filter your entire catalog by days of supply remaining to catch stockouts before customer impact.",
      tip: "Pay immediate attention to Critical (<3.5d) SKUs — these will deplete before normal supplier lead times.",
    },
    simulator: {
      title: "Supply Chain Shock & Disruption Modeling",
      subtitle: "Stress-test inventory against port delays, supplier shutdowns, and viral demand spikes.",
      tip: "Drag the sliders to model 'what-if' scenarios and review the instant AI mitigation playbook.",
    },
    analyst: {
      title: "DemandIQ RAG AI Procurement Specialist",
      subtitle: "Chat with an AI analyst grounded in your real-time store stock, daily velocities, and EOQ math.",
      tip: "Click any quick prompt below or ask custom questions about upcoming supplier reorders.",
    },
    po_planner: {
      title: "Automated EOQ Replenishment Engine",
      subtitle: "Instantly draft vendor-ready Purchase Orders calculated with Gaussian safety buffers.",
      tip: "Generates optimal reorder batch sizes to balance delivery shipping costs against warehouse storage.",
    },
    market_demands: {
      title: "Collective Market Demands & Visual Search Gaps",
      subtitle: "High-intent buyer searches where zero merchants currently have stock (Untapped Profit Opportunities).",
      tip: "Click 'Stock Product' on any gap item to immediately add it to your catalog with pre-filled AI details.",
    },
  };

  return (
    <DashboardShell
      role="Seller"
      title="DemandIQ: Demand Forecasting & Inventory Intelligence"
      subtitle="Revenue Up, Stockouts Down — SME Time-Series ML, Supply Chain Disruption Modeling & RAG Procurement Analyst"
      links={sellerDashboardLinks}
    >
      <div className="space-y-6">
        {/* Executive Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-card/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-0.5 text-xs font-bold text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  DemandIQ AI Engine Active
                  <InfoTooltip
                    title="DemandIQ AI Engine"
                    description="Continuously tracks your product order rates, historical seasonal patterns, and inventory depletion speeds to prevent stockouts."
                  />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Target SLA: 98.0% Service Level
                  <InfoTooltip
                    title="Target SLA (Service Level Agreement)"
                    description="A mathematical safety benchmark guaranteeing 98 out of 100 customer purchases can be fulfilled immediately without backorders."
                  />
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Predict Stockouts Before They Occur. Protect Store Revenue.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Utilizing time-series machine learning, burn-rate velocity sensing, and maritime supply chain shock modeling to ensure your store never misses customer demand.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setGuideModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2.5 text-xs font-bold text-indigo-300 transition-all active:scale-95 shadow-sm"
              >
                <BookOpen className="h-4 w-4 text-indigo-400" />
                📖 DemandIQ Guide & Glossary
              </button>

              <button
                type="button"
                onClick={() => handleGeneratePO(98)}
                disabled={generatingPo}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-indigo-400 hover:to-violet-500 transition-all active:scale-95 disabled:opacity-50"
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

        {/* Executive KPI Metrics Grid with Explanations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <StatCard
              label="Tracked Catalog SKUs"
              value={(overview?.totalTrackedProducts || 0).toString()}
              icon="📦"
              note={`${overview?.healthyStockCount || 0} in optimal stock buffer`}
              color="default"
            />
            <div className="absolute top-3 right-3">
              <InfoTooltip
                title="Tracked Catalog SKUs"
                description="Total unique product variants actively monitored by DemandIQ for velocity and stockout horizon."
              />
            </div>
          </div>

          <div className="relative group">
            <StatCard
              label="Critical Stockouts (< 3.5d)"
              value={(overview?.criticalStockoutsCount || 0).toString()}
              icon="🚨"
              note="Will run out before next delivery"
              color="error"
            />
            <div className="absolute top-3 right-3">
              <InfoTooltip
                title="Critical Stockouts (< 3.5 Days)"
                description="Products that will completely deplete within 3.5 days at your current sales rate. Immediate supplier orders needed!"
              />
            </div>
          </div>

          <div className="relative group">
            <StatCard
              label="30-Day Revenue at Risk"
              value={`$${(overview?.totalRevenueAtRisk30d || 0).toLocaleString()}`}
              icon="💸"
              note="Projected lost sales without reorders"
              color="error"
            />
            <div className="absolute top-3 right-3">
              <InfoTooltip
                title="30-Day Revenue at Risk"
                description="Estimated gross dollar sales your store will lose if critical SKUs stock out and are not replenished."
              />
            </div>
          </div>

          <div className="relative group">
            <StatCard
              label="Avg Days of Supply"
              value={`${overview?.averageDaysOfSupply || 0}d`}
              icon="⏳"
              note="Store inventory turnover runway"
              color="accent"
            />
            <div className="absolute top-3 right-3">
              <InfoTooltip
                title="Average Days of Supply (Runway)"
                description="The average number of days your entire inventory can sustain current sales velocity before running dry."
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Responsive Scroll with Desktop Wheel & Arrow Controls */}
        <div className="relative border-b border-border/60 pb-1">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Scroll tabs left"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-background/90 border border-border/80 shadow-md backdrop-blur-md text-foreground hover:bg-muted hover:scale-105 active:scale-95 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Left Gradient Fade */}
          {canScrollLeft && (
            <div className="pointer-events-none absolute left-0 top-0 bottom-1 w-10 bg-gradient-to-r from-background to-transparent z-[5] hidden sm:block" />
          )}

          {/* Tabs Container */}
          <div
            ref={tabsContainerRef}
            onScroll={checkScrollButtons}
            onWheel={handleTabsWheel}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 -mx-2 px-2 sm:mx-0 sm:px-1 scroll-smooth"
          >
            {(
              [
                { id: "forecasting", label: "Demand Forecasting", badge: "AI Chart", icon: TrendingUp },
                { id: "stockouts", label: "Stockout Prevention", badge: "Risk Matrix", icon: AlertTriangle },
                { id: "simulator", label: "Disruption Simulator", badge: "Stress Test", icon: Ship },
                { id: "analyst", label: "Ask DemandIQ", badge: "AI Chat", icon: Bot },
                { id: "po_planner", label: "Smart Purchase Orders", badge: "Auto EOQ", icon: FileSpreadsheet },
                { id: "market_demands", label: "Collective Demands", badge: "Visual Search", icon: Sparkles },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={(e) => {
                    setActiveTab(tab.id);
                    e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                  }}
                  className={`inline-flex items-center gap-2 shrink-0 rounded-2xl px-3.5 sm:px-4 py-2.5 text-xs font-bold transition-all relative ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/30"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                  <span
                    className={`hidden sm:inline-block rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${
                      isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Gradient Fade */}
          {canScrollRight && (
            <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-background to-transparent z-[5] hidden sm:block" />
          )}

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Scroll tabs right"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-background/90 border border-border/80 shadow-md backdrop-blur-md text-foreground hover:bg-muted hover:scale-105 active:scale-95 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Active Tab Explainer Banner */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 sm:p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 shrink-0 mt-0.5 sm:mt-0">
              <Info className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="font-bold text-foreground">
                {tabDescriptions[activeTab]?.title}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {tabDescriptions[activeTab]?.subtitle}
              </p>
            </div>
          </div>
          <span className="text-[10px] text-indigo-400 font-medium sm:text-right shrink-0">
            💡 {tabDescriptions[activeTab]?.tip}
          </span>
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

                {/* Product Selector Column with Search */}
                <div className="rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-5 shadow-sm backdrop-blur-md flex flex-col">
                  <div className="border-b border-border/40 pb-3 mb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-indigo-400" />
                        <span>Select SKU to Inspect</span>
                        <InfoTooltip
                          title="Product Selector"
                          description="Click any product below to render its time-series sales curve and calculate its reorder threshold."
                        />
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded">
                        {overview?.topStockoutRisks.length || 0} Critical
                      </span>
                    </div>

                    {/* Quick SKU search input */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search SKU or title..."
                        className="w-full rounded-xl border border-border/60 bg-card/80 pl-8 pr-8 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {productSearch && (
                        <button
                          onClick={() => setProductSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {productSearch && (
                      <p className="text-[10px] text-muted-foreground">
                        Showing {searchedSelectorProducts.length} of {uniqueProducts.length} SKUs
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-indigo-500/30 scrollbar-track-transparent">
                    {searchedSelectorProducts.length === 0 ? (
                      <div className="text-center py-8 text-xs text-muted-foreground">
                        <p>No SKUs match &quot;{productSearch}&quot;.</p>
                        <button
                          type="button"
                          onClick={() => setProductSearch("")}
                          className="mt-2 text-indigo-400 hover:underline text-[11px]"
                        >
                          Clear search filter
                        </button>
                      </div>
                    ) : (
                      searchedSelectorProducts.map((p) => {
                        const isSelected = selectedProduct?.productId === p.productId;
                        return (
                          <button
                            key={p.productId}
                            onClick={() => setSelectedProduct(p)}
                            className={`w-full text-left rounded-xl p-3 border transition-all relative ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-500/15 ring-2 ring-indigo-500/40 shadow-sm"
                                : "border-border/40 bg-card/40 hover:bg-muted/40 hover:border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-indigo-400">{p.sku}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                  p.stockoutRisk === "critical"
                                    ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                    : p.stockoutRisk === "warning"
                                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                }`}
                              >
                                {p.daysOfSupply}d Runway
                              </span>
                            </div>
                            <p className="font-semibold text-xs text-foreground truncate mt-1">{p.title}</p>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>Stock: {p.currentStock} units</span>
                              <span className="font-mono text-[10px]">
                                {p.dailyVelocity7d.toFixed(1)} u/d
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
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
            {/* Filter Pills & Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 rounded-2xl bg-card border border-border/60 p-1.5 text-xs overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 hidden sm:inline">
                  Filter:
                </span>
                {(
                  [
                    { id: "all", label: "All Items", tip: "View complete catalog inventory" },
                    { id: "critical", label: "Critical (< 3.5d)", tip: "Runs out in <3.5 days! Immediate reorder required" },
                    { id: "warning", label: "Warning (3.5 - 8d)", tip: "Depleting in 3.5 to 8 days. Plan reorder now" },
                    { id: "healthy", label: "Healthy", tip: "Stock levels are optimal with safe buffers" },
                    { id: "overstocked", label: "Overstocked", tip: "Excess inventory tying up working capital" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRiskFilter(f.id)}
                    title={f.tip}
                    className={`rounded-xl px-3 py-1 font-semibold transition whitespace-nowrap text-xs ${
                      riskFilter === f.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleGeneratePO(98)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 transition active:scale-95"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Add All Critical to PO
              </button>
            </div>

            {/* Matrix Table: Desktop View */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/30 text-[10px] text-muted-foreground uppercase text-left">
                      <th className="p-3.5">
                        <span className="inline-flex items-center gap-1">
                          SKU & Title
                          <InfoTooltip
                            title="SKU & Title"
                            description="Stock Keeping Unit identification code and product name."
                          />
                        </span>
                      </th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1">
                          Current Stock
                          <InfoTooltip
                            title="Current Stock"
                            description="Actual units currently available on hand in warehouse."
                          />
                        </span>
                      </th>
                      <th className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1">
                          7-Day Velocity
                          <InfoTooltip
                            title="7-Day Velocity"
                            description="Units sold per day on average over the last 7 days."
                          />
                        </span>
                      </th>
                      <th className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1">
                          Days Remaining
                          <InfoTooltip
                            title="Days Remaining (Runway)"
                            description="Current stock divided by daily sales speed. Days until complete stockout."
                          />
                        </span>
                      </th>
                      <th className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1">
                          Risk Level
                          <InfoTooltip
                            title="Stockout Risk Level"
                            description="Critical (<3.5d), Warning (3.5-8d), Healthy (8-30d), Overstocked (>30d)."
                          />
                        </span>
                      </th>
                      <th className="p-3.5 text-right">
                        <span className="inline-flex items-center gap-1">
                          30d Lost Revenue
                          <InfoTooltip
                            title="30-Day Revenue at Risk"
                            description="Estimated dollar sales lost over 30 days if this item is not replenished."
                          />
                        </span>
                      </th>
                      <th className="p-3.5 text-center text-indigo-400 font-bold">
                        <span className="inline-flex items-center gap-1">
                          Suggested Reorder
                          <InfoTooltip
                            title="Suggested Reorder Quantity"
                            description="Economic Order Quantity (EOQ) calculated to cover demand + safety buffer."
                          />
                        </span>
                      </th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-xs text-muted-foreground">
                          No products found matching this filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.productId} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3.5">
                            <span className="font-mono text-[10px] font-bold text-indigo-400 block">{p.sku}</span>
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
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : p.stockoutRisk === "warning"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : p.stockoutRisk === "overstocked"
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              {p.stockoutRisk}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold">
                            {p.revenueAtRisk > 0 ? (
                              <span className="text-rose-400">${p.revenueAtRisk.toLocaleString()}</span>
                            ) : (
                              <span className="text-emerald-400">$0</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center font-mono font-black text-indigo-400 bg-indigo-500/5">
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
                              <TrendingUp className="h-3 w-3 text-indigo-400" />
                              Chart
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Matrix Cards: Mobile View (100% Responsive for Mobile Sellers) */}
            <div className="block md:hidden space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground rounded-2xl border border-border/40 bg-card/40">
                  No products found matching this filter criteria.
                </div>
              ) : (
                filteredProducts.map((p) => (
                  <div
                    key={p.productId}
                    className="rounded-2xl border border-border/60 bg-card/70 p-4 space-y-3 shadow-xs"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-mono text-indigo-400 font-bold text-[10px]">{p.sku}</span>
                        <h4 className="font-bold text-foreground text-xs leading-snug line-clamp-2">{p.title}</h4>
                        <span className="text-[10px] text-muted-foreground">{p.category}</span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase shrink-0 ${
                          p.stockoutRisk === "critical"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : p.stockoutRisk === "warning"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : p.stockoutRisk === "overstocked"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {p.stockoutRisk}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/20 border border-border/40 rounded-xl p-2.5">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Stock On Hand:</span>
                        <span className="font-mono font-bold text-foreground">{p.currentStock} units</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Sales Velocity:</span>
                        <span className="font-mono font-bold text-muted-foreground">{p.dailyVelocity7d} u/day</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Days Remaining:</span>
                        <span className={`font-mono font-bold ${p.daysOfSupply < 3.5 ? "text-rose-400" : "text-foreground"}`}>
                          {p.daysOfSupply} days
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Revenue at Risk:</span>
                        <span className={`font-mono font-bold ${p.revenueAtRisk > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                          ${p.revenueAtRisk.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Suggested Reorder & Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
                      <div className="text-xs">
                        <span className="text-[10px] text-muted-foreground block">Optimal Reorder:</span>
                        <span className="font-mono font-bold text-indigo-400">+{p.recommendedReorderQty} units</span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setActiveTab("forecasting");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition"
                      >
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Inspect Chart</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
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
              onTriggerAction={(actionType) => {
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
            <div className="rounded-3xl border border-border/60 bg-card/60 p-5 sm:p-6 shadow-sm backdrop-blur-md">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/40 pb-5">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-indigo-400" />
                    Automated EOQ Replenishment Engine
                    <InfoTooltip
                      title="Automated EOQ Replenishment Engine"
                      description="Calculates exact reorder batches using the Economic Order Quantity (EOQ) formula combined with Gaussian safety buffers."
                      whyItMatters="Takes the guesswork out of ordering from manufacturers and suppliers."
                    />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                    Generates official Purchase Orders calculated using Gaussian Inverse Safety Buffers to guarantee 98% Order Fulfillment without capital waste.
                  </p>
                </div>

                <button
                  onClick={() => handleGeneratePO(98)}
                  disabled={generatingPo}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95 disabled:opacity-50"
                >
                  {generatingPo ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
                  Generate Fresh PO Proposal
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border/40 bg-card/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Standard Lead Time</span>
                    <InfoTooltip
                      title="Standard Lead Time"
                      description="Average duration from sending a Purchase Order until arrival at your inventory warehouse."
                    />
                  </div>
                  <p className="text-lg font-black text-foreground mt-1">6 Days Cycle</p>
                  <p className="text-[11px] text-muted-foreground mt-1">SME domestic manufacturer fulfillment buffer</p>
                </div>

                <div className="rounded-2xl border border-border/40 bg-card/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Gaussian Z-Score</span>
                    <InfoTooltip
                      title="Gaussian Z-Score (Z=2.05)"
                      description="Statistical confidence multiplier representing a 98.0% probability that incoming orders will not be stocked out."
                    />
                  </div>
                  <p className="text-lg font-black text-indigo-400 mt-1">Z = 2.05 (98.0%)</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Confidence interval against demand volatility</p>
                </div>

                <div className="rounded-2xl border border-border/40 bg-card/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Export Formats</span>
                    <InfoTooltip
                      title="Export Formats"
                      description="Download as JSON, copy text to clipboard for WhatsApp/WeChat, or print directly as official PO."
                    />
                  </div>
                  <p className="text-lg font-black text-foreground mt-1">JSON, Text, Print</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Directly importable into ERP and supplier chats</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: COLLECTIVE MARKET DEMANDS (VISUAL SEARCH) */}
        {activeTab === "market_demands" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Notice with Time Period Switcher */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 text-xs text-foreground">
              <div className="flex items-start gap-3.5">
                <Sparkles className="mt-0.5 h-5 w-5 text-emerald-400 shrink-0" />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-extrabold text-sm text-foreground">
                      Aggregated Customer Visual Demand Intelligence
                    </p>
                    <InfoTooltip
                      title="Visual Search Demands"
                      description="When buyers upload a photo or screenshot to find a product, ShopNest records the demand. If zero sellers have it, it's an unmet gap!"
                      whyItMatters="Be the first seller to stock these items to capture 100% of these ready buyers."
                    />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Every visual search generates real anonymized demand trends. When an item has{" "}
                    <strong className="text-emerald-400">0 in stock (Unmet Demand)</strong>, it represents an immediate market gap you can capture!
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

            {/* Filter controls for Category & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 border border-border/60 rounded-2xl p-3 text-xs">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter demands by title or keyword..."
                    className="w-full rounded-xl border border-border/60 bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-lg border border-border/60 bg-card px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Categories</option>
                  {visualMetrics.topCategories.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category}
                    </option>
                  ))}
                </select>

                <span className="text-[11px] font-bold text-muted-foreground ml-1">Status:</span>
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "unmet", label: "Unmet (0 stock)" },
                    { id: "matched", label: "Stocked" },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStatus(st.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      selectedStatus === st.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {st.label}
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

            {/* Demands Grid */}
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
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            {item.detectedCategory || "General"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              (item.status as string) === "unmet" || item.status === "new"
                                ? "bg-rose-500/10 text-rose-400"
                                : item.status === "stocked"
                                ? "bg-emerald-500/10 text-emerald-400"
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
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition active:scale-95"
                          title="Auto-fills Add Product page with title, category, and tags"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          Stock Product
                        </button>
                        <button
                          onClick={() => handleMarkStatus(item, "stocked")}
                          disabled={updatingId === item._id}
                          className="rounded-xl border border-border/60 p-1.5 hover:bg-muted text-muted-foreground transition"
                          title="Mark as stocked"
                        >
                          <Check className="h-4 w-4 text-emerald-400" />
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

        {/* DemandIQ Pro Guide Modal */}
        <DemandIQGuideModal
          isOpen={guideModalOpen}
          onClose={() => setGuideModalOpen(false)}
        />

        {/* Formal Purchase Order Modal */}
        <PurchaseOrderModal po={poModalOpen ? poData : null} onClose={() => setPoModalOpen(false)} />
      </div>
    </DashboardShell>
  );
}
