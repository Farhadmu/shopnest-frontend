"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiTrash2,
  FiArrowLeft,
  FiArrowRight,
  FiStar,
  FiShoppingBag,
  FiShoppingCart,
  FiHeart,
  FiExternalLink,
  FiCheck,
  FiAlertCircle,
  FiPlus,
  FiZap,
} from "react-icons/fi";
import { CompareProductData } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "@/context/ToastContext";

interface CompareProductSlotsProps {
  products: CompareProductData[];
  onRemoveProduct: (id: string) => void;
  onMoveProduct: (index: number, direction: "left" | "right") => void;
  onOpenAddModal: () => void;
  maxLimit: number;
}

export function CompareProductSlots({
  products,
  onRemoveProduct,
  onMoveProduct,
  onOpenAddModal,
  maxLimit,
}: CompareProductSlotsProps) {
  const router = useRouter();
  const { addItem } = useCartDrawer();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});

  const handleThumbnailClick = (productId: string, imageIndex: number) => {
    setActiveImageIndices((prev) => ({ ...prev, [productId]: imageIndex }));
  };

  const handleVariantChange = (productId: string, variantIndex: number) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantIndex }));
  };

  const handleAddToCart = async (product: CompareProductData) => {
    setAddingToCartId(product.id);
    try {
      const variantIdx = selectedVariants[product.id] ?? 0;
      const variant = Array.isArray(product.variants) && product.variants[variantIdx]
        ? typeof product.variants[variantIdx] === "string"
          ? { name: product.variants[variantIdx] as string }
          : (product.variants[variantIdx] as { name: string; price?: number })
        : null;

      const effectivePrice = variant?.price || product.discountPrice || product.price;

      await addItem({
        productId: product.id,
        title: product.title,
        price: effectivePrice,
        originalPrice: product.price,
        image: product.images?.[0],
        images: product.images,
        category: product.category,
        variant: variant?.name,
        variantName: variant?.name,
      });

      toast.success(`${product.title} added to cart!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to add to cart.");
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleBuyNow = async (product: CompareProductData) => {
    await handleAddToCart(product);
    router.push("/cart");
  };

  const handleToggleWishlist = async (product: CompareProductData) => {
    try {
      const res = await toggleWishlist({
        id: product.id,
        title: product.title,
        price: product.discountPrice || product.price,
        image: product.images?.[0],
        images: product.images,
        category: product.category,
      });
      if (res?.added) {
        toast.success(`Saved ${product.title} to wishlist!`);
      } else {
        toast.info(`Removed ${product.title} from wishlist.`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update wishlist.");
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`grid gap-4 sm:gap-6 ${
          products.length === 2
            ? "grid-cols-1 md:grid-cols-2"
            : products.length === 3
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {products.map((product, index) => {
          const images = product.images && product.images.length > 0 ? product.images : [];
          const activeImgIdx = activeImageIndices[product.id] || 0;
          const currentImage = images[activeImgIdx] || images[0];

          const variantIdx = selectedVariants[product.id] ?? 0;
          const variantsList = Array.isArray(product.variants) ? product.variants : [];
          const activeVariant = variantsList[variantIdx];
          const variantPrice =
            typeof activeVariant === "object" && activeVariant?.price
              ? activeVariant.price
              : product.discountPrice || product.price;

          const hasDiscount = product.discountPrice && product.discountPrice < product.price;
          const discountPercent = hasDiscount
            ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
            : 0;

          const isSavedInWishlist = isInWishlist(product.id);
          const isAdding = addingToCartId === product.id;

          return (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              {/* Top Controls: Reorder & Remove */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {index > 0 && (
                    <button
                      onClick={() => onMoveProduct(index, "left")}
                      className="p-1 rounded-lg hover:bg-muted-bg text-muted hover:text-foreground transition-colors text-xs"
                      title="Move Left"
                    >
                      <FiArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {index < products.length - 1 && (
                    <button
                      onClick={() => onMoveProduct(index, "right")}
                      className="p-1 rounded-lg hover:bg-muted-bg text-muted hover:text-foreground transition-colors text-xs"
                      title="Move Right"
                    >
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted px-2 py-0.5 rounded-full bg-muted-bg">
                    Slot {index + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleWishlist(product)}
                    className={`p-1.5 rounded-lg transition-colors text-xs ${
                      isSavedInWishlist
                        ? "text-red-500 bg-red-500/10"
                        : "text-muted hover:text-red-500 hover:bg-muted-bg"
                    }`}
                    title={isSavedInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <FiHeart className={`w-4 h-4 ${isSavedInWishlist ? "fill-red-500" : ""}`} />
                  </button>

                  <button
                    onClick={() => onRemoveProduct(product.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors text-xs"
                    title="Remove from comparison"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Product Image */}
              <div className="relative w-full aspect-square rounded-xl bg-muted-bg/50 border border-border/60 overflow-hidden flex items-center justify-center p-3 mb-3 group/img">
                {currentImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentImage}
                    alt={product.title}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover/img:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted text-xs">
                    <FiShoppingBag className="w-10 h-10 mb-1 opacity-40" />
                    <span>No image available</span>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {hasDiscount && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white font-black text-[10px] shadow-sm">
                      {discountPercent}% OFF
                    </span>
                  )}
                  {product.freeDelivery && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold text-[10px] shadow-sm">
                      Free Delivery
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-thin">
                  {images.slice(0, 5).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => handleThumbnailClick(product.id, i)}
                      className={`relative w-9 h-9 rounded-lg border flex-shrink-0 overflow-hidden transition-all ${
                        activeImgIdx === i
                          ? "border-primary ring-2 ring-primary/20 scale-105"
                          : "border-border hover:border-border/80 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="font-semibold text-primary truncate max-w-[140px]">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <FiStar className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{product.ratingAvg || "4.5"}</span>
                    <span className="text-muted text-[10px]">({product.ratingCount || 0})</span>
                  </div>
                </div>

                <Link
                  href={`/products/${product.id}`}
                  className="font-extrabold text-sm text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug group/title flex items-start gap-1"
                >
                  <span>{product.title}</span>
                  <FiExternalLink className="w-3 h-3 opacity-0 group-hover/title:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </Link>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-xl font-black text-foreground">
                    {formatCurrency(variantPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-muted line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div>
                  {product.stock > 5 ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <FiCheck className="w-3.5 h-3.5" /> In Stock ({product.stock} units)
                    </span>
                  ) : product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-xs">
                      <FiAlertCircle className="w-3.5 h-3.5" /> Only {product.stock} left in stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-500 font-bold text-xs">
                      <FiAlertCircle className="w-3.5 h-3.5" /> Currently Out of Stock
                    </span>
                  )}
                </div>

                {/* Variant Switcher (if available) */}
                {variantsList.length > 0 && (
                  <div className="pt-2 border-t border-border/60">
                    <label className="block text-[11px] font-bold text-muted mb-1">
                      Configuration / Variant:
                    </label>
                    <select
                      value={variantIdx}
                      onChange={(e) => handleVariantChange(product.id, Number(e.target.value))}
                      className="w-full text-xs font-semibold bg-muted-bg/70 border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {variantsList.map((v, vIndex) => {
                        const name = typeof v === "string" ? v : v.name;
                        const vP = typeof v === "object" && v.price ? ` — ৳${v.price}` : "";
                        return (
                          <option key={vIndex} value={vIndex}>
                            {name} {vP}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isAdding || product.stock <= 0}
                  className="px-3 py-2 rounded-xl bg-muted-bg hover:bg-muted-bg/80 text-foreground font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <FiShoppingCart className="w-3.5 h-3.5" />
                  {isAdding ? "Adding..." : "Add to Cart"}
                </button>

                <button
                  onClick={() => handleBuyNow(product)}
                  disabled={product.stock <= 0}
                  className="px-3 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <FiZap className="w-3.5 h-3.5" />
                  Buy Now
                </button>
              </div>
            </div>
          );
        })}

        {/* Placeholder slot if less than maxLimit */}
        {products.length < maxLimit && (
          <div
            onClick={onOpenAddModal}
            className="flex flex-col items-center justify-center min-h-[360px] border-2 border-dashed border-border hover:border-primary/60 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-primary/5 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted-bg group-hover:bg-primary/10 flex items-center justify-center text-muted group-hover:text-primary transition-all mb-3">
              <FiPlus className="w-7 h-7" />
            </div>
            <h3 className="font-black text-sm text-foreground group-hover:text-primary transition-colors">
              Add Product to Compare
            </h3>
            <p className="text-xs text-muted mt-1 max-w-[180px]">
              Select another product to compare specifications, prices, and AI trade-offs.
            </p>
            <span className="mt-4 px-3.5 py-1.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground group-hover:border-primary group-hover:text-primary transition-all shadow-sm">
              Browse Marketplace
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
