"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaShoppingBag,
  FaHeart,
  FaBolt,
  FaStar,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaCheck,
} from "react-icons/fa";
import { getProductById, Product } from "@/lib/api/products";
import { addToCart } from "@/lib/api/cart";
import { addToWishlist } from "@/lib/api/wishlist";
import { useSession } from "@/lib/auth-client";
import {
  getPriceHistory,
  PriceHistoryData,
  getPurchaseDecisionScore,
  PurchaseDecisionScoreData,
  getProductTrustChecker,
  ProductTrustCheckerData,
  getReturnRiskPreview,
  ReturnRiskPreviewData,
  getProductBundle,
  ProductBundleData,
  checkCompatibility,
  CompatibilityResult,
} from "@/lib/api/customer-intelligence";
import { LineAreaChart } from "@/components/analytics/LineAreaChart";
import { GaugeMeter } from "@/components/analytics/GaugeMeter";
import { AiCommerceCopilot } from "@/components/ai/AiCommerceCopilot";

export default function ProductDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  // Intelligence State
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData | null>(null);
  const [decisionScore, setDecisionScore] = useState<PurchaseDecisionScoreData | null>(null);
  const [trustData, setTrustData] = useState<ProductTrustCheckerData | null>(null);
  const [returnRisk, setReturnRisk] = useState<ReturnRiskPreviewData | null>(null);
  const [bundleData, setBundleData] = useState<ProductBundleData | null>(null);
  const [compatResult, setCompatResult] = useState<CompatibilityResult | null>(null);
  const [bundleAdding, setBundleAdding] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      getProductById(params.id)
        .then((p) => {
          setProduct(p);
          if (p) {
            // Fetch product intelligence in parallel
            Promise.all([
              getPriceHistory(p.id).catch(() => null),
              getPurchaseDecisionScore(p.id).catch(() => null),
              getProductTrustChecker(p.id).catch(() => null),
              getReturnRiskPreview(p.id).catch(() => null),
              getProductBundle(p.id).catch(() => null),
              checkCompatibility([p.id]).catch(() => null),
            ]).then(([historyRes, decisionRes, trustRes, returnRes, bundleRes, compatRes]) => {
              if (historyRes) setPriceHistory(historyRes);
              if (decisionRes) setDecisionScore(decisionRes);
              if (trustRes) setTrustData(trustRes);
              if (returnRes) setReturnRisk(returnRes);
              if (bundleRes) setBundleData(bundleRes);
              if (compatRes) setCompatResult(compatRes);
            });
          }
        })
        .catch(() => setProduct(null))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!session?.user) {
      showToast("Please log in to add items to your cart", "error");
      router.push("/login");
      return;
    }

    try {
      await addToCart(product.id, quantity);
      setIsAdded(true);
      showToast(`Added ${quantity} × "${product.title}" to cart! 🛒`);
      setTimeout(() => setIsAdded(false), 2500);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add to cart", "error");
    }
  };

  const handleAddBundleToCart = async () => {
    if (!bundleData || !session?.user) {
      showToast("Please log in to add bundle to cart", "error");
      router.push("/login");
      return;
    }

    setBundleAdding(true);
    try {
      for (const item of bundleData.items) {
        await addToCart(item.productId, 1);
      }
      showToast(`⚡ Added complete ${bundleData.bundleName} (${bundleData.items.length} items) to cart!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add bundle", "error");
    } finally {
      setBundleAdding(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    if (!session?.user) {
      showToast("Please log in to save to wishlist", "error");
      router.push("/login");
      return;
    }

    try {
      await addToWishlist(product.id);
      showToast(`Added "${product.title}" to wishlist! ♡`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add to wishlist", "error");
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!session?.user) {
      router.push("/login");
      return;
    }

    try {
      await addToCart(product.id, quantity);
      router.push("/dashboard/user/checkout");
    } catch {
      router.push("/dashboard/user/cart");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl py-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted">Loading product intelligence details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-surface p-12 text-center">
        <div className="text-5xl">📦</div>
        <h2 className="mt-4 text-2xl font-black text-text">Product Not Found</h2>
        <p className="mt-2 text-sm text-muted">This product may have been unlisted or removed.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg"
        >
          <FaArrowLeft size={12} /> Return to Shop
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const chartData = priceHistory?.history.map((h, i) => ({
    label: `Day ${i * 4 || 1}`,
    value: h.price,
  })) || [
    { label: "Day 1", value: product.price },
    { label: "Day 15", value: product.discountPrice || product.price },
    { label: "Today", value: product.discountPrice || product.price },
  ];

  return (
    <div className="mx-auto max-w-6xl pb-16">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "error" ? "bg-error" : "bg-primary"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs font-bold text-muted">
        <Link href="/products" className="hover:text-primary">
          Marketplace
        </Link>
        <span>/</span>
        <span className="text-primary">{product.category}</span>
        <span>/</span>
        <span className="max-w-[200px] truncate sm:max-w-md text-text">{product.title}</span>
      </div>

      {/* Main Product Display */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Left: Product Images */}
        <div className="flex flex-col gap-4">
          <div className="relative grid min-h-[380px] w-full place-items-center overflow-hidden rounded-3xl border border-border bg-surface shadow-sm sm:min-h-[460px]">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-8xl select-none">🛍️</span>
            )}

            {hasDiscount && (
              <span className="absolute left-4 top-4 rounded-xl bg-error px-3 py-1.5 text-xs font-black uppercase text-white shadow-md">
                Save ৳{(product.price - (product.discountPrice || 0)).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Details & Actions */}
        <div className="flex flex-col justify-between rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                <FaStar size={13} />
                <span>{product.ratingAvg || "4.9"}</span>
                <span className="text-muted">({product.ratingCount || 18} reviews)</span>
              </div>
            </div>

            <h1 className="mt-3 text-2xl font-black tracking-tight text-text sm:text-3xl">{product.title}</h1>

            {/* Pricing */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-text">
                ৳{(product.discountPrice || product.price).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted line-through">৳{product.price.toLocaleString()}</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mt-3 flex items-center gap-2 text-xs font-bold">
              {product.stock > 0 ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <FaCheck size={11} /> {product.stock} units available in stock
                </span>
              ) : (
                <span className="text-error">Currently Out of Stock</span>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 border-t border-border pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Product Description</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted whitespace-pre-line">{product.description}</p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-border bg-muted-bg px-2.5 py-1 text-[11px] font-semibold text-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mt-6 flex items-center gap-4">
              <label className="text-xs font-bold text-muted uppercase">Quantity:</label>
              <div className="flex items-center rounded-xl border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-text transition hover:bg-muted-bg cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-black text-text">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-text transition hover:bg-muted-bg cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Purchase Action Buttons */}
          <div className="mt-8 border-t border-border pt-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition cursor-pointer ${
                  isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-primary text-white shadow-xl shadow-primary/25 hover:bg-primary-hover disabled:opacity-50"
                }`}
              >
                {isAdded ? (
                  <>
                    <FaCheck /> Added to Cart
                  </>
                ) : (
                  <>
                    <FaShoppingBag /> Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-black text-white shadow-xl shadow-amber-500/20 transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
              >
                <FaBolt /> Buy Now
              </button>

              <button
                type="button"
                onClick={handleAddToWishlist}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 text-sm font-bold text-text transition hover:border-primary hover:text-primary cursor-pointer"
              >
                <FaHeart size={13} /> Wishlist
              </button>
            </div>

            {/* Buyer Trust Guarantees */}
            <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-muted-bg p-4 text-center text-xs">
              <div className="flex flex-col items-center gap-1">
                <FaShieldAlt className="text-primary text-sm" />
                <span className="font-bold text-text">Buyer Protection</span>
                <span className="text-[10px] text-muted">100% Genuine</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FaTruck className="text-primary text-sm" />
                <span className="font-bold text-text">Fast Delivery</span>
                <span className="text-[10px] text-muted">Nationwide BD</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FaUndo className="text-primary text-sm" />
                <span className="font-bold text-text">7 Days Return</span>
                <span className="text-[10px] text-muted">Easy Refund</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADVANCED CUSTOMER INTELLIGENCE SECTION */}
      {/* ========================================================================= */}
      <div className="mt-12 space-y-8">
        {/* Row 1: Decision Score & Authenticity Trust Checker */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Purchase Decision Score */}
          {decisionScore && (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Intelligent Analytics</span>
                  <h3 className="text-base font-black text-text">Purchase Decision Score</h3>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                  {decisionScore.overallScore} / 100
                </span>
              </div>

              <div className="mt-5 grid grid-cols-[130px_1fr] items-center gap-5">
                <GaugeMeter score={decisionScore.overallScore} title="Decision Index" size={130} type="health" />

                <div className="space-y-2.5">
                  {Object.entries(decisionScore.dimensions).map(([key, dim]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-muted">{dim.label}</span>
                        <span className="text-text">{dim.score}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${dim.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 rounded-xl bg-muted-bg p-3 text-xs font-semibold text-text">
                💡 {decisionScore.recommendation}
              </p>
            </div>
          )}

          {/* Product Authenticity & Trust Checker */}
          {trustData && (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Platform Safety Shield
                  </span>
                  <h3 className="text-base font-black text-text">Product Authenticity & Trust</h3>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {trustData.trustScore}% Verified
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {trustData.signals.map((sig, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl border border-border/80 p-2.5 text-xs">
                    <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                    <div>
                      <p className="font-bold text-text">{sig.name}</p>
                      <p className="text-[11px] text-muted">{sig.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[10px] text-muted leading-tight">{trustData.disclaimer}</p>
            </div>
          )}
        </div>

        {/* Row 2: 30-Day Price History & Return Risk Preview */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Price History */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Price Intelligence</span>
                <h3 className="text-base font-black text-text">30-Day Price History</h3>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary capitalize">
                Trend: {priceHistory?.trend || "Stable"}
              </span>
            </div>

            <div className="mt-4">
              <LineAreaChart
                data={chartData}
                height={190}
                valuePrefix="৳"
                primaryLabel="Historical Price"
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-muted-bg p-3 text-center text-xs">
              <div>
                <p className="text-[10px] text-muted font-bold">Lowest Price</p>
                <p className="font-black text-emerald-600">৳{(priceHistory?.lowestPrice || product.price).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted font-bold">Average Price</p>
                <p className="font-black text-text">৳{(priceHistory?.averagePrice || product.price).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted font-bold">Highest Price</p>
                <p className="font-black text-error">৳{(priceHistory?.highestPrice || product.price).toLocaleString()}</p>
              </div>
            </div>

            {priceHistory?.insight && (
              <p className="mt-3 text-xs font-semibold text-primary">{priceHistory.insight}</p>
            )}
          </div>

          {/* Smart Return Risk Preview */}
          {returnRisk && (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Hassle-Free Shopping</span>
                    <h3 className="text-base font-black text-text">Smart Return Risk Preview</h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 capitalize">
                    {returnRisk.riskLevel} Return Risk ({returnRisk.historicalReturnRate})
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs font-bold text-text mb-1">Common Category Notes:</p>
                    <ul className="space-y-1 text-xs text-muted">
                      {returnRisk.topReturnReasons.map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-muted-bg p-3">
                    <p className="text-xs font-bold text-text mb-1">Proactive Advice Before Ordering:</p>
                    <ul className="space-y-1 text-xs text-muted">
                      {returnRisk.proactiveAdvice.map((a, i) => (
                        <li key={i}>✓ {a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs font-bold text-success">{returnRisk.guaranteeNotice}</p>
            </div>
          )}
        </div>

        {/* Row 3: Smart Bundle Builder & Compatibility Matrix */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Smart Bundle Builder */}
          {bundleData && (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Complementary Value</span>
                  <h3 className="text-base font-black text-text">Smart Bundle Builder</h3>
                </div>
                <span className="rounded-full bg-error/15 px-3 py-1 text-xs font-black text-error">
                  {bundleData.savingsPercentage}% Bundle Discount
                </span>
              </div>

              <div className="space-y-2">
                {bundleData.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-border p-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
                        {idx === 0 ? "★" : "+"}
                      </span>
                      <span className="font-bold text-text">{it.title}</span>
                    </div>
                    <span className="font-semibold text-muted">৳{it.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-muted-bg p-3.5">
                <div>
                  <p className="text-[11px] text-muted line-through">Total: ৳{bundleData.originalTotal.toLocaleString()}</p>
                  <p className="text-lg font-black text-primary">Bundle Price: ৳{bundleData.bundlePrice.toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddBundleToCart}
                  disabled={bundleAdding}
                  className="rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
                >
                  {bundleAdding ? "Adding..." : "⚡ Add Bundle to Cart"}
                </button>
              </div>
            </div>
          )}

          {/* Product Compatibility Matrix */}
          {compatResult && (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Hardware Interoperability</span>
                  <h3 className="text-base font-black text-text">Compatibility Checker</h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    compatResult.status === "compatible"
                      ? "bg-emerald-500/15 text-emerald-600"
                      : compatResult.status === "potential_issue"
                      ? "bg-amber-500/15 text-amber-600"
                      : "bg-error/15 text-error"
                  }`}
                >
                  {compatResult.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="space-y-2.5">
                {compatResult.checks.map((chk, i) => (
                  <div key={i} className="rounded-xl border border-border p-3 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-text">{chk.aspect}</span>
                      <span className={chk.result === "pass" ? "text-emerald-500" : chk.result === "warning" ? "text-amber-500" : "text-error"}>
                        {chk.result === "pass" ? "✓ Pass" : chk.result === "warning" ? "⚠ Advisory" : "✕ Incompatible"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted">{chk.explanation}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs font-semibold text-text rounded-xl bg-muted-bg p-3">{compatResult.recommendation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Universal Floating AI Copilot */}
      <AiCommerceCopilot role="customer" />
    </div>
  );
}
