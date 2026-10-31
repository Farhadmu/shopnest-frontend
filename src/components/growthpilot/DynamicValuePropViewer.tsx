"use client";

import { useState, useEffect } from "react";
import { DynamicValueProp, getDynamicValueProps } from "@/lib/api/growthpilot";
import {
  Globe,
  Sparkles,
  Search,
  Share2,
  Briefcase,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface Props {
  productId: string;
}

export function DynamicValuePropViewer({ productId }: Props) {
  const [propsList, setPropsList] = useState<DynamicValueProp[]>([]);
  const [activeSource, setActiveSource] = useState<string>("google_search");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    getDynamicValueProps(productId)
      .then((data) => {
        setPropsList(data);
        if (data.length > 0) setActiveSource(data[0].referralSource);
      })
      .catch((err) => console.error("Error loading value props:", err))
      .finally(() => setLoading(false));
  }, [productId]);

  const activeProp = propsList.find((p) => p.referralSource === activeSource);

  const sourceIcons: Record<string, any> = {
    google_search: Search,
    facebook_ad: Share2,
    tiktok_viral: Zap,
    linkedin_b2b: Briefcase,
    direct: Compass,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                <Globe className="h-4 w-4" />
              </span>
              <h3 className="font-extrabold text-foreground text-base tracking-tight">
                Dynamic Website Personalization Layer
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Rewrites your storefront copy and value propositions in real-time based on the visitor&apos;s referral source & intent.
            </p>
          </div>
        </div>

        {/* Source Switcher Pills */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {propsList.map((p) => {
            const Icon = sourceIcons[p.referralSource] || Globe;
            const isSelected = activeSource === p.referralSource;
            return (
              <button
                key={p.referralSource}
                onClick={() => setActiveSource(p.referralSource)}
                className={`inline-flex items-center gap-2 shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "border border-border/60 bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {p.sourceLabel}
              </button>
            );
          })}
        </div>

        {/* Live Storefront Simulation Banner */}
        {activeProp && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-card/90 p-6 shadow-xl backdrop-blur-xl text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 px-3 py-1 text-[11px] font-bold text-indigo-300">
                  <Sparkles className="h-3 w-3" />
                  {activeProp.urgencyBadge}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Incoming Persona: {activeProp.visitorPersona}
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                {activeProp.adaptedHeadline}
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {activeProp.adaptedSubheadline}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                <span className="text-xs font-bold text-amber-300">
                  🎁 {activeProp.personalizedOfferText}
                </span>
                <button className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-indigo-950 shadow-md hover:bg-slate-100 transition">
                  Shop Now with Exclusive Offer &rarr;
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs flex items-center gap-2.5 text-emerald-600 font-medium">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Conversion Impact: {activeProp.conversionBenefit}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
