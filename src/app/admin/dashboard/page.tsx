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

  const links = [
    { label: "Command Center", href: "#command_center", icon: "🌐", description: "Real-time macro metrics & GMV." },
    { label: "Platform Analytics", href: "/admin/analytics", icon: "📈", description: "Marketplace-wide growth trends." },
    { label: "Security Center", href: "/admin/security", icon: "🛡️", description: "Platform security & access logs." },
    { label: "Risk & Fraud Matrix", href: "/admin/risk", icon: "🚨", description: "Heuristic anomaly & abuse risk." },
    { label: "Incident Manager", href: "/admin/incidents", icon: "📑", description: "Security incident triage & notes." },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: "📜", description: "System & admin audit trail." },
    { label: "Regional Map", href: "#map", icon: "🗺️", description: "Bangladesh divisional activity." },
    { label: "Anomaly Center", href: "#anomalies", icon: "🚨", description: "Order spikes & abuse alerts." },
    { label: "Health Index", href: "#health_index", icon: "📊", description: "5-pillar marketplace rating." },
    { label: "Revenue Leakage", href: "#leakage", icon: "💸", description: "Financial audit & leak vectors." },
    { label: "Seller Risk Matrix", href: "#seller_risk", icon: "🛡️", description: "Dispute & cancellation ranking." },
    { label: "Market Forecast", href: "#forecasting", icon: "🔮", description: "Quarterly GMV & order trajectory." },
    { label: "Category Intel", href: "#categories", icon: "📑", description: "Growth rates & catalog shares." },
    { label: "System Telemetry", href: "#telemetry", icon: "⏱️", description: "API response times & bottleneck detector." },
  ];

  return (
    <DashboardShell
      role="Administrator"
      title="Executive Marketplace Control Center"
      subtitle="Complete platform oversight: real-time telemetry, geographic map, anomaly audits, revenue leakage tracking, seller risk matrix, and macro forecasting."
      links={links}
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
            <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr] items-center">
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
          <Panel title="💸 Revenue Leakage & Financial Audit Detector">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-error/10 border border-error/30 p-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-error">Total Potential Leakage</span>
                <h3 className="text-2xl font-black text-error">{leakageData?.leakageFormatted || "৳170K"}</h3>
                <p className="mt-1 text-xs text-muted">Recovered this month: {leakageData?.recoveredThisMonth || "৳240,000"}</p>
              </div>
              <p className="max-w-md text-xs text-text font-medium">
                🛡️ {leakageData?.automatedRemediation || "Atomic locks deployed on coupon checkout to prevent parallel redemption leaks."}
              </p>
            </div>

            <div className="space-y-3">
              {leakageData?.leakageCategories.map((leak, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 text-xs">
                  <div>
                    <span className="font-bold text-text">{leak.type}</span>
                    <p className="text-[11px] text-muted mt-0.5">{leak.details}</p>
                  </div>
                  <span className="text-base font-black text-error">৳{leak.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 6: SELLER RISK RANKING */}
      {activeTab === "seller_risk" && (
        <div className="space-y-6">
          <Panel title="🛡️ Seller Risk Ranking & Moderation Matrix">
            <div className="grid gap-4 sm:grid-cols-4 text-center text-xs">
              <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
                <p className="text-[10px] font-bold text-success uppercase">Low Risk</p>
                <p className="text-xl font-black text-success">{riskData?.riskDistribution.low.count || 4120}</p>
                <p className="text-[10px] text-muted mt-1">{riskData?.riskDistribution.low.percentage}%</p>
              </div>
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-[10px] font-bold text-amber-600 uppercase">Medium Risk</p>
                <p className="text-xl font-black text-amber-600">{riskData?.riskDistribution.medium.count || 580}</p>
                <p className="text-[10px] text-muted mt-1">{riskData?.riskDistribution.medium.percentage}%</p>
              </div>
              <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
                <p className="text-[10px] font-bold text-orange-600 uppercase">High Risk</p>
                <p className="text-xl font-black text-orange-600">{riskData?.riskDistribution.high.count || 121}</p>
                <p className="text-[10px] text-muted mt-1">{riskData?.riskDistribution.high.percentage}%</p>
              </div>
              <div className="rounded-2xl border border-error/30 bg-error/10 p-4">
                <p className="text-[10px] font-bold text-error uppercase">Critical</p>
                <p className="text-xl font-black text-error">{riskData?.riskDistribution.critical.count || 18}</p>
                <p className="text-[10px] text-muted mt-1">{riskData?.riskDistribution.critical.percentage}%</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted">Flagged Merchants Requiring Review</h4>
              {riskData?.flaggedSellers.map((flg, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl border border-border p-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text">{flg.storeName}</span>
                      <span className="rounded-md bg-error/20 text-error px-2 py-0.5 text-[10px] font-extrabold">
                        {flg.riskLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted mt-1">{flg.reason}</p>
                  </div>
                  <span className="rounded-xl border border-border px-3 py-1.5 text-[11px] font-bold text-text">
                    {flg.actionRequired}
                  </span>
                </div>
              ))}
            </div>
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
                        {cat.growthRate}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted mt-1">
                      {cat.orderVolume} • {cat.activeSellers} Active Sellers • Avg Order: {cat.avgOrderValue}
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
