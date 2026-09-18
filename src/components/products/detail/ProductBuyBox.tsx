"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import type { Product } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";
import { addToCart } from "@/lib/api/cart";
import { useWishlist } from "@/context/WishlistContext";
import { useFlyToCart } from "@/context/FlyToCartContext";
import { toast } from "@/context/ToastContext";
import { useSession } from "@/lib/auth-client";
import { recordShoppingEvent, getPurchaseDecisionScore, type PurchaseDecisionScoreData } from "@/lib/api/customer-intelligence";
import { addGuestCartItem, clearGuestCart } from "@/lib/guest-store";
import { FiStar, FiCheckCircle, FiTruck, FiShoppingBag, FiZap, FiHeart, FiMinus, FiPlus, FiExternalLink } from "react-icons/fi";
import { extractVariants, SpecVariant } from "./ProductSpecsTable";

export interface ProductBuyBoxProps {
  product: Product;
}

export function ProductBuyBox({ product }: ProductBuyBoxProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { triggerFlyToCart } = useFlyToCart();

  const allVariants = React.useMemo(() => extractVariants(product), [product]);
  const hasRealVariants = allVariants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<SpecVariant | null>(
    hasRealVariants ? allVariants[0] : null
  );

  const isWishlisted = isInWishlist(product.id);

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [aiScore, setAiScore] = useState<PurchaseDecisionScoreData | null>(null);
  const viewRecordedRef = useRef(false);
  const mainCtasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = mainCtasRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When main buttons scroll above the visible viewport
        const isPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setShowStickyBar(isPast);
      },
      { threshold: 0 }
    );

    observer.observe(el);

    const handleScroll = () => {
      if (!mainCtasRef.current) return;
      const rect = mainCtasRef.current.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const hasBaseDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const activeBasePrice = selectedVariant?.price ?? (hasBaseDiscount ? (product.discountPrice as number) : product.price);
  const displayPrice = activeBasePrice;
  const showDiscount = displayPrice < product.price;
  const discountPct = showDiscount && product.price > 0
    ? Math.round(((product.price - displayPrice) / product.price) * 100)
    : 0;

  const imageSrc = product.images?.[0];

  useEffect(() => {
    if (!session?.user || viewRecordedRef.current) return;
    viewRecordedRef.current = true;
    recordShoppingEvent({
      eventType: "view",
      productId: product.id,
      productTitle: product.title,
      category: product.category,
      price: product.price,
    }).catch(() => {
      viewRecordedRef.current = false;
    });
  }, [session?.user, product.id, product.title, product.category, product.price]);

  useEffect(() => {
    const prodId = product.id || (product as { _id?: string })._id;
    if (!prodId) return;

    getPurchaseDecisionScore(prodId)
      .then((res) => {
        if (res && !res.insufficientData && typeof res.overallScore === "number") {
          setAiScore(res);
        }
      })
      .catch(() => setAiScore(null));
  }, [product.id, (product as { _id?: string })._id]);

  const handleAddToCart = async () => {
    triggerFlyToCart({
      startElement: mainCtasRef.current,
      imageSrc,
    });

    const itemTitle = selectedVariant?.name
      ? `${product.title} (${selectedVariant.name})`
      : product.title;

    if (!session?.user) {
      addGuestCartItem({
        productId: product.id,
        quantity,
        price: displayPrice,
        title: itemTitle,
        images: imageSrc ? [imageSrc] : undefined,
        category: product.category,
      });
      setIsAdded(true);
      toast.cart(`Added ${quantity} × "${itemTitle}" to cart!`, {
        description: "Items added to your shopping bag",
      });
      setTimeout(() => setIsAdded(false), 2000);
      return;
    }
    try {
      await addToCart(product.id, quantity, selectedVariant?.name ?? undefined);
      clearGuestCart();
      setIsAdded(true);
      toast.cart(`Added ${quantity} × "${itemTitle}" to cart!`, {
        description: "Items added to your shopping bag",
      });
      setTimeout(() => setIsAdded(false), 2000);
      recordShoppingEvent({
        eventType: "cart_add",
        productId: product.id,
        productTitle: itemTitle,
        category: product.category,
        price: displayPrice,
      }).catch(() => {});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    const itemTitle = selectedVariant?.name
      ? `${product.title} (${selectedVariant.name})`
      : product.title;

    if (!session?.user) {
      addGuestCartItem({
        productId: product.id,
        quantity,
        price: displayPrice,
        title: itemTitle,
        images: imageSrc ? [imageSrc] : undefined,
        category: product.category,
      });
      router.push(`/login?next=${encodeURIComponent("/checkout")}`);
      return;
    }
    try {
      await addToCart(product.id, quantity, selectedVariant?.name ?? undefined);
      router.push("/checkout");
    } catch {
      router.push("/cart");
    }
  };

  const handleWishlist = async () => {
    try {
      const { added } = await toggleWishlist({
        id: product.id,
        title: product.title,
        price: displayPrice,
        image: imageSrc,
        images: product.images,
        category: product.category,
      });
      if (added) {
        toast.wishlist("Saved to wishlist!", { description: product.title });
      } else {
        toast.info("Removed from wishlist", { description: product.title });
      }
      if (added && session?.user) {
        recordShoppingEvent({
          eventType: "wishlist_add",
          productId: product.id,
          productTitle: product.title,
          category: product.category,
          price: displayPrice,
        }).catch(() => {});
      }
    } catch {
      toast.error("Could not update wishlist");
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Title + rating */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {showDiscount && discountPct > 0 && (
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
            {aiScore && (
              <a
                href="#ai-decision-card"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary hover:bg-primary/20 hover:scale-105 transition-all shadow-2xs group cursor-pointer"
                title="Click to view comprehensive AI Decision Score and evaluation breakdown"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">
                  {aiScore.overallScore}
                </span>
                <span>
                  AI Score: <strong className="font-extrabold">{aiScore.recommendation?.split(":")[0] || "Strong Buy"}</strong>
                </span>
                <span className="text-[10px] opacity-70 group-hover:translate-y-0.5 transition-transform">
                  ↓
                </span>
              </a>
            )}
          </div>
        </div>

        {/* Price row */}
        <div className="flex flex-col gap-2 rounded-xl bg-muted-bg p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-text">{formatCurrency(displayPrice)}</span>
              {showDiscount && discountPct > 0 && (
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

        {/* Variant selector: only render if product has authentic variants */}
        {hasRealVariants && (
          <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-surface-muted/30 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                Edition / Variant:{" "}
                <span className="font-extrabold capitalize text-text">
                  {selectedVariant?.name || "Standard"}
                </span>
              </span>
              {selectedVariant?.stock !== undefined && (
                <span
                  className={`text-[11px] font-bold ${
                    selectedVariant.stock > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-error"
                  }`}
                >
                  {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : "Out of stock"}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {allVariants.map((v) => {
                const isSelected = selectedVariant?.name?.toLowerCase() === v.name?.toLowerCase();
                const swatchColor = v.swatch || v.color || "#4f46e5";
                return (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`group relative flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-xs"
                        : "border-border bg-surface text-text hover:border-primary/40 hover:bg-muted-bg"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: swatchColor }}
                    />
                    <span className="capitalize">{v.name}</span>
                    {v.price && v.price !== product.price && (
                      <span className="text-[10px] font-medium text-muted">
                        ({formatCurrency(v.price)})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity + CTAs */}
        <div ref={mainCtasRef} className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
              onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock ?? product.stock ?? 99, q + 1))}
              className="grid h-10 w-10 place-items-center rounded bg-surface text-text shadow-sm"
            >
              <FiPlus size={14} />
            </button>
          </div>

          {/* Shared flex container to equalize button widths */}
          <div className="flex flex-1 items-center gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              isDisabled={(selectedVariant?.stock ?? product.stock) <= 0}
              onPress={handleAddToCart}
              className="h-12 flex-1 w-full basis-0 rounded-lg border border-primary/30 text-sm font-bold text-primary flex items-center justify-center"
            >
              <span className="flex items-center justify-center gap-2">
                {isAdded ? <FiCheckCircle size={16} /> : <FiShoppingBag size={16} />}
                {isAdded ? "Added" : "Add to Cart"}
              </span>
            </Button>

            <Button
              type="button"
              variant="primary"
              isDisabled={(selectedVariant?.stock ?? product.stock) <= 0}
              onPress={handleBuyNow}
              className="h-12 flex-1 w-full basis-0 rounded-lg text-sm font-bold text-white shadow-md flex items-center justify-center"
            >
              <span className="flex items-center justify-center gap-2">
                <FiZap size={16} /> Buy Now
              </span>
            </Button>
          </div>

          <button
            type="button"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={isWishlisted ? "In Wishlist (Click to remove)" : "Add to wishlist"}
            onClick={handleWishlist}
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border transition-all cursor-pointer ${
              isWishlisted
                ? "border-primary/50 bg-primary/10 text-primary shadow-xs"
                : "border-border text-muted hover:border-primary/40 hover:text-primary"
            }`}
          >
            <FiHeart size={18} className={isWishlisted ? "fill-primary text-primary" : ""} />
          </button>
        </div>

        <p className="text-xs font-semibold text-text">
          {(() => {
            const stock = selectedVariant?.stock ?? product.stock;
            return stock > 0 ? (
              <span className="text-primary">In Stock ({stock} units available)</span>
            ) : (
              <span className="text-error">Out of Stock</span>
            );
          })()}
        </p>
      </div>

      {/* Persistent Floating / Sticky Bottom Action Bar on Scroll */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-surface/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl transition-all duration-300 ease-out transform ${
          showStickyBar
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-8">
          {/* Product Info (Thumbnail, Title, Price, Active Variant) */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted-bg shadow-xs">
              {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageSrc}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs font-bold text-muted">
                  SN
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <h4 className="text-xs font-black text-text truncate max-w-[150px] sm:max-w-xs md:max-w-md lg:max-w-lg">
                {product.title}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-text sm:text-sm">
                  {formatCurrency(displayPrice)}
                </span>
                {showDiscount && discountPct > 0 && (
                  <span className="text-[10px] font-semibold text-muted line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
                {selectedVariant && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary capitalize">
                    <span
                      className="h-2 w-2 rounded-full border border-black/20"
                      style={{ backgroundColor: selectedVariant.swatch || selectedVariant.color || "#4f46e5" }}
                    />
                    {selectedVariant.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Compact CTA Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleWishlist}
              className={`grid h-9 w-9 place-items-center rounded-xl border transition-colors cursor-pointer ${
                isWishlisted
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-surface text-muted hover:border-primary/40 hover:text-primary"
              }`}
              title={isWishlisted ? "In Wishlist (Click to remove)" : "Save to Wishlist"}
            >
              <FiHeart size={15} className={isWishlisted ? "fill-primary text-primary" : ""} />
            </button>

            <button
              type="button"
              disabled={(selectedVariant?.stock ?? product.stock) <= 0}
              onClick={handleAddToCart}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 text-xs font-bold text-primary transition-all hover:bg-primary/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isAdded ? <FiCheckCircle size={14} /> : <FiShoppingBag size={14} />}
              <span className="hidden sm:inline">{isAdded ? "Added" : "Add to Cart"}</span>
            </button>

            <button
              type="button"
              disabled={(selectedVariant?.stock ?? product.stock) <= 0}
              onClick={handleBuyNow}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-focus hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <FiZap size={14} />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}