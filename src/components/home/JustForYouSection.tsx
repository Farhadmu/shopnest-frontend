"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

import { FaArrowRight, FaCheck } from "react-icons/fa";

import { getProducts, Product } from "@/lib/api/products";
import { UnifiedProduct } from "@/components/products/ProductCard";
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

import { ProductCard } from "@/components/products/ProductCard";
import ProductSkeleton from "@/components/home/ProductSkeleton";

export default function JustForYouSection({ initialProducts }: {
  /** Pre-fetched products from HomeDataContext. Skips own fetch when provided. */
  initialProducts?: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(() => initialProducts ?? []);
  const [loading, setLoading] = useState(() => !initialProducts || initialProducts.length === 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If initial products were provided and this is the first mount (retryKey===0), skip fetch.
    if (initialProducts && initialProducts.length > 0 && retryKey === 0) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    async function fetchProducts() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const response = await getProducts({
          page: 1,
          limit: 8,
          sort: "newest",
        });

        let fetchedData: Product[] = [];

        if (Array.isArray(response)) {
          fetchedData = response;
        } else if (response && typeof response === "object") {
          const resObj = response as Record<string, unknown>;
          if (Array.isArray(resObj.items)) {
            fetchedData = resObj.items as Product[];
          } else if (Array.isArray(resObj.products)) {
            fetchedData = resObj.products as Product[];
          } else if (Array.isArray(resObj.data)) {
            fetchedData = resObj.data as Product[];
          }
        }

        setProducts(fetchedData);
      } catch (error) {
        setProducts([]);
        setErrorMessage(
          error instanceof Error ? error.message : "We couldn't load products."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

  const handleAddToCart = async (product: UnifiedProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const prod = product as Product;

    if (!session?.user) {
      addGuestCartItem({
        productId: prod.id,
        price: prod.price,
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
        price: prod.price,
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

  return (
    <section className="relative w-full overflow-hidden py-12 sm:py-16">
      <div className="pointer-events-none absolute right-0 top-10 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-64 w-64 rounded-full bg-fuchsia-500/5 blur-3xl" />

      <div className="relative z-10 mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-4 flex items-center gap-2"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
              Discover
            </span>
            <motion.span
              animate={{ scaleX: [0.7, 1.2, 0.7], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-0.5 w-8 origin-left rounded-full bg-linear-to-r from-primary to-violet-500"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl font-black tracking-tight text-text sm:text-4xl lg:text-5xl"
          >
            Just For You
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-3 max-w-xl text-sm leading-6 text-muted"
          >
            Explore products picked from our marketplace
          </motion.p>
        </div>

        <Link
          href="/products"
          className="group inline-flex w-fit items-center gap-3 rounded-full border border-border bg-surface px-5 py-3 text-sm font-bold text-text shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:text-primary hover:shadow-lg"
        >
          <span>See more</span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-white transition-transform duration-300 group-hover:translate-x-1">
            <FaArrowRight size={11} />
          </span>
        </Link>
      </div>

      {loading ? (
        <ProductSkeleton count={8} />
      ) : errorMessage ? (
        <div className="relative z-10 rounded-[2rem] border border-dashed border-border bg-surface p-12 text-center">
          <h3 className="text-lg font-black text-text">Products are unavailable</h3>
          <p className="mt-2 text-sm text-muted">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-hover"
          >
            Try again <FaArrowRight size={10} />
          </button>
        </div>
      ) : products.length > 0 ? (
        <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              isAdded={!!addedMap[product.id]}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 rounded-[2rem] border border-dashed border-border bg-surface p-12 text-center"
        >
          <div className="text-5xl">🛍️</div>
          <h3 className="mt-5 text-lg font-black text-text">No products available right now</h3>
          <p className="mt-2 text-sm text-muted">Check back soon for new arrivals.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-hover"
          >
            Browse Products <FaArrowRight size={10} />
          </Link>
        </motion.div>
      )}
    </section>
  );
}
