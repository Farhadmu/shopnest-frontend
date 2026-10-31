"use client";

import { CustomerGenomeProfile } from "@/lib/api/hyperpersonal";
import {
  Dna,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  Heart,
  Calendar,
} from "lucide-react";

interface Props {
  genome: CustomerGenomeProfile;
}

export function CustomerGenomeCard({ genome }: Props) {
  return (
    <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-card/95 via-card/80 to-card/50 p-6 shadow-md backdrop-blur-md space-y-6">
      {/* Top Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Dna className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-mono font-bold text-indigo-500 uppercase tracking-wider">
              Customer Genome ID: #{genome.userId?.slice(-6) || "948210"}
            </span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500">
              {genome.privacyShieldStatus}
            </span>
          </div>
          <h3 className="text-lg font-black text-foreground mt-1">
            {genome.archetype}
          </h3>
          <p className="text-xs text-muted-foreground">
            Personalized behavioral DNA mapping your purchasing preferences, style clusters, and price elasticity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-border/60 bg-card p-3 text-center min-w-[90px]">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Loyalty Score</span>
            <span className="text-xl font-black text-indigo-500 font-mono">{genome.loyaltyScore}/100</span>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-3 text-center min-w-[90px]">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Total Spent</span>
            <span className="text-xl font-black text-foreground font-mono">{genome.totalSpentFormatted}</span>
          </div>
        </div>
      </div>

      {/* Aesthetic Style Clusters */}
      <div className="space-y-2 text-xs">
        <span className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          Aesthetic Style Preferences
        </span>
        <div className="flex flex-wrap gap-2">
          {genome.aestheticStyles.map((style, idx) => (
            <span
              key={idx}
              className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 font-semibold text-indigo-500"
            >
              {style}
            </span>
          ))}
        </div>
      </div>

      {/* Category Affinity Progress Bars */}
      <div className="space-y-3 border-t border-border/40 pt-4 text-xs">
        <span className="text-[11px] font-bold text-muted-foreground uppercase block">
          Category Affinities & Interest Intensity
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {genome.topCategoryAffinities.map((cat, idx) => (
            <div key={idx} className="space-y-1.5 rounded-xl border border-border/40 bg-card/40 p-3">
              <div className="flex justify-between font-semibold text-foreground">
                <span>{cat.category}</span>
                <span className="font-mono text-indigo-500">{cat.affinityScore}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${cat.affinityScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border/40 pt-4 text-xs">
        <div className="rounded-xl bg-card/40 border border-border/40 p-2.5">
          <span className="text-[10px] text-muted-foreground uppercase font-medium">Price Elasticity</span>
          <p className="font-bold text-foreground capitalize mt-0.5">{genome.priceElasticity.replace("_", " ")}</p>
        </div>
        <div className="rounded-xl bg-card/40 border border-border/40 p-2.5">
          <span className="text-[10px] text-muted-foreground uppercase font-medium">Funnel Stage</span>
          <p className="font-bold text-indigo-500 capitalize mt-0.5">{genome.journeyStage.replace("_", " ")}</p>
        </div>
        <div className="rounded-xl bg-card/40 border border-border/40 p-2.5">
          <span className="text-[10px] text-muted-foreground uppercase font-medium">Purchases Count</span>
          <p className="font-bold text-foreground mt-0.5">{genome.lifetimePurchasesCount} Orders</p>
        </div>
        <div className="rounded-xl bg-card/40 border border-border/40 p-2.5">
          <span className="text-[10px] text-muted-foreground uppercase font-medium">Predicted Next Order</span>
          <p className="font-bold text-emerald-500 mt-0.5">~{genome.estimatedNextOrderWindowDays} Days</p>
        </div>
      </div>
    </div>
  );
}
