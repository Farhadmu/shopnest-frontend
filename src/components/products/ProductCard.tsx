"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  Button,
  Chip,
} from "@heroui/react";
import {
  FaHeart,
  FaStar,
  FaShoppingBag,
  FaCheck,
  FaBolt,
} from "react-icons/fa";
import { Product } from "@/lib/api/products";
import { ProductCardData } from "@/features/products/types";
import { formatCurrency } from "@/lib/utils";
import { addToCart } from "@/lib/api/cart";
import { addToWishlist } from "@/lib/api/wishlist";
import { useSession } from "@/lib/auth-client";
import {
  addGuestCartItem,
  addGuestWishlistItem,
  clearGuestCart,
  clearGuestWishlist,
} from "@/lib/guest-store";

export type UnifiedProduct = Partial<Product> & Partial<ProductCardData> & {
  id: string;
  title: string;
  price: number;
};

export interface ProductCardProps {
  product: UnifiedProduct;
  index?: number;
  isAdded?: boolean;
  isWishlisted?: boolean;
  onAddToCart?: (product: UnifiedProduct, e: React.MouseEvent) => void;
  onAddToWishlist?: (product: UnifiedProduct, e: React.MouseEvent) => void;
  onBuyNow?: (product: UnifiedProduct, e: React.MouseEvent) => void;
  className?: string;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  isAdded: externalIsAdded,
  isWishlisted: externalIsWishlisted,
  onAddToCart,
  onAddToWishlist,
  onBuyNow,
  className = "",
  compact = false,
}) => {
  const router = useRouter();
  const { data: session } = useSession();

  const [internalAdded, setInternalAdded] = useState(false);
  const [internalWishlist, setInternalWishlist] = useState(false);

  const isAdded = externalIsAdded ?? internalAdded;
  const isWishlist = externalIsWishlisted ?? internalWishlist;

  const imageSrc =
    product.images?.[0] ||
    product.imageUrl ||
    "";

  const discountPrice = product.discountPrice;
  const hasDiscount = !!discountPrice && discountPrice < product.price;
  const displayPrice = hasDiscount ? discountPrice : product.price;
  const savings = hasDiscount ? product.price - discountPrice : 0;
  const category = product.category || "General";
  const stock = product.stock ?? 10;
  const ratingAvg = product.ratingAvg ?? (product.rating ? String(product.rating) : "4.8");
  const ratingCount = product.ratingCount ?? 12;

  const handleCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product, e);
      return;
    }

    if (!session?.user) {
      addGuestCartItem({
        productId: product.id,
        price: displayPrice,
        title: product.title,
        images: imageSrc ? [imageSrc] : undefined,
        image: imageSrc,
        category: category,
      });
      setInternalAdded(true);
      setTimeout(() => setInternalAdded(false), 2000);
      return;
    }

    try {
      await addToCart(product.id, 1);
      clearGuestCart();
      setInternalAdded(true);
      setTimeout(() => setInternalAdded(false), 2000);
    } catch {
      router.push(`/products/${product.id}`);
    }
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAddToWishlist) {
      onAddToWishlist(product, e);
      return;
    }

    if (!session?.user) {
      addGuestWishlistItem({
        productId: product.id,
        price: displayPrice,
        title: product.title,
        images: imageSrc ? [imageSrc] : undefined,
        image: imageSrc,
        category: category,
      });
      setInternalWishlist(true);
      setTimeout(() => setInternalWishlist(false), 2000);
      return;
    }

    try {
      await addToWishlist(product.id);
      clearGuestWishlist();
      setInternalWishlist(true);
      setTimeout(() => setInternalWishlist(false), 2000);
    } catch {
      // ignore error
    }
  };

  const handleBuyNowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onBuyNow) {
      onBuyNow(product, e);
      return;
    }

    if (!session?.user) {
      addGuestCartItem({
        productId: product.id,
        price: displayPrice,
        title: product.title,
        images: imageSrc ? [imageSrc] : undefined,
        image: imageSrc,
        category: category,
      });
      router.push(`/login?next=${encodeURIComponent("/checkout")}`);
      return;
    }

    try {
      await addToCart(product.id, 1);
      router.push("/checkout");
    } catch {
      router.push("/cart");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -6 }}
      className={`h-full ${className}`}
    >
      <Card
        className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border/70 bg-surface shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 p-0"
      >
        {/* Product Image Box */}
        <div className="relative block overflow-hidden">
          <Link href={`/products/${product.id}`} className="block">
            <div
              className={`relative w-full overflow-hidden bg-muted-bg ${
                compact ? "h-40" : "h-52 sm:h-56"
              }`}
            >
              {imageSrc && !imageSrc.startsWith("linear-gradient") ? (
                <Image
                  src={imageSrc}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  priority={index < 4}
                />
              ) : (
                <div
                  className="grid h-full w-full place-items-center text-5xl select-none"
                  style={
                    imageSrc.startsWith("linear-gradient")
                      ? { background: imageSrc }
                      : undefined
                  }
                >
                  🛍️
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/5 opacity-60 transition-opacity group-hover:opacity-75" />
            </div>
          </Link>

          {/* Category Chip */}
          <div className="absolute left-3 top-3 z-20">
            <Chip
              size="sm"
              variant="secondary"
              className="border border-white/20 bg-black/40 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-md"
            >
              {category}
            </Chip>
          </div>

          {/* Savings Badge */}
          {hasDiscount && (
            <div className="absolute bottom-3 left-3 z-20">
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex rounded-full bg-red-500 px-2.5 py-1 text-[9px] font-black text-white shadow-md backdrop-blur-md"
              >
                Save {formatCurrency(savings)}
              </motion.span>
            </div>
          )}

          {/* Wishlist Button */}
          <motion.button
            type="button"
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
            title={isWishlist ? "Saved to Wishlist" : "Add to Wishlist"}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            className={`absolute right-3 top-3 z-30 grid h-9 w-9 place-items-center rounded-full border border-white/50 bg-white/95 shadow-md backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/90 ${
              isWishlist
                ? "border-red-500 bg-red-500 text-white"
                : "text-gray-400 hover:border-red-200 hover:text-red-500 dark:hover:border-red-500/30 dark:hover:text-red-500"
            }`}
          >
            <FaHeart size={13} className={isWishlist ? "text-white" : ""} />
          </motion.button>
        </div>

        {/* Card Body / Content */}
        <CardContent className="flex flex-1 flex-col p-4">
          {/* Rating & Verification */}
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <FaStar size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-black text-text">{ratingAvg}</span>
              <span className="text-[10px] text-muted">({ratingCount})</span>
            </div>

            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              Verified
            </span>
          </div>

          {/* Title */}
          <Link href={`/products/${product.id}`} className="group/link">
            <h3 className="line-clamp-2 min-h-[38px] text-sm font-extrabold leading-5 text-text transition-colors group-hover/link:text-primary">
              {product.title}
            </h3>
          </Link>

          {/* Pricing */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-text">
              {formatCurrency(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs font-semibold text-muted line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-1.5">
            {stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                In Stock ({stock} left)
              </span>
            ) : (
              <span className="text-[10px] font-bold text-error">
                Out of Stock
              </span>
            )}
          </div>
        </CardContent>

        {/* Card Footer with Hero UI Action Buttons */}
        <CardFooter className="gap-2 pt-0 pb-4 px-4">
          <Button
            size="sm"
            variant="primary"
            isDisabled={stock <= 0}
            onClick={(e) => handleCartClick(e as unknown as React.MouseEvent)}
            className={`flex-1 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
              isAdded
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-primary hover:bg-primary-hover shadow-primary/20"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {isAdded ? <FaCheck size={11} /> : <FaShoppingBag size={11} />}
              {isAdded ? "Added" : "Add to Cart"}
            </span>
          </Button>

          {!compact && (
            <Button
              size="sm"
              variant="outline"
              isDisabled={stock <= 0}
              onClick={(e) => handleBuyNowClick(e as unknown as React.MouseEvent)}
              className="rounded-xl border border-border/80 bg-surface/80 text-xs font-bold text-text hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <span className="flex items-center gap-1">
                <FaBolt size={10} className="text-amber-500 animate-pulse" />
                Buy
              </span>
            </Button>
          )}
        </CardFooter>

        {/* Animated Bottom Accent */}
        <motion.div
          initial={{ width: "0%" }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500"
        />
      </Card>
    </motion.div>
  );
};