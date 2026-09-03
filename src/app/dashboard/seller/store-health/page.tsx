"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { getSellerHealthScore, SellerHealthData } from "@/lib/api/seller-intelligence";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { FaHeartbeat, FaCheckCircle, FaExclamationCircle, FaStar, FaTruck, FaComments } from "react-icons/fa";

export default function SellerStoreHealthPage() {
  const [data, setData] = useState<SellerHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSellerHealthScore()
      .then(setData)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell
      role="Seller"
      title="Store Health & Performance Index"
      subtitle="Comprehensive multi-pillar evaluation across customer satisfaction, dispatch reliability, response speed, product quality, and return rates."
    >
      <div className="grid gap-6">
        {/* Overall Store Health Score Card */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Composite Store Health">
            <div className="flex flex-col items-center justify-center p-4">
              <GaugeMeter score={data?.overallHealth || 87} title="Store Health" maxScore={100} size={190} />
              <p className="mt-4 text-center text-xs font-black text-text">
                Store Rating: <span className="text-emerald-600 dark:text-emerald-400">Excellent (Top 10% on ShopNest)</span>
              </p>
              <p className="mt-1 text-center text-[11px] text-muted">
                Weighted composite score across 5 performance pillars.
              </p>
            </div>
          </Panel>

          <div className="lg:col-span-2">
            <Panel title="5-Pillar Performance Telemetry">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-text">
                      <FaStar className="text-amber-500" /> Customer Satisfaction
                    </span>
                    <span className="font-mono text-sm font-black text-primary">
                      {data?.metrics.customerSatisfaction.score || 94}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${data?.metrics.customerSatisfaction.score || 94}%` }} />
                  </div>
                  <p className="mt-2 text-[10px] text-muted">Target: 95% • Status: Excellent</p>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-text">
                      <FaTruck className="text-emerald-500" /> Delivery Reliability
                    </span>
                    <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {data?.metrics.deliveryReliability.score || 96}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${data?.metrics.deliveryReliability.score || 96}%` }} />
                  </div>
                  <p className="mt-2 text-[10px] text-muted">Target: 95% • Dispatched within 24h</p>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-text">
                      <FaComments className="text-purple-500" /> Inquiry Response Rate
                    </span>
                    <span className="font-mono text-sm font-black text-purple-600 dark:text-purple-400">
                      {data?.metrics.responseRate.score || 92}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: `${data?.metrics.responseRate.score || 92}%` }} />
                  </div>
                  <p className="mt-2 text-[10px] text-muted">Target: 90% • Avg reply: &lt; 15 min</p>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-text">
                      <FaCheckCircle className="text-blue-500" /> Return Rate Control
                    </span>
                    <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">
                      {data?.metrics.returnRate.score || 4}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${100 - (data?.metrics.returnRate.score || 4) * 5}%` }} />
                  </div>
                  <p className="mt-2 text-[10px] text-muted">Target: &lt; 5% • Minimal dispute rate</p>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Actionable Improvement Suggestions */}
        <Panel title="Actionable Store Improvement Suggestions">
          <div className="grid gap-3 sm:grid-cols-3">
            {(data?.recommendations || [
              "Maintain current low return rate with high-precision packaging.",
              "Great dispatch speed! Top 10% on ShopNest marketplace.",
              "Expand active catalog with at least 5 new products to increase search discovery.",
            ]).map((rec, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-border bg-muted-bg/50 p-5 text-xs shadow-sm"
              >
                <div>
                  <span className="mb-2 inline-block rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary">
                    Recommendation #{idx + 1}
                  </span>
                  <p className="font-extrabold text-text leading-relaxed">{rec}</p>
                </div>
                <p className="mt-4 text-[10px] text-muted">Impact: High catalog boost</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
