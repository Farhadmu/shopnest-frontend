"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { deliveryManDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getDeliveryById,
  updateDeliveryStatus,
  verifyDeliveryOtp,
  updateDeliveryLocation,
  uploadDeliveryProof,
  type DeliveryRequest,
} from "@/lib/api/delivery";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMapPin,
  FaBox,
  FaMotorcycle,
  FaKey,
  FaPhone,
  FaCompass,
  FaUpload,
  FaShieldAlt,
  FaSyncAlt,
  FaLocationArrow,
} from "react-icons/fa";

const STATUS_FLOW = [
  { key: "assigned", label: "Assigned" },
  { key: "pickup_started", label: "Heading to Store" },
  { key: "picked_up", label: "Items Picked Up" },
  { key: "in_transit", label: "In Transit" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function DeliveryRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Proof of delivery file upload
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const loadDelivery = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getDeliveryById(id);
      setDelivery(res.deliveryRequest);
      setOrder(res.order ?? null);
      setLocations(res.locations ?? []);
    } catch (error) {
      console.error("Failed to load delivery details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDelivery();
  }, [loadDelivery]);

  // GPS broadcaster for this specific delivery
  const toggleGpsBroadcast = () => {
    if (isBroadcasting) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsBroadcasting(false);
      setGpsError(null);
    } else {
      if (!("geolocation" in navigator)) {
        setGpsError("Geolocation is not supported by your browser.");
        return;
      }
      setIsBroadcasting(true);
      setGpsError(null);

      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude, accuracy, speed, heading } = pos.coords;
          try {
            await updateDeliveryLocation({
              latitude,
              longitude,
              accuracy: accuracy || undefined,
              speed: speed || undefined,
              heading: heading || undefined,
              deliveryRequestId: id,
            });
          } catch (err) {
            console.error("Location update failed:", err);
          }
        },
        (err) => setGpsError(`GPS Error: ${err.message}`),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
      );
      watchIdRef.current = watchId;
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleStatusUpdate = async (status: DeliveryRequest["status"]) => {
    if (!id) return;
    setUpdating(true);
    try {
      await updateDeliveryStatus(id, status);
      await loadDelivery();
    } catch (error: any) {
      alert(error?.message || "Failed to advance delivery mission status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyOtpSubmit = async () => {
    if (!id || !otpInput.trim()) return;
    setOtpVerifying(true);
    setOtpError(null);
    try {
      await verifyDeliveryOtp(id, otpInput.trim());
      alert("✅ OTP verified successfully! Order marked as DELIVERED.");
      setShowOtpModal(false);
      setOtpInput("");
      await loadDelivery();
    } catch (err: any) {
      setOtpError(err?.message || "Invalid OTP code. Please verify with customer.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleProofUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile || !id) return;
    setUploadingProof(true);
    try {
      await uploadDeliveryProof(id, proofFile);
      alert("📸 Delivery proof image uploaded successfully!");
      setProofFile(null);
      await loadDelivery();
    } catch (err: any) {
      alert(err?.message || "Failed to upload delivery proof.");
    } finally {
      setUploadingProof(false);
    }
  };

  const currentStepIdx = delivery ? STATUS_FLOW.findIndex((s) => s.key === delivery.status) : -1;
  const isCompleted = delivery?.status === "delivered";
  const isFailed = delivery ? ["failed", "cancelled"].includes(delivery.status) : false;

  if (loading) {
    return (
      <DashboardShell role="Delivery Man" title="Mission Dispatch" subtitle="Loading..." links={deliveryManDashboardLinks}>
        <div className="space-y-4">
          <div className="h-44 animate-pulse rounded-2xl border border-border bg-surface/50" />
          <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface/50" />
        </div>
      </DashboardShell>
    );
  }

  if (!delivery) {
    return (
      <DashboardShell role="Delivery Man" title="Mission Not Found" subtitle="Error" links={deliveryManDashboardLinks}>
        <Panel>
          <div className="py-12 text-center text-muted">
            <FaBox className="mx-auto text-4xl text-muted/40 mb-3" />
            <h3 className="text-base font-bold text-foreground">Delivery Record Not Found</h3>
            <p className="text-xs text-muted mt-1">This delivery mission does not exist or you do not have authorization.</p>
            <button
              type="button"
              onClick={() => router.push("/dashboard/delivery/my-deliveries")}
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition"
            >
              Back to My Deliveries
            </button>
          </div>
        </Panel>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="Delivery Man"
      title={`Mission Control: Order #${delivery.orderId.slice(-8).toUpperCase()}`}
      subtitle="Live mission status, route telemetry, and customer handover."
      links={deliveryManDashboardLinks}
    >
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/dashboard/delivery/my-deliveries"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-foreground transition"
          >
            <FaArrowLeft size={10} /> Back to My Deliveries
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleGpsBroadcast}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                isBroadcasting
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500 animate-pulse"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              <FaLocationArrow className={isBroadcasting ? "rotate-45 text-emerald-500" : ""} />
              <span>{isBroadcasting ? "Broadcasting Live GPS" : "Broadcast Route GPS"}</span>
            </button>

            <button
              type="button"
              onClick={loadDelivery}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-foreground hover:border-primary transition cursor-pointer"
            >
              <FaSyncAlt size={10} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {gpsError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500">
            {gpsError}
          </div>
        )}

        {/* Mission Banner & Progress */}
        <Panel title="Mission Progress & Handover State">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted block">Current Status</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`rounded-lg px-3 py-1 text-xs font-black uppercase ${
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : isFailed
                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    {delivery.status.replace(/_/g, " ")}
                  </span>
                  {delivery.priority === "urgent" && (
                    <span className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-black text-rose-500 uppercase">
                      URGENT
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold text-muted block">Rider Payout</span>
                  <span className="text-xl font-black text-emerald-500">৳{delivery.deliveryFee ?? 60}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted block">Est. Distance</span>
                  <span className="text-base font-black text-foreground">{delivery.estimatedDistance ?? "3.5"} km</span>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
              {STATUS_FLOW.map((step, idx) => {
                const isPast = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition ${
                        isPast
                          ? isCurrent
                            ? "bg-primary text-white ring-4 ring-primary/20"
                            : "bg-emerald-500 text-white"
                          : "bg-muted-bg text-muted border border-border"
                      }`}
                    >
                      {isPast && !isCurrent ? "✓" : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-bold capitalize ${
                        isCurrent ? "text-primary font-black" : isPast ? "text-foreground" : "text-muted"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons for Next State */}
            {!isCompleted && !isFailed && (
              <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-muted">Advance to Next Mission Stage:</span>

                <div className="flex flex-wrap items-center gap-2">
                  {delivery.status === "assigned" && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate("pickup_started")}
                      disabled={updating}
                      className="rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white hover:bg-primary-hover transition cursor-pointer"
                    >
                      🚀 Start Heading to Merchant Store
                    </button>
                  )}

                  {delivery.status === "pickup_started" && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate("picked_up")}
                      disabled={updating}
                      className="rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white hover:bg-primary-hover transition cursor-pointer"
                    >
                      📦 Confirm Package Received & Picked Up
                    </button>
                  )}

                  {delivery.status === "picked_up" && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate("in_transit")}
                      disabled={updating}
                      className="rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white hover:bg-primary-hover transition cursor-pointer"
                    >
                      🚚 Mark In Transit to Customer
                    </button>
                  )}

                  {delivery.status === "in_transit" && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate("out_for_delivery")}
                      disabled={updating}
                      className="rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white hover:bg-primary-hover transition cursor-pointer"
                    >
                      📍 Arrived at Customer Destination
                    </button>
                  )}

                  {delivery.status === "out_for_delivery" && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtpModal(true);
                        setOtpInput("");
                        setOtpError(null);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                    >
                      <FaKey size={11} />
                      <span>Enter Customer Delivery OTP</span>
                    </button>
                  )}

                  <Link
                    href={`/dashboard/delivery/incidents?deliveryId=${delivery.id}`}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition"
                  >
                    ⚠️ Report Delivery Incident
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Panel>

        {/* Addresses & Contacts Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Pickup Address */}
          <Panel title="🏪 Store / Pickup Details">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted block text-[10px] font-bold uppercase mb-1">Merchant Store Location</span>
                <p className="font-bold text-foreground text-sm">{delivery.pickupAddress || "Merchant Store On File"}</p>
              </div>
              {delivery.pickupContact && (
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase mb-1">Merchant Contact Phone</span>
                  <a
                    href={`tel:${delivery.pickupContact}`}
                    className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
                  >
                    <FaPhone size={10} /> {delivery.pickupContact}
                  </a>
                </div>
              )}
              {delivery.sellerNotes && (
                <div className="rounded-xl bg-surface/80 border border-border/40 p-3">
                  <span className="text-muted block text-[10px] font-bold uppercase mb-1">Seller Pickup Instructions</span>
                  <p className="font-medium text-foreground">{delivery.sellerNotes}</p>
                </div>
              )}
            </div>
          </Panel>

          {/* Delivery Destination */}
          <Panel title="🏠 Customer Destination">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted block text-[10px] font-bold uppercase mb-1">Delivery Destination</span>
                <p className="font-bold text-foreground text-sm">{delivery.deliveryAddress || "Customer Destination"}</p>
              </div>
              {delivery.deliveryContact && (
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase mb-1">Customer Phone</span>
                  <a
                    href={`tel:${delivery.deliveryContact}`}
                    className="inline-flex items-center gap-1.5 font-bold text-emerald-500 hover:underline"
                  >
                    <FaPhone size={10} /> {delivery.deliveryContact}
                  </a>
                </div>
              )}
              {delivery.packageInfo && (
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border/40">
                  <div>
                    <span className="text-muted">Weight:</span>{" "}
                    <strong>{delivery.packageInfo.weight ?? "1.0"} kg</strong>
                  </div>
                  <div>
                    <span className="text-muted">Fragile:</span>{" "}
                    <strong className={delivery.packageInfo.fragile ? "text-rose-500" : "text-foreground"}>
                      {delivery.packageInfo.fragile ? "YES" : "No"}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Order Items Summary */}
        {order && (
          <Panel title={`📦 Order Manifest (${order.items?.length || 0} Items)`}>
            <div className="divide-y divide-border/60 text-xs">
              {(order.items || []).map((item: any, idx: number) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">{item.title || `Item #${idx + 1}`}</p>
                    <p className="text-muted text-[11px]">Quantity: {item.quantity} × ৳{item.price?.toLocaleString()}</p>
                  </div>
                  <span className="font-black text-foreground">
                    ৳{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="pt-3 flex items-center justify-between font-black text-sm text-foreground">
                <span>Order Total</span>
                <span className="text-primary">৳{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </Panel>
        )}

        {/* Proof of Delivery Photo Upload */}
        <Panel title="📸 Proof of Delivery (Optional Photo)">
          <div className="space-y-4 text-xs">
            {delivery.deliveryProofImage ? (
              <div>
                <p className="text-emerald-500 font-bold mb-2">✓ Proof Photo on Record:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={delivery.deliveryProofImage}
                  alt="Proof of Delivery"
                  className="h-48 w-auto rounded-xl border border-border object-cover"
                />
              </div>
            ) : (
              <form onSubmit={handleProofUpload} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="rounded-xl border border-border bg-background p-2 text-xs text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-bold file:text-primary hover:file:bg-primary/20"
                />
                <button
                  type="submit"
                  disabled={!proofFile || uploadingProof}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition cursor-pointer disabled:opacity-50"
                >
                  <FaUpload size={10} />
                  <span>{uploadingProof ? "Uploading..." : "Upload Proof Photo"}</span>
                </button>
              </form>
            )}
          </div>
        </Panel>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-black text-base">
                <FaKey className="text-primary" />
                <span>Verify Handover OTP</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="text-muted hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted">
              Enter the 6-digit verification OTP provided by the customer to securely mark Order #{delivery.orderId.slice(-8).toUpperCase()} as delivered.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground">Customer 6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-widest text-2xl font-black py-3 rounded-xl border border-border bg-background text-foreground focus:border-primary outline-none"
              />
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
                {otpError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="px-4 py-2 text-xs font-bold text-muted hover:text-foreground rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtpSubmit}
                disabled={otpVerifying || otpInput.length < 6}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black hover:bg-emerald-600 transition disabled:opacity-50"
              >
                {otpVerifying ? "Verifying..." : "Confirm Delivery Handover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
