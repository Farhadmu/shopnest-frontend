"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  FaArrowRight,
  FaShieldAlt,
  FaShoppingBag,
} from "react-icons/fa";

import { AnimatePresence } from "framer-motion";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { formatCurrency } from "@/lib/utils";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";

export default function CartPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Shared Cart State from Context
  const {
    items: cartItems,
    subtotal,
    total,
    isLoading,
    isUpdating,
    error,
    updateQuantity,
    removeItem,
    moveToWishlist,
  } = useCartDrawer();

  // Product Update State
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);

  // Quantity Change
  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (quantity < 1 || isUpdating) return;
    setUpdatingProductId(productId);
    try {
      await updateQuantity(productId, quantity);
    } finally {
      setUpdatingProductId(null);
    }
  };

  // Remove Product
  const handleRemove = async (productId: string) => {
    if (isUpdating) return;
    setUpdatingProductId(productId);
    try {
      await removeItem(productId);
    } finally {
      setUpdatingProductId(null);
    }
  };

  // Proceed to Checkout Handler
  const handleProceedToCheckout = () => {
    if (!session?.user) {
      router.push(`/login?next=${encodeURIComponent("checkout")}`);
      return;
    }

    router.push("/checkout");
  };

  // Loading
  if (isPending || isLoading) {
    return (
      <LoadingState message="Loading your shopping cart..." />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background/60 pb-20 pt-6 text-text">

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =========================
            Header
        ========================= */}

        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <div className="inline-flex items-center gap-2 rounded-sm bg-primary/15 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-primary shadow-sm backdrop-blur-md">
              <FaShoppingBag className="text-xs" />
              Secure Bag {!session?.user && "(Guest Mode)"}
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-text sm:text-4xl">
              Shopping Cart
            </h1>

            <p className="mt-1 text-sm text-muted">
              {!session?.user
                ? "Your items are saved locally on this browser. Log in when checking out to keep them permanently!"
                : "Review your items and proceed to a secure checkout."}
            </p>
          </div>

          {cartItems.length > 0 && (
            <div className="rounded-sm border border-border/60 bg-surface/80 px-4 py-2 text-xs font-bold text-muted shadow-sm backdrop-blur-md">
              Total Items:{" "}
              <span className="font-black text-primary">
                {cartItems.length}
              </span>
            </div>
          )}
        </div>

        {/* =========================
            Error
        ========================= */}

        {error && (
          <div className="mb-6 rounded-sm border border-error/30 bg-error/10 p-4 text-sm font-semibold text-error backdrop-blur-md">
            {error}
          </div>
        )}

        {/* =========================
            Empty Cart
        ========================= */}

        {cartItems.length === 0 ? (
          <EmptyState
            title="Your Cart is Empty"
            description="Explore our marketplace and add authentic products from verified sellers to your cart."
            actionLabel="Explore Marketplace"
            onAction={() => router.push("/products")}
          />
        ) : (

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">

            {/* =========================
                Cart Items
            ========================= */}

            <div className="flex flex-col gap-4 lg:col-span-2">
              <AnimatePresence initial={false}>
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.productId}
                    item={item}
                    layoutMode="page"
                    isUpdating={updatingProductId === item.productId || isUpdating}
                    onUpdateQuantity={handleQuantityChange}
                    onRemove={handleRemove}
                    onMoveToWishlist={moveToWishlist}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* =========================
                Sidebar
            ========================= */}

            <div className="flex flex-col gap-6 lg:sticky lg:top-6">

              {/* =========================
                  Order Summary
              ========================= */}

              <div className="rounded-sm border border-border/80 bg-surface/80 p-5 shadow-2xl shadow-black/5 backdrop-blur-xl transition-all hover:border-primary/30 sm:p-6">

                <h3 className="text-sm font-black uppercase tracking-wider text-text">
                  Order Summary
                </h3>

                <div className="mt-5 space-y-3.5 text-sm">

                  {/* Subtotal */}

                  <div className="flex justify-between text-muted">
                    <span>Subtotal</span>

                    <span className="font-bold text-text">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Delivery */}

                  <div className="flex justify-between text-muted">
                    <span>Estimated Delivery</span>

                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Free
                    </span>
                  </div>

                  {/* Total */}

                  <div className="border-t border-border/80 pt-4">

                    <div className="flex justify-between text-lg font-black text-text">

                      <span>Total Amount</span>

                      <span className="font-black text-primary">
                        {formatCurrency(total)}
                      </span>

                    </div>

                  </div>

                </div>

                {/* Checkout */}

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-4 text-center text-sm font-black text-white shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:bg-primary-hover hover:shadow-primary/50 cursor-pointer"
                >
                  Proceed to Checkout

                  <FaArrowRight
                    size={12}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

                {/* Security */}

                <div className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-muted">

                  <FaShieldAlt className="text-sm text-emerald-500" />

                  <span>
                    SSL Encrypted &amp; Verified Buyer Protection
                  </span>

                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
