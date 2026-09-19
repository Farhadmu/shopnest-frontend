"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaCheck, FaStar } from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

// Swiper styles
import "swiper/css";

import { getFeaturedProducts, Product } from "@/lib/api/products";
import { addToCart } from "@/lib/api/cart";
import {
  addGuestCartItem,
  clearGuestCart,
} from "@/lib/guest-store";
import { useSession } from "@/lib/auth-client";
import { toast } from "@/context/ToastContext";

const MAX_FEATURED_PRODUCTS = 12;

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
          setProducts(featuredOnly.length > 0 ? featuredOnly : data.slice(0, MAX_FEATURED_PRODUCTS));
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
  }, [initialProducts, retryKey]);

  const handleAddToCart = async (prod: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const price = prod.discountPrice || prod.price;

    if (!session?.user) {
      addGuestCartItem({
        productId: prod.id,
        price,
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

  const uniqueProducts = useMemo(() => {
    return Array.from(
      new Map(products.map((p) => [p.id, p])).values()
    ).slice(0, MAX_FEATURED_PRODUCTS);
  }, [products]);

  // Ensure enough items for smooth infinite loop in Swiper
  const displayProducts = useMemo(() => {
    if (uniqueProducts.length === 0) return [];
    if (uniqueProducts.length < 6) {
      return [...uniqueProducts, ...uniqueProducts, ...uniqueProducts];
    }
    return uniqueProducts;
  }, [uniqueProducts]);
  if (!loading && !errorMessage && uniqueProducts.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden py-10 sm:py-14">
      {/* Embedded CSS for smooth scale & opacity transition on centered coverflow slider */}
      <style>{`
        .featured-coverflow-slider {
          overflow: visible !important;
          padding: 16px 0 24px 0 !important;
        }
        .featured-coverflow-slider .swiper-slide {
          transform: scale(0.88);
          opacity: 0.6;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease;
          will-change: transform, opacity;
        }
        .featured-coverflow-slider .swiper-slide-active {
          transform: scale(1);
          opacity: 1;
          z-index: 20;
        }
      `}</style>

      {/* Background Ambient Lighting */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-88 w-88 rounded-full bg-accent/10 blur-[110px]" />

      {/* Section Header */}
      <div className="relative z-10 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {/* Spotlight Collection Badge */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 text-amber-500 shrink-0">
              <FaStar className="h-3 w-3 fill-amber-500 text-amber-500" />
            </span>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500">
              SPOTLIGHT COLLECTION
            </span>
            <span className="h-[2px] w-8 sm:w-12 rounded-full bg-gradient-to-r from-amber-500 via-rose-400/80 to-indigo-500/60 inline-block" />
          </div>

          {/* Heading */}
          <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="text-text">Featured </span>
            <span className="bg-gradient-to-r from-[#FF8A00] via-[#FF5470] to-[#8B5CF6] bg-clip-text text-transparent">
              Products
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-2 text-xs sm:text-sm text-muted">
            Handpicked best-sellers and editor-chosen essentials curated for peak quality.
          </p>
        </div>

        {/* Explore Link */}
        <div className="flex items-center self-start md:self-end shrink-0">
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary-hover transition-colors"
          >
            <span>Explore all products</span>
            <FaArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Product Content / Loading / Error / Swiper Centered Animated Carousel */}
      {loading ? (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl overflow-hidden shadow-md border border-border flex flex-row animate-pulse min-h-[190px]"
            >
              <div className="w-[40%] bg-muted-bg" />
              <div className="p-5 flex flex-col justify-between w-[60%] space-y-3">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-muted-bg rounded-full" />
                  <div className="h-5 w-3/4 bg-muted-bg rounded-md" />
                  <div className="h-3 w-full bg-muted-bg rounded-md" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  <div className="h-6 w-16 bg-muted-bg rounded-md" />
                  <div className="h-8 w-24 bg-muted-bg rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        <div className="relative z-10 rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
          <h3 className="text-base font-bold text-text">Featured products are temporarily unavailable</h3>
          <p className="mt-1.5 text-xs sm:text-sm text-muted">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover shadow-sm active:scale-95"
          >
            <span>Try again</span>
            <FaArrowRight size={10} />
          </button>
        </div>
      ) : (
        <div className="relative z-10 w-full overflow-hidden">
          <Swiper
            modules={[Autoplay]}
            centeredSlides={true}
            grabCursor={true}
            loop={displayProducts.length >= 4}
            slidesPerView={1.15}
            spaceBetween={16}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 1.6,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 2.2,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 2.5,
                spaceBetween: 28,
              },
            }}
            className="featured-coverflow-slider w-full select-none"
          >
            {displayProducts.map((product, idx) => {
              const discountPercent =
                product.discountPrice && product.discountPrice < product.price
                  ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                  : null;

              const rawImg = product.images?.[0];
              const imageSrc =
                rawImg && (rawImg.startsWith("http") || rawImg.startsWith("/"))
                  ? rawImg
                  : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";

              const displayPrice = product.discountPrice || product.price;
              const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

              return (
                <SwiperSlide
                  key={`${product.id}-${idx}`}
                  className="h-auto select-none"
                >
                  {/* Card strictly matching the reference image, adaptive to light and dark theme */}
                  <div className="group relative flex h-full min-h-[195px] sm:min-h-[210px] w-full flex-row overflow-hidden rounded-2xl border border-border/80 dark:border-[#23263B] bg-surface dark:bg-[#0E1020]/95 backdrop-blur-md shadow-sm hover:shadow-md dark:shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10">
                    {/* Left Side: Full-bleed Image with Discount Badge */}
                    <div className="relative w-[40%] sm:w-[42%] shrink-0 overflow-hidden bg-muted-bg dark:bg-[#080911]">
                      {discountPercent && (
                        <span className="absolute top-2.5 left-2.5 z-20 rounded-full bg-[#FF3B5C] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide text-white shadow-md">
                          {discountPercent}% OFF
                        </span>
                      )}
                      <Link
                        href={`/products/${product.id}`}
                        className="relative block h-full w-full min-h-[195px] sm:min-h-[210px]"
                      >
                        <Image
                          src={imageSrc}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 25vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-106"
                          priority={idx < 3}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                      </Link>
                    </div>

                    {/* Right Side: Product Details & Action */}
                    <div className="flex w-[62%] sm:w-[60%] flex-col justify-between p-4 sm:p-5">
                      <div>
                        {/* Category */}
                        <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-primary">
                          {product.category || "General"}
                        </span>

                        {/* Title */}
                        <Link href={`/products/${product.id}`} className="block mt-1">
                          <h3 className="text-sm sm:text-base font-bold text-text line-clamp-1 hover:text-primary transition-colors">
                            {product.title}
                          </h3>
                        </Link>

                        {/* Description */}
                        <p className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">
                          {product.description ||
                            `${product.title} is a ${product.category || "quality"} product. Key features include high quality and durable design.`}
                        </p>
                      </div>

                      {/* Price & Add to Cart Button */}
                      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-border/60 dark:border-white/5">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-base sm:text-lg font-black text-text">
                            ৳{displayPrice}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-muted line-through">
                              ৳{product.price}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(product, e)}
                          className="flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary-hover px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white transition-all duration-200 shadow-sm active:scale-95 cursor-pointer shrink-0"
                        >
                          {addedMap[product.id] ? (
                            <>
                              <FaCheck size={11} />
                              <span>Added</span>
                            </>
                          ) : (
                            <span>Add to Cart</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}
    </section>
  );
}
