"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, Package } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  verifyStripeCheckoutSession,
  verifySSLCommerzPayment,
} from "@/lib/api/payments";
import { getOrderById, type Order } from "@/lib/api/orders";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderIdParam = searchParams.get("orderId");
  const valId = searchParams.get("val_id") || undefined;

  const { data: authSession } = useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>(
    () => authSession?.user?.email || "customer@example.com"
  );

  useEffect(() => {
    if (authSession?.user?.email) {
      setCustomerEmail(authSession.user.email);
    }
  }, [authSession?.user?.email]);

  const resolvedOrderId =
    orderIdParam ||
    (sessionId?.startsWith("SHOPNEST_") ? sessionId.replace("SHOPNEST_", "") : null);

  const isStripeSession = Boolean(sessionId && sessionId.startsWith("cs_"));
  const hasValidIdentifier = Boolean(isStripeSession || resolvedOrderId);

  const missingSessionError = !hasValidIdentifier
    ? "No payment session or order was provided."
    : null;

  useEffect(() => {
    if (!hasValidIdentifier) return;

    let isMounted = true;

    if (isStripeSession && sessionId) {
      verifyStripeCheckoutSession(sessionId)
        .then(async (res) => {
          if (!isMounted) return;

          if (res.customerEmail) {
            setCustomerEmail(res.customerEmail);
          } else if (authSession?.user?.email) {
            setCustomerEmail(authSession.user.email);
          }

          // If order was attached to verify response, use it
          if (res.order && res.order.items) {
            setOrder(res.order);
            if (res.order.customerEmail) {
              setCustomerEmail(res.order.customerEmail);
            }
            setLoading(false);
            return;
          }

          // Otherwise fetch full order details using getOrderById
          if (res.orderId) {
            try {
              const fetchedOrder = await getOrderById(res.orderId);
              if (isMounted) {
                setOrder(fetchedOrder);
                if (fetchedOrder.customerEmail) {
                  setCustomerEmail(fetchedOrder.customerEmail);
                }
              }
            } catch (err) {
              console.error("Failed to load order details:", err);
            }
          }
          if (isMounted) {
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error("Verification failed:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to verify your payment session."
          );
          setLoading(false);
        });
    } else if (resolvedOrderId) {
      verifySSLCommerzPayment({
        orderId: resolvedOrderId,
        sessionId: sessionId || undefined,
        val_id: valId,
      })
        .then(async (res) => {
          if (!isMounted) return;

          if (res.customerEmail) {
            setCustomerEmail(res.customerEmail);
          } else if (authSession?.user?.email) {
            setCustomerEmail(authSession.user.email);
          }

          if (res.order && res.order.items) {
            setOrder(res.order);
            if (res.order.customerEmail) {
              setCustomerEmail(res.order.customerEmail);
            }
            setLoading(false);
            return;
          }

          try {
            const fetchedOrder = await getOrderById(resolvedOrderId);
            if (isMounted) {
              setOrder(fetchedOrder);
              if (fetchedOrder.customerEmail) {
                setCustomerEmail(fetchedOrder.customerEmail);
              }
            }
          } catch (err) {
            console.error("Failed to load order details:", err);
          }

          if (isMounted) {
            setLoading(false);
          }
        })
        .catch(async (err) => {
          if (!isMounted) return;
          console.warn(
            "SSLCommerz verification returned an error, falling back to getOrderById:",
            err
          );

          try {
            const fetchedOrder = await getOrderById(resolvedOrderId);
            if (isMounted) {
              setOrder(fetchedOrder);
              if (fetchedOrder.customerEmail) {
                setCustomerEmail(fetchedOrder.customerEmail);
              } else if (authSession?.user?.email) {
                setCustomerEmail(authSession.user.email);
              }
              setLoading(false);
            }
          } catch (fetchErr) {
            if (isMounted) {
              console.error("Failed to load order:", fetchErr);
              setError(
                err instanceof Error
                  ? err.message
                  : "Failed to verify your payment session."
              );
              setLoading(false);
            }
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [sessionId, resolvedOrderId, isStripeSession, hasValidIdentifier, valId, authSession?.user?.email]);


  const formatDate = (dateStr?: string | Date) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const finalError = error || missingSessionError;
  const isVerifying = hasValidIdentifier ? loading : false;

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#F4F6F6] dark:bg-[#070512] flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#D2EBE3] border-t-[#18735A] dark:border-emerald-950 dark:border-t-emerald-400" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Confirming Your Payment...
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Please wait while we record your transaction and confirm your order.
          </p>
        </div>
      </div>
    );
  }

  if (finalError) {
    return (
      <div className="min-h-screen bg-[#F4F6F6] dark:bg-[#070512] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center p-8 sm:p-10 rounded-3xl border border-red-200 dark:border-red-900/40 shadow-xl space-y-5">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Payment Verification Failed
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {finalError}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/orders"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Check My Orders
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#18735A] text-white hover:bg-[#135d48] transition-colors shadow-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderNumber = order?.id
    ? order.id.slice(-14).toUpperCase()
    : "AJK1HYY7484BCV";

  const orderDate = formatDate(order?.createdAt);
  const subtotal = order?.subtotal ?? order?.totalAmount ?? 0;
  const deliveryFee = order?.deliveryFee ?? (order ? 60 : 0);
  const total = order?.totalAmount ?? (subtotal + deliveryFee);
  const items = order?.items || [];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-16">
      <div className="max-w-[450px] w-full rounded-md p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800/80">
        {/* Top Checkmark Badge */}
        <div className="w-20 h-20 rounded-full bg-[#D5EBE4] dark:bg-[#12382F] flex items-center justify-center mx-auto mb-5">
          <div className="w-14 h-14 rounded-full bg-[#18735A] flex items-center justify-center text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Payment Successful
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Thank you for shopping. Your order has been successfully placed and has been processed for delivery
          </p>
        </div>

        {/* Bordered Inner Receipt Card */}
        <div className="mt-6 rounded-md border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 bg-white dark:bg-[#120D28]">
          {/* Top 3 Columns: Order Date, Order Number, Order Status */}
          <div className="grid grid-cols-3 gap-2 pb-3.5 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Order Date</p>
              <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 mt-0.5 whitespace-nowrap">
                {orderDate}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-slate-400 font-medium">Order Number</p>
              <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 mt-0.5 font-mono truncate">
                {orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-medium">Order Status</p>
              <p className="text-xs sm:text-[13px] font-bold text-[#18735A] dark:text-emerald-400 mt-0.5">
                Successful
              </p>
            </div>
          </div>

          {/* Section 1: ITEMS ORDERED */}
          <div className="pt-3.5 pb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              ITEMS ORDERED
            </p>

            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title || item.name || "Product"}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.title || item.name || "Product Item"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 flex-shrink-0">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center">
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    ShopNest Order
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Quantity: 1
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 flex-shrink-0">
                  ৳{total.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Section 2: PRICE */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              PRICE
            </p>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Price</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Delivery</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                ৳{deliveryFee.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 text-slate-900 dark:text-slate-100 font-bold border-t border-slate-100 dark:border-slate-800">
              <span>Total</span>
              <span className="text-sm font-extrabold">
                ৳{total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* User requested text above buttons: "Receipt sent to customer@example.com" */}
        <p className="mt-5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
          Receipt sent to{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {customerEmail}
          </span>
        </p>

        {/* Buttons: Done & Track Your Order */}
        <div className="mt-3.5 space-y-2.5">
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl bg-[#18735A] hover:bg-[#135d48] text-white text-xs sm:text-sm font-bold flex items-center justify-center transition-all shadow-sm active:scale-[0.99]"
          >
            Done
          </Link>

          {order?.id ? (
            <Link
              href={`/orders/${order.id}`}
              className="w-full py-3 px-4 rounded-xl bg-[#F0F5F3] dark:bg-[#1A1633] hover:bg-[#E4ECE9] dark:hover:bg-[#252044] text-[#18735A] dark:text-emerald-400 text-xs sm:text-sm font-bold flex items-center justify-center transition-all active:scale-[0.99]"
            >
              Track Your Order
            </Link>
          ) : (
            <Link
              href="/orders"
              className="w-full py-3 px-4 rounded-xl bg-[#F0F5F3] dark:bg-[#1A1633] hover:bg-[#E4ECE9] dark:hover:bg-[#252044] text-[#18735A] dark:text-emerald-400 text-xs sm:text-sm font-bold flex items-center justify-center transition-all active:scale-[0.99]"
            >
              Track Your Order
            </Link>
          )}
        </div>

        {/* User requested text below buttons: "Need help? Contact our support team at shopnest.zero.bug.zone@gmail.com" */}
        <p className="mt-5 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 text-center leading-normal">
          Need help? Contact our support team at{" "}
          <a
            href="mailto:shopnest.zero.bug.zone@gmail.com"
            className="text-slate-600 dark:text-slate-300 hover:text-[#18735A] dark:hover:text-emerald-400 underline font-medium transition-colors"
          >
            shopnest.zero.bug.zone@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F6F6] dark:bg-[#070512] flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#D2EBE3] border-t-[#18735A]" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
