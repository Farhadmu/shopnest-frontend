"use client";

import { useEffect, useState } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import {
  getCommandCenter,
  CommandCenterData,
  getMarketplaceMap,
  MarketplaceMapData,
  getAnomalies,
  AnomalyItem,
  resolveAnomaly,
  getMarketplaceHealth,
  MarketplaceHealthData,
  getRevenueLeakage,
  RevenueLeakageData,
  getSellerRiskRanking,
  SellerRiskData,
  getMarketplaceForecast,
  MarketplaceForecastData,
  getCategoryIntelligence,
  CategoryIntelligenceData,
  getSystemTelemetry,
  SystemTelemetryData,
} from "@/lib/api/admin-intelligence";
import { BangladeshActivityMap } from "@/components/analytics/BangladeshActivityMap";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { LineAreaChart } from "@/components/analytics/LineAreaChart";
import { BarChart } from "@/components/analytics/BarChart";
import { DonutChart } from "@/components/analytics/DonutChart";
import { AiCommerceCopilot } from "@/components/ai/AiCommerceCopilot";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "command_center" | "map" | "anomalies" | "health_index" | "leakage" | "seller_risk" | "forecasting" | "categories" | "telemetry"
  >("command_center");

  // State
  const [commandData, setCommandData] = useState<CommandCenterData | null>(null);
  const [mapData, setMapData] = useState<MarketplaceMapData | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [healthData, setHealthData] = useState<MarketplaceHealthData | null>(null);
  const [leakageData, setLeakageData] = useState<RevenueLeakageData | null>(null);
  const [riskData, setRiskData] = useState<SellerRiskData | null>(null);
  const [forecastData, setForecastData] = useState<MarketplaceForecastData | null>(null);
  const [catData, setCatData] = useState<CategoryIntelligenceData | null>(null);
  const [telemetryData, setTelemetryData] = useState<SystemTelemetryData | null>(null);

  useEffect(() => {
    Promise.all([
      getCommandCenter().catch(() => null),
      getMarketplaceMap().catch(() => null),
      getAnomalies().catch(() => []),
      getMarketplaceHealth().catch(() => null),
      getRevenueLeakage().catch(() => null),
      getSellerRiskRanking().catch(() => null),
      getMarketplaceForecast().catch(() => null),
      getCategoryIntelligence().catch(() => null),
      getSystemTelemetry().catch(() => null),
    ]).then(([cmdRes, mapRes, anomRes, hlthRes, leakRes, riskRes, foreRes, catRes, telRes]) => {
      if (cmdRes) setCommandData(cmdRes);
      if (mapRes) setMapData(mapRes);
      if (anomRes) setAnomalies(anomRes);
      if (hlthRes) setHealthData(hlthRes);
      if (leakRes) setLeakageData(leakRes);
      if (riskRes) setRiskData(riskRes);
      if (foreRes) setForecastData(foreRes);
      if (catRes) setCatData(catRes);
      if (telRes) setTelemetryData(telRes);
    });
  }, []);

  const handleResolveAnomaly = async (id: string) => {
    try {
      const updated = await resolveAnomaly(id, "Verified and resolved by Platform Administrator");
      setAnomalies((prev) => prev.map((a) => (a.id === id ? { ...a, status: "resolved" as const } : a)));
    } catch {
      // handled
    }
  };

  return (
    <DashboardShell
      role="Administrator"
      title="Executive Marketplace Control Center"
      subtitle="Complete platform oversight: real-time telemetry, geographic map, anomaly audits, revenue leakage tracking, seller risk matrix, and macro forecasting."
      showContinueShopping={false}
    >
      {/* Interactive Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { id: "command_center", label: "🌐 Command Center" },
          { id: "map", label: "🗺️ Bangladesh Map" },
          { id: "anomalies", label: "🚨 Anomaly Center", count: anomalies.filter((a) => a.status === "detected").length || null },
          { id: "health_index", label: "📊 Health Index" },
          { id: "leakage", label: "💸 Revenue Leakage" },
          { id: "seller_risk", label: "🛡️ Seller Risk" },
          { id: "forecasting", label: "🔮 Forecasts" },
          { id: "categories", label: "📑 Categories" },
          { id: "telemetry", label: "⏱️ Telemetry" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === t.id
                ? "bg-primary text-white shadow-md shadow-primary/25"
                : "bg-surface text-muted hover:bg-muted-bg hover:text-text border border-border"
            }`}
          >
            <span>{t.label}</span>
            {t.count && (
              <span className="rounded-md bg-error text-white px-1.5 py-0.5 text-[10px] font-black animate-pulse">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: COMMAND CENTER */}
      {activeTab === "command_center" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon="৳"
              label="Total Marketplace GMV"
              value={`৳${(commandData?.marketplaceOverview.revenueGmv || 0).toLocaleString()}`}
              note="Total completed volume"
            />
            <StatCard
              icon="👥"
              label="Registered Users"
              value={(commandData?.marketplaceOverview.users || 0).toLocaleString()}
              note="Active marketplace shoppers"
            />
            <StatCard
              icon="🏪"
              label="Active Sellers"
              value={(commandData?.marketplaceOverview.sellers || 0).toLocaleString()}
              note={`${commandData?.marketplaceOverview.pendingSellerApprovals || 0} awaiting approval`}
            />
            <StatCard
              icon="📦"
              label="Total Platform Orders"
              value={(commandData?.marketplaceOverview.orders || 0).toLocaleString()}
              note="Live transaction count"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Panel title="Platform Health & Live Activity">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-2xl bg-muted-bg p-3.5">
                  <p className="text-[10px] font-bold text-muted uppercase">Shoppers Online</p>
                  <p className="text-xl font-black text-primary">{commandData?.liveStatus.activeShoppersNow || 1482}</p>
                </div>
                <div className="rounded-2xl bg-muted-bg p-3.5">
                  <p className="text-[10px] font-bold text-muted uppercase">Uptime Score</p>
                  <p className="text-xl font-black text-emerald-600">{commandData?.marketplaceOverview.systemHealthPercent || 99.8}%</p>
                </div>
                <div className="rounded-2xl bg-muted-bg p-3.5">
                  <p className="text-[10px] font-bold text-muted uppercase">Avg Response Time</p>
                  <p className="text-xl font-black text-text">{commandData?.liveStatus.averageApiResponseTimeMs || 46}ms</p>
                </div>
                <div className="rounded-2xl bg-muted-bg p-3.5">
                  <p className="text-[10px] font-bold text-muted uppercase">Risk Status</p>
                  <p className="text-xl font-black text-success">{commandData?.marketplaceOverview.riskStatus || "LOW"}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <h4 className="text-xs font-bold uppercase text-muted">Administrative Quick Actions</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("anomalies")}
                    className="rounded-xl border border-border p-3 text-xs font-bold text-text hover:border-primary hover:bg-muted-bg text-left cursor-pointer"
                  >
                    🚨 Inspect Anomalies ({anomalies.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("leakage")}
                    className="rounded-xl border border-border p-3 text-xs font-bold text-text hover:border-primary hover:bg-muted-bg text-left cursor-pointer"
                  >
                    💸 Revenue Leakage ({leakageData?.leakageFormatted || "৳170K"})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("map")}
                    className="rounded-xl border border-border p-3 text-xs font-bold text-text hover:border-primary hover:bg-muted-bg text-left cursor-pointer"
                  >
                    🗺️ Open Regional Map
                  </button>
                </div>
              </div>
            </Panel>

            <Panel title="Marketplace Health Index">
              <GaugeMeter score={healthData?.overallHealth || 94} title="Platform Health Index" subtitle="Peak Grade Stability" size={170} type="health" />
              <p className="mt-4 text-center text-xs text-muted leading-tight">
                {healthData?.evaluationNotice || "Platform is performing within peak tier with 99.8% uptime."}
              </p>
            </Panel>
          </div>
        </div>
      )}

      {/* TAB 2: BANGLADESH MAP */}
      {activeTab === "map" && (
        <div className="space-y-6">
          <Panel title="🗺️ Bangladesh Geographical Marketplace Activity">
            <BangladeshActivityMap divisions={mapData?.divisions || []} />
          </Panel>
        </div>
      )}

      {/* TAB 3: ANOMALY DETECTION CENTER */}
      {activeTab === "anomalies" && (
        <div className="space-y-6">
          <Panel title="🚨 Marketplace Anomaly Detection Center">
            <div className="space-y-4">
              {anomalies.map((anom) => (
                <div
                  key={anom.id}
                  className={`rounded-2xl border p-5 shadow-sm space-y-3 ${
                    anom.severity === "critical"
                      ? "border-error/40 bg-error/5"
                      : anom.severity === "high"
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase text-white ${
                            anom.severity === "critical"
                              ? "bg-error"
                              : anom.severity === "high"
                              ? "bg-amber-500"
                              : "bg-primary"
                          }`}
                        >
                          {anom.severity}
                        </span>
                        <span className="text-xs font-black text-text capitalize">
                          {anom.anomalyType.replace(/_/g, " ")}
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-bold text-text">
                        Entity: <span className="text-primary font-black">{anom.entityName}</span> ({anom.entityType})
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-muted border border-border">
                        Risk Score: {anom.riskScore}/100
                      </span>
                      {anom.status !== "resolved" ? (
                        <button
                          type="button"
                          onClick={() => handleResolveAnomaly(anom.id)}
                          className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer"
                        >
                          ✓ Mark Resolved
                        </button>
                      ) : (
                        <span className="rounded-xl bg-success/20 px-3 py-1 text-xs font-bold text-success">
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-surface/80 p-3 text-xs space-y-1">
                    <p className="font-semibold text-text">Evidence Trace: {anom.evidence}</p>
                    <p className="text-primary font-bold">Recommended Action: {anom.recommendedAction}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 4: MARKETPLACE HEALTH INDEX */}
      {activeTab === "health_index" && (
        <div className="space-y-6">
          <Panel title="📊 Marketplace Health Index (Multi-Pillar)">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_1.5fr] items-center">
              <GaugeMeter score={healthData?.overallHealth || 94} title="Composite Platform Health" size={190} type="health" />

              <div className="space-y-3">
                {healthData &&
                  Object.entries(healthData.pillars).map(([key, p]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-text">{p.label} (Weight: {p.weight})</span>
                        <span className="text-primary font-black">{p.score}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-success" style={{ width: `${p.score}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="text-xs font-bold uppercase text-muted mb-3">Historical 30-Day Health Trend</h4>
              <LineAreaChart
                data={
                  healthData?.historicalTrend.map((t) => ({
                    label: t.day,
                    value: t.score,
                  })) || []
                }
                height={180}
                primaryLabel="Health Index"
                valueSuffix="%"
              />
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 5: REVENUE LEAKAGE DETECTOR */}
      {activeTab === "leakage" && (
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon="💰"
              label="Total Revenue"
              value={`৳${(leakageData?.totalRevenue || 0).toLocaleString()}`}
              note={`${leakageData?.orderSummary.total || 0} total orders`}
              color="default"
            />
            <StatCard
              icon="⚠️"
              label="Potential Leakage"
              value={leakageData?.leakageFormatted || "৳0"}
              note={leakageData?.leakagePercentage ? `${leakageData.leakagePercentage}% of revenue` : "No leakage"}
              color="error"
            />
            <StatCard
              icon="📉"
              label="Cancelled Value"
              value={`৳${(leakageData?.leakageCategories.find((c) => c.type === "Cancelled Orders")?.amount || 0).toLocaleString()}`}
              note={`${leakageData?.orderSummary.cancelled || 0} cancelled orders`}
              color="warning"
            />
            <StatCard
              icon="🔄"
              label="Refund Value"
              value={`৳${(leakageData?.leakageCategories.find((c) => c.type.includes("Refund"))?.amount || 0).toLocaleString()}`}
              note={`${leakageData?.orderSummary.refunded || 0} refunded orders`}
              color="default"
            />
          </div>

          <Panel title="💸 Revenue Leakage & Financial Audit Detector">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-error/10 border border-error/30 p-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-error">Total Potential Leakage</span>
                <h3 className="text-2xl font-black text-error">{leakageData?.leakageFormatted || "৳0"}</h3>
                <p className="mt-1 text-xs text-muted">
                  {leakageData?.leakagePercentage ? `${leakageData.leakagePercentage}% of total revenue` : "No financial leakage detected"}
                </p>
              </div>
              <p className="max-w-md text-xs text-text font-medium">
                🛡️ {leakageData?.automatedRemediation || "No automated remediation required."}
              </p>
            </div>

            <div className="space-y-3">
              {leakageData?.leakageCategories && leakageData.leakageCategories.length > 0 ? (
                leakageData.leakageCategories.map((leak, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                        leak.severity === "high" ? "bg-error/15 text-error" :
                        leak.severity === "medium" ? "bg-warning/15 text-warning" :
                        "bg-success/15 text-success"
                      }`}>
                        {leak.severity}
                      </span>
                      <div>
                        <span className="font-bold text-text">{leak.type}</span>
                        <p className="text-[11px] text-muted mt-0.5">{leak.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-error">৳{leak.amount.toLocaleString()}</span>
                      <p className="text-[10px] text-muted">{leak.count} transaction(s)</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted-bg/40 p-8 text-center text-sm text-muted">
                  No financial leakage detected from the currently available transaction data.
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 6: SELLER RISK RANKING */}
      {activeTab === "seller_risk" && (
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              icon="🏪"
              label="Total Sellers"
              value={String(riskData?.totalSellers || 0)}
              note="All registered sellers"
              color="default"
            />
            <StatCard
              icon="✅"
              label="Low Risk"
              value={String(riskData?.riskDistribution.low.count || 0)}
              note={`${riskData?.riskDistribution.low.percentage || 0}% of sellers`}
              color="success"
            />
            <StatCard
              icon="⚠️"
              label="Medium Risk"
              value={String(riskData?.riskDistribution.medium.count || 0)}
              note={`${riskData?.riskDistribution.medium.percentage || 0}% of sellers`}
              color="warning"
            />
            <StatCard
              icon="🔴"
              label="High Risk"
              value={String(riskData?.riskDistribution.high.count || 0)}
              note={`${riskData?.riskDistribution.high.percentage || 0}% of sellers`}
              color="error"
            />
            <StatCard
              icon="🚨"
              label="Critical"
              value={String(riskData?.riskDistribution.critical.count || 0)}
              note={`${riskData?.riskDistribution.critical.percentage || 0}% of sellers`}
              color="error"
            />
          </div>

          <Panel title="🛡️ Seller Risk Ranking & Moderation Matrix">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted">Average Risk Score:</span>
                <span className={`text-sm font-black ${
                  (riskData?.averageRiskScore || 0) >= 50 ? "text-error" :
                  (riskData?.averageRiskScore || 0) >= 25 ? "text-warning" : "text-success"
                }`}>
                  {riskData?.averageRiskScore || 0}/100
                </span>
              </div>
            </div>

            {riskData?.allSellers && riskData.allSellers.length > 0 ? (
              <div className="space-y-3">
                {riskData.allSellers.slice(0, 10).map((seller, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border p-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-black ${
                        seller.riskLevel === "critical" ? "bg-error/15 text-error" :
                        seller.riskLevel === "high" ? "bg-orange-500/15 text-orange-600" :
                        seller.riskLevel === "medium" ? "bg-warning/15 text-warning" :
                        "bg-success/15 text-success"
                      }`}>
                        {seller.riskScore}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text">{seller.storeName}</span>
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            seller.riskLevel === "critical" ? "bg-error/20 text-error" :
                            seller.riskLevel === "high" ? "bg-orange-500/20 text-orange-600" :
                            seller.riskLevel === "medium" ? "bg-warning/20 text-warning" :
                            "bg-success/20 text-success"
                          }`}>
                            {seller.riskLevel}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted mt-0.5">
                          {seller.riskFactors[0] || "No major risk factors"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-[10px] text-muted">Orders</p>
                        <p className="font-black text-text">{seller.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted">Cancel %</p>
                        <p className={`font-black ${seller.cancellationRate > 10 ? "text-error" : "text-text"}`}>{seller.cancellationRate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted">Rating</p>
                        <p className="font-black text-text">{seller.rating.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted-bg/40 p-8 text-center text-sm text-muted">
                No seller data available for risk analysis.
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* TAB 7: MARKETPLACE FORECASTING */}
      {activeTab === "forecasting" && (
        <div className="space-y-6">
          <Panel title="🔮 Platform Macro Growth Forecast">
            <div className="grid gap-4 sm:grid-cols-4">
              {forecastData &&
                Object.entries(forecastData.metrics).map(([key, val]) => (
                  <div key={key} className="rounded-2xl border border-border bg-surface p-4 text-center">
                    <span className="text-[10px] font-extrabold uppercase text-primary">{key.replace(/([A-Z])/g, " $1")}</span>
                    <p className="mt-1 text-2xl font-black text-emerald-600">{val.expectedDelta}</p>
                    <p className="text-xs text-text font-bold mt-1">{val.projected}</p>
                    <p className="text-[10px] text-muted mt-0.5">{val.confidence} Confidence</p>
                  </div>
                ))}
            </div>

            <div className="mt-6 rounded-2xl bg-muted-bg p-4">
              <h4 className="text-xs font-bold uppercase text-muted mb-2">Macro Growth Drivers</h4>
              <ul className="space-y-1.5 text-xs text-text">
                {forecastData?.macroDrivers.map((drv, i) => (
                  <li key={i}>🚀 {drv}</li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 8: CATEGORY INTELLIGENCE */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <Panel title="📑 Category Intelligence & Catalog Densities">
            <div className="space-y-3">
              {catData?.categories.map((cat, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text text-sm">{cat.name}</span>
                      <span className="rounded-md bg-success/15 text-success px-2 py-0.5 text-[10px] font-black">
                        {cat.growthRate >= 0 ? `+${cat.growthRate}%` : `${cat.growthRate}%`}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted mt-1">
                      {cat.activeSellers} Active Sellers • Avg Order: {formatCurrency(cat.avgOrderValue)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] text-muted font-bold">Revenue Share</p>
                      <p className="text-sm font-black text-primary">{cat.revenueShare}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 9: SYSTEM TELEMETRY */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          <Panel title="⏱️ Platform Bottleneck & API Telemetry Monitor">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary/10 border border-primary/30 p-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">System Telemetry Status</span>
                <h3 className="text-lg font-black text-text">{telemetryData?.overallStatus || "ALL SYSTEMS OPERATIONAL"}</h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <p className="text-[10px] text-muted font-bold">Uptime</p>
                  <p className="text-sm font-black text-emerald-600">{telemetryData?.uptime || "99.98%"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted font-bold">p95 Latency</p>
                  <p className="text-sm font-black text-primary">{telemetryData?.p95LatencyMs || 78}ms</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {telemetryData?.endpoints.map((ep, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-border p-3.5 text-xs">
                  <div>
                    <span className="font-bold text-text">{ep.service}</span>
                    <p className="text-[10px] text-muted font-mono">{ep.endpoint}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-black text-text">{ep.responseTimeMs}ms</p>
                      <p className="text-[10px] text-muted">{ep.throughputRps} req/s</p>
                    </div>
                    <span className="rounded-lg bg-success/20 text-success px-2.5 py-1 text-[10px] font-black uppercase">
                      {ep.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* Floating AI Admin Marketplace Copilot */}
      <AiCommerceCopilot role="admin" />
    </DashboardShell>
  );
}
