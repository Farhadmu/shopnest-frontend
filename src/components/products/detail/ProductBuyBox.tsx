"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { FiStar, FiCheckCircle, FiTruck, FiShoppingBag, FiZap, FiHeart, FiMinus, FiPlus } from "react-icons/fi";
import type { Product } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";
import { addToCart } from "@/lib/api/cart";
import { addToWishlist } from "@/lib/api/wishlist";
import { useSession } from "@/lib/auth-client";
import { addGuestCartItem, addGuestWishlistItem, clearGuestCart, clearGuestWishlist } from "@/lib/guest-store";

export interface ProductBuyBoxProps {
  product: Product;
}

/**
 * TODO(backend): color/size variants aren't part of the `Product` schema
 * yet. Falling back to a single "Standard" variant (derived from the first
 * product tag when available) until the API exposes real variants.
 */
function getVariantOptions(product: Product): string[] {
  if (product.tags && product.tags.length > 0) return product.tags.slice(0, 3);
  return ["Standard"];
}

export function ProductBuyBox({ product }: ProductBuyBoxProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const variants = getVariantOptions(product);
  const [variant, setVariant] = useState(variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? (product.discountPrice as number) : product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - (product.discountPrice as number)) / product.price) * 100)
    : 0;

  const imageSrc = product.images?.[0];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleAddToCart = async () => {
    if (!session?.user) {
      addGuestCartItem({
        productId: product.id,
        quantity,
        price: displayPrice,
        title: product.title,
        images: imageSrc ? [imageSrc] : undefined,
        category: product.category,
      });
      setIsAdded(true);
      showToast(`Added ${quantity} × "${product.title}" to cart!`);
      setTimeout(() => setIsAdded(false), 2000);
      return;
    }
    try {
      await addToCart(product.id, quantity);
      clearGuestCart();
      setIsAdded(true);
      showToast(`Added ${quantity} × "${product.title}" to cart!`);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!session?.user) {
      addGuestCartItem({
        productId: product.id,
        quantity,
        price: displayPrice,
        title: product.title,
        images: imageSrc ? [imageSrc] : undefined,
        category: product.category,
      });
      router.push(`/login?next=${encodeURIComponent("/checkout")}`);
      return;
    }
    try {
      await addToCart(product.id, quantity);
      router.push("/checkout");
    } catch {
      router.push("/cart");
    }
  };

  const handleWishlist = async () => {
    if (!session?.user) {
      addGuestWishlistItem({
        productId: product.id,
        price: displayPrice,
        title: product.title,
        images: imageSrc ? [imageSrc] : undefined,
        category: product.category,
      });
      showToast("Saved to wishlist!");
      return;
    }
    try {
      await addToWishlist(product.id);
      clearGuestWishlist();
      showToast("Saved to wishlist!");
    } catch {
      showToast("Could not update wishlist");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-text px-4 py-3 text-xs font-bold text-background shadow-2xl">
          {toast}
        </div>
      )}

      {/* Title + rating */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {hasDiscount && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black text-primary">
              FLASH DEAL
            </span>
          )}
          <span className="ml-auto text-xs text-muted">SKU: {product.id.slice(0, 10).toUpperCase()}</span>
        </div>

        <h1 className="text-2xl font-black leading-snug text-text sm:text-3xl">{product.title}</h1>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-1 rounded-lg bg-muted-bg px-2.5 py-1 font-bold text-text">
            <FiStar size={15} className="fill-amber-400 text-amber-400" />
            {(product.ratingAvg ?? 4.8).toFixed(1)}
          </span>
          <span className="text-muted">
            {product.ratingCount ?? 0} verified review{(product.ratingCount ?? 0) === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-1 font-semibold text-muted">
            <FiCheckCircle size={14} className="text-primary" /> {product.sold ?? 0} units sold
          </span>
        </div>

        {/* Price row */}
        <div className="flex flex-col gap-2 rounded-xl bg-muted-bg p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-text">{formatCurrency(displayPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg font-semibold text-muted line-through">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-black uppercase text-error">
                    -{discountPct}% off
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">Inclusive of VAT & 1-year replacement warranty</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 shadow-sm">
            <FiTruck size={20} className="text-primary" />
            <div>
              <p className="text-xs font-bold text-text">Standard Dispatch</p>
              <p className="text-[11px] text-muted">Arrives in 24-48 hours</p>
            </div>
          </div>
        </div>

        {/* Variant selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">
            Variant: <span className="text-primary">{variant}</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                  variant === v ? "border-primary bg-primary/10 text-primary" : "border-border text-text hover:bg-muted-bg"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity + CTAs */}
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
          <div className="flex h-12 w-full items-center justify-between rounded-lg bg-muted-bg p-1 sm:w-36">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="grid h-10 w-10 place-items-center rounded bg-surface text-text shadow-sm"
            >
              <FiMinus size={14} />
            </button>
            <span className="font-black text-text">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
              className="grid h-10 w-10 place-items-center rounded bg-surface text-text shadow-sm"
            >
              <FiPlus size={14} />
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            isDisabled={product.stock <= 0}
            onPress={handleAddToCart}
            className="h-12 flex-1 rounded-lg border border-primary/30 text-sm font-bold text-primary"
          >
            <span className="flex items-center justify-center gap-2">
              {isAdded ? <FiCheckCircle size={16} /> : <FiShoppingBag size={16} />}
              {isAdded ? "Added" : "Add to Cart"}
            </span>
          </Button>

          <Button
            type="button"
            variant="primary"
            isDisabled={product.stock <= 0}
            onPress={handleBuyNow}
            className="h-12 flex-1 rounded-lg text-sm font-bold text-white shadow-md"
          >
            <span className="flex items-center justify-center gap-2">
              <FiZap size={16} /> Buy Now
            </span>
          </Button>

          <button
            type="button"
            aria-label="Add to wishlist"
            onClick={handleWishlist}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-error hover:text-error"
          >
            <FiHeart size={18} />
          </button>
        </div>

        <p className="text-xs font-semibold text-text">
          {product.stock > 0 ? (
            <span className="text-primary">In Stock ({product.stock} units available)</span>
          ) : (
            <span className="text-error">Out of Stock</span>
          )}
        </p>
      </div>
    </div>
  );
}