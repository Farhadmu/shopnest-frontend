"use client";

import React, { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";

import type { Cart } from "@/lib/api/cart";
import type { Address } from "@/lib/api/addresses";
import { createOrder } from "@/lib/api/orders";
import { getErrorMessage } from "@/lib/core/errors";

import { DeliveryAddressForm, type AddressFormData } from "./DeliveryAddressForm";
import { CheckoutMethods, type ShippingMethod, type PaymentMethod } from "./CheckoutMethods";
import { OrderSummary } from "./OrderSummary";

interface CheckoutClientProps {
  /** Cart fetched server-side. null = empty or fetch failed. */
  initialCart: Cart | null;
  /** Saved addresses fetched server-side. */
  initialAddresses: Address[];
}

/**
 * CheckoutClient — client boundary for the checkout flow.
 *
 * Responsibilities (only):
 *  - Receive server-fetched cart + addresses as props
 *  - Track address data (received from DeliveryAddressForm via callback)
 *  - Track shipping method + fee and payment method (from CheckoutMethods via callbacks)
 *  - Submit the order (handlePlaceOrder)
 *
 * All other state lives inside the respective child components.
 */
export function CheckoutClient({ initialCart, initialAddresses }: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCoupon = searchParams.get("coupon") ?? "";

  // ── Shipping & Payment (updated by child callbacks) ───────────────────────
  const shippingFeeRef = useRef<number>(120);
  const shippingMethodRef = useRef<ShippingMethod>("home");
  const paymentMethodRef = useRef<PaymentMethod>("cod");

  // ── Address (updated by DeliveryAddressForm callback) ─────────────────────
  const addressRef = useRef<AddressFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    division: "Dhaka",
    district: "",
    upazila: "",
    streetAddress: "",
    orderNotes: "",
  });

  // ── Submit state ──────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── For OrderSummary re-render when shipping/payment changes ──────────────
  const [shippingFee, setShippingFee] = useState(120);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddressChange = (data: AddressFormData) => {
    addressRef.current = data;
  };

  const handleShippingChange = (method: ShippingMethod, price: number) => {
    shippingMethodRef.current = method;
    shippingFeeRef.current = price;
    setShippingFee(price);
  };

  const handlePaymentChange = (method: PaymentMethod) => {
    paymentMethodRef.current = method;
    setPaymentMethod(method);
  };

  const handlePlaceOrder = async (discount: number, couponCode?: string) => {
    const address = addressRef.current;
    const fullName = `${address.firstName.trim()} ${address.lastName.trim()}`.trim();

    if (!fullName) return setSubmitError("Please enter your full name.");
    if (!address.phone.trim()) return setSubmitError("Please enter your contact phone number.");
    if (!address.streetAddress.trim()) return setSubmitError("Please enter your detailed delivery street address.");

    setIsSubmitting(true);
    setSubmitError(null);

    const districtPart = address.district ? `, ${address.district}` : "";
    const upazilaPart = address.upazila ? `, ${address.upazila}` : "";
    const fullShippingAddress = `${fullName} | ${address.phone.trim()} | ${address.streetAddress.trim()}${upazilaPart}${districtPart}, ${address.division} Division${address.orderNotes.trim() ? ` (Note: ${address.orderNotes.trim()})` : ""}`;

    const total = Math.max(0, (initialCart?.subtotal ?? 0) - discount + shippingFeeRef.current);

    try {
      const order = await createOrder({
        shippingAddress: fullShippingAddress,
        division: address.division,
        paymentMethod: paymentMethodRef.current,
        couponCode,
      });

      if (paymentMethodRef.current === "stripe" || paymentMethodRef.current === "sslcommerz") {
        router.push(
          `/confirm-payment?method=${paymentMethodRef.current}&shipping=${shippingMethodRef.current}&amount=${total}&orderId=${order.id}`
        );
      } else {
        router.push(`/orders/${order.id}`);
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (!initialCart || initialCart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center mx-auto mb-4 text-violet-600">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1.5">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Discover thousands of verified products on ShopNest.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm font-semibold text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition-all"
        >
          Browse Products <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const subtotal = initialCart.subtotal;

  return (
    <div className="min-h-screen dark:bg-[#090614]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        {/* Page Title */}
        <div className="mb-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">Checkout</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Complete your order securely below</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-[11px] font-semibold">
            <ShieldCheck className="w-3 h-3" /> 256-Bit SSL Encrypted
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3.5 items-start">
          {/* Left Column: Delivery Address & Methods */}
          <div className="space-y-3">
            <DeliveryAddressForm
              initialAddresses={initialAddresses}
              onChange={handleAddressChange}
            />
            <CheckoutMethods
              onShippingChange={handleShippingChange}
              onPaymentChange={handlePaymentChange}
            />
          </div>

          {/* Right Column: Order Summary */}
          <div>
            <OrderSummary
              cart={initialCart}
              shippingFee={shippingFee}
              paymentMethod={paymentMethod}
              subtotal={subtotal}
              total={Math.max(0, subtotal + shippingFee)}
              initialCoupon={initialCoupon}
              isSubmitting={isSubmitting}
              submitError={submitError}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
