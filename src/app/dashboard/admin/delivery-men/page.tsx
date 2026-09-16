"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel, StatCard } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import { clientFetch, clientMutation } from "@/lib/core/client";
import { getDeliverySocket } from "@/lib/socket/delivery-socket";
import { LiveDeliveryMap, FleetRiderMarkerData } from "@/components/delivery/LiveDeliveryMap";
import { getAdminDeliveryHeatmap, DeliveryHeatmapPoint } from "@/lib/api/delivery";
import {
  FaSyncAlt,
  FaUser,
  FaStar,
  FaEnvelope,
  FaPhone,
  FaCheck,
  FaBan,
  FaTimes,
  FaMotorcycle,
  FaIdCard,
  FaIdBadge,
  FaShieldAlt,
  FaFileAlt,
  FaCar,
  FaUniversity,
  FaEye,
  FaCompass,
  FaMapMarkedAlt,
} from "react-icons/fa";

interface DeliveryManProfile {
  id: string;
  userId: string;
  status: "pending_verification" | "approved" | "rejected" | "suspended";
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

interface DeliveryManDetails {
  id?: string;
  userId: string;
  isActive: boolean;
  availabilityStatus: string;
  rating: number;
  ratingCount: number;
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  personal?: {
    fullName?: string;
    phone?: string;
    alternatePhone?: string;
    email?: string;
    city?: string;
    district?: string;
    currentAddress?: string;
    permanentAddress?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    profilePhoto?: string;
  };
  identity?: {
    nidNumber?: string;
    nidType?: string;
    nidFrontImage?: string;
    nidBackImage?: string;
    selfieImage?: string;
  };
  license?: {
    licenseNumber?: string;
    licenseType?: string;
    licenseExpiryDate?: string;
    licenseFrontImage?: string;
    licenseBackImage?: string;
    drivingExperience?: number;
  };
  vehicle?: {
    vehicleType?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    vehicleRegistrationNumber?: string;
    vehicleRegistrationDocument?: string;
    vehiclePhoto?: string;
    vehicleCapacity?: number;
  };
  bank?: {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    routingNumber?: string;
    mobileBankingProvider?: string;
    mobileBankingNumber?: string;
  };
}

interface DeliveryManItem {
  profile: DeliveryManProfile;
  details?: DeliveryManDetails;
  personal?: DeliveryManDetails["personal"];
  identity?: DeliveryManDetails["identity"];
  license?: DeliveryManDetails["license"];
  vehicle?: DeliveryManDetails["vehicle"];
  bank?: DeliveryManDetails["bank"];
  availabilityStatus: string;
  isActive: boolean;
  rating: number;
  ratingCount: number;
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    updatedAt?: string;
  };
  name?: string;
  email?: string;
  image?: string;
}

