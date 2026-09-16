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
  acceptDelivery,
  updateDeliveryStatus,
  verifyDeliveryOtp,
  uploadDeliveryProof,
  reportDeliveryIncident,
  askDeliveryCopilot,
  type DeliveryStats,
  type DeliveryRequest,
  type DeliveryManProfile,
  type DeliveryManDetails,
  type DeliveryCopilotResponse,
} from "@/lib/api/delivery";
import { getDeliverySocket } from "@/lib/socket/delivery-socket";
import { LiveDeliveryMap } from "@/components/delivery/LiveDeliveryMap";
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
  FaKey,
  FaCamera,
  FaTruckLoading,
  FaWeightHanging,
  FaStore,
  FaHome,
  FaTimes,
  FaInfoCircle,
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

  // Active view tab
  const [activeTab, setActiveTab] = useState<"missions" | "available" | "map" | "copilot">("missions");

  // Selected mission for Live Map focus
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  // Live Location Broadcaster State (Socket.IO Realtime)
  const [isBroadcastingLocation, setIsBroadcastingLocation] = useState(false);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number; time: string; speed?: number } | null>(null);
  const [broadcasterError, setBroadcasterError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Modals state
  const [otpModalDelivery, setOtpModalDelivery] = useState<DeliveryRequest | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const [proofModalDelivery, setProofModalDelivery] = useState<DeliveryRequest | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUploading, setProofUploading] = useState(false);

  const [incidentModalDelivery, setIncidentModalDelivery] = useState<DeliveryRequest | null>(null);
  const [incidentCategory, setIncidentCategory] = useState("customer_unavailable");
  const [incidentSeverity, setIncidentSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [incidentReporting, setIncidentReporting] = useState(false);

  // Quick AI Copilot Assistant State
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState<DeliveryCopilotResponse | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, availableRes, myRes] = await Promise.allSettled([
        getDeliveryStats(),
        getAvailableDeliveries(1, 15),
        getMyDeliveries({ limit: 15 }),
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
        const items = myRes.value.items ?? myRes.value.data ?? [];
        setMyDeliveries(items);
        if (items.length > 0 && !selectedMissionId) {
          const active = items.find((d) =>
            ["assigned", "pickup_started", "picked_up", "in_transit", "out_for_delivery"].includes(d.status)
          );
          if (active) setSelectedMissionId(active.id);
        }
      }
    } catch (error) {
      console.error("Failed to load delivery data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedMissionId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Active deliveries list
  const activeMissions = myDeliveries.filter((d) =>
    ["assigned", "pickup_started", "picked_up", "in_transit", "out_for_delivery"].includes(d.status)
  );

  const selectedMission = activeMissions.find((d) => d.id === selectedMissionId) || activeMissions[0] || null;

  // Capacity calculations
  const maxParcels = details?.preferences?.maxActiveDeliveries ?? details?.vehicle?.vehicleCapacity ?? 3;
  const currentParcelCount = activeMissions.length;
  const vType = details?.vehicle?.vehicleType || "motorcycle";
  const maxWeightKg = details?.vehicle?.vehicleCapacity
    ? details.vehicle.vehicleCapacity * 5
    : vType === "van"
    ? 50
    : vType === "car"
    ? 30
    : vType === "motorcycle"
    ? 20
    : vType === "bicycle"
    ? 10
    : 15;
  const currentLoadedWeight = activeMissions.reduce((sum, d) => sum + (d.packageInfo?.weight || 0), 0);
  const remainingWeight = Math.max(0, maxWeightKg - currentLoadedWeight);

  // Live GPS Broadcaster (Adaptive Socket.IO)
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

      const socket = getDeliverySocket();

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, speed, heading, altitude } = position.coords;
          setLastCoords({
            lat: latitude,
            lng: longitude,
            time: new Date().toLocaleTimeString(),
            speed: speed ? Math.round(speed * 3.6) : undefined, // km/h
          });

          // Broadcast through Socket.IO real-time channel
          if (socket.connected) {
            socket.emit("location:update", {
              latitude,
              longitude,
              accuracy: accuracy || undefined,
              altitude: altitude || undefined,
              speed: speed || undefined,
              heading: heading || undefined,
              deliveryRequestId: selectedMission?.id,
            });
          }
        },
        (err) => {
          console.warn("Geolocation watch warning:", err.message);
          setBroadcasterError(`GPS Signal: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
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

  // Availability Toggle
  const handleToggleOnline = async () => {
    const newStatus = details?.availabilityStatus === "offline" ? "available" : "offline";
    try {
      const res = await setDeliveryAvailability({ availabilityStatus: newStatus });
      setDetails((prev) =>
        prev
          ? {
              ...prev,
              availabilityStatus: (res.availabilityStatus as any) || newStatus,
              isActive: res.isActive,
            }
          : null
      );
    } catch (err: any) {
      alert(err?.message || "Failed to update availability");
    }
  };

  // Accept Open Marketplace Request
  const handleAcceptDelivery = async (reqId: string) => {
    setAcceptingId(reqId);
    try {
      await acceptDelivery(reqId);
      await loadDashboardData();
      setActiveTab("missions");
    } catch (err: any) {
      alert(err?.message || "Failed to accept delivery request.");
      loadDashboardData();
    } finally {
      setAcceptingId(null);
    }
  };

  // Lifecycle Advance Milestone
  const handleAdvanceMilestone = async (delivery: DeliveryRequest) => {
    const nextStatusMap: Record<string, DeliveryRequest["status"]> = {
      assigned: "pickup_started",
      pickup_started: "picked_up",
      picked_up: "in_transit",
      in_transit: "out_for_delivery",
    };

    const nextStatus = nextStatusMap[delivery.status];

    if (delivery.status === "out_for_delivery") {
      setOtpModalDelivery(delivery);
      setOtpInput("");
      setOtpError(null);
      return;
    }

    if (!nextStatus) return;

    setAdvancingId(delivery.id);
    try {
      await updateDeliveryStatus(delivery.id, nextStatus);
      await loadDashboardData();
    } catch (err: any) {
      alert(err?.message || "Failed to advance milestone.");
    } finally {
      setAdvancingId(null);
    }
  };

  // OTP Verification
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpModalDelivery || !otpInput.trim()) return;

    setOtpVerifying(true);
    setOtpError(null);
    try {
      await verifyDeliveryOtp(otpModalDelivery.id, otpInput.trim());
      setOtpModalDelivery(null);
      await loadDashboardData();
    } catch (err: any) {
      setOtpError(err?.message || "Invalid OTP code. Please check with customer.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Upload Proof of Delivery
  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofModalDelivery || !proofFile) return;

    setProofUploading(true);
    try {
      await uploadDeliveryProof(proofModalDelivery.id, proofFile);
      setProofModalDelivery(null);
      setProofFile(null);
      alert("Proof of delivery photo recorded successfully!");
      await loadDashboardData();
    } catch (err: any) {
      alert(err?.message || "Failed to upload proof photo");
    } finally {
      setProofUploading(false);
    }
  };

  // Report Delivery Incident
  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentModalDelivery || !incidentDesc.trim()) return;

    setIncidentReporting(true);
    try {
      await reportDeliveryIncident(incidentModalDelivery.id, {
        category: incidentCategory,
        severity: incidentSeverity,
        description: incidentDesc.trim(),
      });
      setIncidentModalDelivery(null);
      setIncidentDesc("");
      alert("Incident report submitted to administration and merchant.");
      await loadDashboardData();
    } catch (err: any) {
      alert(err?.message || "Failed to submit incident report");
    } finally {
      setIncidentReporting(false);
    }
  };

  // Copilot query
  const handleAskCopilot = async (q?: string) => {
    const query = q || copilotQuery;
    if (!query.trim()) return;
    setCopilotLoading(true);
    try {
      const res = await askDeliveryCopilot(query);
      setCopilotResponse(res);
    } catch (err: any) {
      alert(err?.message || "AI Delivery Copilot is unavailable at this moment.");
    } finally {
      setCopilotLoading(false);
    }
  };

  const isApproved = profile?.status === "approved";
  const isOnline = details?.availabilityStatus === "available" || details?.availabilityStatus === "busy";

  return (
    <DashboardShell
      role="delivery"
      title="Delivery Command Center"
      subtitle="Real-time Logistics Telemetry, Active Missions & Marketplace"
      links={deliveryManDashboardLinks}
      action={
        <button
          onClick={() => {
            setRefreshing(true);
            loadDashboardData();
          }}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground hover:bg-muted-bg rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* ─── Top Rider Status Bar ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center font-black text-xl shadow-md">
                {details?.personal?.fullName ? details.personal.fullName.charAt(0) : "R"}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
                  isOnline ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-foreground">
                  {details?.personal?.fullName || session?.user?.name || "Delivery Partner"}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isApproved
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {profile?.status ? profile.status.replace(/_/g, " ") : "Pending Verification"}
                </span>
              </div>
              <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <FaMotorcycle className="text-primary text-xs" />
                  {details?.vehicle?.vehicleType ? details.vehicle.vehicleType.toUpperCase() : "STANDARD"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <FaStar className="text-xs" />
                  {details?.rating ? details.rating.toFixed(1) : "5.0"} ({details?.ratingCount || 0})
                </span>
              </p>
            </div>
          </div>

          {/* Right Controls: Online Toggle & GPS Broadcaster */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live GPS Broadcaster Toggle */}
            <button
              onClick={toggleLocationBroadcasting}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isBroadcastingLocation
                  ? "bg-emerald-600 text-white animate-pulse"
                  : "bg-card border border-border text-foreground hover:bg-muted-bg"
              }`}
            >
              <FaLocationArrow className={isBroadcastingLocation ? "animate-bounce" : ""} />
              <span>{isBroadcastingLocation ? "Broadcasting GPS" : "Start Live GPS"}</span>
            </button>

            {/* Online / Offline Switch */}
            <button
              onClick={handleToggleOnline}
              disabled={!isApproved}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
                isOnline
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-slate-500/10 text-slate-500 border border-slate-500/30 hover:bg-slate-500/20"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
              <span>{isOnline ? "ONLINE (READY)" : "OFFLINE"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Capacity Meter */}
        <div className="mt-5 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-muted-bg/60 p-3 rounded-xl border border-border/50">
            <div className="flex items-center justify-between text-muted mb-1">
              <span className="font-semibold flex items-center gap-1.5">
                <FaBox className="text-primary text-xs" /> Active Parcels
              </span>
              <span className="font-bold text-foreground">
                {currentParcelCount} / {maxParcels}
              </span>
            </div>
            <div className="w-full bg-border h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  currentParcelCount >= maxParcels ? "bg-red-500" : "bg-primary"
                }`}
                style={{ width: `${Math.min(100, (currentParcelCount / maxParcels) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-muted-bg/60 p-3 rounded-xl border border-border/50">
            <div className="flex items-center justify-between text-muted mb-1">
              <span className="font-semibold flex items-center gap-1.5">
                <FaWeightHanging className="text-amber-500 text-xs" /> Weight Load
              </span>
              <span className="font-bold text-foreground">
                {currentLoadedWeight}kg / {maxWeightKg}kg
              </span>
            </div>
            <div className="w-full bg-border h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  currentLoadedWeight >= maxWeightKg ? "bg-red-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, (currentLoadedWeight / maxWeightKg) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-muted-bg/60 p-3 rounded-xl border border-border/50 flex items-center justify-between">
            <div>
              <span className="text-muted block font-semibold text-[11px]">Free Capacity</span>
              <span className="text-sm font-black text-foreground">{remainingWeight} kg</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                remainingWeight > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
              }`}
            >
              {remainingWeight > 0 ? "AVAILABLE" : "FULL"}
            </span>
          </div>

          <div className="bg-muted-bg/60 p-3 rounded-xl border border-border/50 flex items-center justify-between">
            <div>
              <span className="text-muted block font-semibold text-[11px]">Telemetry State</span>
              <span className="text-sm font-black text-foreground">
                {lastCoords ? `${lastCoords.speed || 0} km/h` : "Stationary"}
              </span>
            </div>
            <span className="text-[10px] text-muted">{lastCoords ? lastCoords.time : "GPS Standby"}</span>
          </div>
        </div>

        {broadcasterError && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
            <FaExclamationTriangle />
            <span>{broadcasterError}</span>
          </div>
        )}
      </div>

      {/* ─── Today's Operational Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Completed"
          value={stats?.todayDeliveries ?? 0}
          icon={<FaCheckCircle className="text-emerald-500" />}
          note={`${stats?.completedDeliveries ?? 0} all-time`}
        />
        <StatCard
          label="Active Missions"
          value={activeMissions.length}
          icon={<FaBox className="text-primary" />}
          note={`${availableDeliveries.length} available requests`}
        />
        <StatCard
          label="Today's Delivery Fees"
          value={stats?.todayEarnings ? `৳${stats.todayEarnings.toLocaleString()}` : "৳0"}
          icon={<FaMoneyBillWave className="text-emerald-500" />}
          note={stats?.totalEarnings ? `৳${stats.totalEarnings.toLocaleString()} total` : "Live fees"}
        />
        <StatCard
          label="Avg. Delivery Time"
          value={stats?.avgDeliveryTimeMinutes ? `${stats.avgDeliveryTimeMinutes}m` : "Under 30m"}
          icon={<FaCompass className="text-amber-500" />}
          note="On-time dispatch"
        />
      </div>

      {/* ─── Main Tabs Switcher ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("missions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "missions"
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:text-foreground hover:bg-muted-bg"
          }`}
        >
          <FaTruckLoading />
          <span>Active Missions ({activeMissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("available")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "available"
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:text-foreground hover:bg-muted-bg"
          }`}
        >
          <FaStore />
          <span>Open Marketplace ({availableDeliveries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("map")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "map"
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:text-foreground hover:bg-muted-bg"
          }`}
        >
          <FaMapMarkerAlt />
          <span>Live Cockpit Map</span>
        </button>

        <button
          onClick={() => setActiveTab("copilot")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "copilot"
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:text-foreground hover:bg-muted-bg"
          }`}
        >
          <FaRobot />
          <span>AI Copilot</span>
        </button>
      </div>

      {/* ─── TAB 1: ACTIVE MISSIONS BOARD ────────────────────────────────────── */}
      {activeTab === "missions" && (
        <div className="space-y-6">
          {activeMissions.length === 0 ? (
            <Panel title="Active Delivery Missions">
              <div className="py-12 text-center">
                <FaBox className="w-12 h-12 text-muted/40 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-foreground">No Active Deliveries in Progress</h3>
                <p className="text-xs text-muted max-w-sm mx-auto mt-1 mb-4">
                  You currently have no assigned delivery assignments. Check the open marketplace to claim new deliveries.
                </p>
                <button
                  onClick={() => setActiveTab("available")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  <FaStore /> Browse Open Requests
                </button>
              </div>
            </Panel>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mission Cards List */}
              <div className="lg:col-span-2 space-y-4">
                {activeMissions.map((mission, idx) => {
                  const isSelected = selectedMission?.id === mission.id;
                  return (
                    <div
                      key={mission.id}
                      onClick={() => setSelectedMissionId(mission.id)}
                      className={`rounded-2xl border transition-all p-5 cursor-pointer ${
                        isSelected
                          ? "border-primary bg-card shadow-md ring-2 ring-primary/20"
                          : "border-border bg-card hover:border-primary/50 shadow-sm"
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-sm text-foreground">Order #{mission.orderId}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              mission.priority === "urgent"
                                ? "bg-red-500/10 text-red-600"
                                : mission.priority === "high"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-blue-500/10 text-blue-600"
                            }`}
                          >
                            {mission.priority}
                          </span>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                          ৳{mission.deliveryFee || 60} Fee
                        </span>
                      </div>

                      {/* Route Locations */}
                      <div className="space-y-2 text-xs mb-4">
                        <div className="flex items-start gap-2 text-muted">
                          <FaStore className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground">Pickup:</span> {mission.pickupAddress || "Seller Store"}
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-muted">
                          <FaHome className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground">Destination:</span> {mission.deliveryAddress || "Customer Address"}
                          </div>
                        </div>
                      </div>

                      {/* Package Weight & Dimensions */}
                      {mission.packageInfo && (
                        <div className="flex items-center gap-3 text-[11px] text-muted bg-muted-bg/60 p-2.5 rounded-xl border border-border/40 mb-4">
                          <span>📦 Weight: <strong className="text-foreground">{mission.packageInfo.weight ? `${mission.packageInfo.weight}kg` : "Standard"}</strong></span>
                          {mission.packageInfo.fragile && <span className="text-red-500 font-bold">⚠️ Fragile</span>}
                        </div>
                      )}

                      {/* Interactive Milestone Stepper Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                        <div className="text-xs font-bold text-primary">
                          Status: <span className="uppercase text-foreground">{mission.status.replace(/_/g, " ")}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIncidentModalDelivery(mission);
                            }}
                            className="px-3 py-1.5 text-xs rounded-xl border border-red-500/30 text-red-600 hover:bg-red-500/10 transition-colors font-semibold"
                          >
                            Report Issue
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProofModalDelivery(mission);
                            }}
                            className="px-3 py-1.5 text-xs rounded-xl border border-border text-foreground hover:bg-muted-bg transition-colors font-semibold flex items-center gap-1.5"
                          >
                            <FaCamera className="text-xs" /> Proof
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdvanceMilestone(mission);
                            }}
                            disabled={advancingId === mission.id}
                            className="px-4 py-1.5 text-xs rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            {advancingId === mission.id ? (
                              <FaSyncAlt className="animate-spin text-xs" />
                            ) : mission.status === "out_for_delivery" ? (
                              <>
                                <FaKey className="text-xs" /> Enter OTP & Complete
                              </>
                            ) : (
                              <>
                                <span>Next Milestone</span> <FaArrowRight className="text-xs" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Side Active Mission Live Map */}
              <div className="lg:col-span-1 space-y-4">
                {selectedMission ? (
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <h4 className="font-bold text-foreground flex items-center gap-1.5">
                        <FaCompass className="text-primary" /> Live Tracking Telemetry
                      </h4>
                      <span className="text-muted text-[10px]">Order #{selectedMission.orderId}</span>
                    </div>

                    <LiveDeliveryMap
                      pickupAddress={selectedMission.pickupAddress}
                      deliveryAddress={selectedMission.deliveryAddress}
                      pickupCoordinates={selectedMission.pickupCoordinates}
                      deliveryCoordinates={selectedMission.deliveryCoordinates}
                      orderId={selectedMission.orderId}
                      deliveryId={selectedMission.id}
                      riderName={details?.personal?.fullName || session?.user?.name || "Delivery Partner"}
                      status={selectedMission.status}
                      trackingState={isBroadcastingLocation ? "LIVE" : "LOCATION_UNAVAILABLE"}
                      riderLocation={
                        lastCoords
                          ? {
                              latitude: lastCoords.lat,
                              longitude: lastCoords.lng,
                              speed: lastCoords.speed,
                              updatedAt: new Date().toISOString(),
                            }
                          : null
                      }
                      height="h-64"
                    />

                    <div className="p-3 bg-muted-bg/50 rounded-xl border border-border/50 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted">Broadcast State:</span>
                        <span className="font-bold text-foreground">
                          {isBroadcastingLocation ? "Active (Broadcasting)" : "Offline Standby"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">OTP Requirement:</span>
                        <span className="font-bold text-emerald-600">6-Digit Customer Code</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: OPEN MARKETPLACE (PATHAO-STYLE) ─────────────────────────── */}
      {activeTab === "available" && (
        <Panel title="Open Delivery Marketplace">
          <p className="text-xs text-muted mb-4">Atomic First-Come Claim. Only requests fitting your vehicle capacity are shown.</p>
          {availableDeliveries.length === 0 ? (
            <div className="py-12 text-center text-muted">
              <FaStore className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-bold text-foreground">No Open Delivery Requests</p>
              <p className="text-xs mt-1">There are currently no new packages waiting for pickup in your zones.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableDeliveries.map((req) => {
                const pkgWeight = req.packageInfo?.weight || 0;
                const canFitWeight = pkgWeight === 0 || pkgWeight <= remainingWeight;
                const canFitParcels = currentParcelCount < maxParcels;
                const isEligible = canFitWeight && canFitParcels;

                return (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-3">
                        <span className="font-black text-sm text-foreground">Order #{req.orderId}</span>
                        <span className="font-black text-xs text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                          ৳{req.deliveryFee || 60}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-muted mb-4">
                        <div className="flex items-start gap-2">
                          <FaStore className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="truncate">{req.pickupAddress || "Seller Location"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <FaHome className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="truncate">{req.deliveryAddress || "Customer Address"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] mb-4">
                        <span className="px-2 py-0.5 rounded bg-muted-bg text-foreground font-semibold">
                          📦 {pkgWeight > 0 ? `${pkgWeight}kg` : "Standard parcel"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isEligible ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {isEligible ? "Fits Capacity" : "Capacity Full"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcceptDelivery(req.id)}
                      disabled={!isApproved || !isEligible || acceptingId === req.id}
                      className="w-full py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-xs shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {acceptingId === req.id ? (
                        <FaSyncAlt className="animate-spin text-xs" />
                      ) : (
                        <>
                          <FaCheckCircle className="text-xs" /> Accept & Claim Mission
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {/* ─── TAB 3: FULL COCKPIT LIVE MAP ────────────────────────────────────── */}
      {activeTab === "map" && (
        <Panel title="Live Delivery Radar & Cockpit Telemetry">
          <div className="space-y-4">
            <LiveDeliveryMap
              pickupAddress={selectedMission?.pickupAddress || "Selected Pickup"}
              deliveryAddress={selectedMission?.deliveryAddress || "Selected Dropoff"}
              pickupCoordinates={selectedMission?.pickupCoordinates}
              deliveryCoordinates={selectedMission?.deliveryCoordinates}
              orderId={selectedMission?.orderId}
              deliveryId={selectedMission?.id}
              riderName={details?.personal?.fullName || session?.user?.name || "Delivery Partner"}
              status={selectedMission?.status || "in_transit"}
              trackingState={isBroadcastingLocation ? "LIVE" : "LOCATION_UNAVAILABLE"}
              multiDeliveries={activeMissions.map((m) => ({
                id: m.id,
                orderId: m.orderId,
                pickupAddress: m.pickupAddress,
                deliveryAddress: m.deliveryAddress,
                pickupCoordinates: m.pickupCoordinates,
                deliveryCoordinates: m.deliveryCoordinates,
                status: m.status,
                deliveryFee: m.deliveryFee,
              }))}
              riderLocation={
                lastCoords
                  ? {
                      latitude: lastCoords.lat,
                      longitude: lastCoords.lng,
                      speed: lastCoords.speed,
                      updatedAt: new Date().toISOString(),
                    }
                  : null
              }
              height="h-96 sm:h-[480px]"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-muted-bg/60 rounded-xl border border-border/50">
                <span className="text-muted block text-[11px] font-semibold">Active Coordinates</span>
                <span className="text-sm font-mono font-bold text-foreground">
                  {lastCoords ? `${lastCoords.lat.toFixed(4)}, ${lastCoords.lng.toFixed(4)}` : "Pending GPS Broadcast"}
                </span>
              </div>
              <div className="p-4 bg-muted-bg/60 rounded-xl border border-border/50">
                <span className="text-muted block text-[11px] font-semibold">Broadcasting Protocol</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Socket.IO WebSockets (Redis-Ready)
                </span>
              </div>
              <div className="p-4 bg-muted-bg/60 rounded-xl border border-border/50">
                <span className="text-muted block text-[11px] font-semibold">Geofencing Radius</span>
                <span className="text-sm font-bold text-foreground">250m Proximity Trigger</span>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* ─── TAB 4: AI DELIVERY COPILOT ──────────────────────────────────────── */}
      {activeTab === "copilot" && (
        <Panel title="AI Delivery Operations Copilot">
          <p className="text-xs text-muted mb-4">Intelligent Telemetry & Route Guidance (Advisory Only)</p>
          <div className="space-y-6">
            {/* Quick Suggestions Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                "Which delivery should I handle first?",
                "Which available request fits my capacity?",
                "Show my active deliveries.",
                "Summarize today's performance.",
                "What is causing delays?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setCopilotQuery(q);
                    handleAskCopilot(q);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:border-primary/50 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskCopilot();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                placeholder="Ask AI Copilot about sequence, capacity, or delays..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-muted-bg border border-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={copilotLoading || !copilotQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
              >
                {copilotLoading ? "Analyzing..." : "Ask Copilot"}
              </button>
            </form>

            {/* Copilot Response Output */}
            {copilotResponse && (
              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <FaRobot className="text-base" />
                  <span>AI Operational Recommendation:</span>
                </div>

                <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {copilotResponse.answer}
                </div>

                {/* Insights List */}
                {copilotResponse.insights && copilotResponse.insights.length > 0 && (
                  <div className="pt-3 border-t border-border/50 space-y-2">
                    <h5 className="text-[11px] font-bold text-muted uppercase tracking-wider">
                      Telemetry Insights Retrieved:
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {copilotResponse.insights.map((ins, i) => (
                        <div key={i} className="p-3 bg-muted-bg/60 rounded-xl border border-border/40 text-xs">
                          <strong className="block text-foreground font-semibold mb-0.5">{ins.title}</strong>
                          <span className="text-muted text-[11px]">{ins.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>
      )}

      {/* ─── OTP VERIFICATION MODAL ─────────────────────────────────────────── */}
      {otpModalDelivery && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <FaKey className="text-primary" /> Delivery OTP Verification
              </h3>
              <button
                onClick={() => setOtpModalDelivery(null)}
                className="text-muted hover:text-foreground cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <p className="text-xs text-muted">
              Please enter the 6-digit customer verification code provided by the recipient for order{" "}
              <strong>#{otpModalDelivery.orderId}</strong> to verify proof of handover.
            </p>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-Digit PIN"
                  className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 rounded-xl bg-muted-bg border border-border text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
                {otpError && <p className="text-red-500 text-xs mt-1.5 font-semibold">{otpError}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOtpModalDelivery(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-muted-bg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpVerifying || otpInput.length !== 6}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                >
                  {otpVerifying ? "Verifying..." : "Verify & Complete Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PROOF PHOTO MODAL ──────────────────────────────────────────────── */}
      {proofModalDelivery && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <FaCamera className="text-primary" /> Upload Proof of Delivery
              </h3>
              <button
                onClick={() => setProofModalDelivery(null)}
                className="text-muted hover:text-foreground cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleProofSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <FaCamera className="w-8 h-8 text-muted mx-auto mb-2" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="text-xs text-foreground cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProofModalDelivery(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-muted-bg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={proofUploading || !proofFile}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
                >
                  {proofUploading ? "Uploading..." : "Save Proof Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── INCIDENT REPORT MODAL ──────────────────────────────────────────── */}
      {incidentModalDelivery && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-red-600 flex items-center gap-2">
                <FaExclamationTriangle /> Report Delivery Incident
              </h3>
              <button
                onClick={() => setIncidentModalDelivery(null)}
                className="text-muted hover:text-foreground cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleIncidentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Issue Category</label>
                <select
                  value={incidentCategory}
                  onChange={(e) => setIncidentCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted-bg border border-border text-xs text-foreground"
                >
                  <option value="customer_unavailable">Customer Unavailable</option>
                  <option value="wrong_address">Wrong Address / Landmark</option>
                  <option value="customer_refused">Customer Refused Delivery</option>
                  <option value="package_issue">Package Damaged / Mismatch</option>
                  <option value="vehicle_problem">Vehicle Breakdown / Accident</option>
                  <option value="safety_issue">Safety / Road Obstacle</option>
                  <option value="other">Other Incident</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Severity</label>
                <select
                  value={incidentSeverity}
                  onChange={(e) => setIncidentSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-muted-bg border border-border text-xs text-foreground"
                >
                  <option value="low">Low - Minor Delay</option>
                  <option value="medium">Medium - Needs Attention</option>
                  <option value="high">High - Handover Blocked</option>
                  <option value="critical">Critical - Emergency / Severe Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Description / Notes</label>
                <textarea
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  rows={3}
                  placeholder="Explain the incident details..."
                  className="w-full px-3 py-2 rounded-xl bg-muted-bg border border-border text-xs text-foreground"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIncidentModalDelivery(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:bg-muted-bg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={incidentReporting || !incidentDesc.trim()}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow hover:bg-red-500 disabled:opacity-50 cursor-pointer"
                >
                  {incidentReporting ? "Submitting..." : "Submit Incident Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
