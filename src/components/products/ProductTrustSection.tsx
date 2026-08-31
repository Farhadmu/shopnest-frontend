"use client";

import React, { useState, useEffect } from "react";
import { FiShield, FiCheckCircle, FiAlertTriangle, FiAward, FiInfo, FiX, FiTrendingDown } from "react-icons/fi";
import { getProductTrustReport, getValueForMoneyScore, ProductTrustReport } from "@/lib/api/customer-intelligence-features";

export function ProductTrustSection({ productId }: { productId: string }) {
  const [trust, setTrust] = useState<ProductTrustReport | null>(null);
  const [valueData, setValueData] = useState<{ score: number; summary: string; breakdown: any[] } | null>(null);
  const [showValueModal, setShowValueModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      setLoading(true);
      Promise.all([
        getProductTrustReport(productId).catch(() => null),
        getValueForMoneyScore(productId).catch(() => null),
      ]).then(([tRes, vRes]) => {
        if (tRes) setTrust(tRes);
        if (vRes) setValueData(vRes);
        setLoading(false);
      });
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="p-6 rounded-3xl bg-card border border-border/80 animate-pulse space-y-3">
        <div className="h-4 w-32 bg-muted-bg rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted-bg rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!trust) return null;

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
            <FiShield />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground">ShopNest Trust & Integrity Report</h3>
            <p className="text-[11px] text-muted">Multi-signal algorithmic assessment powered by real platform data</p>
          </div>
        </div>

        {valueData && (
          <button
            type="button"
            onClick={() => setShowValueModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-bold transition-colors border border-emerald-500/20"
          >
            <FiAward /> Value Score: {valueData.score}/10 <FiInfo size={11} />
          </button>
        )}
      </div>

      {/* 4 Trust Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Seller Trust */}
        <div className="p-3.5 rounded-2xl bg-surface border border-border/60">
          <span className="text-[10px] text-muted uppercase font-bold block">Seller Trust</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-lg font-black text-foreground">{trust.sellerTrust}/100</span>
            <FiCheckCircle className="text-emerald-500" />
          </div>
          <p className="text-[10px] text-muted mt-0.5">Verified Merchant</p>
        </div>

        {/* Product Trust */}
        <div className="p-3.5 rounded-2xl bg-surface border border-border/60">
          <span className="text-[10px] text-muted uppercase font-bold block">Product Trust</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-lg font-black text-foreground">{trust.productTrust}/100</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">High</span>
          </div>
          <p className="text-[10px] text-muted mt-0.5">Spec verified</p>
        </div>

        {/* Review Quality */}
        <div className="p-3.5 rounded-2xl bg-surface border border-border/60">
          <span className="text-[10px] text-muted uppercase font-bold block">Review Authenticity</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-lg font-black text-foreground">{trust.reviewQuality}</span>
          </div>
          <p className="text-[10px] text-muted mt-0.5">{trust.verifiedReviewsCount} verified buyers</p>
        </div>

        {/* Return Risk */}
        <div className="p-3.5 rounded-2xl bg-surface border border-border/60">
          <span className="text-[10px] text-muted uppercase font-bold block">Return Risk</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-lg font-black ${
                trust.returnRisk === "Low" ? "text-emerald-500" : "text-amber-500"
              }`}
            >
              {trust.returnRisk}
            </span>
          </div>
          <p className="text-[10px] text-muted mt-0.5">{trust.returnRate} return rate</p>
        </div>
      </div>

      {/* Fake Discount Warning / Genuine Discount Verification Banner */}
      <div
        className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
          trust.discountIntegrity === "caution"
            ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
        }`}
      >
        <span className="text-base mt-0.5">
          {trust.discountIntegrity === "caution" ? <FiAlertTriangle /> : <FiTrendingDown />}
        </span>
        <div>
          <strong className="font-bold block">
            {trust.discountIntegrity === "caution"
              ? "Discount Integrity Alert"
              : "Price Integrity Verified"}
          </strong>
          <p className="text-[11px] text-foreground/80 mt-0.5">{trust.discountNote}</p>
        </div>
      </div>

      {/* Value For Money Breakdown Modal */}
      {showValueModal && valueData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FiAward className="text-emerald-500 text-lg" />
                <h4 className="font-extrabold text-foreground text-sm">Value for Money Breakdown</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowValueModal(false)}
                className="text-muted hover:text-foreground p-1"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="text-center py-2">
              <span className="text-3xl font-black text-emerald-500">{valueData.score}</span>
              <span className="text-xs text-muted"> / 10 Value Score</span>
              <p className="text-xs text-muted mt-1">{valueData.summary}</p>
            </div>

            <div className="space-y-3 pt-2">
              {valueData.breakdown.map((item, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>{item.factor}</span>
                    <span className="text-muted">{item.score}/100</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted-bg overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowValueModal(false)}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
