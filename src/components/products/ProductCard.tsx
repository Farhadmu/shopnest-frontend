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
import { useWishlist } from "@/context/WishlistContext";
import { useFlyToCart } from "@/context/FlyToCartContext";
import { useSession } from "@/lib/auth-client";
import {
  addGuestCartItem,
  clearGuestCart,
} from "@/lib/guest-store";
import { toast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/core/errors";

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
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { triggerFlyToCart } = useFlyToCart();
  const cardRef = React.useRef<HTMLDivElement | null>(null);

  const [internalAdded, setInternalAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isAdded = externalIsAdded ?? internalAdded;
  const isWishlist = externalIsWishlisted ?? isInWishlist(product.id);

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
  const ratingAvg = product.ratingAvg ?? 0;
  const ratingCount = product.ratingCount ?? 0;

  const handleCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const imgEl = cardRef.current?.querySelector("img");
    triggerFlyToCart({
      startElement: (imgEl as HTMLElement) || (cardRef.current as HTMLElement) || (e.currentTarget as HTMLElement),
      imageSrc,
    });

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
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.toLowerCase().includes("suspended") || msg.toLowerCase().includes("banned")) {
        toast.error("Account Suspended", {
          description: "Your account has been suspended. You cannot add items to cart. Please contact support.",
        });
        return;
      }
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

    try {
      await toggleWishlist({
        id: product.id,
        title: product.title,
        price: displayPrice,
        image: imageSrc,
        images: product.images,
        category: category,
      });
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
      ref={cardRef}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -6 }}
      className={`h-full ${className}`}
    >
      <Card
        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-surface shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 p-0"
      >
        {/* Product Image Box */}
        <div className="relative block overflow-hidden">
          <Link href={`/products/${product.id}`} className="block">
            <div
              className={`relative w-full overflow-hidden bg-muted-bg ${compact ? "aspect-square" : "aspect-4/3 sm:aspect-4/3"
                }`}
            >
              {imageSrc && !imageSrc.startsWith("linear-gradient") && !imgError ? (
                <Image
                  src={imageSrc}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-106"
                  priority={index < 4}
                  onError={() => setImgError(true)}
                  unoptimized={false}
                />
              ) : (
                <div
                  className="grid h-full w-full place-items-center text-4xl select-none"
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
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/5 opacity-40 transition-opacity group-hover:opacity-60" />
            </div>
          </Link>

          {/* Category Chip & Featured Badge */}
          <div className="absolute left-2.5 top-2.5 z-20 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-48px)]">
            <Chip
              size="sm"
              variant="secondary"
              className="border border-white/20 bg-black/50 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-md px-2 py-0.5"
            >
              {category}
            </Chip>

            {product.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/95 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs backdrop-blur-md">
                <FaStar className="fill-white" size={8} />
                <span>Featured</span>
              </span>
            )}
          </div>

          {/* Savings Badge */}
          {hasDiscount && (
            <div className="absolute bottom-2.5 left-2.5 z-20">
              <span className="inline-flex rounded-md bg-rose-500/95 px-2 py-0.5 text-[9px] font-black text-white shadow-xs backdrop-blur-md">
                Save {formatCurrency(savings)}
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <motion.button
            type="button"
            onClick={handleWishlistClick}
            aria-label={isWishlist ? "Remove from wishlist" : "Add to wishlist"}
            title={isWishlist ? "In Wishlist (Click to remove)" : "Add to Wishlist"}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            className={`absolute right-2.5 top-2.5 z-30 grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition-all duration-300 cursor-pointer shadow-sm active:scale-95 ${isWishlist
              ? "border-primary/50 bg-primary/10 text-primary shadow-primary/20 hover:bg-primary/30"
              : "border-white/20 bg-black/40 text-white/80 hover:bg-black/60 hover:text-white hover:border-white/35"
              }`}
          >
            <FaHeart
              size={13}
              className={`transition-all duration-300 ${isWishlist ? "text-primary fill-primary scale-110 drop-shadow-sm" : ""
                }`}
            />
          </motion.button>
        </div>

        {/* Card Body / Content */}
        <CardContent className="flex flex-1 flex-col justify-between p-3 pb-1 gap-2">
          <div>
            {/* Rating & Stock row */}
            <div className="mb-1 flex items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-1">
                <FaStar size={10} className="fill-amber-400 text-amber-400" />
                <span className="text-xs font-black text-text">
                  {ratingAvg > 0 ? ratingAvg.toFixed(1) : "—"}
                </span>
                <span className="text-[10px] text-muted">
                  ({ratingCount})
                </span>
              </div>

              {stock > 0 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-rose-500">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Title */}
            <Link href={`/products/${product.id}`} className="group/link block">
              <h3 className="line-clamp-1 text-sm font-extrabold text-text transition-colors group-hover/link:text-primary" title={product.title}>
                {product.title}
              </h3>
            </Link>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-text truncate">
              {formatCurrency(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] font-semibold text-muted line-through truncate">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </CardContent>

        {/* Card Footer with Action Buttons */}
        <CardFooter className="gap-2 p-3 pt-1">
          <Button
            size="sm"
            variant="primary"
            isDisabled={stock <= 0}
            onClick={(e) => handleCartClick(e as unknown as React.MouseEvent)}
            className={`flex-1 rounded-xl text-xs font-bold text-white shadow-xs transition-all ${isAdded
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
              aria-label="Buy Now"
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
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-primary via-violet-500 to-fuchsia-500"
        />
      </Card>
    </motion.div>
  );
};