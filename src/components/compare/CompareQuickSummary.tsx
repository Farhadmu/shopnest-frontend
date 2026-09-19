"use client";

import React from "react";
import { FiCheck, FiAlertCircle, FiStar, FiTruck, FiShield, FiTag, FiZap } from "react-icons/fi";
import { CompareProductData } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";

interface CompareQuickSummaryProps {
  products: CompareProductData[];
}

export function CompareQuickSummary({ products }: CompareQuickSummaryProps) {
  if (!products || products.length < 2) return null;

  const lowestPrice = Math.min(...products.map((p) => p.discountPrice || p.price));
  const highestRating = Math.max(...products.map((p) => p.ratingAvg || 0));

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-muted-bg/50 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiZap className="text-primary w-4 h-4" />
          <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
            Quick Decision Matrix
          </h3>
        </div>
        <span className="text-xs text-muted font-medium">Core purchase indicators at a glance</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <tbody className="divide-y divide-border/60">
            {/* Price Row */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground w-48 bg-muted-bg/20 flex items-center gap-2">
                <FiTag className="text-primary" /> Price
              </td>
              {products.map((p) => {
                const price = p.discountPrice || p.price;
                const isLowest = price === lowestPrice;
                return (
                  <td key={p.id} className="p-4 font-extrabold text-sm">
                    <div className="flex items-center gap-2">
                      <span className={isLowest ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-foreground"}>
                        {formatCurrency(price)}
                      </span>
                      {isLowest && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Lowest
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Customer Rating */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20 flex items-center gap-2">
                <FiStar className="text-amber-500" /> Customer Rating
              </td>
              {products.map((p) => {
                const rating = p.ratingAvg || 4.5;
                const isHighest = rating === highestRating;
                return (
                  <td key={p.id} className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md text-xs">
                        <FiStar className="fill-amber-500 w-3 h-3" /> {rating}
                      </span>
                      {isHighest && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Top Rated
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Total Reviews */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20">
                Verified Reviews
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-muted font-semibold">
                  {p.ratingCount ? `${p.ratingCount.toLocaleString()} verified reviews` : "No reviews yet"}
                </td>
              ))}
            </tr>

            {/* Stock Availability */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20">
                Stock Status
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  {p.stock > 5 ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <FiCheck className="w-3.5 h-3.5" /> In Stock ({p.stock} units)
                    </span>
                  ) : p.stock > 0 ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                      <FiAlertCircle className="w-3.5 h-3.5" /> Low Stock ({p.stock} units)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                      <FiAlertCircle className="w-3.5 h-3.5" /> Out of Stock
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Delivery */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20 flex items-center gap-2">
                <FiTruck className="text-primary" /> Delivery Cost
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  {p.freeDelivery ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <FiCheck className="w-3.5 h-3.5" /> Free Delivery
                    </span>
                  ) : (
                    <span className="text-muted font-medium">Standard (৳60)</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Warranty */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20 flex items-center gap-2">
                <FiShield className="text-primary" /> Warranty
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-foreground font-semibold">
                  {p.warrantyMonths
                    ? `${p.warrantyMonths} Months (${p.warrantyProvider || "Official"})`
                    : "Standard 7-Day Guarantee"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
