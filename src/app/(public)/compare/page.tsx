"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProducts, Product } from "@/lib/api/products";
import { compareProductsAI, CompareResult } from "@/lib/api/ai-commerce";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  FiColumns,
  FiCheck,
  FiX,
  FiZap,
  FiStar,
  FiShoppingBag,
  FiPlus,
  FiTrash2,
  FiArrowRight,
} from "react-icons/fi";

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialIds = (searchParams.get("ids") || "").split(",").filter(Boolean);

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialIds);
  const [comparing, setComparing] = useState(false);
  const [aiComparison, setAiComparison] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProducts({ limit: 50 })
      .then((res) => setAvailableProducts(Array.isArray(res) ? res : (res as any)?.items || []))
      .catch(() => setAvailableProducts([]));
  }, []);

  const selectedProducts = availableProducts.filter((p) =>
    selectedProductIds.includes(p.id)
  );

  const handleToggleProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds((prev) => prev.filter((i) => i !== id));
      setAiComparison(null);
    } else {
      if (selectedProductIds.length >= 4) {
        setError("You can compare a maximum of 4 products at once.");
        return;
      }
      setError(null);
      setSelectedProductIds((prev) => [...prev, id]);
      setAiComparison(null);
    }
  };

  const runAiCompare = async () => {
    if (selectedProductIds.length < 2) {
      setError("Please select at least 2 products to compare.");
      return;
    }
    setComparing(true);
    setError(null);
    try {
      const res = await compareProductsAI(selectedProductIds);
      setAiComparison(res);
    } catch (err: any) {
      setError(err?.message || "Failed to generate AI comparison.");
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <FiZap /> Multi-Vendor Intelligence
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            AI Product Comparison Engine
          </h1>
          <p className="text-sm text-muted mt-1">
            Compare specifications, price-to-performance value, ratings, and AI verdicts side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runAiCompare}
            disabled={selectedProductIds.length < 2 || comparing}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
          >
            <FiZap /> {comparing ? "Analyzing Specs..." : `Compare Selected (${selectedProductIds.length})`}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
          {error}
        </div>
      )}

      {/* Product Selection Bar */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <FiColumns className="text-primary" /> Select Products from Marketplace (Select 2 to 4)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {availableProducts.map((p) => {
            const isSelected = selectedProductIds.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => handleToggleProduct(p.id)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-between ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-border/80 bg-background/50"
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-muted-bg flex items-center justify-center text-lg mb-2 overflow-hidden">
                  {p.images && p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <FiShoppingBag className="text-muted" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-foreground line-clamp-1">{p.title}</h4>
                <p className="text-[11px] font-black text-primary mt-1">
                  {formatCurrency(p.discountPrice || p.price)}
                </p>
                <span
                  className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? "bg-primary text-white" : "bg-muted-bg text-muted"
                  }`}
                >
                  {isSelected ? "Selected ✓" : "+ Compare"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid & AI Summary */}
      {selectedProducts.length > 0 && (
        <div className="space-y-6">
          {aiComparison && (
            <div className="bg-gradient-to-r from-primary/10 via-card to-primary/5 border border-primary/20 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <FiZap /> AI Neutral Verdict & Analysis
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {aiComparison.summary || "AI analysis completed based on verified specs, pricing, and buyer reviews."}
              </p>
            </div>
          )}

          {/* Comparison Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted-bg border-b border-border text-foreground font-bold">
                  <tr>
                    <th className="p-4 w-44">Feature</th>
                    {selectedProducts.map((p) => (
                      <th key={p.id} className="p-4 min-w-[200px]">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold line-clamp-2">{p.title}</span>
                          <button
                            onClick={() => handleToggleProduct(p.id)}
                            className="text-muted hover:text-red-500 text-sm"
                            title="Remove"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-muted">
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Current Price</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 font-black text-primary text-sm">
                        {formatCurrency(p.discountPrice || p.price)}
                        {p.discountPrice && p.price > p.discountPrice && (
                          <span className="block text-[10px] text-muted line-through">
                            {formatCurrency(p.price)}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Rating & Sentiment</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          <FiStar className="fill-amber-500 text-xs" /> {p.ratingAvg || "5.0"}
                        </span>
                        <span className="text-[11px] text-muted block mt-1">({p.ratingCount || 0} reviews)</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Category</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 font-medium text-foreground">
                        {p.category}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Stock Availability</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4">
                        {p.stock > 0 ? (
                          <span className="text-emerald-500 font-semibold flex items-center gap-1">
                            <FiCheck /> In Stock ({p.stock} units)
                          </span>
                        ) : (
                          <span className="text-red-500 font-semibold flex items-center gap-1">
                            <FiX /> Out of Stock
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Action</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4">
                        <Link
                          href={`/products/${p.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover transition-colors"
                        >
                          View Details <FiArrowRight />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted">Loading compare engine...</div>}>
      <CompareContent />
    </Suspense>
  );
}
