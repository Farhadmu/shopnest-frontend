"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getSellerHealthScore, SellerHealthData } from "@/lib/api/seller-intelligence";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { FaHeartbeat, FaCheckCircle, FaExclamationCircle, FaStar, FaTruck, FaComments, FaBoxes } from "react-icons/fa";

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

  const overall = data?.overallHealth ?? null;
  const healthTier =
    overall === null
      ? { label: "Not enough data", color: "text-muted" }
      : overall >= 80
      ? { label: "Excellent (Ready for Growth)", color: "text-emerald-600 dark:text-emerald-400" }
      : overall >= 60
      ? { label: "Good (Steady Performance)", color: "text-primary" }
      : overall >= 40
      ? { label: "Fair (Improvement Recommended)", color: "text-amber-500" }
      : { label: "Needs Urgent Attention", color: "text-rose-500" };

  const satScore = data?.metrics?.customerSatisfaction?.score ?? null;
  const delScore = data?.metrics?.deliveryReliability?.score ?? null;
  const resScore = data?.metrics?.responseRate?.score ?? null;
  const retScore = data?.metrics?.returnRate?.score ?? null;

  const formatScore = (value: number | null) =>
    typeof value === "number" && Number.isFinite(value) ? `${value}%` : "N/A";
  const barWidth = (value: number | null) =>
    typeof value === "number" && Number.isFinite(value) ? `${value}%` : "0%";

  return (
    <DashboardShell
      role="Seller"
      title="Store Health & Performance Index"
      subtitle="Comprehensive multi-pillar evaluation across customer satisfaction, dispatch reliability, catalog readiness, and return rates."
      links={sellerDashboardLinks}
    >
      <div className="grid gap-6">
        {/* Overall Store Health Score Card */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Composite Store Health">
            <div className="flex flex-col items-center justify-center p-4">
              {overall === null ? (
                <div className="flex h-44 flex-col items-center justify-center px-4 text-center">
                  <p className="text-2xl font-black text-muted">N/A</p>
                  <p className="mt-1 text-[11px] text-muted">
                    Not enough store data to calculate a health score yet.
                  </p>
                </div>
              ) : (
                <GaugeMeter score={overall} title="Store Health" maxScore={100} size={190} />
              )}
              <p className="mt-4 text-center text-xs font-black text-text">
                Store Status: <span className={healthTier.color}>{healthTier.label}</span>
              </p>
              <p className="mt-1 text-center text-[11px] text-muted">
                Weighted composite score across verified store performance pillars.
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
                      {formatScore(satScore)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                    <div className="h-full rounded-full bg-primary" style={{ width: barWidth(satScore) }} />
                  </div>
                  <p className="mt-2 text-[10px] text-muted">
                    {data?.metrics?.customerSatisfaction?.status || "Based on customer reviews"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-text">
                      <FaTruck className="text-emerald-500" /> Delivery Reliability
                    </span>
                    <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {formatScore(delScore)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: barWidth(delScore) }} />
                  </div>
                  <p className="mt-2 text-[10px] text-muted">
                    {data?.metrics?.deliveryReliability?.status || "On-time order dispatch"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-text">
                      <FaComments className="text-purple-500" /> Store Profile & KYC
                    </span>
                    <span className="font-mono text-sm font-black text-purple-600 dark:text-purple-400">
                      {formatScore(resScore)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: barWidth(resScore) }} />
                  </div>
                  <p className="mt-2 text-[10px] text-muted">
                    {data?.metrics?.responseRate?.status || "Store identity readiness"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-text">
                      <FaCheckCircle className="text-blue-500" /> Return Rate Control
                    </span>
                    <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">
                      {formatScore(retScore)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: retScore === null ? "0%" : `${Math.max(10, 100 - retScore * 5)}%` }} />
                  </div>
                  <p className="mt-2 text-[10px] text-muted">
                    {data?.metrics?.returnRate?.status || "Dispute & cancellation control"}
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Actionable Improvement Suggestions */}
        <Panel title="Actionable Store Improvement Suggestions">
          {(data?.recommendations || []).length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">
              Add products and fulfill orders to generate personalized store health recommendations.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {(data?.recommendations || []).map((rec, idx) => (
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
                  <p className="mt-4 text-[10px] text-muted">Impact: High performance boost</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}

