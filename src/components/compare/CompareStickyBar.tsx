"use client";

import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiCheck } from "react-icons/fi";
import { CompareProductData } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { toast } from "@/context/ToastContext";

interface CompareStickyBarProps {
  products: CompareProductData[];
}

export function CompareStickyBar({ products }: CompareStickyBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const { addItem } = useCartDrawer();

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past the hero/card slots (~420px)
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleQuickAdd = async (product: CompareProductData) => {
    setAddingId(product.id);
    try {
      await addItem({
        productId: product.id,
        title: product.title,
        price: product.discountPrice || product.price,
        image: product.images?.[0],
        category: product.category,
      });
      toast.success(`${product.title} added to cart!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  if (!isVisible || products.length === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-md transition-all duration-300 animate-in fade-in slide-in-from-top-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {products.map((p) => {
            const isAdding = addingId === p.id;
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 bg-muted-bg/50 px-3 py-1.5 rounded-xl border border-border/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-card overflow-hidden border border-border flex-shrink-0 flex items-center justify-center">
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted font-bold">SN</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{p.title}</p>
                    <p className="text-[11px] font-black text-primary">
                      {formatCurrency(p.discountPrice || p.price)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickAdd(p)}
                  disabled={isAdding || p.stock <= 0}
                  className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-[11px] flex-shrink-0 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                  title="Quick Add to Cart"
                >
                  {isAdding ? <FiCheck className="w-3 h-3" /> : <FiShoppingCart className="w-3 h-3" />}
                  <span>{isAdding ? "Added" : "Add"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
