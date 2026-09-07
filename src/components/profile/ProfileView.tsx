"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UserProfile } from "@/lib/api/users";
import EditProfileModal from "./EditProfileModal";
import { Lock, CheckCircle2, Edit3, Award, Eye, EyeOff, AlertCircle } from "lucide-react";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

export default function ProfileView({ initialProfile }: { initialProfile: UserProfile | null }) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [msg, setMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialProfile || !initialProfile.email) {
      authClient.getSession().then(({ data }) => {
        if (data?.user) {
          const userData = data.user as unknown as Record<string, unknown>;
          setProfile({
            id: String(userData.id || ""),
            name: String(userData.name || "User"),
            email: String(userData.email || ""),
            phone: String(userData.phone || ""),
            avatarUrl: String(userData.image || userData.avatarUrl || ""),
            role: (userData.role as "customer" | "seller" | "admin") || "customer",
          });
        }
      });
    }
  }, [initialProfile]);

  const avatar = profile?.avatarUrl || profile?.image || "";
  const name = profile?.name || "Loading...";
  const email = profile?.email || "Fetching email...";
  const role = profile?.role || "customer";

  const profileFields = [name, email, profile?.phone, avatar];
  const completedFields = profileFields.filter((f) => f && f.trim() !== "").length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setMsg(error.message || "Failed to change password.");
        setIsSuccess(false);
      } else {
        setMsg("Password changed successfully!");
        setIsSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch {
      setMsg("An unexpected server error occurred.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* LEFT SIDEBAR */}
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/80 p-6 text-center shadow-xl backdrop-blur-md">
          <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-surface bg-muted-bg shadow-lg ring-2 ring-primary/30">
            {avatar ? (
              <Image src={avatar} alt={name} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-black text-xl text-muted">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 className="mt-4 text-xl font-black tracking-tight text-text">{name}</h2>
          <p className="mt-0.5 text-xs text-muted truncate px-2">{email}</p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold capitalize text-primary shadow-sm">
            <Award size={13} />
            <span>{role}</span>
          </div>

          <div className="mt-6 rounded-2xl bg-muted-bg/40 p-4 text-left border border-border/40">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-bold text-muted">Profile Completion</span>
              <span className="font-extrabold text-primary">{profileCompletion}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border/40">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] text-muted">Complete your profile to keep your account information up to date.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-surface/80 p-6 shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-black tracking-tight text-text mb-4">Security Status</h3>
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-muted font-medium">
                <CheckCircle2 size={15} className="text-emerald-500" /> Email Connected
              </span>
              <span className="text-emerald-500 font-bold">Active</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-muted font-medium">
                <CheckCircle2 size={15} className="text-emerald-500" /> Password Protected
              </span>
              <span className="text-emerald-500 font-bold">Secure</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-muted font-medium">
                <CheckCircle2 size={15} className="text-emerald-500" /> Account Status
              </span>
              <span className="text-emerald-500 font-bold">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="space-y-6 lg:col-span-2">
        {/* Edit Profile Card */}
        <div className="rounded-3xl border border-border/80 bg-surface/85 p-6 md:p-8 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black tracking-tight text-text">Edit Profile Credentials</h3>
            <p className="mt-1 text-xs text-muted">Update your full name, phone number or change your profile avatar image.</p>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 px-6 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:opacity-95 shrink-0"
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        </div>

        {/* Change Password Inline Form */}
        <div className="rounded-3xl border border-border/80 bg-surface/85 p-6 md:p-8 shadow-xl backdrop-blur-md">
          <div className="mb-6">
            <h3 className="text-lg font-black tracking-tight text-text flex items-center gap-2">
              <Lock className="text-primary" size={20} />
              Change Password
            </h3>
            <p className="mt-1 text-xs text-muted">Update your password to keep your account secure.</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted mb-1.5">CURRENT PASSWORD</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full rounded-2xl border border-border/80 bg-background px-4 py-3 pr-11 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-3.5 text-muted hover:text-text transition"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted mb-1.5">NEW PASSWORD</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full rounded-2xl border border-border/80 bg-background px-4 py-3 pr-11 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-3.5 text-muted hover:text-text transition"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {msg && (
              <div className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${isSuccess ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                {isSuccess ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{msg}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-primary py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:opacity-95 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
        />
      )}
    </div>
  );
}