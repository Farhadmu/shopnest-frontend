"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  FaSearch,
  FaShoppingBag,
  FaHeart,
  FaStar,
  FaBolt,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaFire,
} from "react-icons/fa";

import { getProducts, Product } from "@/lib/api/products";
import { addToCart } from "@/lib/api/cart";
import { addToWishlist } from "@/lib/api/wishlist";
import { addGuestCartItem, addGuestWishlistItem } from "@/lib/guest-store";
import { useSession } from "@/lib/auth-client";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";

  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] =
    useState(initialCategory);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const [addedMap, setAddedMap] = useState<
    Record<string, boolean>
  >({});

  const [wishlistMap, setWishlistMap] = useState<
    Record<string, boolean>
  >({});

  const { data: session } = useSession();

  const categories = [
    "All Categories",
    "Electronics",
    "Fashion",
    "Home & Kitchen",
    "Beauty",
    "Sports",
    "Books",
    "Gadgets",
    "Gifts & Lifestyle",
    "Furniture & Decor",
    "pet Supplies",
    "Computers & Accessories",
    "Grocery",
    "Toys & kids",
  ];

  const sortOptions = [
    "Newest",
    "Price: Low to High",
    "Price: High to Low",
    "Top Rated",
    "Best Selling",
  ];

  /* LOAD PRODUCTS */

  const load = () => {
    setLoading(true);

    getProducts({
      page: 1,
      limit: 36,
      search: search.trim() || undefined,
      category:
        selectedCategory &&
        selectedCategory !== "All Categories"
          ? selectedCategory
          : undefined,
    })
      .then((data) => {
        let sorted = [...data];

        if (sortBy === "Price: Low to High") {
          sorted.sort(
            (a, b) =>
              (a.discountPrice || a.price) -
              (b.discountPrice || b.price)
          );
        } else if (sortBy === "Price: High to Low") {
          sorted.sort(
            (a, b) =>
              (b.discountPrice || b.price) -
              (a.discountPrice || a.price)
          );
        } else if (sortBy === "Top Rated") {
          sorted.sort(
            (a, b) =>
              (b.ratingAvg || 0) -
              (a.ratingAvg || 0)
          );
        }

        setItems(sorted);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [selectedCategory, sortBy, searchParams]);

  /*  TOAST */

  const showToast = (
    msg: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({
      msg,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  /*  ADD TO CART */

  const handleAddToCart = async (
    product: Product,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

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

      showToast(`Added "${product.title}" to cart! 🛒`);

      setTimeout(() => {
        setAddedMap((prev) => ({
          ...prev,
          [product.id]: false,
        }));
      }, 2000);
      return;
    }

    try {
      await addToCart(product.id, 1);

      setAddedMap((prev) => ({
        ...prev,
        [product.id]: true,
      }));

      showToast(
        `Added "${product.title}" to cart! 🛒`
      );

      setTimeout(() => {
        setAddedMap((prev) => ({
          ...prev,
          [product.id]: false,
        }));
      }, 2000);
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to add to cart",
        "error"
      );
    }
  };

  /* ADD TO WISHLIST */

  const handleAddToWishlist = async (
    product: Product,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      addGuestWishlistItem({
        productId: product.id,
        title: product.title,
        price: product.price,
        images: product.images,
        category: product.category,
      });

      setWishlistMap((prev) => ({
        ...prev,
        [product.id]: true,
      }));

      showToast(`Saved "${product.title}" to wishlist! ❤️`);
      return;
    }

    try {
      await addToWishlist(product.id);

      setWishlistMap((prev) => ({
        ...prev,
        [product.id]: true,
      }));

      showToast(
        `Saved "${product.title}" to wishlist! ❤️`
      );
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to add to wishlist",
        "error"
      );
    }
  };

  /*  BUY NOW */

  const handleBuyNow = async (
    product: Product,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      addGuestCartItem({
        productId: product.id,
        price: product.price,
        title: product.title,
        images: product.images,
        category: product.category,
      });
      router.push(`/login?next=${encodeURIComponent("/dashboard/user/checkout")}`);
      return;
    }

    try {
      await addToCart(product.id, 1);
      router.push("/dashboard/user/checkout");
    } catch {
      router.push("/cart");
    }
  };

  /*  RESET FILTERS */

  const resetFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("Newest");
    setSearch("");
  };

  return (
    <div className="relative mx-auto max-w-7xl px-4 pt-4 pb-20 sm:px-6 lg:px-8">

      {/* BACKGROUND GLOWS */}

      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

      {/* TOAST */}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.9,
            }}
            className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold text-white shadow-2xl backdrop-blur-xl ${
              toast.type === "error"
                ? "bg-red-500/95"
                : "bg-primary/95"
            }`}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20">
              {toast.type === "success" ? (
                <FaCheck size={11} />
              ) : (
                "!"
              )}
            </span>

            <span>{toast.msg}</span>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-1 opacity-70 transition hover:opacity-100"
            >
              <FaTimes size={10} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREMIUM HEADER CARD */}

      <motion.div
        initial={{
          opacity: 0,
          y: -15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="relative z-10 mb-7 overflow-hidden rounded-[2rem] border border-border/70 bg-surface shadow-lg shadow-primary/[0.04]"
      >
        {/* Decorative Background */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

        {/* Gradient Top Line */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500" />

        <div className="relative flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">

          {/* HEADER LEFT */}

          <div className="min-w-0">

            {/* Label */}
            <motion.div
              initial={{
                opacity: 0,
                x: -15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.15,
              }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>

              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                All Products
              </span>

              <FaFire
                size={9}
                className="text-orange-500"
              />
            </motion.div>

            {/* Main Title */}
            <motion.h2
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
                duration: 0.5,
              }}
              className="text-2xl font-black tracking-tight text-text sm:text-3xl lg:text-[2.1rem]"
            >
              Explore{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Products
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
                duration: 0.5,
              }}
              className="mt-2 max-w-xl text-xs leading-5 text-muted sm:text-sm"
            >
              Discover verified products across Bangladesh
              with AI recommendations, fast shipping, and
              complete buyer protection.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.4,
              }}
              className="mt-4 flex flex-wrap items-center gap-2.5"
            >
              {/* Verified */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                <FaCheck size={8} />
                Verified Products
              </span>

              {/* Delivery */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                <FaBolt size={8} />
                Fast Delivery
              </span>

              {/* Sellers */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                <FaStar size={8} />
                Trusted Sellers
              </span>
            </motion.div>
          </div>

          {/* SEARCH AREA */}

          <motion.form
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.25,
            }}
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
            className="flex w-full shrink-0 gap-2 sm:max-w-md lg:w-[390px]"
          >
            <div className="relative flex flex-1 items-center rounded-2xl border border-border/80 bg-background/80 px-4 py-3 shadow-inner backdrop-blur-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">

              <FaSearch
                className="shrink-0 text-primary"
                size={13}
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search products or brands..."
                className="w-full bg-transparent px-3 text-xs text-text outline-none placeholder:text-muted/70 sm:text-sm"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    load();
                  }}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted transition hover:bg-primary/10 hover:text-primary"
                >
                  <FaTimes size={10} />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-primary px-5 py-3 text-xs font-black text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.03] hover:bg-primary-hover active:scale-95 sm:px-6 sm:text-sm"
            >
              Search
            </button>
          </motion.form>
        </div>
      </motion.div>

      {/* MAIN LAYOUT */}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-4">

        {/* LEFT SIDEBAR */}

        <div className="space-y-6 lg:col-span-1">

          {/* Category Filter */}
          <div className="rounded-[1.5rem] border border-border/80 bg-surface p-5 shadow-sm">

            <h3 className="mb-3 text-sm font-black text-text">
              Category
            </h3>

            <div className="relative">
              <select
                value={
                  selectedCategory ||
                  "All Categories"
                }
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value ===
                      "All Categories"
                      ? ""
                      : e.target.value
                  )
                }
                className="w-full cursor-pointer appearance-none rounded-xl border border-border/80 bg-background px-4 py-3 text-xs font-bold text-text outline-none transition-all focus:border-primary"
              >
                {categories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">
                <FaChevronDown size={11} />
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="rounded-[1.5rem] border border-border/80 bg-surface p-5 shadow-sm">

            <h3 className="mb-3 text-sm font-black text-text">
              Price Range (৳)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(e.target.value)
                }
                className="w-full rounded-xl border border-border/80 bg-background px-3 py-2.5 text-xs font-medium text-text outline-none focus:border-primary"
              />

              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(e.target.value)
                }
                className="w-full rounded-xl border border-border/80 bg-background px-3 py-2.5 text-xs font-medium text-text outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="relative rounded-[1.5rem] border border-border/80 bg-surface p-5 shadow-sm">

            <h3 className="mb-3 text-sm font-black text-text">
              Sort By
            </h3>

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setIsSortOpen(!isSortOpen)
                }
                className="flex w-full items-center justify-between rounded-xl border border-border/80 bg-background px-4 py-3 text-xs font-bold text-text outline-none transition-all focus:border-primary"
              >
                <span>{sortBy}</span>

                <FaChevronDown
                  size={11}
                  className={`text-muted transition-transform ${
                    isSortOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    className="absolute left-0 top-full z-30 mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
                  >
                    {sortOptions.map(
                      (opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSortBy(opt);
                            setIsSortOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-colors ${
                            sortBy === opt
                              ? "bg-primary text-white"
                              : "text-text hover:bg-primary/10"
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={resetFilters}
            className="w-full rounded-2xl border border-border/80 bg-surface px-4 py-3 text-xs font-bold text-muted transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            Reset All Filters
          </button>
        </div>

        {/* PRODUCTS AREA */}

        <div className="lg:col-span-3">

          {/* Products Header */}
          <div className="mb-4 flex items-center justify-between">

            <h3 className="flex items-center gap-2 text-lg font-black text-text">
              All Products

              <span className="text-xs font-bold text-muted">
                ({items.length})
              </span>
            </h3>

            <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-[9px] font-bold text-primary sm:inline-block">
              {selectedCategory ||
                "All Categories"}
            </span>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(
                (n) => (
                  <div
                    key={n}
                    className="h-80 animate-pulse rounded-[1.5rem] border border-border/60 bg-surface/60"
                  />
                )
              )}
            </div>
          ) : items.length === 0 ? (

           
            /* EMPTY STATE */

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="rounded-[2rem] border border-dashed border-border bg-surface/50 p-16 text-center"
            >
              <div className="mx-auto grid h-20 w-20 animate-bounce place-items-center rounded-3xl bg-primary/10 text-4xl shadow-inner">
                🛍️
              </div>

              <h3 className="mt-5 text-xl font-black text-text">
                No Products Found
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                We couldn't find anything
                matching your criteria. Try
                adjusting your filter settings.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-2xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                Reset Filters
              </button>
            </motion.div>

          ) : (

            /*  PRODUCTS GRID */

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {items.map(
                (product, index) => {

                  const hasDiscount =
                    !!product.discountPrice &&
                    product.discountPrice <
                      product.price;

                  const isAdded =
                    !!addedMap[product.id];

                  const isWishlisted =
                    !!wishlistMap[
                      product.id
                    ];

                  return (
                    <motion.article
                      key={product.id}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 0.4,
                        delay:
                          index * 0.05,
                      }}
                      whileHover={{
                        y: -6,
                      }}
                      className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border/70 bg-surface shadow-sm transition-shadow duration-500 hover:shadow-xl hover:shadow-primary/10"
                    >

                      {/* Product Image */}
                      <Link
                        href={`/products/${product.id}`}
                        className="relative block"
                      >
                        <div className="relative h-48 overflow-hidden bg-muted-bg">

                          {product.images?.[0] ? (
                            <motion.img
                              src={
                                product.images[0]
                              }
                              alt={
                                product.title
                              }
                              className="h-full w-full object-cover"
                              transition={{
                                duration: 0.6,
                                ease: "easeOut",
                              }}
                              whileHover={{
                                scale: 1.06,
                              }}
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-5xl">
                              🛍️
                            </div>
                          )}

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/5 opacity-70" />

                          {/* Category */}
                          <div className="absolute left-3 top-3">
                            <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                              {product.category}
                            </span>
                          </div>

                          {/* Discount */}
                          {hasDiscount && (
                            <div className="absolute bottom-3 left-3">

                              <motion.span
                                animate={{
                                  scale: [
                                    1,
                                    1.04,
                                    1,
                                  ],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat:
                                    Infinity,
                                  ease: "easeInOut",
                                }}
                                className="inline-flex rounded-full bg-red-500 px-2.5 py-1 text-[9px] font-black text-white shadow-md"
                              >
                                Save ৳
                                {(
                                  product.price -
                                  (product.discountPrice ||
                                    0)
                                ).toLocaleString()}
                              </motion.span>

                            </div>
                          )}

                          {/* Wishlist */}
                          <motion.button
                            type="button"
                            onClick={(e) =>
                              handleAddToWishlist(
                                product,
                                e
                              )
                            }
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
                              y: [
                                0,
                                -2,
                                0,
                              ],
                            }}
                            whileHover={{
                              scale: 1.1,
                              rotate: [
                                -5,
                                5,
                                -3,
                                0,
                              ],
                            }}
                            whileTap={{
                              scale: 0.85,
                            }}
                            transition={{
                              y: {
                                duration: 2.2,
                                repeat:
                                  Infinity,
                                ease: "easeInOut",
                                delay:
                                  index *
                                  0.15,
                              },
                              default: {
                                duration: 0.3,
                              },
                            }}
                            className={`absolute right-3 top-3 z-30 grid h-9 w-9 place-items-center rounded-full border border-white/50 bg-white/95 shadow-lg backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/90 ${
                              isWishlisted
                                ? "border-red-500 bg-red-500 text-white"
                                : "text-gray-400 hover:border-red-200 hover:text-red-500 dark:hover:border-red-500/30 dark:hover:text-red-500"
                            }`}
                          >
                            <motion.span
                              animate={{
                                scale: [
                                  1,
                                  1.1,
                                  1,
                                ],
                              }}
                              transition={{
                                duration: 1.2,
                                repeat:
                                  Infinity,
                                ease: "easeInOut",
                              }}
                              className="relative z-10"
                            >
                              <FaHeart
                                size={14}
                                className={
                                  isWishlisted
                                    ? "text-white"
                                    : ""
                                }
                              />
                            </motion.span>
                          </motion.button>
                        </div>
                      </Link>

                      {/* Product Content */}
                      <div className="flex flex-1 flex-col p-4">

                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <FaStar
                            size={10}
                            className="fill-amber-400 text-amber-400"
                          />

                          <span className="text-[11px] font-black text-text">
                            {product.ratingAvg ||
                              "4.8"}
                          </span>

                          <span className="text-[9px] text-muted">
                            (
                            {product.ratingCount ||
                              12}
                            )
                          </span>
                        </div>

                        {/* Title */}
                        <Link
                          href={`/products/${product.id}`}
                        >
                          <h3 className="mt-2 line-clamp-2 min-h-[36px] text-[13px] font-extrabold leading-4 text-text transition-colors duration-300 group-hover:text-primary">
                            {
                              product.title
                            }
                          </h3>
                        </Link>

                        {/* Price */}
                        <div className="mt-3 flex items-center gap-2">

                          <span className="text-base font-black text-text">
                            ৳
                            {(
                              product.discountPrice ||
                              product.price
                            ).toLocaleString()}
                          </span>

                          {hasDiscount && (
                            <span className="text-[11px] font-semibold text-muted line-through">
                              ৳
                              {product.price.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Stock */}
                        <div className="mt-1.5">

                          {product.stock > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">

                              <motion.span
                                animate={{
                                  scale: [
                                    1,
                                    1.3,
                                    1,
                                  ],
                                  opacity: [
                                    0.7,
                                    1,
                                    0.7,
                                  ],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat:
                                    Infinity,
                                }}
                                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                              />

                              In Stock ·{" "}
                              {
                                product.stock
                              }{" "}
                              available
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-error">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Buttons */}
                        <div className="mt-4 grid grid-cols-2 gap-2">

                          {/* Add Cart */}
                          <motion.button
                            type="button"
                            onClick={(e) =>
                              handleAddToCart(
                                product,
                                e
                              )
                            }
                            disabled={
                              product.stock <=
                              0
                            }
                            animate={{
                              scale: [
                                1,
                                1.02,
                                1,
                              ],
                            }}
                            transition={{
                              repeat:
                                Infinity,
                              duration: 2,
                              ease: "easeInOut",
                            }}
                            className={`inline-flex items-center justify-center gap-1 rounded-xl py-2.5 text-[11px] font-bold transition-all duration-300 ${
                              product.stock <= 0
                                ? "cursor-not-allowed bg-muted-bg text-muted"
                                : isAdded
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                : "bg-primary text-white shadow-sm shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <FaCheck
                                  size={10}
                                />
                                Added
                              </>
                            ) : (
                              <>
                                <FaShoppingBag
                                  size={10}
                                />
                                Add to Cart
                              </>
                            )}
                          </motion.button>

                          {/* Buy Now */}
                          <motion.button
                            type="button"
                            onClick={(e) =>
                              handleBuyNow(
                                product,
                                e
                              )
                            }
                            disabled={
                              product.stock <=
                              0
                            }
                            animate={{
                              scale: [
                                1,
                                1.02,
                                1,
                              ],
                            }}
                            transition={{
                              repeat:
                                Infinity,
                              duration: 2,
                              ease: "easeInOut",
                              delay: 0.3,
                            }}
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-border/80 bg-surface/80 py-2.5 text-[11px] font-bold text-text transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FaBolt
                              size={10}
                              className="animate-pulse text-amber-500"
                            />

                            Buy Now
                          </motion.button>

                        </div>
                      </div>

                      {/* Bottom Accent */}
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
                    </motion.article>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* PAGE */

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">

            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

            <p className="text-sm font-bold text-muted">
              Loading marketplace...
            </p>

          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}