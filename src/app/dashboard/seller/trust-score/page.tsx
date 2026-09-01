"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { LoadingCard, ErrorState, EmptyState } from "@/components/dashboard/DashboardStates";
import { clientFetch } from "@/lib/core/client";

interface TrustBreakdown {
  storeId: string;
  trustScore: number;
  factors: {
    fulfillmentRate: number;
    avgRating: number;
    disputeRate: number;
    accountAgeDays: number;
  };
}

export default function TrustScorePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrustBreakdown | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clientFetch<TrustBreakdown>("/trust/me");
      setData(res);
    } catch {
      setError("Failed to load trust score. Make sure you have a registered store.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const score = data?.trustScore || 0;
  const scoreColor = score >= 80 ? "success" : score >= 50 ? "warning" : "error";
  const scoreLabel = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Improvement";

  return (
    <DashboardShell role="Seller" title="Seller Trust Score" subtitle="Your store's reputation score based on fulfillment, ratings, and account history" links={sellerDashboardLinks}>
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={loadData} />}

        {/* Trust Score Overview */}
        {loading ? (
          <LoadingCard />
        ) : data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard icon="⭐" value={`${data.trustScore}/100`} label="Trust Score" note={scoreLabel} color={scoreColor} />
              <StatCard icon="📦" value={`${(data.factors.fulfillmentRate * 100).toFixed(0)}%`} label="Fulfillment Rate" note="Orders delivered" color="default" />
              <StatCard icon="⭐" value={data.factors.avgRating.toFixed(1)} label="Avg Rating" note="From reviews" color="warning" />
              <StatCard icon="📅" value={`${data.factors.accountAgeDays} days`} label="Account Age" note="On platform" color="accent" />
            </div>

            {/* Score Breakdown */}
            <Panel title="Score Breakdown">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-muted">Fulfillment Rate (40 points max)</span>
                    <span className="text-text">{Math.round(data.factors.fulfillmentRate * 40)}/40</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted-bg overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${data.factors.fulfillmentRate * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-muted mt-1">{data.factors.fulfillmentRate >= 0.95 ? "Excellent! Keep it up." : "Aim for 95%+ by fulfilling all orders."}</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-muted">Product Rating (30 points max)</span>
                    <span className="text-text">{((data.factors.avgRating / 5) * 30).toFixed(1)}/30</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted-bg overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${(data.factors.avgRating / 5) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-muted mt-1">{data.factors.avgRating >= 4.5 ? "Outstanding ratings!" : "Improve product quality to boost ratings."}</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-muted">Dispute Rate (20 points max)</span>
                    <span className="text-text">{((1 - data.factors.disputeRate) * 20).toFixed(1)}/20</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted-bg overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(1 - data.factors.disputeRate) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-muted mt-1">{data.factors.disputeRate <= 0.05 ? "Very low disputes. Great job!" : "Reduce cancellations and returns."}</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-muted">Account Age (10 points max)</span>
                    <span className="text-text">{Math.min(10, Math.round(data.factors.accountAgeDays / 180 * 10))}/10</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted-bg overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${Math.min(100, (data.factors.accountAgeDays / 180) * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-muted mt-1">Points max out at 180 days on the platform.</p>
                </div>
              </div>
            </Panel>

            {/* Tips */}
            <Panel title="How to Improve Your Score">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <h4 className="text-sm font-bold text-text">📦 Fulfill Every Order</h4>
                  <p className="text-xs text-muted mt-1">Ship on time and avoid cancellations. Each fulfilled order boosts your fulfillment rate.</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <h4 className="text-sm font-bold text-text">⭐ Deliver Quality</h4>
                  <p className="text-xs text-muted mt-1">Accurate descriptions and quality products lead to better reviews and higher ratings.</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <h4 className="text-sm font-bold text-text">💬 Respond to Issues</h4>
                  <p className="text-xs text-muted mt-1">Quickly resolve customer complaints to prevent disputes and negative reviews.</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <h4 className="text-sm font-bold text-text">📅 Stay Active</h4>
                  <p className="text-xs text-muted mt-1">Keep listing new products and maintain consistent sales to build account history.</p>
                </div>
              </div>
            </Panel>
          </>
        ) : (
          <EmptyState icon="⭐" title="No trust data" description="Register a store to see your trust score." />
        )}
      </div>
    </DashboardShell>
  );
}
