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
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Sliders,
  FileSpreadsheet,
} from "lucide-react";
import { InfoTooltip } from "./InfoTooltip";

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
      desc: "Simulate shipping bottlenecks & container holdups",
      tooltipDesc:
        "Models delays in international sea shipping, port congestion, customs clearance, or freight container shortages.",
      whyItMatters: "Most imported inventory gets stuck at ports. Knowing your buffer saves sales.",
      icon: Ship,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "demand_surge" as ShockScenarioType,
      name: "Viral Demand Spike",
      desc: "Simulate flash sales, TikTok virality, or festival peaks",
      tooltipDesc:
        "Models an abrupt spike in customer purchases driven by social media virality, festive seasons (Eid, Puja, Black Friday), or influencer campaigns.",
      whyItMatters: "Without enough safety stock, a viral trend leads to immediate stockout and angry buyers.",
      icon: Zap,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      id: "climate_shock" as ShockScenarioType,
      name: "Adverse Weather Shock",
      desc: "Simulate monsoon, road closures, or courier halts",
      tooltipDesc:
        "Models severe regional climate disruptions like monsoon flooding, typhoons, or highway courier blockages.",
      whyItMatters: "Domestic transit can stall for 3 to 10 days. Pre-positioned local stock keeps orders shipping.",
      icon: CloudRain,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      id: "supplier_delay" as ShockScenarioType,
      name: "Tier-1 Factory Delay",
      desc: "Simulate raw material shortage or factory downtime",
      tooltipDesc:
        "Models manufacturing downtime, production backlog, or raw material scarcity at your primary supplier's factory.",
      whyItMatters: "Factory queues take weeks to clear. Advanced PO commitments protect your production slots.",
      icon: Factory,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Control Card */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/50 p-4 sm:p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                <Sliders className="h-4 w-4" />
              </span>
              <h3 className="font-bold text-foreground text-base tracking-tight flex items-center gap-2">
                Supply Chain Shock & Disruption Simulator
                <InfoTooltip
                  title="What is the Shock Simulator?"
                  description="A stress-testing tool that simulates how your current inventory will hold up if shipping is delayed or sales explode unexpectedly."
                  whyItMatters="Gives you actionable mitigation steps before actual disruptions occur."
                  actionHint="Choose a scenario, adjust sliders, and run simulation."
                />
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Model external disruptions, maritime bottlenecks, and viral demand shocks on your store inventory before they happen.
            </p>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95 disabled:opacity-50"
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
        <div className="mt-5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
            <span>Select Shock Scenario to Model:</span>
            <InfoTooltip
              title="Scenario Types"
              description="Pick the external event you want to stress-test your store against."
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              const isSelected = scenarioType === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setScenarioType(sc.id)}
                  className={`flex flex-col text-left rounded-xl border p-3.5 transition-all relative ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30"
                      : "border-border/60 bg-card/40 hover:border-border hover:bg-card/70"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${sc.color}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex items-center gap-1">
                      <InfoTooltip
                        title={sc.name}
                        description={sc.tooltipDesc}
                        whyItMatters={sc.whyItMatters}
                      />
                      {isSelected && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                    </div>
                  </div>
                  <h4 className="mt-3 font-semibold text-xs text-foreground">{sc.name}</h4>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {sc.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders Configuration */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 rounded-2xl bg-card/40 border border-border/40 p-4">
          {/* Slider 1: Lead Time Delay */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                Supply Chain Lead Time Delay
                <InfoTooltip
                  title="Lead Time Delay"
                  description="The number of extra days added to normal delivery from your manufacturer or supplier."
                  whyItMatters="If supplier normally takes 6 days, adding +7 days means delivery takes 13 days."
                />
              </span>
              <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                +{delayDays} Days Delay
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="21"
              step="1"
              value={delayDays}
              onChange={(e) => setDelayDays(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-muted rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>+1d (Minor Transit Delay)</span>
              <span>+7d (Port Bottleneck)</span>
              <span>+21d (Factory Shutdown)</span>
            </div>
          </div>

          {/* Slider 2: Demand Surge Multiplier */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                Demand Surge Multiplier
                <InfoTooltip
                  title="Demand Surge Multiplier"
                  description="Multiplies your current sales velocity. 1.4x means a 40% sudden increase in customer orders."
                  whyItMatters="Models flash sales, holiday seasons, or viral TikTok campaigns."
                />
              </span>
              <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
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
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-muted rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>1.0x (Normal Velocity)</span>
              <span>1.5x (Campaign +50%)</span>
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
            {/* Scenario Summary Card */}
            <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-md">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                Simulated Disruption
              </p>
              <h4 className="mt-1 font-bold text-foreground text-sm truncate">{result.scenario.label}</h4>
              <p className="text-[11px] text-muted-foreground mt-1">
                +{result.scenario.delayDays}d shipping delay &bull; {result.scenario.demandMultiplier}x demand speed
              </p>
            </div>

            {/* Stockout Surge */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                  Total Shocked Stockouts
                </p>
                <InfoTooltip
                  title="Shocked Stockout Count"
                  description="Total products that will run out of stock completely under this disruption scenario."
                />
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-400 font-mono">
                  {result.shockedStockoutCount}
                </span>
                <span className="text-xs font-semibold text-rose-400/90">
                  (+{result.newStockoutsTriggered} new SKUs)
                </span>
              </div>
              <p className="text-[11px] text-rose-400/80 mt-1">Deplete before new shipments arrive</p>
            </div>

            {/* Additional Lost Revenue */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Additional Lost Sales
                </p>
                <InfoTooltip
                  title="Additional Lost Revenue"
                  description="Extra sales money you lose specifically caused by this disruption (beyond baseline)."
                />
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  +${result.additionalLostRevenue.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-amber-400/80 mt-1">Unmet customer purchases while zero stock</p>
            </div>

            {/* Total Shocked Revenue at Risk */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  30d Shocked Revenue at Risk
                </p>
                <InfoTooltip
                  title="Total Shocked Revenue at Risk"
                  description="Total sales vulnerable to stockouts over the 30-day disruption window if not replenished."
                />
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-400 font-mono">
                  ${result.shockedRevenueAtRisk.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-indigo-400/80 mt-1">Over 30-day simulated shock window</p>
            </div>
          </div>

          {/* Impacted Products Table & Mitigation Playbook */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Impacted SKUs */}
            <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-5 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  Most Vulnerable SKUs Under This Disruption
                  <InfoTooltip
                    title="Vulnerable Products"
                    description="Products whose stock depletion accelerates dangerously under this disruption."
                  />
                </h4>
                <span className="text-xs text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded">
                  {result.impactedProducts.length} Affected SKUs
                </span>
              </div>

              {result.impactedProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  🎉 Excellent! Your current safety stock buffer absorbed this disruption with zero stockouts!
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/40 text-[10px] text-muted-foreground uppercase text-left">
                          <th className="pb-2">Product Title</th>
                          <th className="pb-2">Current Stock</th>
                          <th className="pb-2">Normal Depletion</th>
                          <th className="pb-2 text-rose-400">Shock Depletion</th>
                          <th className="pb-2 text-right">Estimated Lost Sales</th>
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
                            <td className="py-2.5 font-mono font-bold text-rose-400">
                              {p.shockedStockoutDays} days
                              <span className="text-[10px] ml-1 text-rose-400/80">(-{p.gapDays}d)</span>
                            </td>
                            <td className="py-2.5 font-mono font-semibold text-right text-foreground">
                              ${p.estimatedRevenueLoss.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-2.5">
                    {result.impactedProducts.map((p) => (
                      <div
                        key={p.productId}
                        className="rounded-xl border border-border/40 bg-card/70 p-3 space-y-2 text-xs"
                      >
                        <p className="font-bold text-foreground text-xs truncate">{p.title}</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-muted-foreground text-[10px] block">Current Stock:</span>
                            <span className="font-mono font-semibold text-foreground">{p.currentStock} units</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[10px] block">Shock Depletion:</span>
                            <span className="font-mono font-bold text-rose-400">
                              {p.shockedStockoutDays} days (-{p.gapDays}d)
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[10px] block">Normal Runway:</span>
                            <span className="font-mono text-muted-foreground">{p.normalStockoutDays} days</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[10px] block">Estimated Lost Sales:</span>
                            <span className="font-mono font-bold text-amber-400">
                              ${p.estimatedRevenueLoss.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* AI Mitigation Playbook */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 via-card/70 to-card/50 p-4 sm:p-5 shadow-sm backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-indigo-400" />
                    <h4 className="font-bold text-foreground text-sm">AI Mitigation Playbook</h4>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    Recommended Actions
                  </span>
                </div>

                <div className="space-y-3">
                  {result.mitigationPlaybook.map((step) => (
                    <div
                      key={step.step}
                      className="rounded-xl border border-border/50 bg-card/80 p-3 text-xs space-y-1.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                          {step.step}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            step.urgency === "immediate"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          }`}
                        >
                          {step.urgency}
                        </span>
                      </div>
                      <p className="text-foreground font-medium leading-relaxed text-[11px]">{step.action}</p>
                      <p className="text-[10.5px] text-emerald-400 font-semibold flex items-center gap-1">
                        <span>Protected Savings:</span>
                        <span>{step.expectedSavings}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button to Execute Mitigation */}
              <div className="mt-5 pt-3 border-t border-border/40">
                <button
                  onClick={() => onApplyPlan?.(result.scenario.label)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:from-indigo-500 hover:to-violet-500 transition active:scale-95"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Generate Shock-Mitigation PO (98.5% SLA)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
