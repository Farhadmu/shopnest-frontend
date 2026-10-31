"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, StatCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getGrowthPilotOverview, GrowthPilotOverview } from "@/lib/api/growthpilot";
import { MultiChannelOrchestrator } from "@/components/growthpilot/MultiChannelOrchestrator";
import { ChurnPreventionOptimizer } from "@/components/growthpilot/ChurnPreventionOptimizer";
import { DynamicValuePropViewer } from "@/components/growthpilot/DynamicValuePropViewer";
import { toast } from "@/context/ToastContext";
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Target,
  UserX,
  Share2,
  Globe,
  RefreshCw,
  Send,
  Zap,
} from "lucide-react";

export default function GrowthPilotPage() {
  const [data, setData] = useState<GrowthPilotOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"orchestrator" | "churn" | "dynamic_layer" | "lead_radar">("orchestrator");

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getGrowthPilotOverview();
      setData(res);
    } catch (err) {
      console.error("GrowthPilot fetch error:", err);
      toast.error("Failed to load GrowthPilot data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <DashboardShell
      role="Seller"
      title="GrowthPilot: Autonomous Growth & Marketing Engine"
      subtitle="CAC Down, Conversion Up — Multimodal Cross-Platform Content Orchestration & Predictive Churn Discounter"
      links={sellerDashboardLinks}
    >
      <div className="space-y-6">
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-card/90 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-0.5 text-xs font-bold text-indigo-300">
                  <Zap className="h-3.5 w-3.5 text-indigo-400" />
                  GrowthPilot Autonomous Marketing Engine
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
                  CAC Down, Conversion Up
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Turn Every Product Listing Into an Omnichannel Growth Machine
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Autonomous RL-guided multi-channel content generation, personalized churn recovery discounting, and real-time website layer adaptation.
              </p>
            </div>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Estimated CAC Reduction"
            value={`-${data?.estimatedCacReductionPercent || 36}%`}
            icon="📉"
            note="Driven by viral organic content & high-CTR copy"
            color="success"
          />
          <StatCard
            label="Projected Conversion Lift"
            value={`+${data?.projectedConversionRateLiftPercent || 4.8}%`}
            icon="📈"
            note="From dynamic UI value props & smart discounts"
            color="accent"
          />
          <StatCard
            label="At-Risk Recoverable Revenue"
            value={`$${(data?.totalAtRiskRevenue || 0).toLocaleString()}`}
            icon="🛡️"
            note={`${data?.highRiskChurnCount || 0} customers in churn danger zone`}
            color="error"
          />
          <StatCard
            label="Leads Scored & Prioritized"
            value={(data?.totalCustomerLeadsScored || 0).toString()}
            icon="🎯"
            note="Active customer intent tracking"
            color="default"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-1 overflow-x-auto scrollbar-none">
          {[
            { id: "orchestrator", label: "Multi-Channel Content Orchestrator", icon: Share2 },
            { id: "churn", label: "Predictive Churn Discounter", icon: UserX },
            { id: "dynamic_layer", label: "Dynamic Website Layer", icon: Globe },
            { id: "lead_radar", label: "Buyer Lead Scoring Radar", icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: MULTI-CHANNEL CONTENT ORCHESTRATOR */}
        {activeTab === "orchestrator" && (
          <div className="animate-in fade-in duration-200">
            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-border/60">
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : data && data.topProducts.length > 0 ? (
              <MultiChannelOrchestrator products={data.topProducts} />
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No store products found. Add products to generate multi-channel campaigns.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PREDICTIVE CHURN DISCOUNTER */}
        {activeTab === "churn" && (
          <div className="animate-in fade-in duration-200">
            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-border/60">
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : data && data.atRiskCustomers.length > 0 ? (
              <ChurnPreventionOptimizer customers={data.atRiskCustomers} />
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">
                All customer accounts are active and healthy. No immediate churn threats detected.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DYNAMIC WEBSITE LAYER */}
        {activeTab === "dynamic_layer" && (
          <div className="animate-in fade-in duration-200">
            {data && data.topProducts.length > 0 ? (
              <DynamicValuePropViewer productId={data.topProducts[0].id} />
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Please add products to preview dynamic storefront layers.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LEAD SCORING RADAR */}
        {activeTab === "lead_radar" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-md">
              <div className="border-b border-border/40 pb-4 mb-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-indigo-500" />
                  Real-Time Lead & Intent Scoring Radar
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Prioritizes active shoppers and leads by purchase intent, browsing recency, and category affinities.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/40">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/30 text-[10px] uppercase text-muted-foreground text-left">
                      <th className="p-3.5">Lead / Shopper</th>
                      <th className="p-3.5 text-center">Intent Score</th>
                      <th className="p-3.5 text-center">Stage</th>
                      <th className="p-3.5">Favorite Category</th>
                      <th className="p-3.5">Recommended Automated Outreach</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(data?.leadScoringQueue || []).map((l) => (
                      <tr key={l.customerId} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-bold text-foreground">
                          {l.name}
                          <span className="text-[11px] font-normal text-muted-foreground block">{l.email}</span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-indigo-500">
                          {l.intentScore}/100
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              l.intentStage === "Hot Prospect"
                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                : l.intentStage === "Warm Shopper"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {l.intentStage}
                          </span>
                        </td>
                        <td className="p-3.5 text-muted-foreground">{l.favoriteCategory}</td>
                        <td className="p-3.5 font-medium text-foreground">{l.recommendedAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
