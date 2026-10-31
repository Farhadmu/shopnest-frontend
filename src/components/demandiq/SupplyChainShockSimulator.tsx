"use client";

import { useState } from "react";
import {
  ShockScenarioType,
  ShockSimulationResult,
  simulateShock,
} from "@/lib/api/demandiq";
import {
  Ship,
  Zap,
  CloudRain,
  Factory,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Sliders,
} from "lucide-react";

interface Props {
  onApplyPlan?: (recommendation: string) => void;
}

export function SupplyChainShockSimulator({ onApplyPlan }: Props) {
  const [scenarioType, setScenarioType] = useState<ShockScenarioType>("port_delay");
  const [delayDays, setDelayDays] = useState<number>(7);
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.4);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ShockSimulationResult | null>(null);

  const handleSimulate = async () => {
    try {
      setLoading(true);
      const data = await simulateShock({
        scenarioType,
        delayDays,
        demandMultiplier,
      });
      setResult(data);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const scenarios = [
    {
      id: "port_delay" as ShockScenarioType,
      name: "Port & Customs Delay",
      desc: "Simulate container shipping & maritime freight bottlenecks",
      icon: Ship,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "demand_surge" as ShockScenarioType,
      name: "Viral Demand Spike",
      desc: "Simulate flash sales, TikTok/social spikes, or holiday surges",
      icon: Zap,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      id: "climate_shock" as ShockScenarioType,
      name: "Adverse Weather Shock",
      desc: "Simulate unseasonal weather or regional climate disruptions",
      icon: CloudRain,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      id: "supplier_delay" as ShockScenarioType,
      name: "Tier-1 Factory Delay",
      desc: "Simulate raw material shortage or manufacturer queue delays",
      icon: Factory,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Control Card */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/50 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                <Sliders className="h-3.5 w-3.5" />
              </span>
              <h3 className="font-bold text-foreground text-base tracking-tight">
                Supply Chain Shock & Disruption Simulator
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Model external supply disruptions, maritime delays, and demand shocks on your store inventory before they happen.
            </p>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Simulating Shock...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Run Shock Simulation
              </>
            )}
          </button>
        </div>

        {/* Scenario Selection Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isSelected = scenarioType === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setScenarioType(sc.id)}
                className={`flex flex-col text-left rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                    : "border-border/60 bg-card/40 hover:border-border hover:bg-card/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${sc.color}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {isSelected && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                </div>
                <h4 className="mt-3 font-semibold text-xs text-foreground">{sc.name}</h4>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{sc.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Sliders Configuration */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 rounded-xl bg-card/40 border border-border/40 p-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-foreground">Supply Chain Lead Time Delay</span>
              <span className="font-mono font-bold text-indigo-500">+{delayDays} Days</span>
            </div>
            <input
              type="range"
              min="1"
              max="21"
              step="1"
              value={delayDays}
              onChange={(e) => setDelayDays(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>+1 Day (Mild)</span>
              <span>+7 Days (Port Congestion)</span>
              <span>+21 Days (Global Strike)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-foreground">Unexpected Demand Surge Multiplier</span>
              <span className="font-mono font-bold text-indigo-500">
                {Math.round((demandMultiplier - 1) * 100)}% Surge ({demandMultiplier}x)
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={demandMultiplier}
              onChange={(e) => setDemandMultiplier(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>1.0x (Normal)</span>
              <span>1.5x (Flash Sale +50%)</span>
              <span>2.5x (Viral Spike +150%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Results Display */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Key Shock Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-md">
              <p className="text-xs text-muted-foreground font-medium uppercase">Shock Scenario</p>
              <h4 className="mt-1 font-bold text-foreground text-sm truncate">{result.scenario.label}</h4>
              <p className="text-[11px] text-muted-foreground mt-1">
                +{result.scenario.delayDays}d shipping delay &bull; {result.scenario.demandMultiplier}x velocity
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-sm backdrop-blur-md">
              <p className="text-xs text-rose-500 font-semibold uppercase">Stockout Surge</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-500 font-mono">
                  {result.shockedStockoutCount}
                </span>
                <span className="text-xs font-semibold text-rose-500/80">
                  (+{result.newStockoutsTriggered} new SKUs)
                </span>
              </div>
              <p className="text-[11px] text-rose-600/80 mt-1">SKUs that will deplete before delivery</p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm backdrop-blur-md">
              <p className="text-xs text-amber-500 font-semibold uppercase">Additional Lost Revenue</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-500 font-mono">
                  +${result.additionalLostRevenue.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-amber-600/80 mt-1">Unmet customer purchases during stockout</p>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 shadow-sm backdrop-blur-md">
              <p className="text-xs text-indigo-500 font-semibold uppercase">Total Shocked Revenue at Risk</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-500 font-mono">
                  ${result.shockedRevenueAtRisk.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-indigo-600/80 mt-1">Over 30-day simulated disruption window</p>
            </div>
          </div>

          {/* Impacted Products Table & Mitigation Playbook */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Impacted SKUs */}
            <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  Most Vulnerable SKUs Under This Disruption
                </h4>
                <span className="text-xs text-muted-foreground font-mono">
                  {result.impactedProducts.length} Affected
                </span>
              </div>

              {result.impactedProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Your safety stock buffer absorbed this disruption with zero stockouts!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/40 text-[10px] text-muted-foreground uppercase text-left">
                        <th className="pb-2">Product</th>
                        <th className="pb-2">Current Stock</th>
                        <th className="pb-2">Normal Depletion</th>
                        <th className="pb-2 text-rose-500">Shock Depletion</th>
                        <th className="pb-2 text-right">Lost Sales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {result.impactedProducts.map((p) => (
                        <tr key={p.productId} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 pr-2 font-medium text-foreground max-w-[200px] truncate">
                            {p.title}
                          </td>
                          <td className="py-2.5 font-mono">{p.currentStock} units</td>
                          <td className="py-2.5 font-mono text-muted-foreground">{p.normalStockoutDays} days</td>
                          <td className="py-2.5 font-mono font-bold text-rose-500">
                            {p.shockedStockoutDays} days
                            <span className="text-[10px] ml-1 text-rose-400">(-{p.gapDays}d)</span>
                          </td>
                          <td className="py-2.5 font-mono font-semibold text-right text-foreground">
                            ${p.estimatedRevenueLoss.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* AI Mitigation Playbook */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 via-card/60 to-card/40 p-5 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-4">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                <h4 className="font-bold text-foreground text-sm">AI Mitigation Playbook</h4>
              </div>

              <div className="space-y-3.5">
                {result.mitigationPlaybook.map((step) => (
                  <div key={step.step} className="rounded-xl border border-border/40 bg-card/70 p-3 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                        {step.step}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          step.urgency === "immediate"
                            ? "bg-rose-500/10 text-rose-500"
                            : "bg-indigo-500/10 text-indigo-500"
                        }`}
                      >
                        {step.urgency}
                      </span>
                    </div>
                    <p className="text-foreground font-medium leading-relaxed">{step.action}</p>
                    <p className="mt-1 text-[11px] text-emerald-500 font-medium">{step.expectedSavings}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
