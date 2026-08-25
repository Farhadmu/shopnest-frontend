"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaSearch, FaShoppingBag, FaHeart, FaStar, FaBolt, FaCheck } from "react-icons/fa";
import { getProducts, Product } from "@/lib/api/products";
import { addToCart } from "@/lib/api/cart";
import { addToWishlist } from "@/lib/api/wishlist";
import { useSession } from "@/lib/auth-client";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";

  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const { data: session } = useSession();

  const categories = [
    "All",
    "Electronics",
    "Fashion",
    "Home & Kitchen",
    "Beauty",
    "Sports",
    "Books",
    "Gadgets",
  ];

  const load = () => {
    setLoading(true);
    getProducts({
      page: 1,
      limit: 36,
      search: search.trim() || undefined,
      category: selectedCategory && selectedCategory !== "All" ? selectedCategory : undefined,
    })
      .then((data) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [selectedCategory, searchParams]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      showToast("Please log in to add items to your cart", "error");
      router.push("/login");
      return;
    }

    try {
      await addToCart(product.id, 1);
      setAddedMap((prev) => ({ ...prev, [product.id]: true }));
      showToast(`Added "${product.title}" to cart! 🛒`);
      setTimeout(() => {
        setAddedMap((prev) => ({ ...prev, [product.id]: false }));
      }, 2000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add to cart", "error");
    }
  };

  const handleAddToWishlist = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      showToast("Please log in to save items to wishlist", "error");
      router.push("/login");
      return;
    }

    try {
      await addToWishlist(product.id);
      showToast(`Saved "${product.title}" to wishlist! ♡`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add to wishlist", "error");
    }
  };

  const handleBuyNow = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      router.push("/login");
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
    <div className="pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "error" ? "bg-error" : "bg-primary"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Hero Search Header */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-primary/5 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Live Catalog</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-text sm:text-4xl">
              Explore Products
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Discover verified products across Bangladesh with AI recommendations, fast shipping
              and buyer protection.
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
            className="flex w-full gap-2 sm:max-w-md"
          >
            <div className="relative flex flex-1 items-center rounded-2xl border border-border bg-background px-4 py-3">
              <FaSearch className="text-muted" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products or brands..."
                className="w-full bg-transparent px-3 text-sm text-text outline-none placeholder:text-muted"
              />
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
            >
              Search
            </button>
          </form>
        </div>

        {/* Category Pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = (cat === "All" && !selectedCategory) || selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat === "All" ? "" : cat)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  isSelected
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "border border-border bg-surface text-muted hover:border-primary/40 hover:text-text"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-80 animate-pulse rounded-3xl border border-border bg-surface"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-3xl">
              🛍️
            </div>
            <h3 className="mt-4 text-lg font-black text-text">No Products Found</h3>
            <p className="mt-1 text-sm text-muted">
              Try adjusting your search keyword or selected category.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
              }}
              className="mt-5 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => {
              const hasDiscount = p.discountPrice && p.discountPrice < p.price;
              const isAdded = !!addedMap[p.id];

              return (
                <article
                  key={p.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                >
                  <Link href={`/products/${p.id}`} className="block">
                    {/* Image Box */}
                    <div className="relative grid h-52 w-full place-items-center overflow-hidden bg-muted-bg">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-6xl select-none">🛍️</span>
                      )}

                      {/* Top Badges */}
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        <span className="rounded-lg bg-surface/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary backdrop-blur-md">
                          {p.category}
                        </span>
                        {hasDiscount && (
                          <span className="rounded-lg bg-error/90 px-2 py-1 text-[10px] font-black uppercase text-white backdrop-blur-md">
                            Save ৳{(p.price - (p.discountPrice || 0)).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Wishlist Icon Button */}
                      <button
                        type="button"
                        onClick={(e) => handleAddToWishlist(p, e)}
                        title="Save to Wishlist"
                        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-surface/90 text-muted backdrop-blur-md transition hover:scale-110 hover:text-error"
                      >
                        <FaHeart size={13} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <FaStar size={11} />
                        <span className="font-bold">{p.ratingAvg || "4.8"}</span>
                        <span className="text-[11px] text-muted">
                          ({p.ratingCount || 12} reviews)
                        </span>
                      </div>

                      <h3 className="mt-2 line-clamp-2 text-sm font-black text-text transition group-hover:text-primary">
                        {p.title}
                      </h3>

                      {/* Price Section */}
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-xl font-black text-text">
                          ৳{(p.discountPrice || p.price).toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-muted line-through">
                            ৳{p.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[11px] font-semibold text-muted">
                        {p.stock > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            ✓ In Stock ({p.stock} units)
                          </span>
                        ) : (
                          <span className="text-error">Out of Stock</span>
                        )}
                      </p>
                    </div>
                  </Link>

                  {/* Action Buttons */}
                  <div className="mt-auto grid grid-cols-2 gap-2 p-4 pt-0">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(p, e)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                        isAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-hover"
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

                    <button
                      type="button"
                      onClick={(e) => handleBuyNow(p, e)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-2.5 text-xs font-bold text-text transition hover:border-primary hover:text-primary"
                    >
                      <FaBolt size={11} className="text-amber-500" /> Buy Now
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading marketplace...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
