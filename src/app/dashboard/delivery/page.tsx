"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { DashboardShell, StatCard, Panel } from "@/components/dashboard/DashboardUI";
import { deliveryManDashboardLinks } from "@/lib/constants/dashboard-nav";
import { useSession } from "@/lib/auth-client";
import {
  getDeliveryStats,
  getAvailableDeliveries,
  getMyDeliveries,
  setDeliveryAvailability,
  updateDeliveryLocation,
  acceptDelivery,
  updateDeliveryStatus,
  verifyDeliveryOtp,
  type DeliveryStats,
  type DeliveryRequest,
  type DeliveryManProfile,
  type DeliveryManDetails,
} from "@/lib/api/delivery";
import {
  FaSyncAlt,
  FaMotorcycle,
  FaStar,
  FaBox,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCompass,
  FaLocationArrow,
  FaArrowRight,
  FaShieldAlt,
  FaExclamationTriangle,
  FaRobot,
  FaPhone,
  FaKey,
} from "react-icons/fa";

export default function DeliveryDashboard() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<DeliveryManProfile | null>(null);
  const [details, setDetails] = useState<DeliveryManDetails | null>(null);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [availableDeliveries, setAvailableDeliveries] = useState<DeliveryRequest[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  // Live Location Broadcaster State
  const [isBroadcastingLocation, setIsBroadcastingLocation] = useState(false);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number; time: string } | null>(null);
  const [broadcasterError, setBroadcasterError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // OTP Verification Modal
  const [otpModalDelivery, setOtpModalDelivery] = useState<DeliveryRequest | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, availableRes, myRes] = await Promise.allSettled([
        getDeliveryStats(),
        getAvailableDeliveries(1, 10),
        getMyDeliveries({ limit: 10 }),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value) {
        setProfile(statsRes.value.profile ?? null);
        setDetails(statsRes.value.details ?? null);
        setStats(statsRes.value.stats ?? null);
      }
      if (availableRes.status === "fulfilled" && availableRes.value) {
        setAvailableDeliveries(availableRes.value.items ?? availableRes.value.data ?? []);
      }
      if (myRes.status === "fulfilled" && myRes.value) {
        setMyDeliveries(myRes.value.items ?? myRes.value.data ?? []);
      }
    } catch (error) {
      console.error("Failed to load delivery data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Live GPS Broadcaster
  const toggleLocationBroadcasting = () => {
    if (isBroadcastingLocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsBroadcastingLocation(false);
      setBroadcasterError(null);
    } else {
      if (!("geolocation" in navigator)) {
        setBroadcasterError("Geolocation is not supported by your browser.");
        return;
      }

      setIsBroadcastingLocation(true);
      setBroadcasterError(null);

      const activeMission = myDeliveries.find((d) =>
        ["assigned", "pickup_started", "picked_up", "in_transit", "out_for_delivery"].includes(d.status)
      );

      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy, speed, heading } = position.coords;
          setLastCoords({
            lat: latitude,
            lng: longitude,
            time: new Date().toLocaleTimeString(),
          });
          try {
            await updateDeliveryLocation({
              latitude,
              longitude,
              accuracy: accuracy || undefined,
              speed: speed || undefined,
              heading: heading || undefined,
              deliveryRequestId: activeMission?.id,
            });
          } catch (err) {
            console.error("GPS upload error:", err);
          }
        },
        (err) => {
          console.warn("Geolocation watch error:", err.message);
          setBroadcasterError(`GPS Signal Error: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
      );

      watchIdRef.current = id;
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleAvailabilityToggle = async (newStatus: "offline" | "available" | "busy") => {
    try {
      await setDeliveryAvailability({
        availabilityStatus: newStatus,
        isActive: newStatus !== "offline",
      });
      loadDashboardData();
    } catch (err: any) {
      alert(err?.message || "Failed to update availability");
    }
  };

  const handleAcceptOrder = async (orderRequestId: string) => {
    setAcceptingId(orderRequestId);
    try {
      const res = await acceptDelivery(orderRequestId);
      alert(`🎉 Order accepted successfully! Delivery OTP: ${res.deliveryOtp || "Generated"}`);
      loadDashboardData();
    } catch (err: any) {
      alert(err?.message || "This delivery order could not be accepted.");
      loadDashboardData();
    } finally {
      setAcceptingId(null);
    }
  };

  const handleAdvanceMission = async (deliveryId: string, nextStatus: DeliveryRequest["status"]) => {
    setAdvancingId(deliveryId);
    try {
      await updateDeliveryStatus(deliveryId, nextStatus);
      loadDashboardData();
    } catch (err: any) {
      alert(err?.message || "Failed to update delivery mission status.");
    } finally {
      setAdvancingId(null);
    }
  };

  const handleVerifyOtpSubmit = async () => {
    if (!otpModalDelivery || !otpInput.trim()) return;
    setOtpVerifying(true);
    setOtpError(null);
    try {
      await verifyDeliveryOtp(otpModalDelivery.id, otpInput.trim());
      alert("✅ OTP verified successfully! Order marked as DELIVERED.");
      setOtpModalDelivery(null);
      setOtpInput("");
      loadDashboardData();
    } catch (err: any) {
      setOtpError(err?.message || "Invalid OTP code. Please check with customer.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Find most urgent active delivery mission
  const activeMission = myDeliveries.find((d) =>
    ["assigned", "pickup_started", "picked_up", "in_transit", "out_for_delivery"].includes(d.status)
  );

  const getNextStatusAction = (currentStatus: string): { nextStatus: DeliveryRequest["status"]; label: string } | null => {
    switch (currentStatus) {
      case "assigned":
        return { nextStatus: "pickup_started", label: "Start Heading to Store" };
      case "pickup_started":
        return { nextStatus: "picked_up", label: "Confirm Items Picked Up" };
      case "picked_up":
        return { nextStatus: "in_transit", label: "Start Transit to Customer" };
      case "in_transit":
        return { nextStatus: "out_for_delivery", label: "Arrived at Customer Location" };
      default:
        return null;
    }
  };

  const isApproved = profile?.status === "approved";
  const currentAvailability = details?.availabilityStatus ?? stats?.availabilityStatus ?? "offline";

  return (
    <DashboardShell
      role="Delivery Man"
      title="Delivery Operations Cockpit"
      subtitle="Manage real-time delivery dispatches, broadcast live telemetry, and track daily earnings."
      links={deliveryManDashboardLinks}
    >
      <div className="space-y-6">
        {/* Verification Alert Banner if Not Approved */}
        {profile && !isApproved && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs">
            <div className="flex items-center gap-3">
              <FaShieldAlt className="text-xl text-amber-500 shrink-0" />
              <div>
                <p className="font-bold text-amber-600 dark:text-amber-400">
                  Account Status: {profile.status.replace(/_/g, " ").toUpperCase()}
                </p>
                <p className="text-muted mt-0.5">
                  {profile.status === "pending_verification"
                    ? "Your identity and vehicle documents are currently under review by the ShopNest Admin Team."
                    : profile.status === "rejected"
                    ? `Application rejected: ${profile.rejectionReason || "Please update your profile information."}`
                    : "Your delivery account is currently suspended. Please contact platform support."}
                </p>
              </div>
              <Link
                href="/delivery/pending"
                className="ml-auto shrink-0 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition"
              >
                View Status →
              </Link>
            </div>
          </div>
        )}

        {/* Top Control Bar: Availability & Live GPS Broadcaster */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          {/* Availability Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted mr-1">Rider Status:</span>
            <button
              type="button"
              onClick={() => handleAvailabilityToggle("available")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition cursor-pointer ${
                currentAvailability === "available"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "bg-surface border border-border text-muted hover:text-text hover:border-emerald-500/40"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>Available</span>
            </button>
            <button
              type="button"
              onClick={() => handleAvailabilityToggle("busy")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition cursor-pointer ${
                currentAvailability === "busy"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  : "bg-surface border border-border text-muted hover:text-text hover:border-amber-500/40"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              <span>On Delivery (Busy)</span>
            </button>
            <button
              type="button"
              onClick={() => handleAvailabilityToggle("offline")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition cursor-pointer ${
                currentAvailability === "offline"
                  ? "bg-slate-600 text-white shadow-md"
                  : "bg-surface border border-border text-muted hover:text-text"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span>Offline</span>
            </button>
          </div>

          {/* GPS Broadcaster Switch & Refresh */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleLocationBroadcasting}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition cursor-pointer border ${
                isBroadcastingLocation
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500 animate-pulse"
                  : "border-border bg-surface text-muted hover:text-text hover:border-primary"
              }`}
              title="Broadcast your live GPS position for customer delivery tracking"
            >
              <FaLocationArrow className={isBroadcastingLocation ? "text-emerald-500 rotate-45" : "text-muted"} />
              <span>{isBroadcastingLocation ? "Live GPS Active" : "Enable Live GPS"}</span>
              {lastCoords && isBroadcastingLocation && (
                <span className="text-[10px] text-muted ml-1">({lastCoords.time})</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                loadDashboardData();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-text hover:border-primary transition cursor-pointer"
            >
              <FaSyncAlt className={`text-primary ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {broadcasterError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500">
            <FaExclamationTriangle className="inline mr-1.5" />
            {broadcasterError}
          </div>
        )}

        {/* Real KPI Stat Tiles */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<FaMoneyBillWave className="text-emerald-500" />}
            label="Today's Earnings"
            value={`৳${stats?.todayEarnings?.toLocaleString() ?? "0"}`}
            note={`Total lifetime: ৳${stats?.totalEarnings?.toLocaleString() ?? "0"}`}
          />
          <StatCard
            icon={<FaMotorcycle className="text-primary" />}
            label="Active Deliveries"
            value={String(stats?.activeDeliveries ?? 0)}
            note={`${stats?.todayDeliveries ?? 0} deliveries completed today`}
          />
          <StatCard
            icon={<FaCheckCircle className="text-emerald-500" />}
            label="Completed Deliveries"
            value={String(stats?.completedDeliveries ?? 0)}
            note={`${stats?.failedDeliveries ?? 0} failed / canceled`}
          />
          <StatCard
            icon={<FaStar className="text-amber-500" />}
            label="Rider Rating"
            value={stats?.rating ? `${stats.rating.toFixed(1)} ★` : "5.0 ★"}
            note={`${stats?.ratingCount ?? 0} verified customer reviews`}
          />
        </div>

        {/* Active Delivery Cockpit (If there is an active mission) */}
        {activeMission && (
          <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-lg shadow-primary/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white text-xl shadow-md shadow-primary/20 animate-bounce">
                  <FaMotorcycle />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-primary tracking-wider">Active Mission</span>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary uppercase">
                      {activeMission.status.replace(/_/g, " ")}
                    </span>
                    {activeMission.priority === "urgent" && (
                      <span className="rounded-md bg-rose-500/10 text-rose-500 px-2 py-0.5 text-[10px] font-black uppercase border border-rose-500/30">
                        URGENT
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-foreground">
                    Order #{String(activeMission.orderId).slice(-8).toUpperCase()}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-[11px] font-bold text-muted block">Delivery Fee</span>
                  <span className="text-lg font-black text-emerald-500">৳{activeMission.deliveryFee ?? 60}</span>
                </div>
                <Link
                  href={`/dashboard/delivery/requests/${activeMission.id}`}
                  className="rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition"
                >
                  Mission Details →
                </Link>
              </div>
            </div>

            {/* Addresses and Action Buttons */}
            <div className="grid gap-4 sm:grid-cols-2 mt-4 text-xs">
              <div className="rounded-xl border border-border/60 bg-surface/60 p-3.5">
                <span className="text-muted block font-bold mb-1 flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-amber-500" /> Store / Pickup Address
                </span>
                <p className="font-bold text-foreground line-clamp-2">
                  {activeMission.pickupAddress || "Merchant Store Location"}
                </p>
                {activeMission.pickupContact && (
                  <p className="text-muted mt-1 flex items-center gap-1">
                    <FaPhone size={9} /> {activeMission.pickupContact}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-border/60 bg-surface/60 p-3.5">
                <span className="text-muted block font-bold mb-1 flex items-center gap-1.5">
                  <FaCompass className="text-emerald-500" /> Customer / Drop Address
                </span>
                <p className="font-bold text-foreground line-clamp-2">
                  {activeMission.deliveryAddress || "Customer Delivery Destination"}
                </p>
                {activeMission.deliveryContact && (
                  <p className="text-muted mt-1 flex items-center gap-1">
                    <FaPhone size={9} /> {activeMission.deliveryContact}
                  </p>
                )}
              </div>
            </div>

            {/* Step Action & OTP Trigger */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="font-bold text-foreground">Mission State:</span>
                <span className="capitalize">{activeMission.status.replace(/_/g, " ")}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Next Step Progression */}
                {(() => {
                  const nextAction = getNextStatusAction(activeMission.status);
                  if (nextAction) {
                    return (
                      <button
                        type="button"
                        onClick={() => handleAdvanceMission(activeMission.id, nextAction.nextStatus)}
                        disabled={advancingId === activeMission.id}
                        className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition cursor-pointer disabled:opacity-50"
                      >
                        <FaArrowRight size={10} />
                        <span>{advancingId === activeMission.id ? "Advancing..." : nextAction.label}</span>
                      </button>
                    );
                  }
                  return null;
                })()}

                {/* OTP Verification Prompt when Out for Delivery */}
                {activeMission.status === "out_for_delivery" && (
                  <button
                    type="button"
                    onClick={() => {
                      setOtpModalDelivery(activeMission);
                      setOtpInput("");
                      setOtpError(null);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <FaKey size={11} />
                    <span>Enter Customer Delivery OTP</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Grid: Available Marketplace Feed & AI Copilot Preview */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Open Available Deliveries Marketplace */}
          <Panel
            title="📍 Available Marketplace Deliveries"
            action={
              <Link href="/dashboard/delivery/available" className="text-xs font-bold text-primary hover:underline">
                Explore All ({availableDeliveries.length}) →
              </Link>
            }
          >
            {availableDeliveries.length === 0 ? (
              <div className="py-12 text-center">
                <FaBox className="mx-auto text-4xl text-muted/40 mb-3" />
                <h4 className="text-sm font-bold text-foreground">No Open Deliveries in Queue</h4>
                <p className="text-xs text-muted max-w-sm mx-auto mt-1">
                  When sellers mark orders &quot;Ready for Pickup&quot;, open delivery jobs will appear here in real-time.
                </p>
                <button
                  type="button"
                  onClick={loadDashboardData}
                  className="mt-4 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-text hover:border-primary transition cursor-pointer"
                >
                  Check Again
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {availableDeliveries.slice(0, 5).map((delivery) => (
                  <div
                    key={delivery.id}
                    className="rounded-2xl border border-border bg-surface/50 p-4 text-xs transition hover:border-primary/40 hover:bg-surface/80"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-foreground">Order #{delivery.orderId.slice(-8).toUpperCase()}</span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                            delivery.priority === "urgent"
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                          }`}
                        >
                          {delivery.priority}
                        </span>
                      </div>
                      <span className="text-base font-black text-emerald-500">৳{delivery.deliveryFee ?? 60}</span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 text-muted my-2">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-muted">Pickup</span>
                        <p className="text-foreground font-medium truncate">{delivery.pickupAddress || "Store location"}</p>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-muted">Destination</span>
                        <p className="text-foreground font-medium truncate">{delivery.deliveryAddress || "Customer address"}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-2">
                      <span className="text-[10px] text-muted">
                        Distance: ~{delivery.estimatedDistance ?? "3.5"} km
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/delivery/requests/${delivery.id}`}
                          className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold text-text hover:border-primary transition"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleAcceptOrder(delivery.id)}
                          disabled={acceptingId === delivery.id || !isApproved}
                          className="rounded-lg bg-primary px-3.5 py-1.5 text-[11px] font-black text-white hover:bg-primary-hover transition cursor-pointer disabled:opacity-50"
                        >
                          {acceptingId === delivery.id ? "Accepting..." : "Accept Job"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* AI Delivery Copilot Widget */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white text-sm shadow-sm">
                  <FaRobot />
                </div>
                <div>
                  <h4 className="font-black text-foreground text-sm">AI Delivery Copilot</h4>
                  <p className="text-[11px] text-muted">Intelligent route & workload assistance</p>
                </div>
              </div>

              <p className="text-xs text-muted mb-4 leading-relaxed">
                Get real-time insights on high-demand zones, vehicle capacity limits, and safety recommendations.
              </p>

              <div className="space-y-2">
                <Link
                  href="/dashboard/delivery/copilot"
                  className="block w-full rounded-xl bg-primary px-3.5 py-2.5 text-center text-xs font-black text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition"
                >
                  Open AI Delivery Copilot →
                </Link>

                <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                  <Link
                    href="/dashboard/delivery/incidents"
                    className="rounded-xl border border-border bg-surface p-2 font-bold text-text hover:border-primary transition"
                  >
                    ⚠️ Report Incident
                  </Link>
                  <Link
                    href="/dashboard/delivery/profile"
                    className="rounded-xl border border-border bg-surface p-2 font-bold text-text hover:border-primary transition"
                  >
                    ⚙️ Fleet Settings
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <Panel title="⚡ Operations Shortcut">
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <Link
                  href="/dashboard/delivery/my-deliveries"
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface/50 p-3 text-center font-bold text-text hover:border-primary transition"
                >
                  <FaMotorcycle className="text-primary text-base" />
                  <span>My Deliveries</span>
                </Link>
                <Link
                  href="/dashboard/delivery/available"
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface/50 p-3 text-center font-bold text-text hover:border-primary transition"
                >
                  <FaMapMarkerAlt className="text-emerald-500 text-base" />
                  <span>Marketplace</span>
                </Link>
                <Link
                  href="/dashboard/delivery/copilot"
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface/50 p-3 text-center font-bold text-text hover:border-primary transition"
                >
                  <FaRobot className="text-indigo-500 text-base" />
                  <span>AI Advisor</span>
                </Link>
                <Link
                  href="/dashboard/delivery/profile"
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface/50 p-3 text-center font-bold text-text hover:border-primary transition"
                >
                  <FaShieldAlt className="text-amber-500 text-base" />
                  <span>KYC Documents</span>
                </Link>
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {otpModalDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-black text-base">
                <FaKey className="text-primary" />
                <span>Verify Delivery OTP</span>
              </div>
              <button
                type="button"
                onClick={() => setOtpModalDelivery(null)}
                className="text-muted hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted">
              Ask the customer for the 6-digit OTP displayed on their ShopNest order tracking screen to securely confirm handover.
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
                onClick={() => setOtpModalDelivery(null)}
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
