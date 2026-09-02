"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getSellerHealthScore, SellerHealthData } from "@/lib/api/seller-intelligence";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { EmptyState, ErrorState, LoadingCard } from "@/components/dashboard/DashboardStates";

export default function SellerStoreHealthPage() {
  const [data, setData] = useState<SellerHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getSellerHealthScore()
      .then(setData)
      .catch(() => setError("Failed to load health data"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell
      role="Seller"
      title="Store Health"
      subtitle="Performance metrics based on your store's actual orders and customer feedback."
      links={sellerDashboardLinks}
    >
      <div className="grid gap-6">
        {error && <ErrorState message={error} />}

        {loading ? (
          <LoadingCard />
        ) : data?.hasEnoughData ? (
          <>
            {/* Overall Health Score */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Panel title="Overall Health Score">
                <div className="flex flex-col items-center justify-center p-4">
                  <GaugeMeter score={data.overallHealth || 0} title="Store Health" maxScore={100} size={190} />
                  <p className="mt-4 text-center text-xs text-muted">
                    Based on delivery reliability, return rate, and customer satisfaction.
                  </p>
                </div>
              </Panel>

              <div className="lg:col-span-2">
                <Panel title="Performance Metrics">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-surface p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text">Customer Satisfaction</span>
                        <span className="font-mono text-sm font-black text-primary">
                          {data.metrics.customerSatisfaction.score ?? "N/A"}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${data.metrics.customerSatisfaction.score || 0}%` }} />
                      </div>
                      <p className="mt-2 text-[10px] text-muted">Based on store rating</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text">Delivery Reliability</span>
                        <span className="font-mono text-sm font-black text-emerald-600">
                          {data.metrics.deliveryReliability.score ?? "N/A"}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${data.metrics.deliveryReliability.score || 0}%` }} />
                      </div>
                      <p className="mt-2 text-[10px] text-muted">On-time delivery rate</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text">Return Rate</span>
                        <span className="font-mono text-sm font-black text-amber-500">
                          {data.metrics.returnRate.score ?? "N/A"}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(100, (data.metrics.returnRate.score || 0) * 5)}%` }} />
                      </div>
                      <p className="mt-2 text-[10px] text-muted">Product returns & refunds</p>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>

            {/* Recommendations */}
            {data.recommendations.length > 0 && (
              <Panel title="Recommendations">
                <div className="grid gap-3 sm:grid-cols-3">
                  {data.recommendations.map((rec, idx) => (
                    <div key={idx} className="rounded-2xl border border-border bg-muted-bg/50 p-5 text-xs">
                      <span className="mb-2 inline-block rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary">
                        #{idx + 1}
                      </span>
                      <p className="font-bold text-text leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </>
        ) : (
          <EmptyState
            icon="🏥"
            title="Not enough data"
            description={data?.recommendations?.[0] || "Start receiving orders to calculate your store health score."}
          />
        )}
      </div>
    </DashboardShell>
  );
}
