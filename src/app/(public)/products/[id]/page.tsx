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
  FaStore,
} from "react-icons/fa";
import { getProductById, Product } from "@/lib/api/products";
import { addToCart } from "@/lib/api/cart";
import { addToWishlist } from "@/lib/api/wishlist";
import { useSession } from "@/lib/auth-client";

export default function ProductDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      getProductById(params.id)
        .then(setProduct)
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
      router.push("/checkout");
    } catch {
      router.push("/cart");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl py-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted">Loading product details...</p>
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

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Left: Product Images */}
        <div className="flex flex-col gap-4">
          <div className="relative grid min-h-[380px] w-full place-items-center overflow-hidden rounded-3xl border border-border bg-surface shadow-sm sm:min-h-[460px]">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
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

        {/* Right: Product Details & Purchase Actions */}
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

            <h1 className="mt-3 text-2xl font-black tracking-tight text-text sm:text-3xl">
              {product.title}
            </h1>

            {/* Pricing */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-text">
                ৳{(product.discountPrice || product.price).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted line-through">
                  ৳{product.price.toLocaleString()}
                </span>
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                Product Description
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted whitespace-pre-line">
                {product.description}
              </p>
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
                  className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-text transition hover:bg-muted-bg"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-black text-text">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-text transition hover:bg-muted-bg"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 border-t border-border pt-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition ${
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
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-black text-white shadow-xl shadow-amber-500/20 transition hover:opacity-95 disabled:opacity-50"
              >
                <FaBolt /> Buy Now
              </button>

              <button
                type="button"
                onClick={handleAddToWishlist}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 text-sm font-bold text-text transition hover:border-primary hover:text-primary"
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
    </div>
  );
}
