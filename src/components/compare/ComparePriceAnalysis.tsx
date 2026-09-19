"use client";

import React from "react";
import { FiDollarSign, FiPercent, FiTrendingDown, FiCheckCircle } from "react-icons/fi";
import { CompareProductData } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";

interface ComparePriceAnalysisProps {
  products: CompareProductData[];
}

export function ComparePriceAnalysis({ products }: ComparePriceAnalysisProps) {
  if (!products || products.length < 2) return null;

  const effectivePrices = products.map((p) => p.discountPrice || p.price);
  const lowestPrice = Math.min(...effectivePrices);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-muted-bg/50 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FiDollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
              Price & Value Analysis
            </h3>
            <p className="text-xs text-muted">Cost variations, discounts, and real feature value</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <tbody className="divide-y divide-border/60">
            {/* Current Price */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground w-52 bg-muted-bg/20">
                Effective Price
              </td>
              {products.map((p) => {
                const current = p.discountPrice || p.price;
                const isLowest = current === lowestPrice;
                return (
                  <td key={p.id} className="p-4">
                    <span className="text-lg font-black text-foreground">
                      {formatCurrency(current)}
                    </span>
                    {isLowest && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <FiCheckCircle className="w-3 h-3" /> Best Price
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Original Price & Discounts */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20 flex items-center gap-1.5">
                <FiPercent className="text-muted" /> Promotional Discount
              </td>
              {products.map((p) => {
                const hasDiscount = p.discountPrice && p.discountPrice < p.price;
                if (!hasDiscount) {
                  return (
                    <td key={p.id} className="p-4 text-muted font-medium">
                      Standard Market Price
                    </td>
                  );
                }
                const saved = p.price - p.discountPrice!;
                const percent = Math.round((saved / p.price) * 100);
                return (
                  <td key={p.id} className="p-4">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-rose-500">
                        Save {formatCurrency(saved)} ({percent}% OFF)
                      </span>
                      <span className="text-[11px] text-muted block line-through">
                        Regular: {formatCurrency(p.price)}
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Price Difference vs Cheapest */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20 flex items-center gap-1.5">
                <FiTrendingDown className="text-muted" /> Difference vs Lowest
              </td>
              {products.map((p) => {
                const current = p.discountPrice || p.price;
                const diff = current - lowestPrice;
                if (diff === 0) {
                  return (
                    <td key={p.id} className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      Lowest Baseline (৳0)
                    </td>
                  );
                }
                const diffPercent = Math.round((diff / lowestPrice) * 100);
                return (
                  <td key={p.id} className="p-4 text-foreground font-semibold">
                    +{formatCurrency(diff)} (+{diffPercent}%)
                  </td>
                );
              })}
            </tr>

            {/* Transparent Value Context */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20">
                Value Assessment
              </td>
              {products.map((p) => {
                const current = p.discountPrice || p.price;
                const rating = p.ratingAvg || 4.5;
                const costPerStar = Math.round(current / rating);
                return (
                  <td key={p.id} className="p-4 text-xs text-muted leading-relaxed">
                    <span className="font-semibold text-foreground">
                      ৳{costPerStar.toLocaleString()} per rating star
                    </span>
                    <span className="block text-[11px] mt-0.5">
                      Based on verified ৳{current.toLocaleString()} price and {rating}/5 customer satisfaction.
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
