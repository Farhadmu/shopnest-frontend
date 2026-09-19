"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiAward, FiShoppingCart, FiZap, FiCheckCircle } from "react-icons/fi";
import { CompareProductData } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { toast } from "@/context/ToastContext";

interface CompareDecisionPanelProps {
  products: CompareProductData[];
  winnerByValueId?: string;
}

export function CompareDecisionPanel({
  products,
  winnerByValueId,
}: CompareDecisionPanelProps) {
  const router = useRouter();
  const { addItem } = useCartDrawer();
  const [addingId, setAddingId] = useState<string | null>(null);

  if (!products || products.length < 2) return null;

  const lowestPrice = Math.min(...products.map((p) => p.discountPrice || p.price));
  const highestRating = Math.max(...products.map((p) => p.ratingAvg || 0));

  const handleAddToCart = async (p: CompareProductData) => {
    setAddingId(p.id);
    try {
      await addItem({
        productId: p.id,
        title: p.title,
        price: p.discountPrice || p.price,
        image: p.images?.[0],
        category: p.category,
      });
      toast.success(`${p.title} added to cart!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  const handleBuyNow = async (p: CompareProductData) => {
    await handleAddToCart(p);
    router.push("/cart");
  };

  return (
    <div className="bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <FiAward className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-foreground">
            Final Decision Summary
          </h3>
          <p className="text-xs text-muted">
            Ready to checkout? Compare top highlights and select your preferred product.
          </p>
        </div>
      </div>

      {/* Grid of decision badges */}
      <div className={`grid gap-4 ${products.length === 2 ? "grid-cols-1 md:grid-cols-2" : products.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
        {products.map((p) => {
          const price = p.discountPrice || p.price;
          const isLowest = price === lowestPrice;
          const isHighestRating = (p.ratingAvg || 0) === highestRating;
          const isBestValue = p.id === winnerByValueId;
          const isAdding = addingId === p.id;

          return (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {isLowest && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                      Lowest Price
                    </span>
                  )}
                  {isHighestRating && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] border border-amber-500/20">
                      Top Rated
                    </span>
                  )}
                  {isBestValue && (
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[10px] border border-primary/20">
                      AI Value Pick
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-sm text-foreground line-clamp-2">
                  {p.title}
                </h4>

                <p className="text-xl font-black text-primary">
                  {formatCurrency(price)}
                </p>

                <p className="text-[11px] text-muted line-clamp-2">
                  {p.freeDelivery ? "Free shipping included" : "Standard shipping"} • {p.stock > 0 ? "In Stock" : "Out of Stock"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                <button
                  onClick={() => handleAddToCart(p)}
                  disabled={isAdding || p.stock <= 0}
                  className="px-3 py-2 rounded-xl bg-muted-bg hover:bg-muted-bg/80 text-foreground font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <FiShoppingCart className="w-3.5 h-3.5" />
                  {isAdding ? "Adding..." : "Add to Cart"}
                </button>

                <button
                  onClick={() => handleBuyNow(p)}
                  disabled={p.stock <= 0}
                  className="px-3 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <FiZap className="w-3.5 h-3.5" />
                  Buy Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
