"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderById, cancelOrder, requestReturn, type Order } from "@/lib/api/orders";
import { getDeliveryTracking, rateDelivery, type DeliveryTrackingResponse } from "@/lib/api/delivery";
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
  FiPhone,
  FiCompass,
  FiLock,
  FiUser,
} from "react-icons/fi";
import { FaMotorcycle, FaStar as FaSolidStar } from "react-icons/fa";

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
  const [tracking, setTracking] = useState<DeliveryTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Review modal state (product review)
  const [reviewTarget, setReviewTarget] = useState<{ id: string; title: string } | null>(null);

  // Delivery Partner Rating Modal State
  const [showRiderRateModal, setShowRiderRateModal] = useState(false);
  const [riderRating, setRiderRating] = useState(5);
  const [timelinessScore, setTimelinessScore] = useState(5);
  const [professionalismScore, setProfessionalismScore] = useState(5);
  const [riderComment, setRiderComment] = useState("");
  const [submittingRiderRate, setSubmittingRiderRate] = useState(false);
  const [riderRateSuccess, setRiderRateSuccess] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const orderData = await getOrderById(id);
      setOrder(orderData);

      // Attempt to fetch live delivery tracking
      try {
        const trackingData = await getDeliveryTracking(id);
        setTracking(trackingData);
      } catch {
        setTracking(null);
      }
    } catch (err: unknown) {
      console.error("Failed to load order:", err);
      setError(err instanceof Error ? err.message : "Order not found or authorization failed.");
    } finally {
      setLoading(false);
    }
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

  const handleRiderRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingRiderRate(true);
    try {
      await rateDelivery(id, {
        rating: riderRating,
        timeliness: timelinessScore,
        professionalism: professionalismScore,
        comment: riderComment.trim() || undefined,
      });
      setRiderRateSuccess(true);
      setShowRiderRateModal(false);
      setActionSuccessMsg("Thank you! Your delivery partner review has been recorded.");
    } catch (err: any) {
      alert(err?.message || "Failed to submit delivery rating.");
    } finally {
      setSubmittingRiderRate(false);
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
            {error || "This order may not exist or you do not have active authorization to access its record."}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={loadOrder}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
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

  // Delivery OTP from Order or Tracking
  const deliveryOtp = (order as any).deliveryOtp || (tracking as any)?.deliveryOtp;

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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <FiPrinter /> Print / Download Invoice
          </button>
          <button
            onClick={loadOrder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-border bg-card hover:bg-muted-bg text-foreground text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <FiRefreshCw /> Refresh Status
          </button>
          {(order.status === "pending" || order.status === "confirmed") && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <FiXCircle /> {actionLoading ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
          {order.status === "delivered" && (
            <button
              onClick={handleReturn}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
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

      {/* CUSTOMER OTP BANNER WHEN OUT FOR DELIVERY */}
      {order.status === "out_for_delivery" && deliveryOtp && (
        <div className="rounded-2xl border-2 border-primary bg-gradient-to-r from-primary/15 via-primary/5 to-card p-6 shadow-xl shadow-primary/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-wider">
                <FiLock className="text-base" />
                <span>Delivery Handover Confirmation Code</span>
              </div>
              <p className="text-xs text-foreground font-medium max-w-xl">
                Your delivery partner has arrived in your area. Please share this secure 6-digit OTP with the rider to verify handover and complete your delivery.
              </p>
            </div>

            <div className="bg-card border-2 border-primary/50 px-6 py-3 rounded-2xl text-center shadow-md">
              <span className="text-[10px] font-black uppercase text-muted block tracking-widest">
                YOUR CONFIRMATION OTP
              </span>
              <span className="text-3xl font-black text-primary tracking-widest font-mono">
                {deliveryOtp}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGNED RIDER & LIVE TELEMETRY CARD */}
      {tracking?.assignedRider && (
        <div className="bg-card border border-primary/30 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl">
                <FaMotorcycle />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-muted block">
                  Assigned Delivery Partner
                </span>
                <h3 className="text-base font-black text-foreground">
                  {tracking.assignedRider.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <FaSolidStar size={11} /> {tracking.assignedRider.rating?.toFixed(1) || "5.0"}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{tracking.assignedRider.vehicleType} ({tracking.assignedRider.vehicleModel || "Vehicle"})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {tracking.assignedRider.phone && (
                <a
                  href={`tel:${tracking.assignedRider.phone}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition shadow-md shadow-emerald-500/20"
                >
                  <FiPhone /> Call Rider
                </a>
              )}
              {order.status === "delivered" && !riderRateSuccess && (
                <button
                  type="button"
                  onClick={() => setShowRiderRateModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-black hover:bg-amber-500/20 transition cursor-pointer"
                >
                  <FiStar /> Rate Delivery Partner
                </button>
              )}
            </div>
          </div>

          {/* Live Scoped GPS Tracking Status */}
          {tracking.isLiveTrackingActive && tracking.currentLocation ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <p className="font-black text-emerald-600 dark:text-emerald-400">
                    Live GPS Broadcaster Active
                  </p>
                  <p className="text-muted text-[11px]">
                    Coordinates: {tracking.currentLocation.latitude.toFixed(4)}° N, {tracking.currentLocation.longitude.toFixed(4)}° E
                    {tracking.currentLocation.updatedAt && ` • Updated ${new Date(tracking.currentLocation.updatedAt).toLocaleTimeString()}`}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-muted">
                {tracking.breadcrumbs?.length || 1} route telemetry pings recorded
              </span>
            </div>
          ) : (
            order.status !== "delivered" && (
              <div className="text-[11px] text-muted flex items-center gap-1.5">
                <FiCompass className="text-primary" />
                <span>Live GPS tracking activates automatically when your rider starts transit to your destination.</span>
              </div>
            )
          )}
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
                  className={`mt-3 text-xs font-bold capitalize ${isCurrent ? "text-primary font-black" : "text-foreground"}`}
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
                <FiMapPin className="text-primary" /> Delivery Destination
              </h3>
              <p className="text-sm font-medium text-foreground whitespace-pre-line leading-relaxed">
                {order.shippingAddress || "Customer Delivery Address on File"}
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                <FiDollarSign className="text-emerald-500" /> Payment Details
              </h3>
              <p className="text-sm font-medium text-foreground capitalize">
                Method: <strong>{order.paymentMethod ? order.paymentMethod.toUpperCase() : "COD"}</strong>
              </p>
              <p className="text-xs text-muted mt-1">
                Payment Status:{" "}
                <strong className="text-emerald-500 uppercase">
                  {order.paymentStatus || (order.status === "delivered" ? "Paid" : "Pending Verification")}
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
                All orders are protected by ShopNest 7-Day Hassle-Free Return & Replacement Guarantee.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIDER RATING MODAL */}
      {showRiderRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-black text-base">
                <FaMotorcycle className="text-primary" />
                <span>Rate Your Delivery Partner</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRiderRateModal(false)}
                className="text-muted hover:text-foreground text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted">
              How was your delivery experience with {tracking?.assignedRider?.name || "your rider"}? Your feedback helps maintain high service quality.
            </p>

            <form onSubmit={handleRiderRateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">Overall Delivery Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRiderRating(star)}
                      className={`text-2xl cursor-pointer transition ${
                        star <= riderRating ? "text-amber-500" : "text-border"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 font-black text-foreground">{riderRating}.0</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Timeliness (1-5)</label>
                  <select
                    value={timelinessScore}
                    onChange={(e) => setTimelinessScore(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2 text-foreground outline-none"
                  >
                    <option value={5}>5 - Fast & On Time</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Acceptable</option>
                    <option value={2}>2 - Late</option>
                    <option value={1}>1 - Very Delayed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Professionalism</label>
                  <select
                    value={professionalismScore}
                    onChange={(e) => setProfessionalismScore(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2 text-foreground outline-none"
                  >
                    <option value={5}>5 - Excellent & Polite</option>
                    <option value={4}>4 - Courteous</option>
                    <option value={3}>3 - Standard</option>
                    <option value={2}>2 - Rude</option>
                    <option value={1}>1 - Unprofessional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Feedback / Comments (Optional)</label>
                <textarea
                  rows={3}
                  value={riderComment}
                  onChange={(e) => setRiderComment(e.target.value)}
                  placeholder="Share details about the handover, packaging condition, or rider courtesy..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRiderRateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-muted hover:text-foreground rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRiderRate}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black hover:bg-primary-hover transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submittingRiderRate ? "Submitting..." : "Submit Rider Rating"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Review Modal Trigger */}
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
