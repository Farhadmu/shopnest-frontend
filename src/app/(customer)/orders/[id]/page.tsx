"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderById, cancelOrder, requestReturn, type Order } from "@/lib/api/orders";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import Link from "next/link";
import {
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiArrowLeft,
  FiShield,
  FiHelpCircle,
  FiDollarSign,
  FiRefreshCw,
  FiPrinter,
  FiXCircle,
  FiRotateCcw,
  FiStar,
} from "react-icons/fi";

const TRACKING_STEPS = [
  { key: "pending", label: "Order Placed", desc: "Order details received" },
  { key: "confirmed", label: "Payment Confirmed", desc: "Verified & queued" },
  { key: "processing", label: "Merchant Processing", desc: "Items packed at store" },
  { key: "shipped", label: "Shipped & Dispatched", desc: "In transit with courier" },
  { key: "out_for_delivery", label: "Out for Delivery", desc: "Rider on the way" },
  { key: "delivered", label: "Delivered", desc: "Package received safely" },
];

export default function OrderDetailsPage() {
  const params = useParams();
  const id =
    typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Review modal state
  const [reviewTarget, setReviewTarget] = useState<{ id: string; title: string } | null>(null);

  const loadOrder = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getOrderById(id)
      .then((data) => {
        setOrder(data);
      })
      .catch((err: unknown) => {
        console.error("Failed to load order:", err);
        setError(err instanceof Error ? err.message : "Order not found or authorization failed.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await loadOrder();
      const interval = window.setInterval(loadOrder, 15000);
      return () => {
        cancelled = true;
        window.clearInterval(interval);
      };
    };
    run();
  }, [loadOrder]);

  const handleCancel = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    setActionLoading(true);
    try {
      await cancelOrder(order.id || (order as { _id?: string })._id || "");
      setActionSuccessMsg("Order has been cancelled successfully.");
      loadOrder();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!order) return;
    const reason = prompt("Please enter the reason for returning this item (e.g. Size mismatch, defective, wrong color):");
    if (!reason || !reason.trim()) return;
    setActionLoading(true);
    try {
      await requestReturn(order.id || "", { reason: reason.trim() });
      setActionSuccessMsg("Return request submitted under ShopNest 7-Day Guarantee.");
      loadOrder();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit return request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-foreground">Retrieving Live Order Tracking...</h2>
        <p className="text-xs text-muted mt-1">
          Connecting to ShopNest real-time delivery telemetry.
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 shadow-sm">
          <h1 className="text-2xl font-black text-foreground">Order Record Not Found</h1>
          <p className="mt-2 text-sm text-muted">
            {error ||
              "This order may not exist or you do not have active authorization to access its record."}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={loadOrder}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors"
            >
              <FiRefreshCw /> Retry Loading
            </button>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-xl text-xs font-bold hover:bg-muted-bg transition-colors"
            >
              <FiArrowLeft /> Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentIdx = TRACKING_STEPS.findIndex((s) => s.key === order.status);
  const activeStepIndex = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors mb-2"
          >
            <FiArrowLeft /> Back to All Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Order #
              {String(order.id || "")
                .slice(-8)
                .toUpperCase()}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                order.status === "delivered"
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : order.status === "cancelled"
                    ? "bg-red-500/10 text-red-500 border border-red-500/20"
                    : order.status === "returned"
                      ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    : "bg-primary/10 text-primary border border-primary/20"
              }`}
            >
              {order.status?.replaceAll("_", " ") || "Pending"}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            <FiPrinter /> Print / Download Invoice
          </button>
          <button
            onClick={loadOrder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-border bg-card hover:bg-muted-bg text-foreground text-xs font-semibold rounded-xl transition-colors"
          >
            <FiRefreshCw /> Refresh
          </button>
          {(order.status === "pending" || order.status === "confirmed") && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl transition-colors"
            >
              <FiXCircle /> {actionLoading ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
          {order.status === "delivered" && (
            <button
              onClick={handleReturn}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl transition-colors"
            >
              <FiRotateCcw /> {actionLoading ? "Submitting..." : "Return / Refund"}
            </button>
          )}
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-border bg-card hover:bg-muted-bg text-foreground text-xs font-semibold rounded-xl transition-colors"
          >
            <FiHelpCircle /> Support
          </Link>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <FiCheckCircle className="text-base" /> {actionSuccessMsg}
        </div>
      )}

      {(order.status === "returned" || order.status === "cancelled") && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-300">
          <p className="font-bold">This order has been {order.status}.</p>
        </div>
      )}

      {/* Real-time Order Tracking Timeline */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
          <FiTruck className="text-primary text-lg" /> Live Order Tracking Timeline
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {TRACKING_STEPS.map((step, idx) => {
            const isCompleted = idx <= activeStepIndex && order.status !== "cancelled";
            const isCurrent = idx === activeStepIndex && order.status !== "cancelled";

            return (
              <div key={step.key} className="flex flex-col items-center text-center relative group">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-black transition-all ${
                    isCompleted
                      ? "bg-primary text-white shadow-lg shadow-primary/20 ring-4 ring-primary/10"
                      : "bg-muted-bg text-muted border border-border"
                  }`}
                >
                  {isCompleted ? <FiCheckCircle /> : idx + 1}
                </div>
                <p
                  className={`mt-3 text-xs font-bold capitalize ${isCurrent ? "text-primary" : "text-foreground"}`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-muted mt-0.5 leading-tight">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Order Items & Delivery / Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Items Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <FiPackage className="text-primary" /> Purchased Products ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-border/60">
              {(order.items || []).map((item, index: number) => (
                <div
                  key={index}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-foreground">
                      {item.title || `Item #${index + 1}`}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      <span>
                        Quantity: <strong className="text-foreground">{item.quantity}</strong>
                      </span>
                      <span>Unit Price: ৳{item.price?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <p className="font-black text-sm text-foreground">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </p>
                    {order.status === "delivered" && (
                      <button
                        type="button"
                        onClick={() =>
                          setReviewTarget({
                            id: item.productId || (item as { id?: string }).id || "",
                            title: item.title || `Product #${index + 1}`,
                          })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-xs font-bold transition-colors"
                      >
                        <FiStar /> Write Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                <FiMapPin className="text-primary" /> Order Summary
              </h3>
              <p className="text-sm font-medium text-foreground whitespace-pre-line leading-relaxed">
                Total: ৳{order.totalAmount?.toLocaleString()}
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                <FiDollarSign className="text-emerald-500" /> Payment Details
              </h3>
              <p className="text-sm font-medium text-foreground capitalize">
                Status:{" "}
                <strong className="text-emerald-500 uppercase">
                  {order.status === "delivered" ? "Paid" : "Pending"}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Financial Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-foreground mb-4">Financial Summary</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="text-foreground font-semibold">
                  ৳{order.subtotal?.toLocaleString() || "0"}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-500 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-৳{order.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Shipping & Handling</span>
                <span className="text-foreground font-semibold">
                  {order.deliveryFee === 0
                    ? "FREE"
                    : `৳${order.deliveryFee?.toLocaleString() || "0"}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-base font-extrabold text-foreground border-t border-border pt-3 mt-2">
                <span>Total Amount</span>
                <span className="text-primary text-lg font-black">
                  ৳{order.totalAmount?.toLocaleString() || "0"}
                </span>
              </div>
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted flex items-start gap-2.5">
              <FiShield className="text-primary text-base shrink-0 mt-0.5" />
              <span>
                All orders are protected by ShopNest 7-Day Hassle-Free Return & Replacement
                Guarantee.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal Trigger */}
      {reviewTarget && (
        <ReviewModal
          productId={reviewTarget.id}
          productTitle={reviewTarget.title}
          isOpen={true}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => {
            setActionSuccessMsg("Review submitted successfully! Thank you for your feedback.");
          }}
        />
      )}
    </div>
  );
}
