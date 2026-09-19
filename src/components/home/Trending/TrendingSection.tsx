"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

import {
  FaArrowRight,
  FaCheck,
  FaFire,
} from "react-icons/fa";

import { getTrendingProducts, Product } from "@/lib/api/products";
import { addToCart } from "@/lib/api/cart";
import { addToWishlist } from "@/lib/api/wishlist";
import {
  addGuestCartItem,
  addGuestWishlistItem,
  clearGuestCart,
  clearGuestWishlist,
} from "@/lib/guest-store";
import { useSession } from "@/lib/auth-client";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "@/context/ToastContext";

import TrendingCard from "./TrendingCard";
import TrendingSkeleton from "./TrendingSkeleton";

export default function TrendingSection({ initialProducts }: {
  /** Pre-fetched trending products from HomeDataContext. Skips own fetch when provided. */
  initialProducts?: Product[];
}) {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(() => initialProducts ?? []);
  const [loading, setLoading] = useState(() => !initialProducts || initialProducts.length === 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const [addedMap, setAddedMap] = useState<
    Record<string, boolean>
  >({});

  const { data: session } = useSession();


  // Fetch Trending Products


  useEffect(() => {
    // If initial products were provided and this is the first mount (retryKey===0), skip fetch.
    if (initialProducts && initialProducts.length > 0 && retryKey === 0) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadTrending() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const data = await getTrendingProducts(8);

        if (!cancelled) {
          setProducts(data?.products || []);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "Unable to load trending products right now."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTrending();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

 
  // Add To Cart
 

  const handleAddToCart = async (
    product: Product,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Guest mode
    if (!session?.user) {
      addGuestCartItem({
        productId: product.id,
        price: product.price,
        title: product.title,
        images: product.images,
        category: product.category,
      });

      setAddedMap((prev) => ({
        ...prev,
        [product.id]: true,
      }));

      toast.cart(`Added "${product.title}" to cart!`, {
        description: "Item added to your shopping bag",
      });

      setTimeout(() => {
        setAddedMap((prev) => ({ ...prev, [product.id]: false }));
      }, 2000);
      return;
    }

    try {
      await addToCart(product.id, 1);
      clearGuestCart();

      setAddedMap((prev) => ({
        ...prev,
        [product.id]: true,
      }));

      toast.cart(`Added "${product.title}" to cart!`, {
        description: "Item added to your shopping bag",
      });

      setTimeout(() => {
        setAddedMap((prev) => ({ ...prev, [product.id]: false }));
      }, 2000);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to add to cart"
      );
    }
  };

  
  const { toggleWishlist } = useWishlist();

  const handleAddToWishlist = async (
    product: Product,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await toggleWishlist({
        id: product.id,
        title: product.title,
        price: product.discountPrice || product.price,
        image: product.images?.[0],
        images: product.images,
        category: product.category,
      });

      if (res.added) {
        toast.wishlist(`Saved "${product.title}" to wishlist!`, {
          description: "Item saved to your favorites",
        });
      } else {
        toast.info(`Removed "${product.title}" from wishlist`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update wishlist"
      );
    }
  };

  
  // Render


  return (
    <section className="relative w-full overflow-hidden py-12 sm:py-16">
      {/* Background Glow */}

      <div className="pointer-events-none absolute left-0 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-500/5 blur-3xl" />

      {/*  Header  */}

      <div className="relative z-10 mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {/* Trending Label */}

          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            className="mb-4 flex items-center gap-2"
          >
            <motion.span
              animate={{
                scale: [1, 1.15, 1],
                rotate: [-3, 3, -3],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="grid h-9 w-9 place-items-center rounded-full bg-orange-500/10 text-orange-500"
            >
              <FaFire size={14} />
            </motion.span>

            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
              Trending now
            </span>

            <motion.span
              animate={{
                scaleX: [0.7, 1.2, 0.7],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-[2px] w-8 origin-left rounded-full bg-gradient-to-r from-primary to-violet-500"
            />
          </motion.div>

          {/* Main Headline */}

          <motion.h2
            initial={{
              opacity: 0,
              y: 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 0.1,
              duration: 0.5,
            }}
            className="text-3xl font-black tracking-tight text-text sm:text-4xl lg:text-5xl"
          >
           Customer {" "}
            <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              favorites
            </span>
          </motion.h2>

          {/* Subtitle */}

          <motion.p
            initial={{
              opacity: 0,
              y: 10,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 0.2,
              duration: 0.5,
            }}
            className="mt-3 max-w-xl text-sm leading-6 text-muted"
          >
           Discover the products our customers love most and find your next favorite today.
          </motion.p>
        </div>

        {/* Explore All */}

        <Link
          href="/products"
          className="group inline-flex w-fit items-center gap-3 rounded-full border border-border bg-surface px-5 py-3 text-sm font-bold text-text shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:text-primary hover:shadow-lg"
        >
          <span>See more </span>

          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-white transition-transform duration-300 group-hover:translate-x-1">
            <FaArrowRight size={11} />
          </span>
        </Link>
      </div>

      {/*  Products */}

      {loading ? (
        <TrendingSkeleton />
      ) : errorMessage ? (
        <div className="relative z-10 rounded-[2rem] border border-dashed border-border bg-surface p-12 text-center">
          <h3 className="text-lg font-black text-text">
            Trending products are unavailable
          </h3>

          <p className="mt-2 text-sm text-muted">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-hover"
          >
            Try again
            <FaArrowRight size={10} />
          </button>
        </div>
      ) : products.length > 0 ? (
        <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product, index) => (
            <TrendingCard
              key={product.id}
              product={product}
              index={index}
              isAdded={!!addedMap[product.id]}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        /* Empty State */

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative z-10 rounded-[2rem] border border-dashed border-border bg-surface p-12 text-center"
        >
          <motion.div
            animate={{
              y: [0, -8, 0],
              rotate: [-3, 3, -3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-5xl"
          >
            🔥
          </motion.div>

          <h3 className="mt-5 text-lg font-black text-text">
            No trending products yet
          </h3>

          <p className="mt-2 text-sm text-muted">
            Check back soon for new and popular products.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-hover"
          >
            Browse Products

            <FaArrowRight size={10} />
          </Link>
        </motion.div>
      )}
    </section>
  );
}
