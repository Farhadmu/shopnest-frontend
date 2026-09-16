"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { deliveryManDashboardLinks } from "@/lib/constants/dashboard-nav";
import { clientFetch, clientMutation } from "@/lib/core/client";
import { useSession } from "@/lib/auth-client";
import { FaUser, FaIdCard, FaIdBadge, FaMotorcycle, FaUniversity, FaMapMarkerAlt, FaSave, FaStar, FaTimes } from "react-icons/fa";

interface DeliveryManProfile {
  id: string;
  userId: string;
  status: "pending_verification" | "approved" | "rejected" | "suspended";
  rejectionReason?: string;
  resubmissionRequired?: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryManDetails {
  id: string;
  userId: string;
  personal?: {
    fullName?: string;
    phone?: string;
    email?: string;
    city?: string;
    district?: string;
    serviceArea?: string[];
    profilePhoto?: string;
  };
  identity?: {
    nidNumber?: string;
  };
  license?: {
    licenseNumber?: string;
  };
  vehicle?: {
    vehicleType?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    vehicleRegistrationNumber?: string;
  };
  bank?: {
    bankName?: string;
    accountNumber?: string;
    mobileBankingProvider?: string;
    mobileBankingNumber?: string;
  };
  preferences?: {
    maxActiveDeliveries?: number;
    availabilityPreference?: string;
    deliveryRadius?: number;
  };
  isActive: boolean;
  availabilityStatus: "offline" | "available" | "busy";
  rating: number;
  ratingCount: number;
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  createdAt: string;
  updatedAt: string;
}

export default function DeliveryProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<DeliveryManProfile | null>(null);
  const [details, setDetails] = useState<DeliveryManDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientFetch<{ profile?: DeliveryManProfile; details?: DeliveryManDetails }>(
        "/delivery/profile"
      );
      setProfile(res?.profile ?? null);
      setDetails(res?.details ?? null);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await clientMutation("/delivery/profile", "PATCH", {
        personal: details?.personal,
        identity: details?.identity,
        license: details?.license,
        vehicle: details?.vehicle,
        bank: details?.bank,
        preferences: details?.preferences,
      });
      await loadProfile();
      alert("Profile updated successfully!");
    } catch (error: any) {
      alert(error?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvailabilityChange = async (availability: "offline" | "available" | "busy") => {
    try {
      await clientMutation("/delivery/availability", "PATCH", { availabilityStatus: availability });
      await loadProfile();
    } catch (error: any) {
      alert(error?.message || "Failed to update availability");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
      pending_verification: "bg-amber-500/10 text-amber-500 border-amber-500/30",
      rejected: "bg-rose-500/10 text-rose-500 border-rose-500/30",
      suspended: "bg-slate-500/10 text-slate-500 border-slate-400/30",
    };
    return statusConfig[status] || "bg-muted/10 text-muted border-border";
  };

  if (loading) {
    return (
      <DashboardShell role="Delivery Man" title="My Profile" subtitle="Loading..." links={deliveryManDashboardLinks}>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border border-border bg-surface/50" />
          ))}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="Delivery Man"
      title="My Profile"
      subtitle="Manage your delivery profile, documents, and vehicle information."
      links={deliveryManDashboardLinks}
    >
      <div className="space-y-6">
        {/* Profile Status Card */}
        <Panel title="Profile Status">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <FaUser className="text-primary text-2xl" />
              </div>
              <div className="text-xs">
                <p className="font-black text-text text-lg">
                  {details?.personal?.fullName || session?.user?.name || "Delivery Partner"}
                </p>
                <p className="text-muted">{details?.personal?.phone || session?.user?.email || "No phone provided"}</p>
                {profile?.status === "rejected" && profile?.rejectionReason && (
                  <p className="text-rose-500 mt-1">Rejection: {profile.rejectionReason}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`rounded-lg border px-3 py-1 text-xs font-black ${getStatusBadge(profile?.status || "pending_verification")}`}>
                {(profile?.status || "pending_verification").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>

              <div className="flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-1.5">
                <FaStar className="text-amber-500" />
                <span className="text-xs font-black text-text">{details?.rating?.toFixed(1) ?? "0.0"}★</span>
                <span className="text-[10px] text-muted">({details?.ratingCount ?? 0})</span>
              </div>
            </div>
          </div>

          {profile?.status === "pending_verification" && (
            <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-500">
              Your profile is under review. You will be notified once it is approved.
            </div>
          )}

          {profile?.status === "rejected" && (
            <div className="mt-3 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs">
              <p className="font-bold text-rose-500">Profile Rejected</p>
              <p className="text-muted mt-1">{profile.rejectionReason || "No reason provided. Please update your profile and resubmit."}</p>
            </div>
          )}

          {profile?.status === "approved" && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-500">
              <span className="font-bold">✓ Profile Verified</span>
              {profile.verifiedAt && <span className="text-muted">({new Date(profile.verifiedAt).toLocaleDateString()})</span>}
            </div>
          )}
        </Panel>

        {/* Availability Card */}
        <Panel title="Set Your Availability">
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-black text-text mb-1">Current Status</p>
              <p className="text-muted">
                {details?.availabilityStatus === "available" && "🟢 Available for deliveries"}
                {details?.availabilityStatus === "busy" && "🟡 Busy with active deliveries"}
                {details?.availabilityStatus === "offline" && "⚪ Offline - not accepting deliveries"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAvailabilityChange("available")}
                disabled={details?.availabilityStatus === "available"}
                className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-50 transition"
              >
                Go Available
              </button>
              <button
                type="button"
                onClick={() => handleAvailabilityChange("busy")}
                disabled={details?.availabilityStatus !== "available"}
                className="rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500 hover:bg-amber-500/20 disabled:opacity-50 transition"
              >
                Set Busy
              </button>
              <button
                type="button"
                onClick={() => handleAvailabilityChange("offline")}
                className="rounded-xl bg-slate-500/10 px-3 py-1.5 text-xs font-bold text-muted hover:bg-slate-500/20 transition"
              >
                Go Offline
              </button>
            </div>
          </div>
        </Panel>

        {/* Personal Information Form */}
        <Panel title="Personal Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-text mb-1">Full Name</label>
              <input
                type="text"
                value={details?.personal?.fullName || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    personal: { ...prev!.personal, fullName: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text mb-1">Phone Number</label>
              <input
                type="tel"
                value={details?.personal?.phone || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    personal: { ...prev!.personal, phone: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text mb-1">Email</label>
              <input
                type="email"
                value={details?.personal?.email || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    personal: { ...prev!.personal, email: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text mb-1">City</label>
              <input
                type="text"
                value={details?.personal?.city || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    personal: { ...prev!.personal, city: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text mb-1">Service Area (comma-separated)</label>
              <input
                type="text"
                value={details?.personal?.serviceArea?.join(", ") || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    personal: {
                      ...prev!.personal,
                      serviceArea: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    },
                  }))
                }
                placeholder="e.g. Dhaka, Chittagong, Sylhet"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
          </div>
        </Panel>

        {/* Identity Information */}
        <Panel title="Identity Verification" icon={<FaIdCard />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-text mb-1">NID/National ID Number</label>
              <input
                type="text"
                value={details?.identity?.nidNumber || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    identity: { ...prev!.identity, nidNumber: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
          </div>
        </Panel>

        {/* License Information */}
        <Panel title="Driving License" icon={<FaIdBadge />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-text mb-1">License Number</label>
              <input
                type="text"
                value={details?.license?.licenseNumber || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    license: { ...prev!.license, licenseNumber: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
          </div>
        </Panel>

        {/* Vehicle Information */}
        <Panel title="Vehicle Information" icon={<FaMotorcycle />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-text mb-1">Vehicle Type</label>
              <select
                value={details?.vehicle?.vehicleType || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    vehicle: { ...prev!.vehicle, vehicleType: e.target.value as any },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              >
                <option value="">Select vehicle type</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="bicycle">Bicycle</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text mb-1">Vehicle Brand</label>
              <input
                type="text"
                value={details?.vehicle?.vehicleBrand || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    vehicle: { ...prev!.vehicle, vehicleBrand: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text mb-1">Vehicle Model</label>
              <input
                type="text"
                value={details?.vehicle?.vehicleModel || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    vehicle: { ...prev!.vehicle, vehicleModel: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text mb-1">Registration Number</label>
              <input
                type="text"
                value={details?.vehicle?.vehicleRegistrationNumber || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    vehicle: { ...prev!.vehicle, vehicleRegistrationNumber: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
          </div>
        </Panel>

        {/* Bank Information */}
        <Panel title="Payment / Bank Information" icon={<FaUniversity />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-text mb-1">Bank Name</label>
              <input
                type="text"
                value={details?.bank?.bankName || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    bank: { ...prev!.bank, bankName: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text mb-1">Account Number</label>
              <input
                type="text"
                value={details?.bank?.accountNumber || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    bank: { ...prev!.bank, accountNumber: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text mb-1">Mobile Banking Provider</label>
              <select
                value={details?.bank?.mobileBankingProvider || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    bank: { ...prev!.bank, mobileBankingProvider: e.target.value as any },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              >
                <option value="">Select provider</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text mb-1">Mobile Banking Number</label>
              <input
                type="tel"
                value={details?.bank?.mobileBankingNumber || ""}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    bank: { ...prev!.bank, mobileBankingNumber: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
          </div>
        </Panel>

        {/* Preferences */}
        <Panel title="Delivery Preferences">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-text mb-1">Max Active Deliveries</label>
              <input
                type="number"
                min={1}
                max={10}
                value={details?.preferences?.maxActiveDeliveries || 3}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    preferences: { ...prev!.preferences, maxActiveDeliveries: Number(e.target.value) },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text mb-1">Availability Preference</label>
              <select
                value={details?.preferences?.availabilityPreference || "part_time"}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev!,
                    preferences: { ...prev!.preferences, availabilityPreference: e.target.value as any },
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-text"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="weekends">Weekends Only</option>
                <option value="on_call">On Call</option>
              </select>
            </div>
          </div>
        </Panel>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={loadProfile}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-text hover:border-muted transition cursor-pointer"
          >
            <FaTimes size={11} />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white hover:bg-primary-hover transition cursor-pointer disabled:opacity-50"
          >
            <FaSave size={11} />
            <span>{saving ? "Saving..." : "Save Profile"}</span>
          </button>
        </div>

        {/* Delivery Stats */}
        <Panel title="Delivery Statistics">
          <div className="grid gap-4 sm:grid-cols-4 text-center">
            <div className="rounded-xl bg-muted-bg/50 border border-border p-4">
              <p className="text-[10px] font-black uppercase text-muted">Total Deliveries</p>
              <p className="mt-1 text-xl font-black text-text">{details?.totalDeliveries ?? 0}</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
              <p className="text-[10px] font-black uppercase text-emerald-500">Completed</p>
              <p className="mt-1 text-xl font-black text-emerald-500">{details?.completedDeliveries ?? 0}</p>
            </div>
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4">
              <p className="text-[10px] font-black uppercase text-rose-500">Failed</p>
              <p className="mt-1 text-xl font-black text-rose-500">{details?.failedDeliveries ?? 0}</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
              <p className="text-[10px] font-black uppercase text-amber-500">Success Rate</p>
              <p className="mt-1 text-xl font-black text-text">
                {details?.totalDeliveries
                  ? `${Math.round(((details.completedDeliveries ?? 0) / details.totalDeliveries) * 100)}%`
                  : "N/A"}
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
