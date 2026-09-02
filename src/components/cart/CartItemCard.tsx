"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Trash2, Plus, Minus, Check, ShoppingBag } from "lucide-react";
import { ExtendedCartItem } from "@/context/CartDrawerContext";
import { formatCurrency } from "@/lib/utils";

export interface CartItemCardProps {
  item: ExtendedCartItem;
  layoutMode?: "drawer" | "page";
  isUpdating?: boolean;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onMoveToWishlist?: (item: ExtendedCartItem) => Promise<void> | void;
}

export function CartItemCard({
  item,
  layoutMode = "drawer",
  isUpdating = false,
  onUpdateQuantity,
  onRemove,
  onMoveToWishlist,
}: CartItemCardProps) {
  const [wishlistSuccess, setWishlistSuccess] = useState(false);

  const itemImg =
    item.image ||
    (item.images && item.images.length > 0 ? item.images[0] : null);

  const unitPrice = item.price;
  const originalPrice = item.originalPrice;
  const hasDiscount = originalPrice && originalPrice > unitPrice;
  const isPageMode = layoutMode === "page";

  const handleWishlist = async () => {
    if (!onMoveToWishlist) return;
    setWishlistSuccess(true);
    await onMoveToWishlist(item);
    setTimeout(() => setWishlistSuccess(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{
        opacity: 0,
        height: 0,
        x: 40,
        transition: { duration: 0.25 },
      }}
      className={`relative group transition-all duration-200 ${
        isPageMode
          ? "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-sm border border-border/80 bg-surface/80 shadow-md shadow-black/5 backdrop-blur-xl hover:border-primary/40 hover:shadow-lg"
          : "flex items-start gap-3.5 py-4 border-b border-slate-100 dark:border-purple-900/20"
      }`}
    >
      {/* Left: Product Thumbnail */}
      <div
        className={`relative shrink-0 rounded-sm bg-slate-50 dark:bg-[#16102E] p-1.5 border border-slate-100 dark:border-purple-900/30 overflow-hidden flex items-center justify-center ${
          isPageMode ? "w-20 h-24 sm:w-24 sm:h-24" : "w-16 h-20"
        }`}
      >
        {itemImg ? (
          <Link href={`/products/${item.productId}`} className="h-full w-full">
            <Image
              src={itemImg}
              alt={item.title || "Product image"}
              width={isPageMode ? 96 : 64}
              height={isPageMode ? 96 : 80}
              unoptimized={itemImg.startsWith("data:")}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-300 dark:text-purple-400/40">
            <ShoppingBag size={isPageMode ? 32 : 24} />
          </div>
        )}
      </div>

      {/* Center: Product Details */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          {item.isBestseller && (
            <span className="rounded-sm bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Bestseller
            </span>
          )}
          {hasDiscount && (
            <span className="rounded-sm bg-[#7C3AED] px-1.5 py-0.5 text-[10px] font-bold text-white tracking-wide">
              -
              {Math.round(
                ((originalPrice! - unitPrice) / originalPrice!) * 100
              )}
              % OFF
            </span>
          )}
        </div>

        {/* Brand / Category Name */}
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-purple-300/70 truncate">
          {item.brand || item.category || "SHOPNEST"}
        </p>

        {/* Product Title */}
        <Link
          href={`/products/${item.productId}`}
          className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-[#7C3AED] dark:hover:text-purple-400 line-clamp-1 leading-snug transition-colors"
        >
          {item.title || `Product #${item.productId.slice(-5)}`}
        </Link>

        {/* Variant / Option info */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          {item.variant ? `Variant: ${item.variant}` : "Standard Edition"}
        </p>

        {/* Compact Quantity Controller */}
        <div className="mt-2.5 flex items-center gap-3">
          <div className="inline-flex h-7 items-center rounded-sm border border-slate-200 dark:border-purple-900/40 bg-white dark:bg-[#110C24] px-1 shadow-xs">
            <button
              type="button"
              disabled={isUpdating || item.quantity <= 1}
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              aria-label="Decrease quantity"
              title={item.quantity <= 1 ? "Minimum quantity reached" : "Decrease"}
              className="grid h-5 w-5 place-items-center rounded-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-purple-900/40 hover:text-slate-900 dark:hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Minus size={11} />
            </button>
            <span className="min-w-6 text-center text-xs font-bold text-slate-800 dark:text-slate-100 px-1">
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={isUpdating || (item.stock !== undefined && item.quantity >= item.stock)}
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              aria-label="Increase quantity"
              title={
                item.stock !== undefined && item.quantity >= item.stock
                  ? `Maximum stock (${item.stock}) reached`
                  : "Increase"
              }
              className="grid h-5 w-5 place-items-center rounded-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-purple-900/40 hover:text-slate-900 dark:hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus size={11} />
            </button>
          </div>

          {isPageMode && (
            <span className="text-xs text-muted">
              {formatCurrency(unitPrice)} each
            </span>
          )}
        </div>
      </div>

      {/* Right Column: Actions & Pricing */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2">
        {/* Top Action Buttons (Heart & Trash) */}
        <div className="flex items-center gap-1.5">
          {onMoveToWishlist && (
            <button
              type="button"
              onClick={handleWishlist}
              aria-label="Save to wishlist"
              title="Move to wishlist"
              className={`grid h-7 w-7 place-items-center rounded-sm transition-colors cursor-pointer ${
                wishlistSuccess
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-500"
                  : "text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-purple-900/30"
              }`}
            >
              {wishlistSuccess ? (
                <Check size={13} className="text-emerald-500" />
              ) : (
                <Heart size={14} />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            aria-label="Remove item"
            title="Remove from cart"
            className="grid h-7 w-7 place-items-center rounded-sm text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Pricing Block */}
        <div className="text-right">
          {hasDiscount && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 line-through">
              {formatCurrency(originalPrice! * item.quantity)}
            </p>
          )}
          <p
            className={`font-extrabold text-[#7C3AED] dark:text-[#A855F7] leading-tight ${
              isPageMode ? "text-lg sm:text-xl" : "text-base"
            }`}
          >
            {formatCurrency(unitPrice * item.quantity)}
          </p>
          {item.quantity > 1 && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              ({formatCurrency(unitPrice)} per item)
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
