"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerDialog,
} from "@heroui/react";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const router = useRouter();
  const {
    isOpen,
    closeCart,
    items,
    itemCount,
    subtotal,
    total,
    isLoading,
    isUpdating,
    updateQuantity,
    removeItem,
    moveToWishlist,
  } = useCartDrawer();

  // Free shipping progress calculation (Free above ৳2000 or $100)
  const freeShippingThreshold = 2000;
  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );
  const amountNeededForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotal
  );

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <Drawer isOpen={isOpen} onOpenChange={(open) => !open && closeCart()}>
      {/* Backdrop with smooth blur */}
      <DrawerBackdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
        {/* Slide-Over Drawer Container on Right Side */}
        <DrawerContent
          placement="right"
          className="fixed inset-0 z-50 flex justify-end pointer-events-none"
        >
          <DrawerDialog className="pointer-events-auto h-full w-full sm:w-[440px] sm:max-w-[440px] bg-white dark:bg-[#0D081D] text-slate-900 dark:text-white border-l border-slate-200 dark:border-purple-900/30 shadow-2xl flex flex-col outline-none overflow-hidden !p-0 !m-0 !rounded-none ml-auto">
            {/* 1. Header (Sticky Top Bar) */}
            <div className="shrink-0 px-5 py-3.5 border-b border-slate-100 dark:border-[#2D2250]/80 bg-white/95 dark:bg-[#0D081D]/95 backdrop-blur-md flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeCart}
                  aria-label="Close cart drawer"
                  className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 dark:bg-[#16102E] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#201740] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Items
                  </h2>
                  <span className="flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-[#7C3AED] px-1.5 text-xs font-black text-white shadow-sm shadow-purple-500/25">
                    {itemCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="text-xs font-semibold text-[#7C3AED] hover:text-[#6D28D9] dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                >
                  Full Page View
                </Link>
              </div>
            </div>

            {/* Free Shipping Progress Indicator */}
            {items.length > 0 && (
              <div className="shrink-0 px-5 py-2.5 bg-slate-50/90 dark:bg-[#140E2C] border-b border-slate-100 dark:border-purple-900/20">
                <div className="flex items-center justify-between text-[11px] font-medium mb-1.5">
                  {amountNeededForFreeShipping > 0 ? (
                    <span className="text-slate-600 dark:text-slate-300">
                      Add{" "}
                      <span className="font-bold text-[#7C3AED] dark:text-purple-400">
                        {formatCurrency(amountNeededForFreeShipping)}
                      </span>{" "}
                      more for <span className="font-bold text-emerald-600 dark:text-emerald-400">Free Shipping</span>
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles size={12} /> You unlocked Free Express Shipping!
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    {progressToFreeShipping}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-purple-950/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] transition-all duration-500"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>
            )}

            {/* 2. Scrollable Body Area */}
            <div className="flex-1 overflow-y-auto px-5 py-1 [scrollbar-width:thin] [scrollbar-color:#7C3AED_transparent]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <div className="h-8 w-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Loading your smart bag...
                  </p>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="relative mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-slate-100 dark:bg-[#16102E] border border-slate-200 dark:border-purple-900/30 shadow-inner">
                    <ShoppingBag className="h-10 w-10 text-[#7C3AED] opacity-80" />
                    <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-purple-500 animate-ping" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                    Explore curated tech, fashion, and lifestyle deals to fill your cart.
                  </p>
                  <Link
                    href="/products"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <span>Start Shopping</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-purple-900/20">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CartItemCard
                        key={item.productId}
                        item={item}
                        layoutMode="drawer"
                        isUpdating={isUpdating}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                        onMoveToWishlist={moveToWishlist}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* 3. Footer (Sticky Bottom Checkout Section - Full Width Vertical Stack) */}
            {items.length > 0 && (
              <div className="shrink-0 p-5 border-t border-slate-200 dark:border-[#2D2250]/80 bg-slate-50/95 dark:bg-[#110C24]/95 backdrop-blur-md flex flex-col gap-3.5 z-10 w-full">
                {/* Price Breakdown */}
                <div className="w-full space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Shipping:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {amountNeededForFreeShipping === 0 ? "FREE" : "Calculated at checkout"}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-200 dark:border-purple-900/30">
                    <div>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        Total:
                      </span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Including VAT and duties
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-purple-200 bg-clip-text text-transparent">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary CTA Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] py-3.5 px-4 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 hover:from-[#4338CA] hover:to-[#6D28D9] hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>Proceed to checkout</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>

                {/* Secure Checkout Note */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                  <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                  <span>256-bit SSL Encrypted & Guaranteed Safe Checkout</span>
                </div>
              </div>
            )}
          </DrawerDialog>
        </DrawerContent>
      </DrawerBackdrop>
    </Drawer>
  );
}
