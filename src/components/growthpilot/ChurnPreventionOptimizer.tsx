"use client";

import { useState } from "react";
import { ChurnRiskCustomer } from "@/lib/api/growthpilot";
import {
  UserX,
  ShieldAlert,
  Percent,
  Send,
  Check,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign,
} from "lucide-react";
import { toast } from "@/context/ToastContext";

interface Props {
  customers: ChurnRiskCustomer[];
}

export function ChurnPreventionOptimizer({ customers }: Props) {
  const [deployedIds, setDeployedIds] = useState<Set<string>>(new Set());

  const handleDeployVoucher = (c: ChurnRiskCustomer) => {
    setDeployedIds((prev) => new Set(prev).add(c.customerId));
    toast.success(`Personalized ${c.recommendedDiscountPercent}% Comeback Voucher deployed to ${c.name}!`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                <UserX className="h-4 w-4" />
              </span>
              <h3 className="font-extrabold text-foreground text-base tracking-tight">
                Predictive Churn Engine & Dynamic Discounter
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              RL-inspired individualized discount strategies that maximize retention while strictly protecting merchant profit margins.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 font-semibold text-emerald-500">
              Safety Cap: Max 20% Discount
            </span>
          </div>
        </div>

        {/* Churn Queue Table */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-border/40">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30 text-[10px] uppercase text-muted-foreground text-left">
                <th className="p-3.5">Customer</th>
                <th className="p-3.5 text-center">Historical Spend</th>
                <th className="p-3.5 text-center">Last Active</th>
                <th className="p-3.5 text-center">Churn Risk</th>
                <th className="p-3.5 text-center text-indigo-500 font-bold">Optimal Discount</th>
                <th className="p-3.5 text-center">Recovery Prob</th>
                <th className="p-3.5 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {customers.map((c) => {
                const isDeployed = deployedIds.has(c.customerId);
                return (
                  <tr key={c.customerId} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-foreground block">{c.name}</span>
                      <span className="text-[11px] text-muted-foreground">{c.email}</span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-foreground">
                      ${c.totalSpent.toLocaleString()}
                      <span className="text-[10px] font-normal text-muted-foreground block">
                        ({c.totalOrders} orders)
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono text-muted-foreground">
                      {c.lastOrderDaysAgo}d ago
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          c.riskTier === "critical"
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            : c.riskTier === "high"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                        }`}
                      >
                        {Math.round(c.churnProbability * 100)}% ({c.riskTier})
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-black text-indigo-600 bg-indigo-500/5">
                      {c.recommendedDiscountPercent}% OFF
                    </td>
                    <td className="p-3.5 text-center font-mono font-semibold text-emerald-600">
                      {Math.round(c.projectedRecoveryProbability * 100)}% Win-Back
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeployVoucher(c)}
                        disabled={isDeployed}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
                          isDeployed
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        {isDeployed ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                        {isDeployed ? "Voucher Sent" : "Deploy Incentive"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
