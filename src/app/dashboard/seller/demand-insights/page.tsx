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
import { toast } from "@/context/ToastContext";
import {
  Search,
  Camera,
  Sparkles,
  TrendingUp,
  AlertCircle,
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
} from "lucide-react";

export default function SellerDemandInsightsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SellerDemandInsightsResponse | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "unmet" | "matched">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalItem, setActiveModalItem] = useState<VisualSearchDemandItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSellerDemandInsights({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        search: searchQuery.trim() || undefined,
        limit: 30,
      });
      setData(res);
    } catch {
      toast.error("Failed to load customer demand insights");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleMarkStatus = async (item: VisualSearchDemandItem, newStatus: "stocked" | "reviewed") => {
    try {
      setUpdatingId(item._id);
      await updateDemandStatus(item._id, newStatus);
      toast.success(`Marked as ${newStatus}!`);
      setData((prev) => {
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

  const metrics = data?.metrics || {
    totalSearches: 0,
    unmetSearches: 0,
    matchedSearches: 0,
    topCategories: [],
    trendingKeywords: [],
  };

  const topCategoryName = metrics.topCategories[0]?.category || "None yet";
  const unmetPercentage =
    metrics.totalSearches > 0
      ? Math.round((metrics.unmetSearches / metrics.totalSearches) * 100)
      : 0;

  return (
    <DashboardShell
      role="Seller"
      title="Customer Search Demand & Visual Insights"
      subtitle="Discover what customers & guests are searching for using AI Visual Search. Identify high-demand items to stock and grow your store revenue."
      links={sellerDashboardLinks}
    >
      <div className="space-y-6">
        {/* Top Banner Notice */}
        <div className="flex items-start gap-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4.5 text-xs text-foreground">
          <Sparkles className="mt-0.5 h-5 w-5 text-emerald-500 shrink-0" />
          <div className="space-y-1">
            <p className="font-extrabold text-sm text-foreground">
              Direct Buyer Demand Intelligence
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every time a customer or guest uploads a product image to search ShopNest, our Vision AI analyzes the product details.
              When an item has <strong>0 in stock (Unmet Demand)</strong>, it represents an immediate market gap you can capture by listing the product first!
            </p>
          </div>
        </div>

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Visual Searches"
            value={metrics.totalSearches.toString()}
            icon="📷"
            note="Searches conducted by buyers"
            color="default"
          />
          <StatCard
            label="Unmet Demand (Zero Stock)"
            value={metrics.unmetSearches.toString()}
            icon="🔥"
            note={`${unmetPercentage}% of searches had 0 stock`}
            color="error"
          />
          <StatCard
            label="Fulfilled Demands"
            value={metrics.matchedSearches.toString()}
            icon="✅"
            note="Searches with matching stock"
            color="success"
          />
          <StatCard
            label="Top Demand Category"
            value={topCategoryName}
            icon="📦"
            note="Most searched category"
            color="accent"
          />
        </div>

        {/* Filter and Search Bar */}
        <Panel
          title="Customer Visual Search Demands"
          icon={<Camera className="h-5 w-5 text-emerald-500" />}
          action={
            data ? (
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {data.demands.length} demands shown
              </span>
            ) : null
          }
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
              {/* Search input */}
              <div className="relative min-w-[240px] flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, tag, or category..."
                  className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 rounded-xl bg-muted/40 p-1 text-xs font-bold border border-border/60">
                <button
                  onClick={() => setSelectedStatus("all")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    selectedStatus === "all"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Demands
                </button>
                <button
                  onClick={() => setSelectedStatus("unmet")}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 transition ${
                    selectedStatus === "unmet"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-rose-500 hover:text-rose-600"
                  }`}
                >
                  <AlertCircle className="h-3.5 w-3.5" /> High Opportunity (0 In Stock)
                </button>
                <button
                  onClick={() => setSelectedStatus("matched")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    selectedStatus === "matched"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  In Stock / Matched
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchInsights}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Category Filter Pills (if categories exist) */}
            {metrics.topCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Categories:
                </span>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    selectedCategory === "all"
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Categories
                </button>
                {metrics.topCategories.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1.5 ${
                      selectedCategory === cat.category
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{cat.category}</span>
                    <span className="rounded-full bg-black/20 px-1.5 text-[10px]">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Grid of Demand Cards */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-3">
                <RefreshCw className="h-7 w-7 animate-spin text-emerald-500" />
                <p className="text-sm font-semibold">Loading customer search demands...</p>
              </div>
            ) : !data || data.demands.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Camera className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-foreground">No Search Demands Found</h4>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {selectedStatus !== "all" || selectedCategory !== "all"
                    ? "Try adjusting your category or status filters to view other customer search demands."
                    : "Customer visual search demands will appear here once buyers search with photos on the storefront."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.demands.map((item) => {
                  const isUnmet = item.isUnmetDemand;
                  const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={item._id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5"
                    >
                      <div>
                        {/* Image Preview & Opportunity Badge */}
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/40 border border-border/80">
                          <img
                            src={item.imageUrl}
                            alt={item.detectedTitle}
                            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                          />

                          {/* Top Status Tag */}
                          <div className="absolute top-2.5 left-2.5">
                            {isUnmet ? (
                              <span className="flex items-center gap-1 rounded-full bg-rose-600/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-md">
                                <AlertCircle className="h-3 w-3" /> 0 IN STOCK — HIGH DEMAND
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 rounded-full bg-emerald-600/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-md">
                                <CheckCircle className="h-3 w-3" /> {item.matchedCount} In Catalog
                              </span>
                            )}
                          </div>

                          {/* Quick Inspect Button */}
                          <button
                            onClick={() => setActiveModalItem(item)}
                            className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition hover:bg-black/80"
                            title="Inspect image & AI data"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Title & Metadata */}
                        <div className="mt-3.5 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                              📁 {item.detectedCategory || "General"}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {dateStr}
                            </span>
                          </div>

                          <h4 className="line-clamp-2 text-sm font-extrabold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                            {item.detectedTitle}
                          </h4>

                          {item.searchQuery && (
                            <p className="text-xs text-muted-foreground">
                              Buyer query: <strong className="text-foreground font-semibold">&quot;{item.searchQuery}&quot;</strong>
                            </p>
                          )}
                        </div>

                        {/* Identified Tags / Keywords */}
                        {item.detectedTags && item.detectedTags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {item.detectedTags.slice(0, 4).map((tag, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                        {/* Status chip */}
                        {item.status === "stocked" ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" /> Stocked
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkStatus(item, "stocked")}
                            disabled={updatingId === item._id}
                            className="text-[11px] text-muted-foreground hover:text-foreground font-medium underline underline-offset-2"
                          >
                            Mark as stocked
                          </button>
                        )}

                        {/* Stock This Product CTA */}
                        <button
                          onClick={() => handleStockProduct(item)}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-teal-500/20 hover:brightness-105 transition"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>Stock This Product</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Demand Detail Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-emerald-500" />
                <h3 className="font-black text-base text-foreground">
                  Customer Search Demand Details
                </h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Product Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background">
                <img
                  src={activeModalItem.imageUrl}
                  alt={activeModalItem.detectedTitle}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* AI Detection Breakdown */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                    Detected Product Name
                  </span>
                  <h4 className="text-base font-extrabold text-foreground mt-0.5">
                    {activeModalItem.detectedTitle}
                  </h4>
                </div>

                {activeModalItem.searchQuery && (
                  <div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                      Buyer Search Input
                    </span>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      &quot;{activeModalItem.searchQuery}&quot;
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-xl border border-border p-2.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Category</span>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {activeModalItem.detectedCategory}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-2.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Stock Status</span>
                    <p className="text-xs font-bold mt-0.5 text-rose-500">
                      {activeModalItem.isUnmetDemand ? "0 In Stock" : `${activeModalItem.matchedCount} Available`}
                    </p>
                  </div>
                </div>

                {activeModalItem.detectedFeatures && activeModalItem.detectedFeatures.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                      Identified Features
                    </span>
                    <ul className="mt-1 space-y-1">
                      {activeModalItem.detectedFeatures.map((feat, idx) => (
                        <li key={idx} className="text-muted-foreground flex items-center gap-1.5">
                          • {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeModalItem.detectedTags && activeModalItem.detectedTags.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                      Suggested Search Tags
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {activeModalItem.detectedTags.map((t, idx) => (
                        <span key={idx} className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/70">
              <button
                onClick={() => setActiveModalItem(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const item = activeModalItem;
                  setActiveModalItem(null);
                  handleStockProduct(item);
                }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-500/20 hover:brightness-105 transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>List Product with this Information</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
