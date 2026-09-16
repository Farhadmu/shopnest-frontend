"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useSession } from "@/lib/auth-client";
import { getDeliveryProfile, DeliveryManProfile, DeliveryManDetails } from "@/lib/api/delivery";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiShield,
  FiFileText,
  FiPhoneCall,
  FiArrowRight,
  FiTruck,
} from "react-icons/fi";

export default function DeliveryPendingPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<DeliveryManProfile | null>(null);
  const [details, setDetails] = useState<DeliveryManDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getDeliveryProfile();
      if (res && "data" in res && (res as any).data) {
        setProfile((res as any).data.profile || null);
        setDetails((res as any).data.details || null);
      } else if (res) {
        setProfile(res.profile || null);
        setDetails(res.details || null);
      }
    } catch (err) {
      console.error("Failed to load delivery profile:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionLoading) {
      if (!session?.user) {
        router.replace("/login?next=/delivery/pending");
        return;
      }
      fetchProfile();
    }
  }, [session, sessionLoading, router, fetchProfile]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-background px-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-text">Checking verification status...</p>
          <p className="text-xs text-muted">Retrieving KYC telemetry from ShopNest Trust Engine.</p>
        </div>
      </div>
    );
  }

  const status = profile?.status || "pending_verification";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface dark:bg-background text-text transition-colors p-4 sm:p-6 lg:p-8">
      {/* Header mark */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2 border-b border-border">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-linear-to-r from-primary to-accent flex items-center justify-center text-white shadow-md">
            <FiTruck className="text-lg" />
          </div>
          <div>
            <span className="font-black text-base tracking-tight text-text block leading-none">ShopNest</span>
            <span className="text-[10px] font-bold text-primary tracking-wider uppercase">Delivery Partner Portal</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-muted-bg px-3.5 py-1.5 text-xs font-bold text-text hover:border-primary transition cursor-pointer disabled:opacity-60"
        >
          <FiRefreshCw className={`text-primary ${refreshing ? "animate-spin" : ""}`} />
          <span>Check Status</span>
        </button>
      </header>

      {/* Main Status Container */}
      <main className="max-w-3xl w-full mx-auto my-auto py-8">
        {status === "approved" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8 text-center shadow-xl backdrop-blur-md"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 text-3xl shadow-lg">
              <FiCheckCircle />
            </div>
            <span className="inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
              Application Approved
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight mb-2">
              Welcome to the Delivery Fleet!
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto mb-6">
              Your identity documents and vehicle information have been verified by the ShopNest operations team. You are ready to accept deliveries.
            </p>
            <Link
              href="/dashboard/delivery"
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-primary to-accent px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-primary/30 transition-all hover:scale-105"
            >
              <span>Enter Delivery Command Center</span>
              <FiArrowRight />
            </Link>
          </motion.div>
        )}

        {status === "pending_verification" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 text-center shadow-xl backdrop-blur-md"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/20 text-3xl shadow-lg">
              <FiClock className="animate-pulse" />
            </div>
            <span className="inline-block rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
              Application Under Review
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight mb-2">
              We Are Reviewing Your Application
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto mb-6">
              Thank you for applying to become a ShopNest Delivery Partner. Our operations and compliance team is currently reviewing your identity documents, driving license, and vehicle registration.
            </p>

            {/* Application metadata */}
            <div className="grid gap-3 sm:grid-cols-3 max-w-xl mx-auto mb-6 text-left">
              <div className="rounded-2xl border border-border bg-surface p-3.5 shadow-sm">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Submitted On</span>
                <span className="text-xs font-black text-text mt-0.5 block">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Today"}
                </span>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-3.5 shadow-sm">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Vehicle</span>
                <span className="text-xs font-black text-text mt-0.5 block capitalize">
                  {details?.vehicle?.vehicleType || "Registered"}
                </span>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-3.5 shadow-sm">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Est. Response Time</span>
                <span className="text-xs font-black text-amber-500 mt-0.5 block">12–24 Hours</span>
              </div>
            </div>

            {/* Steps Timeline */}
            <div className="rounded-2xl border border-border bg-surface/50 p-4 max-w-xl mx-auto mb-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-text">Application Submitted</p>
                  <p className="text-[10px] text-muted">Personal &amp; vehicle information recorded.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 animate-pulse">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-text">KYC &amp; License Verification</p>
                  <p className="text-[10px] text-muted">Admin verifying NID, license validity &amp; ownership.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-muted-bg text-muted flex items-center justify-center text-xs font-bold shrink-0 border border-border">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-muted">Fleet Activation</p>
                  <p className="text-[10px] text-muted">Access granted to live delivery marketplace.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-xs font-bold text-text hover:border-primary transition shadow-sm cursor-pointer"
              >
                <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
                <span>Refresh Status</span>
              </button>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition shadow-sm"
              >
                <FiPhoneCall />
                <span>Contact Fleet Support</span>
              </Link>
            </div>
          </motion.div>
        )}

        {status === "rejected" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6 sm:p-8 text-center shadow-xl backdrop-blur-md"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20 text-3xl shadow-lg">
              <FiXCircle />
            </div>
            <span className="inline-block rounded-full bg-rose-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-2">
              Action Required: Application Rejected
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight mb-2">
              Verification Could Not Be Completed
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto mb-4">
              Our compliance team reviewed your application and noted the following feedback:
            </p>

            {/* Rejection Note */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 max-w-lg mx-auto mb-6 text-left">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest block mb-1">
                Admin Reviewer Feedback
              </span>
              <p className="text-xs font-semibold text-text">
                {profile?.rejectionReason || "Some documents were unclear or expired. Please upload valid NID/license documents."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/delivery/register?resubmit=true"
                className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-primary to-accent px-6 py-3 text-xs font-bold text-white shadow-lg hover:shadow-primary/30 transition-all hover:scale-105"
              >
                <FiFileText />
                <span>Update &amp; Resubmit Application</span>
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-xs font-bold text-text hover:border-primary transition"
              >
                <FiPhoneCall />
                <span>Contact Support</span>
              </Link>
            </div>
          </motion.div>
        )}

        {status === "suspended" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-500/30 bg-slate-500/5 p-6 sm:p-8 text-center shadow-xl backdrop-blur-md"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-500/10 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-500/20 text-3xl shadow-lg">
              <FiAlertTriangle />
            </div>
            <span className="inline-block rounded-full bg-slate-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2">
              Account Suspended
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight mb-2">
              Operational Access Blocked
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto mb-6">
              Your delivery partner account has been temporarily suspended by platform administration.
              {profile?.rejectionReason ? ` Reason: ${profile.rejectionReason}` : " Please contact fleet compliance."}
            </p>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold text-white hover:bg-primary-hover transition shadow-md"
            >
              <FiPhoneCall />
              <span>Contact Fleet Administration</span>
            </Link>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted">
        <span>© {new Date().getFullYear()} ShopNest Logistics Network. Verified Deliveries.</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
          <Link href="/support" className="hover:text-primary">Support</Link>
        </div>
      </footer>
    </div>
  );
}