export default function AdminDeliveryMenPage() {
  const [deliveryMen, setDeliveryMen] = useState<DeliveryManItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState<DeliveryManItem | null>(null);

  // Demand Heatmap State
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapTimeRange, setHeatmapTimeRange] = useState<"today" | "7d" | "30d" | "all">("30d");
  const [heatmapPoints, setHeatmapPoints] = useState<DeliveryHeatmapPoint[]>([]);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);

  // Rejection modal
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!showHeatmap) return;
    setLoadingHeatmap(true);
    getAdminDeliveryHeatmap(heatmapTimeRange)
      .then((res) => {
        setHeatmapPoints(res?.points || []);
      })
      .catch(() => {
        setHeatmapPoints([]);
      })
      .finally(() => {
        setLoadingHeatmap(false);
      });
  }, [showHeatmap, heatmapTimeRange]);

  const loadDeliveryMen = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientFetch<{ items?: DeliveryManItem[]; data?: DeliveryManItem[] }>(
        `/delivery/admin/list${filter !== "all" ? `?status=${filter}` : ""}`
      );
      const items = res?.items ?? res?.data ?? [];
      setDeliveryMen(items);
    } catch (error) {
      console.error("Failed to load delivery men:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    loadDeliveryMen();

    if (typeof window !== "undefined") {
      const socket = getDeliverySocket();
      socket.emit("join:admin_operations");

      const onAdminRiderLocation = (payload: {
        riderId: string;
        latitude: number;
        longitude: number;
        speed?: number;
        heading?: number;
        accuracy?: number;
        deliveryRequestId?: string;
        orderId?: string;
      }) => {
        if (!payload?.riderId || typeof payload.latitude !== "number") return;
        setDeliveryMen((prev) =>
          prev.map((dm) => {
            if (dm.profile.userId === payload.riderId) {
              return {
                ...dm,
                isActive: true,
                currentLocation: {
                  latitude: payload.latitude,
                  longitude: payload.longitude,
                  speed: payload.speed,
                  heading: payload.heading,
                  accuracy: payload.accuracy,
                  updatedAt: new Date().toISOString(),
                },
              };
            }
            return dm;
          })
        );
      };

      const onDeliveryStatusChange = () => {
        loadDeliveryMen();
      };

      socket.on("admin:rider_location", onAdminRiderLocation);
      socket.on("admin:delivery_status", onDeliveryStatusChange);
      socket.on("admin:delivery_assigned", onDeliveryStatusChange);
      socket.on("admin:delivery_completed", onDeliveryStatusChange);

      return () => {
        socket.off("admin:rider_location", onAdminRiderLocation);
        socket.off("admin:delivery_status", onDeliveryStatusChange);
        socket.off("admin:delivery_assigned", onDeliveryStatusChange);
        socket.off("admin:delivery_completed", onDeliveryStatusChange);
      };
    }
  }, [loadDeliveryMen]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDeliveryMen();
  };

  const handleStatusChange = async (userId: string, status: string, reason?: string) => {
    setActionLoading(true);
    try {
      await clientMutation(`/delivery/admin/profile/${userId}/status`, "PATCH", {
        status,
        rejectionReason: reason,
      });
      setRejectingUserId(null);
      setRejectionReason("");
      setSelectedApplicant(null);
      await loadDeliveryMen();
    } catch (error: any) {
      alert(error?.message || "Failed to update delivery partner status");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
      pending_verification: "bg-amber-500/10 text-amber-500 border-amber-500/30",
      rejected: "bg-rose-500/10 text-rose-500 border-rose-500/30",
      suspended: "bg-slate-500/10 text-slate-500 border-slate-400/30",
    };
    return config[status] || "bg-muted/10 text-muted border-border";
  };

  const pendingCount = deliveryMen.filter((d) => d.profile.status === "pending_verification").length;
  const approvedCount = deliveryMen.filter((d) => d.profile.status === "approved").length;
  const suspendedCount = deliveryMen.filter((d) => d.profile.status === "suspended").length;
  const activeNowCount = deliveryMen.filter((d) => d.isActive || d.availabilityStatus === "available").length;

  const fleetMarkers: FleetRiderMarkerData[] = deliveryMen
    .filter(
      (dm) =>
        dm.currentLocation?.latitude !== undefined &&
        dm.currentLocation?.latitude !== null &&
        dm.currentLocation?.longitude !== undefined &&
        dm.currentLocation?.longitude !== null
    )
    .map((dm) => {
      const isOnline = dm.isActive || dm.availabilityStatus === "available" || dm.availabilityStatus === "busy";
      return {
        id: dm.profile.userId,
        name: dm.personal?.fullName || dm.name || "Delivery Partner",
        latitude: dm.currentLocation!.latitude,
        longitude: dm.currentLocation!.longitude,
        speed: dm.currentLocation!.speed,
        heading: dm.currentLocation!.heading,
        accuracy: dm.currentLocation!.accuracy,
        status: isOnline ? (dm.availabilityStatus || "available") : "offline",
        isActive: isOnline,
        phone: dm.personal?.phone,
        rating: dm.rating,
        vehicleType: dm.vehicle?.vehicleType,
        updatedAt: dm.currentLocation!.updatedAt,
      };
    });

  return (
    <DashboardShell
      role="admin"
      title="Delivery Operations & Fleet Cockpit"
      subtitle="Inspect KYC verification dossiers, manage rider availability, and enforce safety compliance."
      links={adminDashboardLinks}
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard
            icon={<FaMotorcycle className="text-primary" />}
            label="Total Delivery Partners"
            value={String(deliveryMen.length)}
            note={`${activeNowCount} active online now`}
          />
          <StatCard
            icon={<FaSyncAlt className="text-amber-500" />}
            label="Pending KYC Review"
            value={String(pendingCount)}
            note="Applications awaiting verification"
          />
          <StatCard
            icon={<FaStar className="text-emerald-500" />}
            label="Approved Fleet"
            value={String(approvedCount)}
            note="Verified operational riders"
          />
          <StatCard
            icon={<FaBan className="text-rose-500" />}
            label="Suspended / Inactive"
            value={String(suspendedCount)}
            note="Blocked from deliveries"
          />
        </div>

        {/* ─── Real Google Map Fleet Radar Cockpit & Heatmap ────────────────── */}
        <Panel
          title="Active Logistics Fleet Radar (Bangladesh Real-Time)"
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHeatmap((prev) => !prev)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  showHeatmap
                    ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                    : "bg-surface border-border text-foreground hover:bg-muted-bg"
                }`}
              >
                <span>🔥 Demand Heatmap</span>
                {loadingHeatmap && <FaSyncAlt className="animate-spin text-[10px]" />}
              </button>

              {showHeatmap && (
                <div className="flex items-center gap-1 bg-surface border border-border p-0.5 rounded-lg text-[10px] font-bold">
                  {(["today", "7d", "30d"] as const).map((tr) => (
                    <button
                      key={tr}
                      type="button"
                      onClick={() => setHeatmapTimeRange(tr)}
                      className={`px-2 py-0.5 rounded ${
                        heatmapTimeRange === tr ? "bg-primary text-white" : "text-muted hover:text-foreground"
                      }`}
                    >
                      {tr.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}

              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{fleetMarkers.length} GPS Riders</span>
              </span>
            </div>
          }
        >
          <div className="space-y-3">
            <p className="text-xs text-muted">
              Live geographic positioning of active delivery fleet across Bangladesh with demand density heatmap clustering.
            </p>
            <LiveDeliveryMap
              fleetRiders={fleetMarkers}
              heatmapPoints={showHeatmap ? heatmapPoints : undefined}
              trackingState={fleetMarkers.length > 0 ? "LIVE" : "LOCATION_UNAVAILABLE"}
              height="h-80 sm:h-96"
            />
          </div>
        </Panel>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-muted">Filter KYC Status:</span>
            {["all", "pending_verification", "approved", "rejected", "suspended"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer capitalize ${
                  filter === status
                    ? "bg-primary text-white"
                    : "border border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                {status === "all" ? "All Partners" : status.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-foreground hover:border-primary transition cursor-pointer self-start sm:self-auto"
          >
            <FaSyncAlt className={`text-primary ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Delivery Men List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-surface/50" />
            ))}
          </div>
        ) : deliveryMen.length === 0 ? (
          <Panel>
            <div className="py-16 text-center text-muted">
              <FaMotorcycle className="mx-auto text-4xl text-muted/40 mb-3" />
              <h3 className="text-base font-bold text-foreground">No Delivery Partners Found</h3>
              <p className="text-xs text-muted mt-1">No applications match the current filter selection.</p>
            </div>
          </Panel>
        ) : (
          <div className="space-y-4">
            {deliveryMen.map((dm) => (
              <div
                key={dm.profile.id}
                className="rounded-2xl border border-border bg-card p-5 text-xs transition hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl shrink-0">
                      <FaUser />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-foreground text-sm">
                          {dm.personal?.fullName || dm.name || "Delivery Partner"}
                        </p>
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black uppercase ${getStatusBadge(dm.profile.status)}`}>
                          {dm.profile.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-1">
                        {dm.personal?.phone && (
                          <span className="flex items-center gap-1">
                            <FaPhone size={9} /> {dm.personal.phone}
                          </span>
                        )}
                        {dm.email && (
                          <span className="flex items-center gap-1">
                            <FaEnvelope size={9} /> {dm.email}
                          </span>
                        )}
                        <span>
                          Vehicle: <strong className="text-foreground capitalize">{dm.vehicle?.vehicleType || "Motorcycle"}</strong>
                        </span>
                        <span>
                          Total: <strong className="text-foreground">{dm.totalDeliveries ?? 0}</strong> ({dm.completedDeliveries ?? 0} done)
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <FaStar size={10} /> {dm.rating?.toFixed(1) ?? "5.0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Dossier Inspection */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedApplicant(dm)}
                      className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
                    >
                      <FaEye size={11} />
                      <span>Inspect Dossier</span>
                    </button>

                    {dm.profile.status === "pending_verification" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(dm.profile.userId, "approved")}
                          disabled={actionLoading}
                          className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition cursor-pointer disabled:opacity-50"
                        >
                          <FaCheck size={10} /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingUserId(dm.profile.userId)}
                          disabled={actionLoading}
                          className="flex items-center gap-1 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition cursor-pointer"
                        >
                          <FaTimes size={10} /> Reject
                        </button>
                      </>
                    )}

                    {dm.profile.status === "approved" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(dm.profile.userId, "suspended")}
                        disabled={actionLoading}
                        className="flex items-center gap-1 rounded-xl bg-slate-500/10 border border-slate-400/30 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-500/20 transition cursor-pointer"
                      >
                        <FaBan size={10} /> Suspend
                      </button>
                    )}

                    {dm.profile.status === "suspended" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(dm.profile.userId, "approved")}
                        disabled={actionLoading}
                        className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition cursor-pointer"
                      >
                        <FaCheck size={10} /> Reinstate
                      </button>
                    )}
                  </div>
                </div>

                {dm.profile.rejectionReason && (
                  <div className="mt-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-[11px] text-rose-500">
                    <strong>Rejection Reason:</strong> {dm.profile.rejectionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KYC DOSSIER INSPECTION MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl">
                  <FaShieldAlt />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    KYC Verification Dossier: {selectedApplicant.personal?.fullName || selectedApplicant.name || "Partner"}
                  </h3>
                  <p className="text-xs text-muted">Review submitted identity documents, vehicle registration, and credentials.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="text-muted hover:text-foreground text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Dossier Grid */}
            <div className="space-y-4 text-xs">
              {/* Personal Info */}
              <div className="rounded-2xl bg-surface/50 border border-border/60 p-4 space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-2 uppercase tracking-wider text-[11px]">
                  <FaUser className="text-primary" /> Personal Identity
                </h4>
                <div className="grid grid-cols-2 gap-2 text-muted">
                  <div>Full Name: <strong className="text-foreground">{selectedApplicant.personal?.fullName || "—"}</strong></div>
                  <div>Phone: <strong className="text-foreground">{selectedApplicant.personal?.phone || "—"}</strong></div>
                  <div>Alt Phone: <strong className="text-foreground">{selectedApplicant.personal?.alternatePhone || "—"}</strong></div>
                  <div>City / District: <strong className="text-foreground">{selectedApplicant.personal?.city || "—"}, {selectedApplicant.personal?.district || "—"}</strong></div>
                  <div className="col-span-2">Address: <strong className="text-foreground">{selectedApplicant.personal?.currentAddress || "—"}</strong></div>
                </div>
              </div>

              {/* Identity / NID */}
              <div className="rounded-2xl bg-surface/50 border border-border/60 p-4 space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-2 uppercase tracking-wider text-[11px]">
                  <FaIdCard className="text-amber-500" /> National ID (NID)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-muted">
                  <div>NID Number: <strong className="text-foreground font-mono">{selectedApplicant.identity?.nidNumber || "—"}</strong></div>
                  <div>NID Type: <strong className="text-foreground">{selectedApplicant.identity?.nidType || "Standard Smart NID"}</strong></div>
                </div>
                {(selectedApplicant.identity?.nidFrontImage || selectedApplicant.identity?.nidBackImage) && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {selectedApplicant.identity?.nidFrontImage && (
                      <div>
                        <span className="text-[10px] text-muted block mb-1">NID Front</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selectedApplicant.identity.nidFrontImage} alt="NID Front" className="h-28 w-full object-cover rounded-xl border border-border" />
                      </div>
                    )}
                    {selectedApplicant.identity?.nidBackImage && (
                      <div>
                        <span className="text-[10px] text-muted block mb-1">NID Back</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selectedApplicant.identity.nidBackImage} alt="NID Back" className="h-28 w-full object-cover rounded-xl border border-border" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Driving License */}
              <div className="rounded-2xl bg-surface/50 border border-border/60 p-4 space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-2 uppercase tracking-wider text-[11px]">
                  <FaIdBadge className="text-emerald-500" /> Driving License
                </h4>
                <div className="grid grid-cols-2 gap-2 text-muted">
                  <div>License Number: <strong className="text-foreground font-mono">{selectedApplicant.license?.licenseNumber || "—"}</strong></div>
                  <div>Expiry Date: <strong className="text-foreground">{selectedApplicant.license?.licenseExpiryDate || "—"}</strong></div>
                  <div>Driving Experience: <strong className="text-foreground">{selectedApplicant.license?.drivingExperience ?? 2} Years</strong></div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="rounded-2xl bg-surface/50 border border-border/60 p-4 space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-2 uppercase tracking-wider text-[11px]">
                  <FaCar className="text-primary" /> Vehicle & Registration
                </h4>
                <div className="grid grid-cols-2 gap-2 text-muted">
                  <div>Vehicle Type: <strong className="text-foreground capitalize">{selectedApplicant.vehicle?.vehicleType || "Motorcycle"}</strong></div>
                  <div>Brand / Model: <strong className="text-foreground">{selectedApplicant.vehicle?.vehicleBrand || "—"} {selectedApplicant.vehicle?.vehicleModel || ""}</strong></div>
                  <div>Registration Number: <strong className="text-foreground font-mono">{selectedApplicant.vehicle?.vehicleRegistrationNumber || "—"}</strong></div>
                  <div>Max Simultaneous Capacity: <strong className="text-foreground">{selectedApplicant.vehicle?.vehicleCapacity ?? 3} Orders</strong></div>
                </div>
              </div>

              {/* Bank Info */}
              <div className="rounded-2xl bg-surface/50 border border-border/60 p-4 space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-2 uppercase tracking-wider text-[11px]">
                  <FaUniversity className="text-indigo-500" /> Payment & Mobile Banking
                </h4>
                <div className="grid grid-cols-2 gap-2 text-muted">
                  <div>Mobile Provider: <strong className="text-foreground uppercase">{selectedApplicant.bank?.mobileBankingProvider || "bKash"}</strong></div>
                  <div>Mobile Number: <strong className="text-foreground font-mono">{selectedApplicant.bank?.mobileBankingNumber || selectedApplicant.personal?.phone || "—"}</strong></div>
                  <div>Bank Name: <strong className="text-foreground">{selectedApplicant.bank?.bankName || "—"}</strong></div>
                  <div>Account Number: <strong className="text-foreground font-mono">{selectedApplicant.bank?.accountNumber || "—"}</strong></div>
                </div>
              </div>
            </div>

            {/* Dossier Footer Actions */}
            <div className="flex items-center justify-between border-t border-border/60 pt-4">
              <span className="text-xs text-muted">
                Status: <strong className="uppercase text-foreground">{selectedApplicant.profile.status.replace(/_/g, " ")}</strong>
              </span>

              <div className="flex items-center gap-2">
                {selectedApplicant.profile.status === "pending_verification" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedApplicant.profile.userId, "approved")}
                      disabled={actionLoading}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white hover:bg-emerald-600 transition shadow-md shadow-emerald-500/20"
                    >
                      ✓ Approve Applicant
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingUserId(selectedApplicant.profile.userId);
                      }}
                      disabled={actionLoading}
                      className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition"
                    >
                      ✕ Reject Application
                    </button>
                  </>
                )}

                {selectedApplicant.profile.status === "approved" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedApplicant.profile.userId, "suspended")}
                    disabled={actionLoading}
                    className="rounded-xl bg-slate-500/10 border border-slate-400/30 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-500/20 transition"
                  >
                    Suspend Partner
                  </button>
                )}

                {selectedApplicant.profile.status === "suspended" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedApplicant.profile.userId, "approved")}
                    disabled={actionLoading}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white hover:bg-emerald-600 transition"
                  >
                    Reinstate Partner
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-rose-500">Reject Delivery Partner Application</h3>
              <button
                type="button"
                onClick={() => setRejectingUserId(null)}
                className="text-muted hover:text-foreground text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted">
              Please specify the rejection rationale (e.g. illegible driving license, invalid NID, vehicle requirements not met). This feedback will be shown to the applicant for resubmission.
            </p>

            <div>
              <textarea
                rows={3}
                required
                placeholder="Reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-rose-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingUserId(null)}
                className="px-4 py-2 text-xs font-bold text-muted hover:text-foreground rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectionReason.trim() || actionLoading}
                onClick={() => handleStatusChange(rejectingUserId, "rejected", rejectionReason.trim())}
                className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-black hover:bg-rose-600 transition disabled:opacity-50 cursor-pointer shadow-md"
              >
                {actionLoading ? "Submitting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
