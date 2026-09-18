"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { deliveryManDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getReverseDeliveryById,
  generateReverseOtp,
  verifyReverseOtp,
  completeReversePickup,
  updateReverseDeliveryStatus,
  updateReverseDeliveryLocation,
  type ReverseDeliveryRequest,
  type ReturnRequest,
} from "@/lib/api/returns";
import { useDeliveryLiveTracking } from "@/hooks/delivery/useDeliveryLiveTracking";
import { LiveDeliveryMap } from "@/components/delivery/LiveDeliveryMap";
import {
  FiArrowLeft,
  FiMapPin,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiRefreshCw,
  FiSend,
} from "react-icons/fi";
import { FaMotorcycle } from "react-icons/fa";

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  available: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20", label: "Available" },
  assigned: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20", label: "Assigned" },
  accepted: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20", label: "Accepted" },
  pickup_started: { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-indigo-500/20", label: "Pickup Started" },
  picked_up: { bg: "bg-teal-500/10", text: "text-teal-600", border: "border-teal-500/20", label: "Picked Up" },
  in_transit: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20", label: "In Transit" },
  seller_received: { bg: "bg-pink-500/10", text: "text-pink-600", border: "border-pink-500/20", label: "Delivered" },
  failed: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20", label: "Failed" },
  cancelled: { bg: "bg-gray-500/10", text: "text-gray-600", border: "border-gray-500/20", label: "Cancelled" },
};

