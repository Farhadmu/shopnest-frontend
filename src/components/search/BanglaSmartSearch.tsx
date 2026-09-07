"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiSearch, FiTag, FiFilter, FiTrendingUp, FiShoppingBag, FiStar, FiClock } from "react-icons/fi";
import { searchBanglaSmart, BanglaSearchResponse } from "@/lib/api/customer-intelligence-features";
import { Product } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";

const SAMPLE_QUERIES = [
  "3000 takar moddhe valo headphone",
  "৩০০০ টাকার মধ্যে ভালো earbuds",
  "gaming keyboard chai",
  "budget laptop under 50000",
  "smart watch 2000 er moddhe",
];

export function BanglaSmartSearch() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BanglaSearchResponse | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shopnest_recent_searches");
      if (saved) setRecentSearches(JSON.parse(saved).slice(0, 5));
    } catch {}
  }, []);

  const handleSearch = async (qText: string) => {
    if (!qText.trim()) return;
    setIsLoading(true);
    try {
      const res = await searchBanglaSmart(qText);
      setResults(res);

      // Save to recent searches
      const updated = [qText, ...recentSearches.filter((s) => s !== qText)].slice(0, 5);
      setRecentSearches(updated);
      try {
        localStorage.setItem("shopnest_recent_searches", JSON.stringify(updated));
      } catch {}
    } catch {
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Input Bar */}
      <form onSubmit={onSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search in English, বাংলা, or Banglish (e.g. '3000 takar moddhe valo headphone')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-28 py-4 rounded-2xl bg-card border border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground text-sm font-medium shadow-sm transition-all"
          />
          <FiSearch className="absolute left-4 text-muted text-lg pointer-events-none" />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2.5 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            {isLoading ? "Analyzing..." : "Smart Search"}
          </button>
        </div>
      </form>

      {/* Suggested & Recent Query Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted font-semibold flex items-center gap-1">
          <FiTrendingUp className="text-primary" /> Popular Prompts:
        </span>
        {SAMPLE_QUERIES.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => {
              setQuery(sample);
              handleSearch(sample);
            }}
            className="px-3 py-1.5 rounded-xl bg-card border border-border/70 hover:border-primary/50 text-foreground/80 hover:text-primary transition-all text-xs"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* Extracted Intent & Filter Badges */}
      {results && results.extractedIntent && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-primary flex items-center gap-1">
              <FiFilter /> Query Understanding:
            </span>
            {results.extractedIntent.budgetLimit && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                Max Budget: ৳{results.extractedIntent.budgetLimit.toLocaleString()}
              </span>
            )}
            {results.extractedIntent.detectedCategory && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 font-bold border border-purple-500/20">
                Category: {results.extractedIntent.detectedCategory}
              </span>
            )}
            {results.extractedIntent.keywords.map((kw, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-card border border-border text-muted font-medium">
                #{kw}
              </span>
            ))}
          </div>
          <span className="text-muted font-semibold">
            {results.totalFound} products matched
          </span>
        </div>
      )}

      {/* Product Results Grid */}
      {results && (
        <div className="space-y-4">
          {results.products.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border text-muted">
              <p className="font-bold text-foreground">No exact matches found for your query.</p>
              <p className="text-xs mt-1">Try adjusting the budget or searching with different Bangla keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.products.map((p) => {
                const price = p.discountPrice ?? p.price;
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="group bg-card border border-border/80 hover:border-primary/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square w-full rounded-xl bg-muted-bg overflow-hidden relative mb-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted font-bold">ShopNest</div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{p.category}</span>
                      <h4 className="text-xs font-bold text-foreground line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                        {p.title}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold mt-1.5">
                        <FiStar className="fill-amber-400 text-amber-400" />
                        <span>{p.ratingAvg ? p.ratingAvg.toFixed(1) : "4.8"}</span>
                        <span className="text-muted text-[10px]">({p.sold || 12} sold)</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-black text-foreground">{formatCurrency(price)}</span>
                        {p.discountPrice && (
                          <span className="text-[10px] text-muted line-through ml-1.5">
                            {formatCurrency(p.price)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-primary group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
