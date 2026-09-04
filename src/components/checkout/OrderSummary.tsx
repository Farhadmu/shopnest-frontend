"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Tag, ArrowRight, ShieldCheck, Truck, CheckCircle, X, ShoppingBag } from "lucide-react";
import type { Cart } from "@/lib/api/cart";
import { validateCoupon } from "@/lib/api/coupons";
import { getErrorMessage } from "@/lib/core/errors";
import { formatCurrency } from "@/lib/utils";
import type { PaymentMethod } from "./CheckoutMethods";
import { CheckoutCard } from "./CheckoutCard";

interface OrderSummaryProps {
  cart: Cart;
  shippingFee: number;
  paymentMethod: PaymentMethod;
  total: number;
  subtotal: number;
  /** Initial coupon code (e.g. from URL query param) */
  initialCoupon?: string;
  isSubmitting: boolean;
  submitError: string | null;
  onPlaceOrder: (discount: number, couponCode?: string) => void;
}

export function OrderSummary({
  cart,
  shippingFee,
  paymentMethod,
  total: externalTotal,
  subtotal,
  initialCoupon = "",
  isSubmitting,
  submitError,
  onPlaceOrder,
}: OrderSummaryProps) {
  const [couponInput, setCouponInput] = useState(initialCoupon);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount + shippingFee);

  // Auto-apply coupon from URL if present
  useEffect(() => {
    if (initialCoupon && !appliedCoupon) {
      validateCoupon(initialCoupon, subtotal)
        .then((res) => setAppliedCoupon({ code: res.code, discount: res.discount }))
        .catch(() => undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCoupon, subtotal]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponError(null);
    try {
      const res = await validateCoupon(couponInput.trim(), subtotal);
      setAppliedCoupon({ code: res.code, discount: res.discount });
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
  };

  return (
    <CheckoutCard
      icon={ShoppingBag}
      title="Order Summary"
      subtitle={`${cart.items.length} item${cart.items.length !== 1 ? "s" : ""} in your bag`}
      className="lg:sticky lg:top-20"
    >
      {/* Cart Items List */}
      <div className="px-4 py-2.5 space-y-2 max-h-44 overflow-y-auto divide-y divide-slate-100 dark:divide-[#2D2250]">
        {cart.items.map((item, idx) => {
          const imageUrl = item.image || (item.images && item.images[0]) || null;
          return (
            <div key={item.productId || idx} className="pt-2 first:pt-0 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-sm flex-shrink-0 overflow-hidden border border-slate-200 dark:border-[#2D2250] bg-slate-50 dark:bg-slate-900">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={item.title || "Product"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-violet-50 dark:bg-violet-950/30 text-violet-500 text-xs font-bold">
                    {(item.title || "P").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-100 line-clamp-1 leading-tight">
                  {item.title || "Product"}
                </p>
                <p className="text-[10px] text-slate-400">
                  Qty: {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>

              <span className="text-xs font-bold text-slate-700 dark:text-slate-100 flex-shrink-0">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-slate-100 dark:bg-[#2D2250]" />

      {/* Coupon Section */}
      <div className="px-4 py-2.5">
        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          <Tag className="w-3 h-3" /> Discount Code
        </label>

        {appliedCoupon ? (
          <div className="flex items-center justify-between p-2 rounded-sm bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{appliedCoupon.code}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-500">-{formatCurrency(appliedCoupon.discount)} saved</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="p-1 rounded-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ENTER CODE"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              className="flex-1 px-2.5 py-1.5 rounded-sm text-xs uppercase tracking-wider bg-slate-50 dark:bg-[#0D0A1E] border border-slate-200 dark:border-[#2D2250] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 transition-all"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={isApplying || !couponInput.trim()}
              className="px-3 py-1.5 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-sm flex-shrink-0 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isApplying ? "..." : "Apply"}
            </button>
          </div>
        )}

        {couponError && (
          <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
            <X className="w-3 h-3" /> {couponError}
          </p>
        )}
      </div>

      <div className="h-px bg-slate-100 dark:bg-[#2D2250]" />

      {/* Price Breakdown */}
      <div className="px-4 py-2.5 space-y-1.5 text-xs">
        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
          <span>Subtotal ({cart.items.length} items)</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Shipping</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(shippingFee)}</span>
        </div>

        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
          <span>Discount</span>
          <span className={`font-semibold ${discount > 0 ? "text-emerald-500" : "text-slate-700 dark:text-slate-200"}`}>
            {discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)}
          </span>
        </div>

        <div className="h-px bg-slate-100 dark:bg-[#2D2250] !my-2" />

        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Total</span>
          <span className="text-base font-extrabold text-violet-600 dark:text-violet-400">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {submitError && (
        <div className="mx-4 mb-2.5 p-2 rounded-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-start gap-1.5">
          <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Place Order CTA */}
      <div className="px-4 pb-3">
        <Button
          onPress={() => onPlaceOrder(discount, appliedCoupon?.code)}
          isDisabled={isSubmitting}
          className="w-full py-2.5 text-xs font-bold text-white rounded-sm shadow-md shadow-violet-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
          style={{
            background: isSubmitting
              ? "#6b7280"
              : "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
          }}
        >
          {isSubmitting ? (
            <span>Processing...</span>
          ) : (
            <>
              Pay Now ৳{total.toLocaleString("en-BD")}
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </Button>

        <div className="mt-2.5 flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Buyer Protection</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-violet-500" /> Fast Delivery</span>
          <span>·</span>
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Easy Returns</span>
        </div>
      </div>
    </CheckoutCard>
  );
}
