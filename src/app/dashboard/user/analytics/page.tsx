"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getSpendingAnalytics,
  SpendingAnalyticsData,
  getWishlistAnalytics,
  WishlistAnalyticsData,
  getSavedSearches,
  SavedSearchItem,
  createSavedSearch,
  deleteSavedSearch,
  getPersonalizedOffers,
  PersonalizedOfferItem,
  getCustomerActivityTimeline,
  CustomerActivityItem,
} from "@/lib/api/customer-intelligence";
import { LineAreaChart } from "@/components/analytics/LineAreaChart";
import { DonutChart } from "@/components/analytics/DonutChart";
import { formatCurrency } from "@/lib/utils";
import { FaBookmark, FaTrash, FaSearch, FaTag, FaHeart, FaCheck, FaArrowRight } from "react-icons/fa";

export default function CustomerAnalyticsPage() {
  const [spending, setSpending] = useState<SpendingAnalyticsData | null>(null);
  const [wishlist, setWishlist] = useState<WishlistAnalyticsData | null>(null);
  const [searches, setSearches] = useState<SavedSearchItem[]>([]);
  const [offers, setOffers] = useState<PersonalizedOfferItem[]>([]);
  const [timeline, setTimeline] = useState<CustomerActivityItem[]>([]);

  // New Search Form State
  const [newQuery, setNewQuery] = useState("");
  const [newCategory, setNewCategory] = useState("Electronics");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      getSpendingAnalytics().catch(() => null),
      getWishlistAnalytics().catch(() => null),
      getSavedSearches().catch(() => []),
      getPersonalizedOffers().catch(() => []),
      getCustomerActivityTimeline().catch(() => []),
    ])
      .then(([spendRes, wishRes, searchRes, offerRes, timeRes]) => {
        if (!active) return;
        if (spendRes) setSpending(spendRes);
        if (wishRes) setWishlist(wishRes);
        if (searchRes) setSearches(searchRes);
        if (offerRes) setOffers(offerRes);
        if (timeRes) setTimeline(timeRes);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSaveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim()) return;
    try {
      await createSavedSearch({ query: newQuery.trim(), category: newCategory });
      setNewQuery("");
      getSavedSearches().then(setSearches);
    } catch {
      // handled
    }
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      await deleteSavedSearch(id);
      setSearches((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // handled
    }
  };

  const handleCopyOffer = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const lineChartData = (spending?.monthlySpending || []).map((m) => ({
    label: m.month,
    value: m.amount,
  }));

  const donutChartData = (spending?.categorySpending || []).map((c) => ({
    label: c.category,
    value: c.amount,
  }));

  const totalSpend = spending?.overview?.totalSpend ?? 0;
  const monthlySpend = spending?.overview?.monthlySpend ?? 0;
  const avgOrderValue = spending?.overview?.avgOrderValue ?? 0;
  const orderCount = spending?.overview?.orderCount ?? 0;
  const totalPotentialSavings = wishlist?.totalPotentialSavings ?? 0;

  return (
    <DashboardShell
      role="Customer"
      title="Personal Shopping & Spending Insights"
      subtitle="Deep telemetry on your shopping patterns, monthly budgets, wishlist price drop opportunities, personalized perks, and activity timeline."
      links={userDashboardLinks}
    >
      <div className="grid gap-5">
          {/* KPI Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="💳"
            label="Total Lifetime Spend"
            value={formatCurrency(totalSpend)}
            note={`${orderCount} completed order${orderCount === 1 ? "" : "s"}`}
            trend={totalSpend > 0 ? "Active" : "No spend"}
          />
          <StatCard
            icon="📅"
            label="Current Month Spend"
            value={formatCurrency(monthlySpend)}
            note={monthlySpend > 0 ? "Budget benchmark on track" : "No orders this month yet"}
            trend={monthlySpend > 0 ? "+12% MoM" : "Waiting"}
          />
          <StatCard
            icon="🏷️"
            label="Avg Order Value (AOV)"
            value={formatCurrency(avgOrderValue)}
            note={spending?.overview?.orderFrequency || "0 orders / month"}
          />
          <StatCard
            icon="🎯"
            label="Potential Wishlist Savings"
            value={formatCurrency(totalPotentialSavings)}
            note={`${wishlist?.priceDropOpportunities?.length || 0} price drop${(wishlist?.priceDropOpportunities?.length || 0) === 1 ? "" : "s"} detected`}
            trend={totalPotentialSavings > 0 ? "Deal Alert" : "No deals"}
          />
        </div>

        {/* Spending Analytics Charts */}
        <div className="grid gap-5 grid-cols-1 xl:grid-cols-2">
          <Panel
            title="Monthly Spending Trajectory"
            action={
              <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                {lineChartData.length > 0 ? `${lineChartData.length} Months` : "No data"}
              </span>
            }
          >
            <p className="mb-4 text-xs text-muted">
              Monthly expenditure breakdown showing spending velocity and trendline.
            </p>
            {lineChartData.length > 0 ? (
              <LineAreaChart data={lineChartData} color="#6366f1" height={260} />
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted-bg/40 text-sm text-muted">
                No spending data yet. Start shopping to unlock your trend chart.
              </div>
            )}
          </Panel>

          <Panel
            title="Category Spend Distribution"
            action={
              <span className="rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                {donutChartData.length > 0 ? "Top Categories" : "No data"}
              </span>
            }
          >
            <p className="mb-4 text-xs text-muted">
              Visual share of your budget allocated across different product verticals.
            </p>
            {donutChartData.length > 0 ? (
              <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
                <DonutChart data={donutChartData} size={220} />
                <div className="grid gap-2">
                  {(spending?.categorySpending || []).map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between rounded-xl bg-muted-bg p-2.5 text-xs">
                      <span className="font-bold text-text">{cat.category}</span>
                      <span className="font-black text-primary">{formatCurrency(cat.amount)} ({cat.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted-bg/40 text-sm text-muted">
                Category analytics will appear after your first purchase.
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Most Purchased Products" action={<span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">{spending?.mostPurchasedProducts?.length || 0} Items</span>}>
          {spending?.mostPurchasedProducts && spending.mostPurchasedProducts.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {spending.mostPurchasedProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-border bg-muted-bg/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted">{product.category}</p>
                  <h3 className="mt-2 line-clamp-2 text-sm font-black text-text">{product.title}</h3>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted">Purchased</span>
                    <span className="font-black text-primary">{product.purchases}x</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted">Spend</span>
                    <span className="font-bold text-text">{formatCurrency(product.totalSpent)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted-bg/40 p-8 text-center text-sm text-muted">
              No purchased products yet. Once you place orders, your top products will appear here.
            </div>
          )}
        </Panel>

        {/* Wishlist Analytics & Price Drop Alerts */}
        <Panel
          title="Wishlist Price-Drop Opportunities"
          action={
            <Link
              href="/dashboard/user/wishlist"
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              View Full Wishlist <FaArrowRight size={10} />
            </Link>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(wishlist?.priceDropOpportunities || []).map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-muted-bg/50 p-4 transition hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-rose-600 dark:text-rose-400">
                      Save {formatCurrency(item.priceDrop)} ({item.priceDropPercent}%)
                    </span>
                    <span className="text-xs text-muted">{item.category}</span>
                  </div>
                  <h3 className="line-clamp-2 text-sm font-black text-text">{item.title}</h3>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-muted line-through">{formatCurrency(item.originalPrice)}</p>
                    <p className="text-lg font-black text-primary">{formatCurrency(item.currentPrice)}</p>
                  </div>
                  <Link
                    href={`/products/${item.id}`}
                    className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-hover"
                  >
                    Grab Deal
                  </Link>
                </div>
              </div>
            ))}
            {(wishlist?.priceDropOpportunities || []).length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
                <FaHeart className="mx-auto mb-2 text-muted" size={24} />
                No active price drops right now. Add more items to your wishlist to get notified.
              </div>
            )}
          </div>
        </Panel>

        {/* Personalized Offers & Rewards */}
        <Panel
          title="Personalized Offers & Exclusive Perks"
          action={
            <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {offers.length} Active Rewards
            </span>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {offers.length > 0 ? (
              offers.map((offer) => (
                <div
                  key={offer.id}
                  className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface to-muted-bg p-5 shadow-sm"
                >
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/10 blur-xl" />
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-black uppercase text-primary">
                        <FaTag size={10} /> {offer.discountPercent}% OFF
                      </span>
                      <span className="text-[10px] text-muted">Exp: {new Date(offer.expiresAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-extrabold text-text">{offer.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted">{offer.description}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/80 pt-3">
                    <span className="rounded-lg bg-surface px-2.5 py-1 text-xs font-mono font-black text-text border border-border">
                      {offer.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyOffer(offer.code)}
                      className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-hover"
                    >
                      {copiedCode === offer.code ? (
                        <>
                          <FaCheck size={10} /> Copied!
                        </>
                      ) : (
                        "Apply Code"
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-muted-bg/40 p-8 text-center text-sm text-muted">
                No personalized offers available right now. Keep shopping to unlock exclusive rewards.
              </div>
            )}
          </div>
        </Panel>

        {/* Saved Searches & Shopping Timeline */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          {/* Saved Searches */}
          <Panel title="Saved Searches">
            <form onSubmit={handleSaveSearch} className="mb-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                placeholder="Save search (e.g., Ultra-wide Monitor)..."
                className="w-full flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-none focus:border-primary"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-none focus:border-primary sm:w-auto"
              >
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Living">Home & Living</option>
                <option value="Beauty">Beauty</option>
              </select>
              <button
                type="submit"
                className="flex items-center justify-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-hover sm:w-auto"
              >
                <FaBookmark size={10} /> Save
              </button>
            </form>

            <div className="grid gap-2">
              {searches.length > 0 ? (
                searches.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 transition hover:border-primary/40"
                  >
                    <Link
                      href={`/products?search=${encodeURIComponent(s.query)}`}
                      className="flex items-center gap-2.5 text-xs font-bold text-text hover:text-primary"
                    >
                      <FaSearch size={11} className="text-muted" />
                      <span>{s.query}</span>
                      {s.category && (
                        <span className="rounded-md bg-muted-bg px-2 py-0.5 text-[10px] text-muted">
                          {s.category}
                        </span>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteSearch(s.id)}
                      className="p-1 text-muted transition hover:text-error"
                      title="Remove saved search"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted-bg/40 p-4 text-center text-xs text-muted">
                  Save a product search to track your favorite shopping filters here.
                </div>
              )}
            </div>
          </Panel>

          {/* Shopping Activity Timeline */}
          <Panel title="Shopping Activity Timeline">
            <div className="space-y-3">
              {timeline.length > 0 ? (
                timeline.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 rounded-xl bg-muted-bg/60 p-3 text-xs">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs">
                      {act.activityType === "order"
                        ? "📦"
                        : act.activityType === "wishlist_add"
                        ? "❤️"
                        : act.activityType === "search"
                        ? "🔍"
                        : act.activityType === "review"
                        ? "⭐"
                        : "🛡️"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-text">{act.title}</p>
                      {act.details && <p className="mt-0.5 text-[11px] text-muted">{act.details}</p>}
                      <p className="mt-1 text-[10px] text-muted/80">{new Date(act.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted-bg/40 p-4 text-center text-xs text-muted">
                  Your shopping activity timeline is empty right now.
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