export default function ReverseDeliveryDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [data, setData] = useState<{ reverseDelivery: ReverseDeliveryRequest; returnRequest: ReturnRequest | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [pickupOtp, setPickupOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getReverseDeliveryById(id);
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load reverse delivery");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { currentLocation, trackingState, socketConnected, isJoined, secondsSinceLastUpdate } = useDeliveryLiveTracking({
    deliveryId: id,
    orderId: data?.reverseDelivery.orderId,
    initialStatus: data?.reverseDelivery.status,
    initialLocation: null,
  });

  const handleStatusUpdate = async (status: ReverseDeliveryRequest["status"], note?: string) => {
    if (!id) return;
    setActioning(true);
    setError(null);
    try {
      await updateReverseDeliveryStatus(id, status, { note });
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to update status");
    } finally {
      setActioning(false);
    }
  };

  const handleGenerateOtp = async () => {
    setActioning(true);
    setOtpError(null);
    setOtpMessage(null);
    try {
      const result = await generateReverseOtp(id);
      setPickupOtp(result.deliveryOtp);
      setOtpVerified(false);
      setOtpMessage("Share this OTP with the customer to verify pickup.");
    } catch (err: any) {
      setOtpError(err?.message || "Failed to generate pickup OTP");
    } finally {
      setActioning(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!pickupOtp.trim()) {
      setOtpError("Enter the customer OTP first");
      return;
    }
    setActioning(true);
    setOtpError(null);
    try {
      const result = await verifyReverseOtp(id, pickupOtp.trim());
      if (result.verified) {
        setOtpVerified(true);
        setOtpMessage("OTP verified. You can now mark the item picked up.");
      }
    } catch (err: any) {
      setOtpError(err?.message || "Invalid pickup OTP");
    } finally {
      setActioning(false);
    }
  };

  const handleCompletePickup = async () => {
    if (!otpVerified) {
      setOtpError("Verify the customer OTP before marking the item picked up");
      return;
    }
    setActioning(true);
    setError(null);
    try {
      await completeReversePickup(id, { note: "Product picked up successfully" });
      setOtpMessage(null);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to complete pickup");
    } finally {
      setActioning(false);
    }
  };

  const toggleGpsBroadcast = useCallback(() => {
    if (!id) return;

    if (isBroadcasting) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsBroadcasting(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    const broadcast = async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, speed, heading } = position.coords;
      try {
        await updateReverseDeliveryLocation(id, {
          latitude,
          longitude,
          accuracy: accuracy ?? undefined,
          speed: speed ?? undefined,
          heading: heading ?? undefined,
        });
      } catch (err: any) {
        console.error("Failed to broadcast location:", err?.message || err);
      }
    };

    const onError = (err: GeolocationPositionError) => {
      console.error("GPS broadcast error:", err.message);
      setIsBroadcasting(false);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      broadcast,
      onError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    setIsBroadcasting(true);
  }, [id, isBroadcasting]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <DashboardShell role="Delivery Man" title="Reverse Delivery" subtitle="Loading..." links={deliveryManDashboardLinks}>
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground">Loading Reverse Delivery...</h2>
        </div>
      </DashboardShell>
    );
  }

  if (error || !data) {
    return (
      <DashboardShell role="Delivery Man" title="Reverse Delivery" subtitle="Error" links={deliveryManDashboardLinks}>
        <div className="max-w-3xl mx-auto py-16 px-4 text-center">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
            <h1 className="text-2xl font-black text-foreground">Not Found</h1>
            <p className="mt-2 text-sm text-muted">{error || "This reverse delivery does not exist or you don't have access."}</p>
            <Link href="/dashboard/delivery/returns" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold">
              <FiArrowLeft /> Back to Returns
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const reverse = data.reverseDelivery;
  const ret = data.returnRequest;
  const style = STATUS_STYLES[reverse.status] || STATUS_STYLES.available;

  const canAccept = reverse.status === "available";
  const canStartPickup = reverse.status === "assigned" || reverse.status === "accepted";
  const canCompletePickup = reverse.status === "pickup_started";
  const canMarkInTransit = reverse.status === "picked_up";
  const canBroadcast = ["accepted", "pickup_started", "picked_up", "in_transit"].includes(reverse.status);

  return (
    <DashboardShell role="Delivery Man" title={`Reverse Delivery #${String(reverse.orderId).slice(-8).toUpperCase()}`} subtitle="Manage return pickup and delivery" links={deliveryManDashboardLinks}>
      <div className="max-w-5xl mx-auto space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-bold text-red-600">
            {error}
          </div>
        )}

        {/* Status Banner */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Current Status</span>
              <p className="text-2xl font-black text-foreground mt-1">{style.label}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
              {reverse.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <LiveDeliveryMap
            pickupAddress={reverse.customerAddress}
            deliveryAddress={reverse.sellerAddress}
            pickupCoordinates={currentLocation ? undefined : undefined}
            deliveryCoordinates={undefined}
            status={reverse.status}
            orderId={String(reverse.orderId)}
            deliveryId={reverse.id}
            riderName="You"
            trackingState={trackingState}
            secondsSinceLastUpdate={secondsSinceLastUpdate}
            riderLocation={currentLocation || undefined}
            height="h-72 sm:h-96"
            showControls={canBroadcast}
          />
          {canBroadcast && (
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={toggleGpsBroadcast}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                  isBroadcasting
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                }`}
              >
                <FiSend /> {isBroadcasting ? "Stop GPS Broadcast" : "Broadcast Route GPS"}
              </button>
              {isBroadcasting && (
                <span className="text-xs text-muted">
                  {socketConnected ? "🟢 Connected" : "🔴 Reconnecting"} | {trackingState}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Product & Address Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted mb-3 flex items-center gap-1.5">
              <FiPackage className="text-primary" /> Product
            </h3>
            <p className="text-sm font-bold text-foreground">{reverse.productTitle}</p>
            {ret && (
              <>
                <p className="text-xs text-muted mt-1">Return Reason: {ret.reason}</p>
                <p className="text-xs text-muted">Quantity: {ret.quantity}</p>
              </>
            )}
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted mb-3 flex items-center gap-1.5">
              <FiMapPin className="text-primary" /> Locations
            </h3>
            <p className="text-xs text-foreground font-medium">Pickup: {reverse.customerAddress}</p>
            <p className="text-xs text-foreground font-medium mt-1">Deliver to: {reverse.sellerAddress}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase text-muted mb-4">Status History</h3>
          <div className="space-y-3">
            {(reverse.statusHistory || []).slice().reverse().map((entry, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground capitalize">{entry.status.replace(/_/g, " ")}</p>
                  <p className="text-[10px] text-muted">{new Date(entry.at).toLocaleString()}</p>
                  {entry.note && <p className="text-[10px] text-muted">{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase text-muted mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {canAccept && (
              <button
                type="button"
                onClick={() => handleStatusUpdate("accepted", "Accepted by delivery partner")}
                disabled={actioning}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-500 text-white rounded-xl text-xs font-black hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
              >
                <FaMotorcycle /> Accept
              </button>
            )}
            {canStartPickup && (
              <button
                type="button"
                onClick={() => handleStatusUpdate("pickup_started", "Heading to customer for pickup")}
                disabled={actioning}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-xs font-black hover:bg-indigo-600 transition disabled:opacity-50 cursor-pointer"
              >
                <FaMotorcycle /> Start Pickup
              </button>
            )}
            {canCompletePickup && !otpVerified && (
              <div className="w-full rounded-xl border border-border bg-surface p-3 space-y-2">
                <p className="text-[11px] font-bold text-foreground">Pickup OTP verification</p>
                {otpMessage && <p className="text-[10px] text-emerald-600">{otpMessage}</p>}
                {otpError && <p className="text-[10px] text-red-600">{otpError}</p>}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateOtp}
                    disabled={actioning}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 text-white rounded-xl text-[11px] font-black hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
                  >
                    <FiCheckCircle /> Generate OTP
                  </button>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={pickupOtp}
                    onChange={(event) => setPickupOtp(event.target.value.replace(/\D/g, ""))}
                    placeholder="Customer OTP"
                    className="min-w-[130px] rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={actioning}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-500 text-white rounded-xl text-[11px] font-black hover:bg-indigo-600 transition disabled:opacity-50 cursor-pointer"
                  >
                    Verify OTP
                  </button>
                </div>
              </div>
            )}
            {canCompletePickup && otpVerified && (
              <button
                type="button"
                onClick={handleCompletePickup}
                disabled={actioning}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-500 text-white rounded-xl text-xs font-black hover:bg-teal-600 transition disabled:opacity-50 cursor-pointer"
              >
                <FiCheckCircle /> Mark Picked Up
              </button>
            )}
            {canMarkInTransit && (
              <button
                type="button"
                onClick={() => handleStatusUpdate("in_transit", "On the way to seller")}
                disabled={actioning}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-black hover:bg-orange-600 transition disabled:opacity-50 cursor-pointer"
              >
                <FaMotorcycle /> Mark In Transit
              </button>
            )}
            {(reverse.status === "assigned" || reverse.status === "accepted" || reverse.status === "pickup_started") && (
              <button
                type="button"
                onClick={() => handleStatusUpdate("cancelled", "Cancelled by delivery partner")}
                disabled={actioning}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition disabled:opacity-50 cursor-pointer"
              >
                <FiXCircle /> Cancel
              </button>
            )}
          </div>
        </div>

        <Link href="/dashboard/delivery/returns" className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-border bg-card text-foreground rounded-xl text-xs font-bold hover:bg-muted-bg transition">
          <FiArrowLeft /> Back to Returns
        </Link>
      </div>
    </DashboardShell>
  );
}
