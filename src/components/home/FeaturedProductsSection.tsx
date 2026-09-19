"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { FaArrowRight, FaCheck, FaStar } from "react-icons/fa";

import { getFeaturedProducts, Product } from "@/lib/api/products";
import { ProductCard, UnifiedProduct } from "@/components/products/ProductCard";
import ProductSkeleton from "@/components/home/ProductSkeleton";
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

const MAX_FEATURED_PRODUCTS = 8;

interface FeaturedProductsSectionProps {
  initialProducts?: Product[];
}

export default function FeaturedProductsSection({
  initialProducts,
}: FeaturedProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.filter((p) => p.isFeatured).slice(0, MAX_FEATURED_PRODUCTS);
    }
    return [];
  });
  const [loading, setLoading] = useState<boolean>(() => !initialProducts || initialProducts.length === 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadFeatured() {
      if (initialProducts && initialProducts.length > 0 && retryKey === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage(null);

        const data = await getFeaturedProducts(MAX_FEATURED_PRODUCTS);

        if (!cancelled) {
          const featuredOnly = data.filter((p) => p.isFeatured).slice(0, MAX_FEATURED_PRODUCTS);
          setProducts(featuredOnly);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "Unable to load featured products right now. Please check your connection."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFeatured();

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const handleAddToCart = async (product: UnifiedProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const prod = product as Product;

    if (!session?.user) {
      addGuestCartItem({
        productId: prod.id,
        price: prod.discountPrice || prod.price,
        title: prod.title,
        images: prod.images,
        category: prod.category,
      });
      setAddedMap((prev) => ({ ...prev, [prod.id]: true }));
      toast.cart(`Added "${prod.title}" to cart!`, {
        description: "Item added to your shopping bag",
      });
      setTimeout(() => setAddedMap((prev) => ({ ...prev, [prod.id]: false })), 2000);
      return;
    }

    try {
      await addToCart(prod.id, 1);
      clearGuestCart();
      setAddedMap((prev) => ({ ...prev, [prod.id]: true }));
      toast.cart(`Added "${prod.title}" to cart!`, {
        description: "Item added to your shopping bag",
      });
      setTimeout(() => setAddedMap((prev) => ({ ...prev, [prod.id]: false })), 2000);
    } catch {
      toast.error("Failed to add to cart", {
        description: "Please check your network and try again",
      });
    }
  };

  const { toggleWishlist } = useWishlist();

  const handleAddToWishlist = async (product: UnifiedProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const prod = product as Product;
    try {
      const res = await toggleWishlist({
        id: prod.id,
        title: prod.title,
        price: prod.discountPrice || prod.price,
        image: prod.images?.[0],
        images: prod.images,
        category: prod.category,
      });
      if (res.added) {
        toast.wishlist(`Saved "${prod.title}" to wishlist!`, {
          description: "Item saved to your favorites",
        });
      } else {
        toast.info(`Removed "${prod.title}" from wishlist`);
      }
    } catch {
      toast.error("Failed to update wishlist", {
        description: "Could not update your wishlist right now",
      });
    }
  };

  const uniqueProducts = Array.from(
    new Map(products.map((p) => [p.id, p])).values()
  ).slice(0, MAX_FEATURED_PRODUCTS);

  // If there are no featured products and no error, hide the section
  if (!loading && !errorMessage && uniqueProducts.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden py-12 sm:py-16">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute left-0 top-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      {/* Section Header */}
      <div className="relative z-10 mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {/* Label Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-4 flex items-center gap-2"
          >
            <motion.span
              animate={{
                scale: [1, 1.15, 1],
                rotate: [-4, 4, -4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="grid h-9 w-9 place-items-center rounded-full bg-amber-500/15 text-amber-500"
            >
              <FaStar size={14} className="fill-amber-500 text-amber-500" />
            </motion.span>

            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
              Spotlight Collection
            </span>

            <motion.span
              animate={{ scaleX: [0.7, 1.2, 0.7], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-0.5 w-8 origin-left rounded-full bg-linear-to-r from-amber-500 to-primary"
            />
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl font-black tracking-tight text-text sm:text-4xl lg:text-5xl"
          >
            Featured{" "}
            <span className="bg-linear-to-r from-amber-500 via-orange-500 to-primary bg-clip-text text-transparent">
              Products
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-3 max-w-xl text-sm leading-6 text-muted"
          >
            Handpicked best-sellers and editor-chosen essentials curated for peak quality.
          </motion.p>
        </div>

        {/* Explore Link */}
        <Link
          href="/products"
          className="group inline-flex w-fit items-center gap-3 rounded-full border border-border bg-surface px-5 py-3 text-sm font-bold text-text shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:text-amber-600 dark:hover:text-amber-400 hover:shadow-lg"
        >
          <span>Explore all products</span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-500 text-white transition-transform duration-300 group-hover:translate-x-1">
            <FaArrowRight size={11} />
          </span>
        </Link>
      </div>

      {/* Product Content / Loading / Error / Grid */}
      {loading ? (
        <ProductSkeleton count={4} />
      ) : errorMessage ? (
        <div className="relative z-10 rounded-[2rem] border border-dashed border-border bg-surface p-12 text-center">
          <h3 className="text-lg font-black text-text">Featured products are unavailable</h3>
          <p className="mt-2 text-sm text-muted">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-600"
          >
            Try again <FaArrowRight size={10} />
          </button>
        </div>
      ) : (
        <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {uniqueProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              isAdded={!!addedMap[product.id]}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}
