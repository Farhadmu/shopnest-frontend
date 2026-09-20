"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiColumns,
  FiPlus,
  FiArrowRight,
  FiShoppingBag,
  FiLayers,
  FiRefreshCw,
  FiAlertTriangle,
} from "react-icons/fi";

import { getCompareProducts, CompareProductData } from "@/lib/api/products";
import { CompareResult } from "@/lib/api/ai-commerce";

import { CompareHero } from "@/components/compare/CompareHero";
import { CompareProductSlots } from "@/components/compare/CompareProductSlots";
import { CompareStickyBar } from "@/components/compare/CompareStickyBar";
import { CompareQuickSummary } from "@/components/compare/CompareQuickSummary";
import { CompareAiAssistant } from "@/components/compare/CompareAiAssistant";
import { CompareKeyDifferences } from "@/components/compare/CompareKeyDifferences";
import { CompareSpecGroups } from "@/components/compare/CompareSpecGroups";
import { ComparePriceAnalysis } from "@/components/compare/ComparePriceAnalysis";
import { CompareReviews } from "@/components/compare/CompareReviews";
import { CompareSellerTrust } from "@/components/compare/CompareSellerTrust";
import { CompareDeliveryWarranty } from "@/components/compare/CompareDeliveryWarranty";
import { CompareDecisionPanel } from "@/components/compare/CompareDecisionPanel";
import { CompareAddProductModal } from "@/components/compare/CompareAddProductModal";
import { CompareHistoryDrawer } from "@/components/compare/CompareHistoryDrawer";

const MAX_COMPARE_LIMIT = 4;

function CompareWorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract initial product IDs from URL query params ?ids=...
  const initialIdsParam = searchParams.get("ids") || "";
  const initialIds = initialIdsParam.split(",").map((s) => s.trim()).filter(Boolean);

  const [productIds, setProductIds] = useState<string[]>(initialIds);
  const [products, setProducts] = useState<CompareProductData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(initialIds.length > 0);
  const [error, setError] = useState<string | null>(null);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // View modes
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [aiResult, setAiResult] = useState<CompareResult | null>(null);

  // Synchronize URL with active product IDs
  const syncUrl = useCallback(
    (newIds: string[]) => {
      const currentUrl = new URL(window.location.href);
      if (newIds.length > 0) {
        currentUrl.searchParams.set("ids", newIds.join(","));
      } else {
        currentUrl.searchParams.delete("ids");
      }
      window.history.replaceState({}, "", currentUrl.toString());
    },
    []
  );

  // Load enriched comparison data when product IDs change
  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getCompareProducts(productIds)
      .then((data) => {
        if (!isMounted) return;
        setProducts(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || "Failed to load product comparison.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productIds]);

  // Handlers
  const handleAddProduct = (id: string) => {
    if (productIds.includes(id)) return;
    if (productIds.length >= MAX_COMPARE_LIMIT) {
      setError(`You can compare a maximum of ${MAX_COMPARE_LIMIT} products at once.`);
      return;
    }
    setError(null);
    const updated = [...productIds, id];
    setProductIds(updated);
    syncUrl(updated);
    setAiResult(null);
  };

  const handleRemoveProduct = (id: string) => {
    const updated = productIds.filter((item) => item !== id);
    setProductIds(updated);
    syncUrl(updated);
    setAiResult(null);
  };

  const handleMoveProduct = (index: number, direction: "left" | "right") => {
    const newIdx = direction === "left" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= productIds.length) return;

    const newIds = [...productIds];
    const temp = newIds[index];
    newIds[index] = newIds[newIdx];
    newIds[newIdx] = temp;

    setProductIds(newIds);
    syncUrl(newIds);
  };

  const handleClearAll = () => {
    setProductIds([]);
    setProducts([]);
    syncUrl([]);
    setAiResult(null);
  };

  const handleLoadSavedComparison = (ids: string[]) => {
    const clean = ids.slice(0, MAX_COMPARE_LIMIT);
    setProductIds(clean);
    syncUrl(clean);
    setAiResult(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Sticky Compact Top Bar when scrolled */}
      <CompareStickyBar products={products} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Workspace Hero Header */}
        <CompareHero
          productCount={products.length}
          maxLimit={MAX_COMPARE_LIMIT}
          productIds={productIds}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenHistoryDrawer={() => setIsHistoryDrawerOpen(true)}
          onClearAll={handleClearAll}
          canCompare={products.length >= 2}
        />

        {/* Global Error Banner if any */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="font-bold underline hover:text-rose-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State Skeletons */}
        {isLoading && products.length === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-pulse"
                >
                  <div className="w-full aspect-square bg-muted-bg rounded-xl" />
                  <div className="h-4 bg-muted-bg rounded w-3/4" />
                  <div className="h-6 bg-muted-bg rounded w-1/2" />
                  <div className="h-9 bg-muted-bg rounded-xl" />
                </div>
              ))}
            </div>
            <div className="h-48 bg-card border border-border rounded-2xl animate-pulse" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm space-y-6 max-w-2xl mx-auto my-12">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
              <FiColumns className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                No Products Selected for Comparison
              </h2>
              <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                Add 2 to {MAX_COMPARE_LIMIT} products from our marketplace to compare detailed specifications, verified buyer reviews, delivery options, and AI trade-offs side-by-side.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/25 transition-all flex items-center gap-2 active:scale-95"
              >
                <FiPlus className="w-4 h-4" /> Add Products to Compare
              </button>

              <Link
                href="/products"
                className="px-6 py-3 bg-card hover:bg-muted-bg border border-border text-foreground font-bold text-sm rounded-2xl transition-all flex items-center gap-2 shadow-xs"
              >
                <FiShoppingBag className="w-4 h-4" /> Browse Catalog
              </Link>
            </div>

            {/* Quick Category Browse Shortcuts */}
            <div className="pt-6 border-t border-border/60">
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                Popular categories to compare:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Laptops", "Smartphones", "Audio", "Monitors", "Wearables"].map((cat) => (
                  <Link
                    key={cat}
                    href={`/products?category=${cat}`}
                    className="px-3 py-1.5 rounded-xl bg-muted-bg/60 hover:bg-muted-bg text-xs font-semibold text-foreground border border-border/50 transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Comparison Workspace Content */}
        {products.length > 0 && (
          <div className="space-y-10">
            {/* Top Product Cards Grid */}
            <section aria-label="Compared Products">
              <CompareProductSlots
                products={products}
                onRemoveProduct={handleRemoveProduct}
                onMoveProduct={handleMoveProduct}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                maxLimit={MAX_COMPARE_LIMIT}
              />
            </section>

            {/* Single Product Notice if only 1 is selected */}
            {products.length === 1 && (
              <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-3">
                <p className="font-bold text-sm text-foreground">
                  Select at least one more product to unlock full side-by-side comparison, AI insights, and difference analysis.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  + Add Second Product
                </button>
              </div>
            )}

            {/* Full Comparative Analysis Sections (Rendered when 2+ products are loaded) */}
            {products.length >= 2 && (
              <>
                {/* 1. Quick Decision Matrix */}
                <section aria-label="Quick Overview">
                  <CompareQuickSummary products={products} />
                </section>

                {/* 2. Flagship AI Decision Assistant */}
                <section aria-label="AI Comparison Assistant">
                  <CompareAiAssistant
                    products={products}
                    aiResult={aiResult}
                    onAiResultUpdate={setAiResult}
                  />
                </section>

                {/* 3. Key Differences */}
                <section aria-label="Key Differences">
                  <CompareKeyDifferences
                    products={products}
                    differencesOnly={differencesOnly}
                    onToggleDifferencesOnly={setDifferencesOnly}
                  />
                </section>

                {/* 4. Grouped Specifications Matrix */}
                <section aria-label="Specifications Matrix">
                  <CompareSpecGroups
                    products={products}
                    differencesOnly={differencesOnly}
                  />
                </section>

                {/* 5. Price & Value Breakdown */}
                <section aria-label="Price and Value">
                  <ComparePriceAnalysis products={products} />
                </section>

                {/* 6. Customer Reviews & Ratings */}
                <section aria-label="Customer Reviews">
                  <CompareReviews products={products} />
                </section>

                {/* 7. Seller & Trust Verification */}
                <section aria-label="Seller and Trust">
                  <CompareSellerTrust products={products} />
                </section>

                {/* 8. Delivery & Warranty */}
                <section aria-label="Delivery and Warranty">
                  <CompareDeliveryWarranty products={products} />
                </section>

                {/* 9. Final Decision & Purchase Row */}
                <section aria-label="Purchase Actions">
                  <CompareDecisionPanel
                    products={products}
                    winnerByValueId={aiResult?.winnerByValue}
                  />
                </section>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Product Search Modal */}
      <CompareAddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectProduct={handleAddProduct}
        selectedProductIds={productIds}
        maxLimit={MAX_COMPARE_LIMIT}
      />

      {/* Compare History Drawer */}
      <CompareHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onLoadComparison={handleLoadSavedComparison}
      />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted text-xs space-y-2">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-bold">Initializing ShopNest Comparison Workspace...</p>
        </div>
      }
    >
      <CompareWorkspaceContent />
    </Suspense>
  );
}
