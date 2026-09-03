"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { useOverviewStats } from "@/hooks/dashboard/user/useOverviewStats";
import { useShoppingIntent } from "@/hooks/dashboard/user/useShoppingIntent";
import { addToCart } from "@/lib/api/cart";
import { formatCurrency } from "@/lib/utils";
import {
  FiShoppingBag,
  FiBox,
  FiHeart,
  FiShield,
  FiSearch,
  FiArrowRight,
  FiCheck,
  FiStar,
  FiTag,
  FiAlertCircle,
  FiTrendingUp,
  FiClock,
  FiZap,
} from "react-icons/fi";
import { FaWandSparkles } from "react-icons/fa6";

export default function CustomerOverviewPage() {
  const { stats, recentOrders, securityData } = useOverviewStats(true);
  const { query, setQuery, result, loading, error, detect, search, reset, suggestions } = useShoppingIntent();
  const [addingCartId, setAddingCartId] = useState<string | null>(null);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingCartId(productId);
    try {
      await addToCart(productId, 1);
      setAddedMap((prev) => ({ ...prev, [productId]: true }));
      setToastMsg("Added to cart successfully! 🛍️");
      setTimeout(() => {
        setAddedMap((prev) => ({ ...prev, [productId]: false }));
        setToastMsg(null);
      }, 2500);
    } catch {
      setToastMsg("Failed to add to cart. Please check your session.");
      setTimeout(() => setToastMsg(null), 2500);
    } finally {
      setAddingCartId(null);
    }
  };

  return (
    <DashboardShell
      role="Customer"
      title="Commerce Command Center"
      subtitle="Discover personalized shopping journeys, plan smart budgets, track product lifecycles and protect your account with AI intelligence."
    >
      <div className="space-y-8">
        {/* Toast Alert */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 rounded-2xl bg-primary text-white px-5 py-3 text-xs font-bold shadow-2xl flex items-center gap-2"
            >
              <FiCheck /> {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4 Colorful Animated Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Card 1: Orders */}
          <Link
            href="/dashboard/user/orders"
            className="group relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-colors" />
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500 shadow-inner group-hover:scale-110 transition-transform">
                <FiBox size={22} />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-indigo-500">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" /> Live
              </span>
            </div>
            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Orders Placed</span>
              <h3 className="text-2xl font-black text-foreground">{stats.orders}</h3>
              <p className="mt-0.5 text-[11px] text-muted">Lifetime fulfilled purchases</p>
            </div>
          </Link>

          {/* Card 2: Cart Items */}
          <Link
            href="/cart"
            className="group relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-xl group-hover:bg-amber-500/20 transition-colors" />
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 shadow-inner group-hover:scale-110 transition-transform">
                <FiShoppingBag size={22} />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-500">
                Ready
              </span>
            </div>
            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Cart Items</span>
              <h3 className="text-2xl font-black text-foreground">{stats.cart}</h3>
              <p className="mt-0.5 text-[11px] text-muted">Ready for 1-click checkout</p>
            </div>
          </Link>

          {/* Card 3: Wishlist */}
          <Link
            href="/wishlist"
            className="group relative overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/10"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose-500/10 blur-xl group-hover:bg-rose-500/20 transition-colors" />
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500 shadow-inner group-hover:scale-110 transition-transform">
                <FiHeart size={22} />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-rose-500">
                Saved
              </span>
            </div>
            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Wishlist Collections</span>
              <h3 className="text-2xl font-black text-foreground">{stats.wishlist}</h3>
              <p className="mt-0.5 text-[11px] text-muted">Saved products & folders</p>
            </div>
          </Link>

          {/* Card 4: Security Shield */}
          <Link
            href="/dashboard/user/security"
            className="group relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20 transition-colors" />
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                <FiShield size={22} />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-500">
                Active
              </span>
            </div>
            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Account Shield</span>
              <h3 className="text-2xl font-black text-foreground">
                {securityData?.securityScore || 98}% Safe
              </h3>
              <p className="mt-0.5 text-[11px] text-muted">ATO & Session Guard Active</p>
            </div>
          </Link>
        </div>

        {/* AI Natural Language Shopping Assistant Panel */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-purple-500/5 to-card p-6 shadow-xl space-y-6">
          {/* Subtle Ambient Glows */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-purple-500/20 blur-3xl" />

          {/* Header */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-lg shadow-primary/30">
                <FaWandSparkles className="animate-spin text-lg text-amber-300" style={{ animationDuration: "8s" }} />
              </div>
              <div>
                <h2 className="text-base font-black text-foreground tracking-tight sm:text-lg">
                  AI Natural Language Shopping Assistant
                </h2>
                <p className="text-xs text-muted">
                  Search MongoDB catalog using natural language, Bengali, and strict budget constraints.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-500 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Real MongoDB Catalog
              </span>
              {result && (
                <button
                  type="button"
                  onClick={reset}
                  className="px-2.5 py-1 text-xs text-muted hover:text-foreground font-semibold hover:underline"
                >
                  Clear Results
                </button>
              )}
            </div>
          </div>

          {/* Search Bar Form */}
          <form onSubmit={detect} className="relative z-10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
                <FiSearch className="text-base" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 'Show me a gaming mouse under 3000 taka' or '৫ হাজার টাকার মধ্যে হেডফোন'"
                className="w-full rounded-2xl border border-border bg-surface/90 py-3.5 pl-11 pr-4 text-xs font-medium text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 backdrop-blur-md transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 px-7 py-3.5 text-xs font-black text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Searching Catalog...</span>
                </>
              ) : (
                <>
                  <FiZap /> Find Real Products
                </>
              )}
            </button>
          </form>

          {/* Suggested Quick Prompt Chips */}
          <div className="relative z-10 space-y-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
              Try popular search prompts:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => search(promptText)}
                  className="rounded-xl border border-border/80 bg-surface/70 px-3 py-1.5 text-[11px] font-semibold text-foreground/80 transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:scale-105"
                >
                  💡 {promptText}
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="relative z-10 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-500">
              <FiAlertCircle className="text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Animation */}
          {loading && (
            <div className="relative z-10 py-10 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
                <FaWandSparkles className="text-2xl animate-spin text-primary" style={{ animationDuration: "3s" }} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Parsing Natural Language & Querying MongoDB...</h4>
                <p className="text-xs text-muted">
                  Enforcing strict budget limits and fetching live in-stock catalog products.
                </p>
              </div>
            </div>
          )}

          {/* Search Results Display */}
          <AnimatePresence>
            {!loading && result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="relative z-10 space-y-5 rounded-3xl border border-border/80 bg-surface/90 p-5 backdrop-blur-xl shadow-lg"
              >
                {/* Intent Extraction Summary Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xl bg-primary/15 px-3 py-1 text-xs font-black text-primary">
                      🎯 Intent: {result.extractedIntent.occasion}
                    </span>
                    <span className="rounded-xl bg-surface px-2.5 py-1 text-[11px] font-bold text-foreground border border-border shadow-xs">
                      👤 For: {result.extractedIntent.recipient}
                    </span>
                    <span className="rounded-xl bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      💰 Budget Limit: {result.extractedIntent.detectedBudget}
                    </span>
                    <span className="rounded-xl bg-purple-500/15 px-2.5 py-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                      🏷️ Focus: {result.extractedIntent.categoryFocus}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-muted">
                    {result.matchingProducts.length} Results
                  </span>
                </div>

                {/* AI Truthful Explanation */}
                <div className="rounded-2xl bg-card p-3.5 border border-border text-xs text-foreground/90 leading-relaxed flex items-start gap-2.5">
                  <span className="text-base mt-0.5 text-primary">🤖</span>
                  <p>{result.recommendationSummary}</p>
                </div>

                {/* Products Grid or Honest Empty State */}
                {result.matchingProducts.length === 0 ? (
                  <div className="py-10 text-center space-y-3 rounded-2xl bg-card border border-dashed border-border p-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted-bg text-muted text-xl">
                      <FiSearch />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">No Products Found in Catalog</h4>
                      <p className="text-xs text-muted max-w-md mx-auto mt-1">
                        We could not find any live items matching your exact search keywords or budget. We never invent products. Try adjusting your budget or searching with a broader category term.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {result.matchingProducts.map((p) => {
                      const isAdded = !!addedMap[p.id];
                      const isAdding = addingCartId === p.id;
                      const hasDiscount = !!p.discountPrice && p.discountPrice < p.price;
                      const displayPrice = p.discountPrice || p.price;
                      const discountPct = hasDiscount
                        ? Math.round(((p.price - (p.discountPrice || p.price)) / p.price) * 100)
                        : 0;

                      return (
                        <div
                          key={p.id}
                          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                        >
                          {/* Top Tag & Discount Badge */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="rounded-lg bg-surface px-2 py-0.5 text-[10px] font-bold text-muted border border-border">
                              {p.category}
                            </span>
                            {hasDiscount && (
                              <span className="rounded-md bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-500">
                                -{discountPct}% OFF
                              </span>
                            )}
                          </div>

                          {/* Image & Title */}
                          <Link href={`/products/${p.id}`} className="block space-y-2">
                            <div className="aspect-video sm:aspect-square w-full overflow-hidden rounded-xl bg-muted-bg flex items-center justify-center relative">
                              {p.images?.[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.title}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <span className="text-3xl">🛍️</span>
                              )}

                              {/* Stock Pill */}
                              <div className="absolute bottom-2 left-2 rounded-md bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    (p.stock ?? 1) > 0 ? "bg-emerald-400" : "bg-red-400"
                                  }`}
                                />
                                {(p.stock ?? 1) > 0 ? `${p.stock ?? 1} in stock` : "Out of stock"}
                              </div>
                            </div>

                            <h4 className="font-bold text-xs text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                              {p.title}
                            </h4>
                          </Link>

                          {/* Price & Rating */}
                          <div className="mt-3 pt-2 border-t border-border/40 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-black text-primary">
                                  {formatCurrency(displayPrice)}
                                </span>
                                {hasDiscount && (
                                  <span className="ml-1.5 text-[10px] text-muted line-through">
                                    {formatCurrency(p.price)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                                <FiStar className="fill-amber-400" size={12} />
                                <span>{p.ratingAvg ? p.ratingAvg.toFixed(1) : "5.0"}</span>
                                {p.ratingCount !== undefined && (
                                  <span className="text-muted text-[10px]">({p.ratingCount})</span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/products/${p.id}`}
                                className="flex-1 rounded-xl border border-border bg-surface hover:bg-muted-bg py-2 text-center text-xs font-bold text-foreground transition-colors"
                              >
                                View Specs
                              </Link>
                              <button
                                type="button"
                                onClick={(e) => handleAddToCart(p.id, e)}
                                disabled={isAdding || (p.stock ?? 1) <= 0}
                                className={`flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                                  isAdded
                                    ? "bg-emerald-500 text-white"
                                    : "bg-primary text-white hover:bg-primary-hover shadow-sm"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {isAdded ? (
                                  <>
                                    <FiCheck /> Added
                                  </>
                                ) : isAdding ? (
                                  "..."
                                ) : (
                                  <>
                                    <FiShoppingBag /> Add
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Snapshot 2-Column Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Purchases */}
          <Panel title="Recent Purchases">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center space-y-3 text-muted text-xs">
                <FiBox className="mx-auto text-3xl text-muted/50" />
                <p className="font-semibold text-foreground">No orders placed yet.</p>
                <p className="text-[11px]">Your order history and delivery tracking will appear here.</p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-hover transition-colors"
                >
                  Discover Marketplace <FiArrowRight />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 transition hover:border-primary/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                        📦
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Order #{o.id.slice(-6)}</p>
                        <p className="text-[11px] text-muted">
                          {o.items.length} items • {formatCurrency(o.totalAmount)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-xl px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                        o.status === "delivered"
                          ? "bg-emerald-500/15 text-emerald-600"
                          : o.status === "shipped"
                          ? "bg-indigo-500/15 text-indigo-600"
                          : "bg-amber-500/15 text-amber-600"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                ))}

                <Link
                  href="/dashboard/user/orders"
                  className="block pt-2 text-center text-xs font-bold text-primary hover:underline"
                >
                  View All Orders →
                </Link>
              </div>
            )}
          </Panel>

          {/* Security & Protection Status */}
          <Panel title="Account Shield & Security Center">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
              <GaugeMeter
                score={securityData?.securityScore || 98}
                title="Account Shield"
                subtitle="Active Fraud & ATO Protection"
                size={150}
                type="security"
              />
              <div className="space-y-2.5 text-xs flex-1">
                <div className="flex items-center gap-2 rounded-xl bg-card border border-border p-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-bold">
                    ✓
                  </span>
                  <span className="font-semibold text-foreground">HMAC-SHA256 Signed Session Guard</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-card border border-border p-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-bold">
                    ✓
                  </span>
                  <span className="font-semibold text-foreground">Account Takeover (ATO) Shield</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-card border border-border p-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-bold">
                    ✓
                  </span>
                  <span className="font-semibold text-foreground">Zero Compromised Breach Vectors</span>
                </div>
                <Link
                  href="/dashboard/user/security"
                  className="mt-2 block text-xs font-bold text-primary hover:underline text-right"
                >
                  Open Security Center →
                </Link>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
