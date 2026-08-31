"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { FaHeart, FaStar, FaShoppingBag, FaCheck } from "react-icons/fa";
import { formatCurrency } from "@/lib/utils";
import { addToCart } from "@/lib/api/cart";
import { addToWishlist } from "@/lib/api/wishlist";
import { useSession } from "@/lib/auth-client";
import { ProductCardData } from "../types";

import {
  addGuestCartItem,
  addGuestWishlistItem,
  clearGuestCart,
  clearGuestWishlist,
} from "@/lib/guest-store";

export interface ProductCardProps {
  product: ProductCardData;
  onAddToCart?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);

  const imageStyle = product.imageUrl?.startsWith("linear-gradient")
    ? { background: product.imageUrl }
    : undefined;

  const handleCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product.id);
      return;
    }

    if (!session?.user) {
      // Guest mode
      addGuestCartItem({
        productId: product.id,
        price: product.price,
        title: product.title,
        image: product.imageUrl,
        category: product.category,
      });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
      return;
    }

    try {
      await addToCart(product.id, 1);
      clearGuestCart();
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch {
      router.push(`/products/${product.id}`);
    }
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      // Guest mode
      addGuestWishlistItem({
        productId: product.id,
        price: product.price,
        title: product.title,
        image: product.imageUrl,
        category: product.category,
      });
      setIsWishlist(true);
      setTimeout(() => setIsWishlist(false), 2000);
      return;
    }

    try {
      await addToWishlist(product.id);
      clearGuestWishlist();
      setIsWishlist(true);
      setTimeout(() => setIsWishlist(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }} className="h-full">
      <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl">
        <div className="flex h-full flex-col p-4">
          {/* Image box */}
          <div
            className="relative mb-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl bg-muted-bg"
            style={imageStyle}
          >
            {!imageStyle && <span className="text-5xl select-none">🛍️</span>}
            {imageStyle && <span className="text-5xl drop-shadow-lg select-none">🛍️</span>}
            <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-text backdrop-blur-md">
              {product.category || "Featured"}
            </span>
            <button
              type="button"
              onClick={handleWishlistClick}
              aria-label="Add to wishlist"
              className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur-md shadow-sm transition ${
                isWishlist
                  ? "bg-rose-500 text-white"
                  : "bg-surface/90 text-muted hover:text-rose-500"
              }`}
            >
              <FaHeart size={12} />
            </button>
          </div>

          {/* Rating */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              Verified
            </span>
            {product.rating && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <FaStar size={11} /> {product.rating}
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/products/${product.id}`} className="group/link">
            <h3 className="mb-1 line-clamp-2 text-sm font-black text-foreground transition-colors group-hover/link:text-primary">
              {product.title}
            </h3>
          </Link>

          {/* Price */}
          <p className="mb-4 text-lg font-black text-foreground">{formatCurrency(product.price)}</p>

          {/* Add to Cart Button */}
          <div className="mt-auto">
            <button
              type="button"
              onClick={handleCartClick}
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition shadow-sm ${
                isAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-primary text-white hover:bg-primary-hover shadow-primary/20"
              }`}
            >
              {isAdded ? (
                <>
                  <FaCheck size={11} /> Added
                </>
              ) : (
                <>
                  <FaShoppingBag size={11} /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
