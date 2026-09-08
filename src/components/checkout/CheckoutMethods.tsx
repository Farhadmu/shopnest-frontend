"use client";

import { useState } from "react";
import { Truck, Building2, CreditCard, ShieldCheck, Wallet } from "lucide-react";
import { CheckoutCard } from "./CheckoutCard";

export type ShippingMethod = "home" | "hub";
export type PaymentMethod = "cod" | "stripe" | "sslcommerz";

interface CheckoutMethodsProps {
  onShippingChange: (method: ShippingMethod, price: number) => void;
  onPaymentChange: (method: PaymentMethod) => void;
}

const SHIPPING_OPTIONS = [
  {
    id: "home" as const,
    label: "Home Delivery",
    desc: "Delivered to your doorstep · 2–3 business days",
    price: 120,
    icon: Truck,
  },
  {
    id: "hub" as const,
    label: "ShopNest Hub",
    desc: "Self-pickup from nearest hub · 1–2 business days",
    price: 60,
    icon: Building2,
  },
];

const PAYMENT_OPTIONS = [
  {
    id: "cod" as const,
    label: "Cash on Delivery",
    desc: "Pay upon parcel receipt",
    icon: ShieldCheck,
    badge: "COD",
    styles: {
      border: "border-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-300",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600",
      badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500 border-emerald-500",
    },
  },
  {
    id: "stripe" as const,
    label: "Card Payment",
    desc: "Visa, Mastercard, Amex",
    icon: CreditCard,
    badge: "CARD",
    styles: {
      border: "border-violet-500",
      bg: "bg-violet-50 dark:bg-violet-950/30",
      text: "text-violet-700 dark:text-violet-300",
      iconBg: "bg-violet-100 dark:bg-violet-900/50 text-violet-600",
      badge: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
      dot: "bg-violet-500 border-violet-500",
    },
  },
  {
    id: "sslcommerz" as const,
    label: "SSLCOMMERZ",
    desc: "bKash, Nagad, Rocket, Cards",
    icon: Wallet,
    badge: "MFS",
    styles: {
      border: "border-pink-500",
      bg: "bg-pink-50 dark:bg-pink-950/30",
      text: "text-pink-700 dark:text-pink-300",
      iconBg: "bg-pink-100 dark:bg-pink-900/50 text-pink-600",
      badge: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
      dot: "bg-pink-500 border-pink-500",
    },
  },
];

export function CheckoutMethods({ onShippingChange, onPaymentChange }: CheckoutMethodsProps) {
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("home");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const handleShippingChange = (method: ShippingMethod, price: number) => {
    setShippingMethod(method);
    onShippingChange(method, price);
  };

  const handlePaymentChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    onPaymentChange(method);
  };

  return (
    <div className="space-y-3">
      {/* ── 1. Shipping Method ── */}
      <CheckoutCard
        icon={Truck}
        title="Shipping Method"
        subtitle="Choose how you want to receive your order"
      >
        <div className="p-3 space-y-2">
          {SHIPPING_OPTIONS.map((opt) => {
            const isSelected = shippingMethod === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleShippingChange(opt.id, opt.price)}
                className={`w-full text-left px-3 py-2 rounded-sm border-2 transition-all flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                    : "border-slate-200 dark:border-[#2D2250] hover:border-violet-300 dark:hover:border-violet-700 bg-slate-50 dark:bg-[#0D0A1E]"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "border-violet-500 bg-violet-500" : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                <div
                  className={`w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "bg-violet-100 dark:bg-violet-900/50 text-violet-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${isSelected ? "text-violet-700 dark:text-violet-300" : "text-slate-800 dark:text-slate-100"}`}>
                    {opt.label}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{opt.desc}</p>
                </div>

                <span className={`text-xs font-bold flex-shrink-0 ${isSelected ? "text-violet-600 dark:text-violet-400" : "text-slate-700 dark:text-slate-200"}`}>
                  ৳{opt.price}
                </span>
              </button>
            );
          })}
        </div>
      </CheckoutCard>

      {/* ── 2. Payment Method ── */}
      <CheckoutCard
        icon={CreditCard}
        title="Payment Method"
        subtitle="All transactions are encrypted and secured"
      >
        <div className="p-3 space-y-2">
          {PAYMENT_OPTIONS.map((opt) => {
            const isSelected = paymentMethod === opt.id;
            const Icon = opt.icon;
            const { styles } = opt;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handlePaymentChange(opt.id)}
                className={`w-full text-left px-3 py-2 rounded-sm border-2 transition-all flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? `${styles.border} ${styles.bg}`
                    : "border-slate-200 dark:border-[#2D2250] hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-[#0D0A1E]"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? styles.dot : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                <div
                  className={`w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 ${
                    isSelected ? styles.iconBg : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${isSelected ? styles.text : "text-slate-800 dark:text-slate-100"}`}>
                    {opt.label}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{opt.desc}</p>
                </div>

                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex-shrink-0 ${
                    isSelected ? styles.badge : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {opt.badge}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mx-3 mb-3 flex items-center gap-2 p-2 rounded-sm bg-slate-50 dark:bg-[#0D0A1E] border border-slate-200 dark:border-[#2D2250]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            256-bit SSL encrypted. Payment details are never stored on our servers.
          </p>
        </div>
      </CheckoutCard>
    </div>
  );
}
