"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";

import {
  FaShoppingBag,
  FaHeart,
  FaStar,
  FaCheck,
} from "react-icons/fa";

import { Product } from "@/lib/api/products";

interface TrendingCardProps {
  product: Product;
  index: number;
  isAdded: boolean;
  onAddToCart: (
    product: Product,
    e: React.MouseEvent<HTMLButtonElement>
  ) => void;
  onAddToWishlist: (
    product: Product,
    e: React.MouseEvent<HTMLButtonElement>
  ) => void;
}

export default function TrendingCard({
  product,
  index,
  isAdded,
  onAddToCart,
  onAddToWishlist,
}: TrendingCardProps) {
  const hasDiscount =
    product.discountPrice &&
    product.discountPrice < product.price;

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 30,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
      }}
      whileHover={{
        y: -8,
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-surface shadow-sm transition-shadow duration-500 hover:shadow-2xl hover:shadow-primary/10"
    >
      {/* Product Image */}

      <Link
        href={`/products/${product.id}`}
        className="relative block"
      >
        <div className="relative h-60 overflow-hidden bg-muted-bg">
          {product.images?.[0] ? (
            <motion.img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover"
              transition={{
                duration: 0.6,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.08,
              }}
            />
          ) : (
            <div className="grid h-full place-items-center text-6xl">
              🛍️
            </div>
          )}

          {/* Image Overlay */}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/5 opacity-70" />

          {/* Category */}

          <div className="absolute left-4 top-4">
            <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-md">
              {product.category}
            </span>
          </div>

          {/* Discount */}

          {hasDiscount && (
            <div className="absolute bottom-4 left-4">
              <motion.span
                animate={{
                  scale: [1, 1.04, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-flex rounded-full bg-red-500 px-3 py-1.5 text-[10px] font-black text-white shadow-lg"
              >
                Save ৳
                {(
                  product.price -
                  (product.discountPrice || 0)
                ).toLocaleString()}
              </motion.span>
            </div>
          )}

          {/* Wishlist */}

          <motion.button
            type="button"
            onClick={(e) => onAddToWishlist(product, e)}
            aria-label="Add to wishlist"
            title="Add to Wishlist"
            initial={{
              scale: 0.8,
              opacity: 0,
            }}
            whileInView={{
              scale: 1,
              opacity: 1,
            }}
            animate={{
              y: [0, -3, 0],
            }}
            whileHover={{
              scale: 1.12,
              rotate: [-6, 6, -4, 0],
            }}
            whileTap={{
              scale: 0.82,
            }}
            transition={{
              y: {
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.15,
              },
              default: {
                duration: 0.3,
              },
            }}
            className="absolute right-4 top-4 z-30 grid h-11 w-11 place-items-center rounded-full border border-white/50 bg-white/95 text-gray-400 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-red-200 hover:bg-white hover:text-red-500 dark:border-white/10 dark:bg-slate-900/90 dark:text-gray-400 dark:hover:border-red-500/30 dark:hover:bg-slate-900 dark:hover:text-red-500"
          >
            {/* Ripple */}

            <motion.span
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.25, 0, 0.25],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute inset-0 rounded-full bg-red-400/30"
            />

            {/* Glow */}

            <motion.span
              animate={{
                boxShadow: [
                  "0 0 0px rgba(239,68,68,0)",
                  "0 0 15px rgba(239,68,68,0.25)",
                  "0 0 0px rgba(239,68,68,0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-1 rounded-full"
            />

            {/* Heart */}

            <motion.span
              animate={{
                scale: [1, 1.12, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10"
            >
              <FaHeart size={16} />
            </motion.span>
          </motion.button>
        </div>
      </Link>

      {/* Product Content */}

      <div className="flex flex-1 flex-col p-5">
        {/* Rating */}

        <div className="flex items-center gap-1.5">
          <FaStar
            size={11}
            className="fill-amber-400 text-amber-400"
          />

          <span className="text-xs font-black text-text">
            {product.ratingAvg || "4.8"}
          </span>

          <span className="text-[10px] text-muted">
            ({product.ratingCount || 12} reviews)
          </span>
        </div>

        {/* Product Title */}

        <Link href={`/products/${product.id}`}>
          <h3 className="mt-3 line-clamp-2 min-h-[42px] text-[15px] font-extrabold leading-5 text-text transition-colors duration-300 group-hover:text-primary">
            {product.title}
          </h3>
        </Link>

        {/* Price */}

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xl font-black text-text">
            ৳
            {(
              product.discountPrice ||
              product.price
            ).toLocaleString()}
          </span>

          {hasDiscount && (
            <span className="text-xs font-semibold text-muted line-through">
              ৳{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock */}

        <div className="mt-2">
          {product.stock > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <motion.span
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              />

              In Stock · {product.stock} available
            </span>
          ) : (
            <span className="text-[10px] font-bold text-error">
              Out of Stock
            </span>
          )}
        </div>

        {/* Add To Cart */}

        <div className="mt-5">
          <button
            type="button"
            onClick={(e) => onAddToCart(product, e)}
            disabled={product.stock <= 0}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all duration-300 ${
              product.stock <= 0
                ? "cursor-not-allowed bg-muted-bg text-muted"
                : isAdded
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                : "bg-primary text-white shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
            }`}
          >
            {isAdded ? (
              <>
                <FaCheck size={11} />
                Added to Cart
              </>
            ) : (
              <>
                <FaShoppingBag size={11} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Animated Accent */}

      <motion.div
        initial={{
          width: "0%",
        }}
        whileHover={{
          width: "100%",
        }}
        transition={{
          duration: 0.5,
        }}
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500"
      />

      {/* Hover Shine */}

      <motion.div
        initial={{
          x: "-100%",
        }}
        whileHover={{
          x: "100%",
        }}
        transition={{
          duration: 0.7,
        }}
        className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </motion.article>
  );
}