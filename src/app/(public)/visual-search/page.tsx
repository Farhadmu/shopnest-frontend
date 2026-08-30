"use client";

import React, { useState } from "react";
import { visualSearchAI, VisualSearchResult } from "@/lib/api/ai-commerce";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  FiCamera,
  FiUploadCloud,
  FiSearch,
  FiStar,
  FiArrowRight,
  FiShoppingBag,
  FiImage,
  FiCheckCircle,
} from "react-icons/fi";

const SAMPLE_SEARCH_IMAGES = [
  { label: "Wireless Headphones", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80" },
  { label: "Mechanical Keyboard", url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80" },
  { label: "Gaming Mouse", url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80" },
  { label: "Oversized Hoodie", url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80" },
];

export default function VisualSearchPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<VisualSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (urlToSearch?: string) => {
    const targetUrl = (urlToSearch || imageUrl).trim();
    if (!targetUrl) {
      setError("Please provide an image URL to search.");
      return;
    }

    setSearching(true);
    setError(null);
    try {
      const data = await visualSearchAI(targetUrl, searchQuery);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Visual search failed. Please try a different image.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider">
          <FiCamera /> AI Visual Intelligence
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Visual Product Search
        </h1>
        <p className="text-sm text-muted">
          Find matching items across all vendor storefronts simply by pasting or uploading a product photo.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm max-w-2xl mx-auto space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <FiImage className="text-primary" /> Image URL or Product Photo
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/product-image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => handleSearch()}
              disabled={searching || !imageUrl.trim()}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 shrink-0"
            >
              <FiSearch /> {searching ? "Analyzing..." : "Find Matches"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Tip: Add a description below to improve search results
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <FiSearch className="text-primary" /> Describe What You See (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., wireless headphones, gaming laptop, running shoes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Sample Quick Try Buttons */}
        <div>
          <span className="text-[11px] font-semibold text-muted block mb-2">Or try these sample products:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SAMPLE_SEARCH_IMAGES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setImageUrl(sample.url);
                  handleSearch(sample.url);
                }}
                className="p-2 rounded-xl border border-border bg-background/60 hover:bg-primary/5 hover:border-primary text-left text-xs font-medium transition-all flex items-center gap-2 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sample.url} alt={sample.label} className="w-8 h-8 rounded-lg object-cover" />
                <span className="truncate text-foreground group-hover:text-primary text-[11px]">{sample.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary/10 via-card to-primary/5 border border-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">AI Visual Recognition</span>
              <p className="text-base font-extrabold text-foreground mt-0.5">
                Detected: &ldquo;{result.detectedQuery}&rdquo;
              </p>
            </div>
            <span className="text-xs font-bold text-muted bg-background px-3 py-1.5 rounded-full border border-border">
              {result.products.length} matching products found
            </span>
          </div>

          {result.products.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 text-2xl">
                <FiSearch />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">No Direct Visual Match</h3>
              <p className="text-xs text-muted">
                Try searching with another photo angle or browse all marketplace products.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
              >
                Browse Full Catalog <FiArrowRight />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {result.products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="bg-card border border-border rounded-2xl p-3.5 hover:border-primary/50 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full aspect-square rounded-xl bg-muted-bg overflow-hidden mb-3 relative">
                      {p.images && p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <FiShoppingBag className="text-2xl" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                        {p.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {p.title}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="font-black text-sm text-primary">
                      {formatCurrency(p.discountPrice || p.price)}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                      <FiStar className="fill-amber-500 text-[10px]" /> {p.ratingAvg || "5.0"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
