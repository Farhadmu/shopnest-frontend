"use client";

import React, { useEffect, useState } from "react";
import { FiZap, FiDollarSign, FiAward, FiActivity, FiShield } from "react-icons/fi";
import type { IconType } from "react-icons";
import type { Product } from "@/lib/api/products";
import {
  getPurchaseDecisionScore,
  PurchaseDecisionScoreData,
} from "@/lib/api/customer-intelligence";

export interface ProductAiScoreBannerProps {
  product: Product;
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
      <div className="@container w-full">
        <div
          className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm @[850px]:flex-row @[850px]:items-center"
          role="status"
          aria-label="Loading AI decision score"
        >
          <div className="flex items-center gap-3 min-w-[260px] sm:min-w-[280px] shrink-0">
            <div className="shimmer h-12 w-12 shrink-0 rounded-xl" />
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <div className="shimmer h-3 w-36 rounded" />
              <div className="shimmer h-4 w-48 rounded" />
            </div>
          </div>
          <div className="flex flex-1 min-w-0 flex-wrap items-center gap-2">
            <div className="shimmer h-6 w-28 rounded-lg" />
            <div className="shimmer h-6 w-32 rounded-lg" />
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

  interface DimensionConfig {
    key: string;
    icon: IconType;
    dim?: { score: number; label: string; note: string };
  }

  const rawDimensions: DimensionConfig[] = [
    { key: "quality", icon: FiAward, dim: dimensions.quality },
    { key: "value", icon: FiDollarSign, dim: dimensions.value },
    { key: "popularity", icon: FiActivity, dim: dimensions.popularity },
    { key: "reliability", icon: FiShield, dim: dimensions.reliability },
  ];

  const dimensionItems = rawDimensions.filter(
    (item): item is DimensionConfig & { dim: { score: number; label: string; note: string } } =>
      Boolean(item.dim && item.dim.label && item.dim.note)
  );

  return (
    <div className="@container w-full">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-linear-to-r from-surface via-muted-bg to-surface p-5 shadow-sm @[850px]:flex-row @[850px]:items-center">
        <div className="flex items-center gap-3 min-w-[260px] sm:min-w-[280px] shrink-0">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg font-black text-primary">
            {overallScore}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary">
              ShopNest AI Decision Score <FiZap size={13} />
            </div>
            <p className="text-sm font-bold text-text leading-snug">
              {recommendation || "Verified AI Assessment"}
            </p>
          </div>
        </div>

        <div className="flex flex-1 min-w-0 flex-wrap items-center gap-2 text-xs">
          {dimensionItems.map(({ key, icon: Icon, dim }) => (
            <span
              key={key}
              title={`${dim.label}: ${dim.note}`}
              className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface/70 px-2.5 py-1 text-[11px] font-medium text-muted"
            >
              <Icon size={14} className="text-primary shrink-0" />
              <span className="font-semibold text-text">{dim.label}</span>
              <span className="text-muted">({dim.note})</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}