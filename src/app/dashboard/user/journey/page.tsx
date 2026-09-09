"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, StatCard, EmptyState, LoadingCard } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getShoppingJourney, getJourneyAnalytics, ShoppingJourneyData, JourneyAnalytics } from "@/lib/api/customer-intelligence";
import {
  FaSearch,
  FaEye,
  FaHeart,
  FaShoppingCart,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaArrowRight,
  FaShoppingBag,
  FaFire,
  FaClock,
  FaFilter,
  FaChartLine,
  FaStar,
  FaTimes,
  FaRobot,
  FaTags,
  FaExclamationTriangle,
} from "react-icons/fa";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 3 Months" },
  { value: "all", label: "All Time" },
];

const EVENT_TYPE_OPTIONS = [
  { value: "", label: "All Activity" },
  { value: "search", label: "Searches" },
  { value: "view", label: "Product Views" },
  { value: "wishlist_add", label: "Wishlist" },
  { value: "cart_add", label: "Cart" },
  { value: "purchase", label: "Purchases" },
  { value: "category_browse", label: "Categories" },
];

const EVENT_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  search: { icon: <FaSearch size={14} />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  view: { icon: <FaEye size={14} />, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
  wishlist_add: { icon: <FaHeart size={14} />, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
  cart_add: { icon: <FaShoppingCart size={14} />, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  purchase: { icon: <FaCheckCircle size={14} />, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
  category_browse: { icon: <FaTags size={14} />, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
};

export default function ShoppingJourneyPage() {
  const [journeyData, setJourneyData] = useState<ShoppingJourneyData | null>(null);
  const [analytics, setAnalytics] = useState<JourneyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [range, setRange] = useState("30d");
  const [eventType, setEventType] = useState("");
  const [analyticsPage, setAnalyticsPage] = useState(1);

  const loadJourney = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getShoppingJourney();
      setJourneyData(data);
    } catch {
      setJourneyData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const data = await getJourneyAnalytics({ range, type: eventType || undefined, page: analyticsPage, limit: 20 });
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [range, eventType, analyticsPage]);

  useEffect(() => {
    loadJourney();
  }, [loadJourney]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const progress = journeyData?.journey?.journeyProgress ?? 0;
  const stage = journeyData?.journey?.currentStage || "discovery";

  return (
    <DashboardShell
      role="Customer"
      title="Shopping Journey"
      subtitle="Your complete shopping timeline and insights"
      links={userDashboardLinks}
      showContinueShopping={false}
    >
      <div className="space-y-6">
        {/* Journey Progress */}
        {journeyData?.journey && (
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Active Discovery Path</span>
                <h3 className="text-lg font-black text-text capitalize">
                  {journeyData.journey.category || "Electronics & Gaming"} Setup Path
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Stage: <span className="font-bold text-text uppercase">{stage.replace(/_/g, " ")}</span>
                </p>
              </div>
              <div className="rounded-2xl border border-primary/30 bg-surface px-4 py-2 text-center shadow-xs">
                <p className="text-[10px] font-bold text-muted uppercase">Journey Progress</p>
                <p className="text-2xl font-black text-primary">{progress}%</p>
              </div>
            </div>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {analytics && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard icon="📊" label="Total Activities" value={analytics.stats.totalActivities} note="All time" />
            <StatCard icon="👀" label="Products Viewed" value={analytics.stats.productsViewed} note="Views" color="accent" />
            <StatCard icon="🔍" label="Searches" value={analytics.stats.searches} note="Search queries" />
            <StatCard icon="❤️" label="Wishlist" value={analytics.stats.wishlistAdds} note="Wishlist adds" color="error" />
            <StatCard icon="🛒" label="Cart Adds" value={analytics.stats.cartAdds} note="Added to cart" color="success" />
            <StatCard icon="✅" label="Purchases" value={analytics.stats.purchases} note="Completed" color="success" />
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-muted">
              <FaFilter size={12} /> Filters
            </div>
            <select
              value={range}
              onChange={(e) => { setRange(e.target.value); setAnalyticsPage(1); }}
              className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              {RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={eventType}
              onChange={(e) => { setEventType(e.target.value); setAnalyticsPage(1); }}
              className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
            <FaExclamationTriangle className="mx-auto text-red-500 text-3xl mb-2" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button onClick={loadAnalytics} className="mt-3 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600">
              Retry
            </button>
          </div>
        )}

        {/* Main Content */}
        {!error && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left Column - Timeline & Activity */}
            <div className="space-y-6">
              {/* Shopping Funnel */}
              {analytics?.funnel && (
                <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
                  <h3 className="text-sm font-black text-text mb-4 flex items-center gap-2">
                    <FaChartLine size={16} /> Shopping Funnel
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Discovery", data: analytics.funnel.discovery },
                      { label: "Product Views", data: analytics.funnel.views },
                      { label: "Wishlist", data: analytics.funnel.wishlist },
                      { label: "Cart", data: analytics.funnel.cart },
                      { label: "Checkout", data: analytics.funnel.checkout },
                      { label: "Purchase", data: analytics.funnel.purchase },
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-text w-24">{step.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted-bg overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${step.data.percentage}%` }} />
                        </div>
                        <span className="text-xs text-muted w-16 text-right">{step.data.count}</span>
                        <span className="text-xs text-muted w-12 text-right">{step.data.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Timeline */}
              <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
                <h3 className="text-sm font-black text-text mb-4">Activity Timeline</h3>
                {analyticsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <LoadingCard key={i} />
                    ))}
                  </div>
                ) : analytics && analytics.timeline.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.timeline.map((event) => {
                      const eventConfig = EVENT_ICONS[event.eventType] || EVENT_ICONS.view;
                      return (
                        <div key={event.id} className="flex items-start gap-3 rounded-xl border border-border bg-muted-bg/30 p-3">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${eventConfig.bg} ${eventConfig.color}`}>
                            {eventConfig.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-text capitalize">
                              {event.eventType.replace(/_/g, " ")}
                            </p>
                            {event.productTitle && (
                              <p className="text-xs text-muted truncate">{event.productTitle}</p>
                            )}
                            <p className="text-[10px] text-muted mt-1">{formatDate(event.createdAt)}</p>
                          </div>
                          {event.price && (
                            <span className="text-xs font-bold text-text">৳{event.price.toLocaleString()}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState icon="📋" title="No Activity Yet" description="Your shopping journey will appear here as you browse and shop." />
                )}

                {/* Timeline Pagination */}
                {analytics && analytics.pagination && analytics.pagination.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted">
                      Page {analytics.pagination.page} of {analytics.pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAnalyticsPage((p) => Math.max(1, p - 1))}
                        disabled={analyticsPage === 1}
                        className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-bold text-text disabled:opacity-50 hover:bg-muted-bg"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setAnalyticsPage((p) => p + 1)}
                        disabled={analyticsPage >= analytics.pagination.totalPages}
                        className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-bold text-text disabled:opacity-50 hover:bg-muted-bg"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Insights */}
            <div className="space-y-6">
              {/* Recent Searches */}
              {analytics && analytics.recentSearches.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
                  <h3 className="text-sm font-black text-text mb-3 flex items-center gap-2">
                    <FaSearch size={14} /> Recent Searches
                  </h3>
                  <div className="space-y-2">
                    {analytics.recentSearches.slice(0, 8).map((search, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-xl border border-border bg-muted-bg/30 px-3 py-2">
                        <span className="text-xs font-medium text-text truncate">{search.query}</span>
                        <span className="text-[10px] text-muted">{formatDate(search.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Most Viewed Products */}
              {analytics && analytics.mostViewedProducts.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
                  <h3 className="text-sm font-black text-text mb-3 flex items-center gap-2">
                    <FaEye size={14} /> Most Viewed
                  </h3>
                  <div className="space-y-2">
                    {analytics.mostViewedProducts.slice(0, 5).map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-xl border border-border bg-muted-bg/30 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-text truncate">{product.productTitle || "Unknown Product"}</p>
                          <p className="text-[10px] text-muted">{product.category || ""}</p>
                        </div>
                        <span className="text-[10px] font-bold text-muted">{product.count} views</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Interests */}
              {analytics && analytics.interests.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
                  <h3 className="text-sm font-black text-text mb-3 flex items-center gap-2">
                    <FaFire size={14} /> Your Interests
                  </h3>
                  <div className="space-y-2">
                    {analytics.interests.slice(0, 5).map((interest, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-xl border border-border bg-muted-bg/30 px-3 py-2">
                        <span className="text-xs font-medium text-text capitalize">{interest.category}</span>
                        <span className="text-[10px] text-muted">{interest.interactions} interactions</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insight */}
              {analytics && analytics.interests.length > 0 && (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-6">
                  <h3 className="text-sm font-black text-text mb-2 flex items-center gap-2">
                    <FaRobot size={14} /> AI Shopping Insight
                  </h3>
                  <p className="text-xs text-muted leading-5">
                    You seem interested in <span className="font-bold text-text capitalize">{analytics.interests[0]?.category}</span> based on your recent activity.
                    {analytics.interests[0]?.uniqueProducts && analytics.interests[0]!.uniqueProducts > 1 && (
                      <> You&apos;ve explored {analytics.interests[0].uniqueProducts} unique products in this category.</>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommended Items */}
        {journeyData?.recommendedItems && journeyData.recommendedItems.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <h3 className="text-sm font-black text-text mb-4">Recommended For You</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {journeyData.recommendedItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-muted-bg/30 p-3.5 shadow-sm transition hover:border-primary/50 hover:shadow-md">
                  <div className="h-32 w-full rounded-xl bg-muted-bg overflow-hidden flex items-center justify-center">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl">🛍️</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="truncate text-xs font-bold text-text">{item.title}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs font-black text-primary">৳{(item.discountPrice ?? item.price).toLocaleString()}</span>
                      <span className="text-[11px] font-bold text-amber-500">★ {item.ratingAvg.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
