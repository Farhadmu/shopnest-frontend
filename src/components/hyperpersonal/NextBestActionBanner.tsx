"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NextBestAction, getNextBestAction } from "@/lib/api/hyperpersonal";
import { Sparkles, ArrowRight, Tag, ShieldCheck, Zap } from "lucide-react";

export function NextBestActionBanner() {
  const [nba, setNba] = useState<NextBestAction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getNextBestAction()
      .then((data) => setNba(data))
      .catch((err) => console.error("Error fetching NBA:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !nba) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-card/90 p-5 md:p-6 shadow-xl backdrop-blur-xl text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-0.5 text-xs font-bold text-indigo-300">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              {nba.badge}
            </span>
            {nba.incentiveVoucher && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                <Tag className="h-3 w-3" />
                Code: {nba.incentiveVoucher.code} ({nba.incentiveVoucher.discountPercent}% OFF)
              </span>
            )}
          </div>

          <h3 className="text-base md:text-lg font-black text-white tracking-tight leading-snug">
            {nba.headline}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {nba.subtext}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={nba.ctaLink || "/"}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-5 py-3 text-xs font-bold text-white shadow-lg hover:from-indigo-400 hover:to-violet-500 transition-all active:scale-95"
          >
            <span>{nba.ctaText}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
