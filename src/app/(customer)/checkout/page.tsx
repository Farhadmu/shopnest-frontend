"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@heroui/react";
import { getCart, type Cart } from "@/lib/api/cart";
import { validateCoupon } from "@/lib/api/coupons";
import { createOrder } from "@/lib/api/orders";
import { getErrorMessage } from "@/lib/core/errors";
import { formatCurrency } from "@/lib/utils";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCoupon = searchParams.get("coupon") ?? "";

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [couponInput, setCouponInput] = useState(initialCoupon);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(
    null
  );
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  // Auto-apply a coupon carried over from the cart page's query string.
  useEffect(() => {
    if (initialCoupon && cart && !appliedCoupon) {
      validateCoupon(initialCoupon, cart.subtotal)
        .then((result) => setAppliedCoupon({ code: result.code, discount: result.discount }))
        .catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

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

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      setSubmitError("Shipping address is required");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createOrder({
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
        couponCode: appliedCoupon?.code,
      });
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Preparing checkout..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadCart} />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <ErrorState
        title="Your cart is empty"
        message="Add items to your cart before checking out."
        onRetry={() => router.push("/cart")}
      />
    );
  }

  const subtotal = cart.subtotal;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-muted">Provide shipping details and complete your order payment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground mb-3">Shipping Address</h3>
            <Input
              placeholder="Street, city, state, ZIP"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              fullWidth
            />
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground mb-3">Payment Method</h3>
            <div className="flex flex-col gap-2">
              {[
                { value: "cod", label: "Cash on Delivery" },
                { value: "card", label: "Credit / Debit Card" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.value}
                    checked={paymentMethod === option.value}
                    onChange={() => setPaymentMethod(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

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
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponInput("");
                  }}
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
                  <Button
                    onPress={handleApplyCoupon}
                    isDisabled={isApplying || !couponInput.trim()}
                  >
                    {isApplying ? "Applying..." : "Apply"}
                  </Button>
                </div>
                {couponError && <p className="text-xs text-error">{couponError}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
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
            {submitError && <p className="text-xs text-error mt-3">{submitError}</p>}
            <Button
              variant="primary"
              className="w-full mt-4"
              onPress={handlePlaceOrder}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Placing order..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingState message="Preparing checkout..." />}>
      <CheckoutForm />
    </Suspense>
  );
}
