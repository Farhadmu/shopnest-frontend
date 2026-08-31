"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  FaTrash,
  FaArrowRight,
  FaShieldAlt,
  FaTicketAlt,
  FaShoppingBag,
} from "react-icons/fa";

import {
  getCart,
  removeCartItem,
  updateCartItem,
  Cart,
  CartItem,
} from "@/lib/api/cart";

import {
  getGuestCart,
  updateGuestCartItemQuantity,
  removeGuestCartItem,
  clearGuestCart,
  syncGuestDataToServer,
} from "@/lib/guest-store";

import { validateCoupon } from "@/lib/api/coupons";
import { getErrorMessage } from "@/lib/core/errors";
import { formatCurrency } from "@/lib/utils";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";

interface AppliedCoupon {
  code: string;
  discount: number;
}

export default function CartPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Cart State
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] =
    useState<AppliedCoupon | null>(null);

  // Product Update State
  const [updatingProductId, setUpdatingProductId] =
    useState<string | null>(null);

  // =========================
  // Load Cart (Guest or DB)
  // =========================

  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!session?.user) {
      // Guest mode from localStorage
      const localCart = getGuestCart();
      setCart(localCart);
      setIsLoading(false);
      return;
    }

    try {
      // If user is authenticated, sync any pending guest items & clear localStorage
      const localCart = getGuestCart();
      if (localCart?.items?.length > 0) {
        await syncGuestDataToServer();
      } else {
        clearGuestCart();
      }
      const data = await getCart();
      setCart(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!isPending) {
      loadCart();
    }
  }, [isPending, loadCart]);

  // Listen for guest cart updates across tabs/components
  useEffect(() => {
    if (!session?.user) {
      const handleGuestCartUpdate = () => {
        setCart(getGuestCart());
      };
      window.addEventListener("guest_cart_updated", handleGuestCartUpdate);
      return () => {
        window.removeEventListener("guest_cart_updated", handleGuestCartUpdate);
      };
    }
  }, [session]);

  // =========================
  // Merge Duplicate Products
  // =========================

  const cartItems = useMemo<CartItem[]>(() => {
    if (!cart?.items?.length) {
      return [];
    }

    const itemsMap = new Map<string, CartItem>();

    cart.items.forEach((item) => {
      const existingItem = itemsMap.get(item.productId);

      if (existingItem) {
        itemsMap.set(item.productId, {
          ...existingItem,
          quantity:
            existingItem.quantity + item.quantity,
        });
      } else {
        itemsMap.set(item.productId, item);
      }
    });

    return Array.from(itemsMap.values());
  }, [cart]);

  // =========================
  // Quantity Change
  // =========================

  const handleQuantityChange = async (
    productId: string,
    quantity: number
  ) => {
    if (quantity < 1 || updatingProductId) {
      return;
    }

    setUpdatingProductId(productId);
    setError(null);

    try {
      if (!session?.user) {
        // Guest mode
        const updated = updateGuestCartItemQuantity(productId, quantity);
        setCart(updated);
      } else {
        // Logged in mode
        const updatedCart = await updateCartItem(
          productId,
          quantity
        );
        clearGuestCart();
        setCart(updatedCart);
      }

      // Cart changed, so coupon must be applied again.
      if (appliedCoupon) {
        setAppliedCoupon(null);
        setCouponInput("");
        setCouponError(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingProductId(null);
    }
  };

  // =========================
  // Remove Product
  // =========================

  const handleRemove = async (productId: string) => {
    if (updatingProductId) {
      return;
    }

    setUpdatingProductId(productId);
    setError(null);

    try {
      if (!session?.user) {
        // Guest mode
        const updated = removeGuestCartItem(productId);
        setCart(updated);
      } else {
        // Logged in mode
        const updatedCart = await removeCartItem(productId);
        clearGuestCart();
        setCart(updatedCart);
      }

      // Remove applied coupon when cart changes.
      if (appliedCoupon) {
        setAppliedCoupon(null);
        setCouponInput("");
        setCouponError(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingProductId(null);
    }
  };

  // =========================
  // Apply Coupon
  // =========================

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();

    if (!code || !cart) {
      return;
    }

    setIsApplying(true);
    setCouponError(null);

    try {
      const result = await validateCoupon(
        code,
        cart.subtotal
      );

      setAppliedCoupon({
        code: result.code,
        discount: result.discount,
      });
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(getErrorMessage(err));
    } finally {
      setIsApplying(false);
    }
  };

  // =========================
  // Remove Coupon
  // =========================

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  // =========================
  // Proceed to Checkout Handler
  // =========================

  const handleProceedToCheckout = () => {
    if (!session?.user) {
      router.push(`/login?next=${encodeURIComponent("/dashboard/user/checkout")}`);
      return;
    }

    const checkoutUrl = appliedCoupon
      ? `/dashboard/user/checkout?coupon=${encodeURIComponent(appliedCoupon.code)}`
      : "/dashboard/user/checkout";

    router.push(checkoutUrl);
  };

  // =========================
  // Loading
  // =========================

  if (isPending || isLoading) {
    return (
      <LoadingState message="Loading your shopping cart..." />
    );
  }

  // =========================
  // Calculations
  // =========================

  const subtotal = cart?.subtotal ?? 0;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  // =========================
  // Page
  // =========================

  return (
    <div className="relative min-h-screen overflow-hidden bg-background/60 pb-20 pt-6 text-text">

      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/4 top-10 h-[400px] w-[400px] animate-pulse rounded-full bg-blue-900 blur-[130px] dark:bg-blue-500/30" />

      <div
        className="pointer-events-none absolute bottom-10 right-1/4 h-[450px] w-[450px] animate-pulse rounded-full bg-purple-900 blur-[140px] dark:bg-purple-500/30"
        style={{
          animationDuration: "6s",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =========================
            Header
        ========================= */}

        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-primary shadow-sm backdrop-blur-md">
              <FaShoppingBag className="text-xs" />
              Secure Bag {!session?.user && "(Guest Mode)"}
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-text sm:text-4xl">
              Shopping Cart
            </h1>

            <p className="mt-1 text-sm text-muted">
              {!session?.user
                ? "Your items are saved locally on this browser. Log in when checking out to keep them permanently!"
                : "Review your items and apply exclusive promo codes before checkout."}
            </p>
          </div>

          {cartItems.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-surface/80 px-4 py-2 text-xs font-bold text-muted shadow-sm backdrop-blur-md">
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
          <div className="mb-6 rounded-2xl border border-error/30 bg-error/10 p-4 text-sm font-semibold text-error backdrop-blur-md">
            {error}
          </div>
        )}

        {/* =========================
            Empty Cart
        ========================= */}

        {!cart || cartItems.length === 0 ? (
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

              {cartItems.map((item) => {
                const isUpdating =
                  updatingProductId === item.productId;

                return (
                  <div
                    key={item.productId}
                    className="group relative flex flex-col items-start justify-between gap-4 rounded-3xl border border-border/80 bg-surface/80 p-4 shadow-xl shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-primary/10 sm:flex-row sm:items-center sm:p-6"
                  >

                    {/* Product Info */}

                    <div className="flex w-full min-w-0 items-start gap-4 sm:w-auto sm:items-center">

                      <Link
                        href={`/products/${item.productId}`}
                        className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-muted-bg text-3xl shadow-inner transition group-hover:scale-105"
                      >
                        {item.images?.[0] || item.image ? (
                          <img
                            src={item.images?.[0] || item.image}
                            alt={item.title || "Product"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          "🛍️"
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">

                        <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                          {item.category || "Marketplace Item"}
                        </span>

                        <Link
                          href={`/products/${item.productId}`}
                          className="mt-0.5 line-clamp-2 block text-sm font-black leading-snug text-text transition-colors hover:text-primary sm:text-base"
                        >
                          {item.title ||
                            `Product #${item.productId}`}
                        </Link>

                        <p className="mt-1 text-xs font-bold text-muted sm:text-sm">
                          {formatCurrency(item.price)} each
                        </p>

                      </div>
                    </div>

                    {/* =========================
                        Controls
                    ========================= */}

                    <div className="flex w-full items-center justify-between gap-4 border-t border-border/60 pt-3 sm:w-auto sm:justify-end sm:border-t-0 sm:pt-0">

                      {/* Quantity */}

                      <div className="flex items-center rounded-2xl border border-border/80 bg-background/90 p-1 shadow-inner backdrop-blur-sm">

                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            item.quantity <= 1
                          }
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.quantity - 1
                            )
                          }
                          className="grid h-8 w-8 place-items-center rounded-xl text-sm font-bold text-text transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                        >
                          -
                        </button>

                        <span className="w-8 text-center text-sm font-black text-text">
                          {isUpdating
                            ? "..."
                            : item.quantity}
                        </span>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.quantity + 1
                            )
                          }
                          className="grid h-8 w-8 place-items-center rounded-xl text-sm font-bold text-text transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                        >
                          +
                        </button>

                      </div>

                      {/* Line Total */}

                      <span className="min-w-[90px] text-right text-sm font-black text-text sm:text-base">
                        {formatCurrency(
                          item.price * item.quantity
                        )}
                      </span>

                      {/* Remove */}

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleRemove(item.productId)
                        }
                        title="Remove item"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-error/20 bg-error/10 text-error shadow-sm transition-all duration-300 hover:scale-105 hover:bg-error hover:text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        <FaTrash size={12} />
                      </button>

                    </div>
                  </div>
                );
              })}

            </div>

            {/* =========================
                Sidebar
            ========================= */}

            <div className="flex flex-col gap-6 lg:sticky lg:top-6">

              {/* =========================
                  Coupon Card
              ========================= */}

              <div className="rounded-3xl border border-border/80 bg-surface/80 p-5 shadow-2xl shadow-black/5 backdrop-blur-xl transition-all hover:border-primary/30 sm:p-6">

                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
                  <FaTicketAlt className="text-sm text-primary" />
                  Promo Coupon
                </div>

                {appliedCoupon ? (

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 p-4 backdrop-blur-md">

                    <div>
                      <p className="text-sm font-black text-primary">
                        {appliedCoupon.code}
                      </p>

                      <p className="text-xs font-bold text-muted">
                        -
                        {formatCurrency(
                          appliedCoupon.discount
                        )}{" "}
                        discount applied
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-error transition hover:underline cursor-pointer"
                    >
                      Remove
                    </button>

                  </div>

                ) : (

                  <div className="mt-4 flex flex-col gap-2">

                    <div className="flex gap-2">

                      <input
                        value={couponInput}
                        onChange={(event) =>
                          setCouponInput(
                            event.target.value.toUpperCase()
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="e.g. SHOP10"
                        className="w-full rounded-2xl border border-border/80 bg-background/90 px-4 py-3 text-xs font-bold text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-sm"
                      />

                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={
                          isApplying ||
                          !couponInput.trim()
                        }
                        className="rounded-2xl bg-primary px-5 py-3 text-xs font-black text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary-hover disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                      >
                        {isApplying ? "..." : "Apply"}
                      </button>

                    </div>

                    {couponError && (
                      <p className="px-1 text-xs font-semibold text-error">
                        {couponError}
                      </p>
                    )}

                  </div>
                )}
              </div>

              {/* =========================
                  Order Summary
              ========================= */}

              <div className="rounded-3xl border border-border/80 bg-surface/80 p-5 shadow-2xl shadow-black/5 backdrop-blur-xl transition-all hover:border-primary/30 sm:p-6">

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

                  {/* Discount */}

                  {discount > 0 && (
                    <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">

                      <span>
                        Discount ({appliedCoupon?.code})
                      </span>

                      <span>
                        -{formatCurrency(discount)}
                      </span>

                    </div>
                  )}

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
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-center text-sm font-black text-white shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:bg-primary-hover hover:shadow-primary/50 cursor-pointer"
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
