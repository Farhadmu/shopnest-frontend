"use client";

import { useEffect, useState } from "react";
import {
  getUserProfile,
  updateUserProfile,
  UserProfile,
} from "@/lib/api/users";
import { createAuthClient } from "better-auth/react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

const authClient = createAuthClient();

export default function ProfilePage() {
  const [p, setP] = useState<UserProfile | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [uploading, setUploading] = useState(false);

  // Profile message
  const [profileMsg, setProfileMsg] = useState("");
  const [profileMsgType, setProfileMsgType] = useState<
    "success" | "error"
  >("success");

  // Password message
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordMsgType, setPasswordMsgType] = useState<
    "success" | "error"
  >("success");

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // =========================
  // Get User Profile
  // =========================
  useEffect(() => {
    getUserProfile()
      .then((d) => {
        setP(d);
        setName(d.name || "");
        setEmail(d.email || "");
        setPhone(d.phone || "");
        setAvatar(d.avatarUrl || d.image || "");
      })
      .catch(() => undefined);
  }, []);

  // =========================
  // Image Upload
  // =========================
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setProfileMsg("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setAvatar(data.data.url);

        setProfileMsgType("success");
        setProfileMsg(
          "Image uploaded successfully! Click Save Changes."
        );
      } else {
        setProfileMsgType("error");
        setProfileMsg("Image upload failed.");
      }
    } catch {
      setProfileMsgType("error");
      setProfileMsg("Image upload error.");
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // Save Profile
  // =========================
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setProfileMsg("");

    try {
      const d = await updateUserProfile({
        name,
        phone,
        avatarUrl: avatar,
      });

      setP(d);

      setProfileMsgType("success");
      setProfileMsg("Profile updated successfully!");
    } catch (e) {
      setProfileMsgType("error");
      setProfileMsg(
        e instanceof Error
          ? e.message
          : "Failed to update profile."
      );
    }
  };

  // =========================
  // Change Password
  // =========================
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    setPasswordMsg("");

    if (!currentPassword || !newPassword) {
      setPasswordMsgType("error");
      setPasswordMsg("Please fill in both password fields.");
      return;
    }

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setPasswordMsgType("error");
        setPasswordMsg(
          error.message || "Failed to change password."
        );
        return;
      }

      setPasswordMsgType("success");
      setPasswordMsg("Password changed successfully!");

      setCurrentPassword("");
      setNewPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
    } catch (err: unknown) {
      setPasswordMsgType("error");
      setPasswordMsg(
        err instanceof Error
          ? err.message
          : "An error occurred while changing password."
      );
    }
  };

  // =========================
  // Profile Completion
  // =========================
  const profileFields = [name, email, phone, avatar];

  const completedFields = profileFields.filter(
    (field) => field && field.trim() !== ""
  ).length;

  const profileCompletion = Math.round(
    (completedFields / profileFields.length) * 100
  );

  return (
    <div className="mx-auto max-w-5xl">
      {/* =========================
          Header
      ========================= */}
      <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
        Account
      </p>

      <h1 className="mt-1 text-3xl font-black">
        Profile & Security
      </h1>

      <p className="mt-2 text-sm text-muted">
        Manage your identity and account preferences.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* =========================
            LEFT SIDEBAR
        ========================= */}
        <div className="space-y-6">
          {/* =========================
              User Info Card
          ========================= */}
          <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
            {/* Avatar */}
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-primary/50 bg-muted-bg shadow-inner">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                  No Image
                </div>
              )}
            </div>

            {/* Name */}
            <h2 className="mt-4 text-lg font-bold">
              {name || "Loading..."}
            </h2>

            {/* Email */}
            <p className="mt-1 text-xs text-muted">
              {email || "Loading..."}
            </p>

            {/* Role */}
            <div className="mt-4 inline-block rounded-full bg-muted-bg px-3 py-1 text-xs font-semibold capitalize text-primary">
              {p?.role || "customer"}
            </div>

            {/* =========================
                Profile Completion
            ========================= */}
            <div className="mt-6 text-left">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-muted">
                  Profile Completion
                </span>

                <span className="text-xs font-bold text-primary">
                  {profileCompletion}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted-bg">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[11px] text-muted">
                Complete your profile to keep your account information
                up to date.
              </p>
            </div>
          </div>

          {/* =========================
              Security Status
          ========================= */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="mb-4 text-base font-bold">
              Security Status
            </h3>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                    ✓
                  </span>

                  <span className="text-sm font-medium">
                    Email Connected
                  </span>
                </div>

                <span className="text-xs font-bold text-green-600">
                  Active
                </span>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                    ✓
                  </span>

                  <span className="text-sm font-medium">
                    Password Protected
                  </span>
                </div>

                <span className="text-xs font-bold text-green-600">
                  Secure
                </span>
              </div>

              {/* Account */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                    ✓
                  </span>

                  <span className="text-sm font-medium">
                    Account Status
                  </span>
                </div>

                <span className="text-xs font-bold text-green-600">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            RIGHT CONTENT
        ========================= */}
        <div className="space-y-6 md:col-span-2">
          {/* =========================
              Edit Profile
          ========================= */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="mb-4 text-base font-bold">
              Edit Profile
            </h3>

            <form onSubmit={saveProfile} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm opacity-60 focus:outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1XXXXXXXXX"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Avatar */}
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">
                  Profile Avatar
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background p-5 text-center transition hover:border-primary">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="mb-2 h-6 w-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>

                    <p className="text-xs font-medium text-muted">
                      {uploading
                        ? "Uploading..."
                        : "Click to upload new avatar"}
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Save Changes"}
              </button>

              {/* Profile Message */}
              {profileMsg && (
                <div
                  className={`rounded-xl border px-4 py-3 text-center ${
                    profileMsgType === "success"
                      ? "border-green-500/20 bg-green-500/10"
                      : "border-red-500/20 bg-red-500/10"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      profileMsgType === "success"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {profileMsg}
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* =========================
              Change Password
          ========================= */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold">
                Change Password
              </h2>

              <p className="mt-1 text-sm text-muted">
                Update your password to keep your account secure.
              </p>
            </div>

            <form
              onSubmit={handlePasswordChange}
              className="space-y-5"
            >
              {/* Current Password */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-sm font-semibold"
                >
                  Current Password
                </label>

                <div className="relative">
                  <input
                    id="currentPassword"
                    type={
                      showCurrentPassword ? "text" : "password"
                    }
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(e.target.value)
                    }
                    placeholder="Enter your current password"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-foreground"
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-semibold"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="newPassword"
                    type={
                      showNewPassword ? "text" : "password"
                    }
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="Enter your new password"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-foreground"
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Update Password Button */}
              <button
                type="submit"
                className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
              >
                Update Password
              </button>

              {/* Password Message */}
              {passwordMsg && (
                <div
                  className={`rounded-xl border px-4 py-3 text-center ${
                    passwordMsgType === "success"
                      ? "border-green-500/20 bg-green-500/10"
                      : "border-red-500/20 bg-red-500/10"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      passwordMsgType === "success"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {passwordMsg}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}