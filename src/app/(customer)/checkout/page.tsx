"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";
import { getCart, type Cart } from "@/lib/api/cart";
import { validateCoupon } from "@/lib/api/coupons";
import { createOrder } from "@/lib/api/orders";
import { getErrorMessage } from "@/lib/core/errors";
import { formatCurrency } from "@/lib/utils";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import Link from "next/link";
import {
  FiShield,
  FiTruck,
  FiCreditCard,
  FiCheckCircle,
  FiLock,
  FiTag,
  FiMapPin,
  FiUser,
  FiPhone,
  FiArrowRight,
  FiShoppingBag,
} from "react-icons/fi";

const BD_DIVISIONS = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Rangpur",
  "Mymensingh",
];

type PaymentMethodType = "cod" | "bkash" | "nagad" | "rocket" | "card";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCoupon = searchParams.get("coupon") ?? "";

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Address fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("cod");
  const [mfsNumber, setMfsNumber] = useState("");
  const [mfsTrxId, setMfsTrxId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Coupon
  const [couponInput, setCouponInput] = useState(initialCoupon);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(
    null
  );
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Submission
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

  useEffect(() => {
    if (initialCoupon && cart && !appliedCoupon) {
      validateCoupon(initialCoupon, cart.subtotal)
        .then((result) => setAppliedCoupon({ code: result.code, discount: result.discount }))
        .catch(() => undefined);
    }
  }, [cart, initialCoupon, appliedCoupon]);

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
    if (!fullName.trim()) {
      setSubmitError("Please enter your recipient full name.");
      return;
    }
    if (!phone.trim()) {
      setSubmitError("Please enter your contact phone number.");
      return;
    }
    if (!streetAddress.trim()) {
      setSubmitError("Please enter your detailed delivery street address.");
      return;
    }

    if (
      (paymentMethod === "bkash" || paymentMethod === "nagad" || paymentMethod === "rocket") &&
      !mfsNumber.trim()
    ) {
      setSubmitError(`Please enter your ${paymentMethod.toUpperCase()} mobile account number.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const fullShippingAddress = `${fullName.trim()} | ${phone.trim()} | ${streetAddress.trim()}, ${city.trim() || division}, ${division} Division ${orderNotes.trim() ? `(Note: ${orderNotes.trim()})` : ""}`;

    try {
      const order = await createOrder({
        shippingAddress: fullShippingAddress,
        division,
        paymentMethod: paymentMethod,
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
    return <LoadingState message="Preparing your secure checkout..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadCart} />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <FiShoppingBag />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-muted text-sm mb-6">
          Discover thousands of verified products from top sellers across Bangladesh.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors"
        >
          Browse Products <FiArrowRight />
        </Link>
      </div>
    );
  }

  const subtotal = cart.subtotal;
  const discount = appliedCoupon?.discount ?? 0;
  const shippingFee = division === "Dhaka" ? 60 : 120;
  const total = Math.max(0, subtotal - discount + shippingFee);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Secure Checkout
          </h1>
          <p className="text-sm text-muted mt-1">
            Review your order, enter delivery details, and select your payment method.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-semibold w-fit">
          <FiShield className="text-sm" /> 256-Bit SSL Encrypted & Verified
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Forms */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Delivery & Shipping Address</h2>
                <p className="text-xs text-muted">Where should we deliver your package?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  <span className="flex items-center gap-1">
                    <FiUser /> Full Name *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Farhadul Islam"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  <span className="flex items-center gap-1">
                    <FiPhone /> Mobile Number (+880) *
                  </span>
                </label>
                <input
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  <span className="flex items-center gap-1">
                    <FiMapPin /> Division *
                  </span>
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  {BD_DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} Division
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  City / Area / Thana
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhanmondi / Gulshan / Mirpur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Street Address & House / Flat Details *
                </label>
                <textarea
                  rows={2}
                  placeholder="House #, Road #, Sector, Area landmark"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted mb-1">
                  Delivery Notes / Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before delivery, leave with guard"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Select Payment Method</h2>
                <p className="text-xs text-muted">
                  Choose your preferred safe & instant payment option.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
              {/* COD */}
              <div
                onClick={() => setPaymentMethod("cod")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-border/80 bg-background/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                      <FiTruck />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Cash on Delivery</h4>
                      <p className="text-xs text-muted">Pay in cash upon doorstep delivery</p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-primary bg-primary" : "border-muted"}`}
                  >
                    {paymentMethod === "cod" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* bKash */}
              <div
                onClick={() => setPaymentMethod("bkash")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "bkash"
                    ? "border-[#D12053] bg-[#D12053]/5 shadow-sm"
                    : "border-border hover:border-border/80 bg-background/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#D12053]/10 text-[#D12053] flex items-center justify-center font-black text-sm">
                      bKash
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">bKash Direct</h4>
                      <p className="text-xs text-muted">Instant mobile wallet checkout</p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "bkash" ? "border-[#D12053] bg-[#D12053]" : "border-muted"}`}
                  >
                    {paymentMethod === "bkash" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Nagad */}
              <div
                onClick={() => setPaymentMethod("nagad")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "nagad"
                    ? "border-[#F7941D] bg-[#F7941D]/5 shadow-sm"
                    : "border-border hover:border-border/80 bg-background/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F7941D]/10 text-[#F7941D] flex items-center justify-center font-black text-sm">
                      Nagad
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Nagad Wallet</h4>
                      <p className="text-xs text-muted">Govt Post Office digital payment</p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "nagad" ? "border-[#F7941D] bg-[#F7941D]" : "border-muted"}`}
                  >
                    {paymentMethod === "nagad" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Card / Stripe */}
              <div
                onClick={() => setPaymentMethod("card")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "card"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-border/80 bg-background/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl">
                      <FiCreditCard />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Card / Stripe</h4>
                      <p className="text-xs text-muted">Visa, Mastercard, AMEX</p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" ? "border-primary bg-primary" : "border-muted"}`}
                  >
                    {paymentMethod === "card" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Payment Details Prompt */}
            {(paymentMethod === "bkash" ||
              paymentMethod === "nagad" ||
              paymentMethod === "rocket") && (
              <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    Merchant Account: <strong className="text-primary">+8801700-000000</strong>
                  </span>
                  <span className="text-muted">Type: Merchant / Payment</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">
                      {paymentMethod.toUpperCase()} Account Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={mfsNumber}
                      onChange={(e) => setMfsNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">
                      Transaction ID (TrxID) (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9J4K82L1A"
                      value={mfsTrxId}
                      onChange={(e) => setMfsTrxId(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Card Number *</label>
                  <input
                    type="text"
                    placeholder="4242 •••• •••• 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">CVC / CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-4 border-b border-border pb-4 divide-y divide-border/50">
              {cart.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between pt-2.5 text-xs">
                  <div className="flex-1 pr-3">
                    <p className="font-semibold text-foreground line-clamp-1">{item.title}</p>
                    <p className="text-muted">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-foreground">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Application */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-muted mb-1.5 flex items-center gap-1">
                <FiTag /> Discount Coupon
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs">
                  <div>
                    <strong>{appliedCoupon.code}</strong> applied
                    <p className="text-[10px] text-muted">
                      -{formatCurrency(appliedCoupon.discount)} discount
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponInput("");
                    }}
                    className="text-muted hover:text-red-500 font-semibold text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. SHOP10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-border bg-background text-xs uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button
                    size="sm"
                    onPress={handleApplyCoupon}
                    isDisabled={isApplying || !couponInput.trim()}
                    className="bg-primary text-white text-xs px-3"
                  >
                    {isApplying ? "..." : "Apply"}
                  </Button>
                </div>
              )}
              {couponError && <p className="text-[11px] text-red-500 mt-1">{couponError}</p>}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs border-t border-border pt-4">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({cart.items.length} items)</span>
                <span className="text-foreground font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-500 font-semibold">
                  <span>Coupon Savings ({appliedCoupon?.code})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Shipping & Delivery Fee</span>
                <span>{formatCurrency(shippingFee)}</span>
              </div>
              <div className="flex justify-between items-center text-base font-extrabold text-foreground border-t border-border pt-3 mt-2">
                <span>Grand Total</span>
                <span className="text-primary text-lg">{formatCurrency(total)}</span>
              </div>
            </div>

            {submitError && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                {submitError}
              </div>
            )}

            {/* Place Order CTA */}
            <Button
              className="w-full mt-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
              onPress={handlePlaceOrder}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Securing Order...</span>
              ) : (
                <>
                  <FiLock /> Complete & Place Order ({formatCurrency(total)})
                </>
              )}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <FiCheckCircle className="text-emerald-500" /> Buyer Protection
              </span>
              <span className="flex items-center gap-1">
                <FiTruck className="text-primary" /> Fast Delivery
              </span>
            </div>
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
