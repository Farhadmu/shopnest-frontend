"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button, Input } from "@heroui/react";
import { getCart, removeCartItem, updateCartItem, type Cart } from "@/lib/api/cart";
import { validateCoupon } from "@/lib/api/coupons";
import { getErrorMessage } from "@/lib/core/errors";
import { formatCurrency } from "@/lib/utils";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
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
      // Coupon discount depends on subtotal; re-validate if one is applied.
      if (appliedCoupon) {
        setAppliedCoupon(null);
      }
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
    return <LoadingState message="Loading your cart..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadCart} />;
  }

  const subtotal = cart?.subtotal ?? 0;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <p className="text-muted">Review your selected items before proceeding to checkout.</p>
      </div>

      {!cart || cart.items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse products and add items to your cart to see them here."
          actionLabel="Browse Products"
          onAction={() => (window.location.href = "/products")}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-3">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">Product #{item.productId}</p>
                  <p className="text-sm text-muted">{formatCurrency(item.price)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => handleQuantityChange(item.productId, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => handleQuantityChange(item.productId, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <p className="w-24 text-right font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                <Button size="sm" variant="danger" onPress={() => handleRemove(item.productId)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3">Have a coupon?</h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-primary">{appliedCoupon.code}</p>
                    <p className="text-xs text-muted">
                      -{formatCurrency(appliedCoupon.discount)} applied
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-medium text-muted hover:text-error"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      fullWidth
                    />
                    <Button onPress={handleApplyCoupon} isDisabled={isApplying || !couponInput.trim()}>
                      {isApplying ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-error">{couponError}</p>}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3">Order Summary</h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base border-t border-border pt-2 mt-1">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              <Link
                href={{
                  pathname: "/checkout",
                  query: appliedCoupon ? { coupon: appliedCoupon.code } : undefined,
                }}
              >
                <Button variant="primary" className="w-full mt-4">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
