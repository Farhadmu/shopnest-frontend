"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";

import { getCart, type Cart } from "@/lib/api/cart";
import { validateCoupon } from "@/lib/api/coupons";
import { createOrder } from "@/lib/api/orders";
import { getAddresses, type Address } from "@/lib/api/addresses";
import { getErrorMessage } from "@/lib/core/errors";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

import { DeliveryAddressForm, type AddressFormData } from "@/components/checkout/DeliveryAddressForm";
import { CheckoutMethods, type ShippingMethod, type PaymentMethod } from "@/components/checkout/CheckoutMethods";
import { OrderSummary } from "@/components/checkout/OrderSummary";

const INITIAL_ADDRESS: AddressFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  division: "Dhaka",
  district: "",
  upazila: "",
  streetAddress: "",
  orderNotes: "",
};

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCoupon = searchParams.get("coupon") ?? "";

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Addresses & Selected Mode
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("custom");
  const [address, setAddress] = useState<AddressFormData>(INITIAL_ADDRESS);

  // Shipping & Payment Methods
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("home");
  const [shippingFee, setShippingFee] = useState(120);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  // Coupon
  const [couponInput, setCouponInput] = useState(initialCoupon);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Submit status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateAddress = (field: keyof AddressFormData, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const applyAddressToForm = (addr: Address, addrId: string) => {
    setSelectedAddressId(addrId);
    const [first = "", ...rest] = (addr.fullName || "").split(" ");
    setAddress({
      firstName: first,
      lastName: rest.join(" "),
      phone: addr.phone || "",
      division: addr.division || "Dhaka",
      district: "",
      upazila: "",
      streetAddress: addr.streetAddress || "",
      orderNotes: "",
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [cartRes, addrRes] = await Promise.allSettled([getCart(), getAddresses()]);

        if (cartRes.status === "fulfilled") {
          if (!cancelled) setCart(cartRes.value);
        } else {
          throw cartRes.reason;
        }

        if (addrRes.status === "fulfilled" && addrRes.value.length > 0 && !cancelled) {
          setSavedAddresses(addrRes.value);
          const defaultAddr = addrRes.value.find((a) => a.isDefault) || addrRes.value[0];
          if (defaultAddr) {
            const addrId = defaultAddr.id || (defaultAddr as { _id?: string })._id || "";
            applyAddressToForm(defaultAddr, addrId);
          }
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    getCart()
      .then((cartData) => {
        setCart(cartData);
        return getAddresses();
      })
      .then((addrList) => {
        if (addrList && addrList.length > 0) {
          setSavedAddresses(addrList);
          const defaultAddr = addrList.find((a) => a.isDefault) || addrList[0];
          if (defaultAddr) {
            const addrId = defaultAddr.id || (defaultAddr as { _id?: string })._id || "";
            applyAddressToForm(defaultAddr, addrId);
          }
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  // Auto-apply coupon from URL if present
  useEffect(() => {
    if (initialCoupon && cart && !appliedCoupon) {
      validateCoupon(initialCoupon, cart.subtotal)
        .then((res) => setAppliedCoupon({ code: res.code, discount: res.discount }))
        .catch(() => undefined);
    }
  }, [cart, initialCoupon, appliedCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !cart) return;
    setIsApplying(true);
    setCouponError(null);
    try {
      const res = await validateCoupon(couponInput.trim(), cart.subtotal);
      setAppliedCoupon({ code: res.code, discount: res.discount });
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(getErrorMessage(err));
    } finally {
      setIsApplying(false);
    }
  };

  const handlePlaceOrder = async () => {
    const fullName = `${address.firstName.trim()} ${address.lastName.trim()}`.trim();
    if (!fullName) return setSubmitError("Please enter your full name.");
    if (!address.phone.trim()) return setSubmitError("Please enter your contact phone number.");
    if (!address.streetAddress.trim()) return setSubmitError("Please enter your detailed delivery street address.");

    setIsSubmitting(true);
    setSubmitError(null);

    const districtPart = address.district ? `, ${address.district}` : "";
    const upazilaPart = address.upazila ? `, ${address.upazila}` : "";
    const fullShippingAddress = `${fullName} | ${address.phone.trim()} | ${address.streetAddress.trim()}${upazilaPart}${districtPart}, ${address.division} Division${address.orderNotes.trim() ? ` (Note: ${address.orderNotes.trim()})` : ""}`;

    try {
      const order = await createOrder({
        shippingAddress: fullShippingAddress,
        division: address.division,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      });

      if (paymentMethod === "stripe" || paymentMethod === "sslcommerz") {
        router.push(
          `/confirm-payment?method=${paymentMethod}&shipping=${shippingMethod}&amount=${total}&orderId=${order.id}`
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

  if (isLoading) return <LoadingState message="Preparing your secure checkout..." />;
  if (error) return <ErrorState message={error} onRetry={handleRetry} />;
  if (!cart || cart.items.length === 0) {
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

  const subtotal = cart.subtotal;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount + shippingFee);

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
              savedAddresses={savedAddresses}
              selectedAddressId={selectedAddressId}
              address={address}
              onChange={updateAddress}
              onSelectSavedAddress={(addr) => applyAddressToForm(addr, addr.id || (addr as { _id?: string })._id || "")}
              onSelectCustom={() => {
                setSelectedAddressId("custom");
                setAddress(INITIAL_ADDRESS);
              }}
            />

            <CheckoutMethods
              shippingMethod={shippingMethod}
              onShippingChange={(method, price) => {
                setShippingMethod(method);
                setShippingFee(price);
              }}
              paymentMethod={paymentMethod}
              onPaymentChange={setPaymentMethod}
            />
          </div>

          {/* Right Column: Order Summary */}
          <div>
            <OrderSummary
              cart={cart}
              shippingMethod={shippingMethod}
              shippingFee={shippingFee}
              couponInput={couponInput}
              appliedCoupon={appliedCoupon}
              couponError={couponError}
              isApplying={isApplying}
              isSubmitting={isSubmitting}
              submitError={submitError}
              paymentMethod={paymentMethod}
              total={total}
              subtotal={subtotal}
              discount={discount}
              onCouponInputChange={setCouponInput}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={() => {
                setAppliedCoupon(null);
                setCouponInput("");
              }}
              onPlaceOrder={handlePlaceOrder}
            />
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
