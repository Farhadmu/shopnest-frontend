"use client";

import Link from "next/link";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { useOverviewStats } from "@/hooks/dashboard/user/useOverviewStats";
import { useShoppingIntent } from "@/hooks/dashboard/user/useShoppingIntent";

export default function CustomerOverviewPage() {
  const { stats, recentOrders, securityData } = useOverviewStats(true);
  const { query, setQuery, result, loading, detect } = useShoppingIntent();

  return (
    <DashboardShell
      role="Customer"
      title="Commerce Command Center"
      subtitle="Discover personalized shopping journeys, plan smart budgets, track product lifecycles and protect your account with AI intelligence."
      links={userDashboardLinks}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon="📦" label="Orders Placed" value={String(stats.orders)} note="Lifetime fulfilled purchases" />
          <StatCard icon="🛒" label="Cart Items" value={String(stats.cart)} note="Ready for immediate checkout" />
          <StatCard icon="♡" label="Wishlist" value={String(stats.wishlist)} note="Saved favorite products" />
          <StatCard icon="🔔" label="Notifications" value={String(stats.notifications)} note="Order & price drop alerts" />
        </div>

        {/* AI Shopping Intent Extractor */}
        <Panel title="✨ AI Natural Language Shopping Assistant">
          <form onSubmit={detect} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'I need something for my brother's birthday under 5000 tk'"
              className="flex-1 rounded-xl bg-background px-4 py-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {loading ? "Analyzing Intent..." : "Find Best Matches"}
            </button>
          </form>

          {result && (
            <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-primary">
                  🎯 Intent: {result.extractedIntent.occasion} for {result.extractedIntent.recipient}
                </span>
                <span className="rounded-lg bg-surface px-2.5 py-1 text-[11px] font-bold text-text shadow-xs">
                  Target: {result.extractedIntent.detectedBudget}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">{result.recommendationSummary}</p>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {result.matchingProducts.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition hover:border-primary/50"
                  >
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-muted-bg overflow-hidden flex items-center justify-center font-bold text-muted text-xs">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" /> : "🛍️"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-text">{p.title}</p>
                      <p className="text-xs font-extrabold text-primary">৳{(p.discountPrice || p.price).toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Panel>

        {/* Quick Snapshot Grid */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Recent Purchases">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted">No orders placed yet.</div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                    <div>
                      <p className="text-xs font-bold text-text">Order #{o.id.slice(-6)}</p>
                      <p className="text-[11px] text-muted">{o.items.length} items • ৳{o.totalAmount.toLocaleString()}</p>
                    </div>
                    <span className="rounded-lg bg-success/15 px-2.5 py-1 text-[11px] font-extrabold text-success uppercase">
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Security & Protection Status">
            <div className="flex items-center justify-between p-2">
              <GaugeMeter score={securityData?.securityScore || 92} title="Account Shield" subtitle="Active Fraud & ATO Protection" size={150} type="security" />
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  <span className="font-semibold text-text">Strong HMAC Auth</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  <span className="font-semibold text-text">Session Guard Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  <span className="font-semibold text-text">Zero Breach Signals</span>
                </div>
                <Link href="/dashboard/user/security" className="mt-2 text-xs font-bold text-primary hover:underline block">
                  Open Security Center →
                </Link>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
