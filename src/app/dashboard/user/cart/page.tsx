"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FaTrash, FaShoppingBag, FaArrowRight, FaShieldAlt, FaTicketAlt } from "react-icons/fa";
import { getCart, removeCartItem, updateCartItem, type Cart } from "@/lib/api/cart";
import { validateCoupon } from "@/lib/api/coupons";
import { getErrorMessage } from "@/lib/core/errors";
import { formatCurrency } from "@/lib/utils";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";

export default function CartPage() {
  const [cart, setCart] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(
    null
  );

  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const updated = await updateCartItem(productId, quantity);
      setCart(updated);
      if (appliedCoupon) setAppliedCoupon(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const updated = await removeCartItem(productId);
      setCart(updated);
      if (appliedCoupon) setAppliedCoupon(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !cart) return;
    setIsApplying(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(couponInput.trim(), cart.subtotal);
      setAppliedCoupon({ code: result.code, discount: result.discount });
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(getErrorMessage(err));
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  if (isLoading) {
    return <LoadingState message="Loading your shopping cart..." />;
  }

  const subtotal = cart?.subtotal ?? 0;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);
  // A cart should contain at most one row per product. Merge any legacy or
  // race-created duplicate rows before rendering so React always receives a
  // stable, unique key while the API also repairs the persisted cart.
  const cartItems = Array.from(
    (cart?.items ?? []).reduce((items: Map<string, any>, item: any) => {
      const existing = items.get(item.productId);
      items.set(item.productId, existing
        ? { ...existing, quantity: existing.quantity + item.quantity }
        : item);
      return items;
    }, new Map<string, any>()).values()
  );

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Your Bag</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-text">Shopping Cart</h1>
        <p className="mt-1 text-sm text-muted">
          Review your selected items before proceeding to secure checkout.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-error/30 bg-error/10 p-4 text-sm font-semibold text-error">
          {error}
        </div>
      )}

      {!cart || cartItems.length === 0 ? (
        <EmptyState
          title="Your Cart is Empty"
          description="Explore our marketplace and add authentic products from verified sellers to your cart."
          actionLabel="Explore Marketplace"
          onAction={() => (window.location.href = "/products")}
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Item List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cartItems.map((item: any) => (
              <div
                key={item.productId}
                className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <Link
                    href={`/products/${item.productId}`}
                    className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-muted-bg text-3xl"
                  >
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "🛍️"
                    )}
                  </Link>

                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-primary">
                      {item.category || "Marketplace Item"}
                    </span>
                    <Link
                      href={`/products/${item.productId}`}
                      className="mt-0.5 block truncate text-base font-black text-text hover:text-primary"
                    >
                      {item.title || `Product #${item.productId}`}
                    </Link>
                    <p className="mt-1 text-sm font-bold text-muted">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-border pt-3 sm:border-0 sm:pt-0">
                  {/* Quantity Stepper */}
                  <div className="flex items-center rounded-xl border border-border bg-background p-1">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-text hover:bg-muted-bg"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-text hover:bg-muted-bg"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <span className="min-w-[80px] text-right text-base font-black text-text">
                    {formatCurrency(item.price * item.quantity)}
                  </span>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.productId)}
                    title="Remove item"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-error/20 bg-error/10 text-error transition hover:bg-error hover:text-white"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout & Summary Card */}
          <div className="flex flex-col gap-5">
            {/* Coupon Card */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                <FaTicketAlt className="text-primary" /> Promo Coupon
              </div>

              {appliedCoupon ? (
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-primary/10 p-3.5">
                  <div>
                    <p className="text-sm font-black text-primary">{appliedCoupon.code}</p>
                    <p className="text-xs text-muted">
                      -{formatCurrency(appliedCoupon.discount)} discount applied
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-error hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. SHOP10"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-text outline-none placeholder:text-muted focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplying || !couponInput.trim()}
                      className="rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-50"
                    >
                      {isApplying ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-xs font-semibold text-error">{couponError}</p>}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wider text-text">
                Order Summary
              </h3>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-bold text-text">{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted">
                  <span>Estimated Delivery</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Free</span>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-lg font-black text-text">
                    <span>Total Amount</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <Link
                href={{
                  pathname: "/checkout",
                  query: appliedCoupon ? { coupon: appliedCoupon.code } : undefined,
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-center text-sm font-black text-white shadow-xl shadow-primary/25 transition hover:bg-primary-hover"
              >
                Proceed to Checkout <FaArrowRight size={12} />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-muted">
                <FaShieldAlt className="text-emerald-600" />
                <span>SSL Encrypted & Verified Buyer Protection</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
