"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiClock, FiShoppingCart, FiStar, FiArrowRight } from "react-icons/fi";
import { addToCart } from "@/lib/api/cart";
import { formatCurrency } from "@/lib/utils";
import {
  getRecentlyViewedProducts,
  getSmartRecommendations,
  recordRecentlyViewedProduct,
  type CustomerProductSuggestion,
} from "@/lib/api/customer-intelligence";

export interface RecentlyViewedItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  rating?: number;
  category?: string;
  viewedAt: number | string;
}

export function recordRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("shopnest_recently_viewed");
    let list: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];
    list = list.filter((i) => i.id !== item.id);
    list.unshift({ ...item, viewedAt: Date.now() });
    localStorage.setItem("shopnest_recently_viewed", JSON.stringify(list.slice(0, 10)));
    void recordRecentlyViewedProduct(item.id).catch(() => undefined);
  } catch {
    // Ignore storage quota errors
  }
}

export function RecentlyViewed({ currentProductId }: { currentProductId?: string }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      try {
        const remote = await getRecentlyViewedProducts();
        if (!isCurrent) return;
        const mapped = remote.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.discountPrice ?? item.price,
          image: item.images?.[0],
          rating: item.ratingAvg,
          category: item.category,
          viewedAt: item.viewedAt ?? Date.now(),
        }));
        setItems(currentProductId ? mapped.filter((item) => item.id !== currentProductId).slice(0, 6) : mapped.slice(0, 6));
      } catch {
        try {
          const raw = localStorage.getItem("shopnest_recently_viewed");
          const parsed: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];
          if (isCurrent) {
            setItems(currentProductId ? parsed.filter((item) => item.id !== currentProductId).slice(0, 6) : parsed.slice(0, 6));
          }
        } catch {
          if (isCurrent) setItems([]);
        }
      }
    };
    void load();
    return () => {
      isCurrent = false;
    };
  }, [currentProductId]);

  if (items.length === 0) return null;

  const handleAddToCart = async (item: RecentlyViewedItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(item.id);
    try {
      await addToCart(item.id, 1);
      setAddedId(item.id);
      setTimeout(() => setAddedId(null), 1800);
    } catch (err: any) {
      alert(err?.message || "Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <section className="py-8 border-t border-border/60">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FiClock />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-foreground">Recently Viewed</h3>
            <p className="text-xs text-muted">Pick up right where you left off</p>
          </div>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          Explore All <FiArrowRight />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.id}`}
            className="group relative bg-card border border-border/80 hover:border-primary/50 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="aspect-square w-full rounded-xl bg-muted-bg overflow-hidden relative mb-2.5 flex items-center justify-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-muted text-xs font-bold">ShopNest</div>
                )}
              </div>
              <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold mt-1">
                <FiStar className="fill-amber-400 text-amber-400" />
                <span>{item.rating ? item.rating.toFixed(1) : "5.0"}</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between gap-1">
              <span className="text-xs font-black text-foreground">
                {formatCurrency(item.price)}
              </span>
              <button
                type="button"
                onClick={(e) => handleAddToCart(item, e)}
                disabled={addingId === item.id}
                className={`p-2 rounded-xl text-xs transition-all ${
                  addedId === item.id
                    ? "bg-emerald-500 text-white"
                    : "bg-primary/10 hover:bg-primary text-primary hover:text-white"
                }`}
                title="Add to Cart"
              >
                <FiShoppingCart />
              </button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SmartRecommendations({ currentProductId }: { currentProductId?: string }) {
  const [items, setItems] = useState<CustomerProductSuggestion[]>([]);

  useEffect(() => {
    let isCurrent = true;
    getSmartRecommendations()
      .then((results) => {
        if (isCurrent) setItems(results.filter((item) => item.id !== currentProductId).slice(0, 6));
      })
      .catch(() => {
        if (isCurrent) setItems([]);
      });
    return () => {
      isCurrent = false;
    };
  }, [currentProductId]);

  if (items.length === 0) return null;

  return (
    <section className="border-t border-border/60 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-foreground">You May Also Like</h3>
          <p className="text-xs text-muted">Recommendations based on your saved and recently viewed products</p>
        </div>
        <Link href="/products" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
          Shop more <FiArrowRight />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <Link key={item.id} href={`/products/${item.id}`} className="group rounded-2xl border border-border/80 bg-card p-3 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <div className="mb-2.5 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-muted-bg">
              {item.images?.[0] ? <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <span className="text-xs font-bold text-muted">ShopNest</span>}
            </div>
            <h4 className="line-clamp-1 text-xs font-bold text-foreground group-hover:text-primary">{item.title}</h4>
            <div className="mt-2 flex items-center justify-between gap-1">
              <span className="text-xs font-black text-foreground">{formatCurrency(item.discountPrice ?? item.price)}</span>
              {item.ratingAvg ? <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500"><FiStar className="fill-amber-400" />{item.ratingAvg.toFixed(1)}</span> : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
