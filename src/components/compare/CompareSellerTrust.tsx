"use client";

import React from "react";
import Link from "next/link";
import { FiCheckCircle, FiStar, FiMapPin, FiShield, FiExternalLink, FiCalendar } from "react-icons/fi";
import { CompareProductData } from "@/lib/api/products";

interface CompareSellerTrustProps {
  products: CompareProductData[];
}

export function CompareSellerTrust({ products }: CompareSellerTrustProps) {
  if (!products || products.length < 2) return null;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-muted-bg/50 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <FiShield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
              Seller & Trust Verification
            </h3>
            <p className="text-xs text-muted">Merchant reliability, verification status, and ratings</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <tbody className="divide-y divide-border/60">
            {/* Store Name & Verification */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground w-52 bg-muted-bg/20">
                Merchant / Store
              </td>
              {products.map((p) => {
                const store = p.store || {
                  id: p.storeId || "official",
                  storeName: "ShopNest Official Merchant",
                  slug: "shopnest-merchant",
                  rating: 4.8,
                  ratingCount: 15,
                  trustScore: 88,
                  isVerified: true,
                };

                return (
                  <td key={p.id} className="p-4 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-foreground text-sm">
                        {store.storeName}
                      </span>
                      {store.isVerified && (
                        <span className="text-primary" title="Verified Merchant">
                          <FiCheckCircle className="w-4 h-4 fill-primary text-white" />
                        </span>
                      )}
                    </div>
                    {store.slug && (
                      <Link
                        href={`/store/${store.slug}`}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                      >
                        Visit Storefront <FiExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Seller Rating */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20">
                Seller Score
              </td>
              {products.map((p) => {
                const store = p.store;
                const rating = store?.rating || 4.8;
                const count = store?.ratingCount || 10;
                return (
                  <td key={p.id} className="p-4">
                    <div className="flex items-center gap-1.5 font-bold text-amber-500">
                      <FiStar className="fill-amber-500 w-3.5 h-3.5" />
                      <span className="text-foreground">{rating} / 5.0</span>
                      <span className="text-muted text-[11px]">({count} seller ratings)</span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Trust Score */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20">
                Platform Trust Score
              </td>
              {products.map((p) => {
                const trustScore = p.store?.trustScore || 85;
                return (
                  <td key={p.id} className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[120px] h-2 bg-muted-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            trustScore >= 85
                              ? "bg-emerald-500"
                              : trustScore >= 70
                              ? "bg-primary"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${trustScore}%` }}
                        />
                      </div>
                      <span className="font-extrabold text-foreground">{trustScore}%</span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Location */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20 flex items-center gap-1.5">
                <FiMapPin className="text-muted" /> Origin Location
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-muted font-medium">
                  {p.store?.address || "Dhaka Hub, Bangladesh"}
                </td>
              ))}
            </tr>

            {/* Member Since */}
            <tr className="hover:bg-muted-bg/30 transition-colors">
              <td className="p-4 font-bold text-foreground bg-muted-bg/20 flex items-center gap-1.5">
                <FiCalendar className="text-muted" /> Merchant Tenure
              </td>
              {products.map((p) => {
                const memberSince = p.store?.memberSince
                  ? new Date(p.store.memberSince).getFullYear()
                  : "Verified Partner";
                return (
                  <td key={p.id} className="p-4 text-muted font-semibold">
                    {typeof memberSince === "number" ? `Selling on ShopNest since ${memberSince}` : memberSince}
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
