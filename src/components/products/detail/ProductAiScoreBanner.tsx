"use client";

import React, { useEffect, useState } from "react";
import {
  FiZap,
  FiDollarSign,
  FiAward,
  FiActivity,
  FiShield,
  FiCheckCircle,
  FiCpu,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import type { Product } from "@/lib/api/products";
import {
  getPurchaseDecisionScore,
  PurchaseDecisionScoreData,
} from "@/lib/api/customer-intelligence";

export interface ProductAiScoreBannerProps {
  product: Product;
}

interface DimensionConfig {
  key: string;
  icon: IconType;
  colorClass: string;
  bgClass: string;
  barColor: string;
  dim?: { score: number; label: string; note: string };
}

export function ProductAiScoreBanner({ product }: ProductAiScoreBannerProps) {
  const [data, setData] = useState<PurchaseDecisionScoreData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const productId = product.id || (product as { _id?: string })._id;

  useEffect(() => {
    let isMounted = true;

    if (!productId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    getPurchaseDecisionScore(productId)
      .then((res) => {
        if (!isMounted) return;
        if (!res || res.insufficientData || typeof res.overallScore !== "number" || !res.dimensions) {
          setData(null);
        } else {
          setData(res);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setData(null);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Loading skeleton shimmer to prevent layout shift while data is fetched
  if (loading) {
    return (
      <div className="w-full">
        <div
          className="rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-sm space-y-4"
          role="status"
          aria-label="Loading AI decision score"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="shimmer h-14 w-14 rounded-2xl shrink-0" />
              <div className="space-y-2">
                <div className="shimmer h-3 w-44 rounded" />
                <div className="shimmer h-5 w-64 rounded" />
              </div>
            </div>
            <div className="shimmer h-8 w-48 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="shimmer h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If real data is unavailable, call failed, or insufficient data: hide banner completely
  if (!data || typeof data.overallScore !== "number" || !data.dimensions) {
    return null;
  }

  const { overallScore, dimensions, recommendation } = data;

  const rawDimensions: DimensionConfig[] = [
    {
      key: "quality",
      icon: FiAward,
      colorClass: "text-amber-500",
      bgClass: "bg-amber-500/10",
      barColor: "bg-amber-500",
      dim: dimensions.quality,
    },
    {
      key: "value",
      icon: FiDollarSign,
      colorClass: "text-emerald-500",
      bgClass: "bg-emerald-500/10",
      barColor: "bg-emerald-500",
      dim: dimensions.value,
    },
    {
      key: "popularity",
      icon: FiActivity,
      colorClass: "text-blue-500",
      bgClass: "bg-blue-500/10",
      barColor: "bg-blue-500",
      dim: dimensions.popularity,
    },
    {
      key: "reliability",
      icon: FiShield,
      colorClass: "text-purple-500",
      bgClass: "bg-purple-500/10",
      barColor: "bg-purple-500",
      dim: dimensions.reliability,
    },
  ];

  const dimensionItems = rawDimensions.filter(
    (item): item is DimensionConfig & { dim: { score: number; label: string; note: string } } =>
      Boolean(item.dim && item.dim.label && item.dim.note)
  );

  return (
    <section
      id="ai-decision-card"
      className="scroll-mt-28 w-full rounded-3xl border border-primary/20 bg-gradient-to-br from-surface via-surface-muted/40 to-primary/5 p-5 sm:p-7 shadow-sm transition-all relative overflow-hidden"
    >
      {/* Background glow accents */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-border/60 pb-5">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white font-black text-xl sm:text-2xl shadow-md shadow-primary/20 ring-4 ring-primary/10">
              {overallScore}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-surface">
              <FiCheckCircle size={11} />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-primary">
                <FiZap className="fill-primary" size={13} /> ShopNest AI Decision Engine
              </span>
              <span className="hidden sm:inline-block text-muted text-xs">•</span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted-bg px-2 py-0.5 text-[10px] font-bold text-muted capitalize">
                <FiCpu size={10} /> Verified Confidence
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-text tracking-tight">
              {recommendation || "Verified AI Assessment"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto bg-surface/80 border border-border/80 rounded-2xl px-3.5 py-2 text-xs font-semibold text-muted shadow-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] leading-tight">
            Real-time algorithmic score evaluated from verified orders, buyer reviews & store metrics
          </span>
        </div>
      </div>

      {/* 4 Multi-Dimensional Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5">
        {dimensionItems.map(({ key, icon: Icon, colorClass, bgClass, barColor, dim }) => {
          const scorePercent = Math.min(Math.max(dim.score || 70, 20), 100);

          return (
            <div
              key={key}
              className="flex flex-col justify-between rounded-2xl border border-border/70 bg-surface/90 hover:bg-surface p-4 shadow-xs hover:border-primary/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0 text-sm`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-bold text-text group-hover:text-primary transition-colors">
                      {dim.label}
                    </span>
                  </div>
                  <span className="text-xs font-black text-text bg-muted-bg px-2 py-0.5 rounded-lg font-mono">
                    {dim.score}/100
                  </span>
                </div>

                {/* Micro Progress Bar */}
                <div className="h-1.5 w-full rounded-full bg-muted-bg overflow-hidden my-2.5">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-muted font-medium mt-1 leading-relaxed">
                {dim.note}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}