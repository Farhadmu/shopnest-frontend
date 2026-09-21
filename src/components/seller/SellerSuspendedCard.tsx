"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  Mail,
  FileQuestion,
  CheckCircle2,
  Lock,
  Store,
  X,
  Send,
  HelpCircle,
  Clock,
  ArrowRight,
  EyeOff,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { MyStore, submitSellerAppeal } from "@/lib/api/sellers";
import { useSession } from "@/lib/auth-client";
import { toast } from "@/context/ToastContext";

export interface SellerSuspendedCardProps {
  store: MyStore;
}

export function SellerSuspendedCard({ store }: SellerSuspendedCardProps) {
  const { data: session } = useSession();
  const [isAppealOpen, setIsAppealOpen] = useState(false);
  const [appealReason, setAppealReason] = useState(store?.appeal?.reason || "");
  const [appealEmail, setAppealEmail] = useState(
    store?.appeal?.email || session?.user?.email || ""
  );
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync state if store updates
  useEffect(() => {
    if (store?.appeal?.reason) {
      setAppealReason(store.appeal.reason);
    }
    if (store?.appeal?.email) {
      setAppealEmail(store.appeal.email);
    }
  }, [store]);

  const hasPendingAppeal =
    store?.appeal?.status === "pending" || appealSubmitted;

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReason.trim()) {
      toast.error("Please explain your situation for the appeal review.");
      return;
    }

    setSubmitting(true);
    try {
      await submitSellerAppeal({
        reason: appealReason.trim(),
        email: appealEmail.trim() || session?.user?.email || "",
      });
      setAppealSubmitted(true);
      toast.success("Merchant appeal successfully submitted to Compliance.");
    } catch (err: any) {
      toast.error(
        err?.message ||
        "Could not submit appeal. Please reach out to support directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
      {/* Modern 2-Column Split Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-surface shadow-xl backdrop-blur-xl"
      >
        {/* Top Gradient Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Left Main Column: Reason & Action (Col 1-7) */}
          <div className="p-5 sm:p-7 md:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              {/* Header Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-3 w-3" /> Compliance Hold
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted-bg px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                  <Store className="h-3 w-3 text-primary" /> {store.storeName}
                </span>
              </div>

              {/* Title */}
              <h1 className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-text">
                Store Account Suspended
              </h1>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Your store has been temporarily paused by marketplace moderation. Review the notice below to file an appeal.
              </p>

              {/* Suspension Reason Box */}
              <div className="mt-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Administrative Suspension Reason</span>
                </div>
                <p className="mt-1.5 text-xs font-medium text-text pl-5.5 leading-relaxed bg-background/60 p-2.5 rounded-xl border border-rose-500/15">
                  "{store.suspensionReason || store.rejectionReason || "Store under compliance investigation."}"
                </p>
              </div>

              {/* Active Appeal Notification Banner (If exists) */}
              {store?.appeal?.reason && (
                <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <span className="font-bold text-text">Appeal Ticket Logged</span>
                      <p className="text-[11px] text-muted truncate max-w-[240px]">
                        "{store.appeal.reason}"
                      </p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-black uppercase shrink-0">
                    {store.appeal.status || "Pending"}
                  </span>
                </div>
              )}
            </div>

            {/* Actions & Footer */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setAppealSubmitted(false);
                    setIsAppealOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-rose-500/20 transition hover:from-rose-700 hover:to-rose-600 active:scale-[0.98] cursor-pointer"
                >
                  <FileQuestion className="h-3.5 w-3.5" />
                  {store?.appeal?.reason
                    ? "Update Appeal Message"
                    : "Submit Compliance Appeal"}
                </button>

                <Link
                  href="/dashboard/seller"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-text shadow-xs transition hover:border-primary/40 hover:text-primary active:scale-[0.98]"
                >
                  <span>Seller Hub</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="text-[11px] text-muted flex items-center gap-1.5 pt-1">
                <HelpCircle className="h-3.5 w-3.5 text-muted shrink-0" />
                <span>Need support? Contact</span>
                <a
                  href="mailto:compliance@shopnest.com"
                  className="font-semibold text-primary hover:underline"
                >
                  compliance@shopnest.com
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Platform Restrictions Checklist (Col 8-12) */}
          <div className="p-5 sm:p-7 md:col-span-5 bg-muted-bg/30 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-rose-500" /> Current Store Restrictions
              </h2>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3 shadow-xs">
                  <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
                    <EyeOff className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text">Public Storefront Paused</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Store & listings are hidden from buyer marketplace search.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3 shadow-xs">
                  <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text">Product Creation Locked</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Adding or editing inventory is temporarily restricted.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3 shadow-xs">
                  <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text">Read-Only Hub Active</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Historical sales, analytics, and orders remain accessible.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fast Appeal Reassurance */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-[11px] text-muted">
              <span className="font-bold text-primary">Fast SLA: </span>
              Appeals are reviewed by our trust team within 24–48 hours.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Appeal Submission Modal */}
      <AnimatePresence>
        {isAppealOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl"
            >
              <button
                onClick={() => setIsAppealOpen(false)}
                className="absolute top-4 right-4 rounded-full p-2 text-muted hover:bg-muted-bg hover:text-text transition"
                aria-label="Close appeal modal"
              >
                <X className="h-4 w-4" />
              </button>

              {!appealSubmitted ? (
                <form onSubmit={handleAppealSubmit}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <FileQuestion className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-text">
                        {store?.appeal?.reason
                          ? "Edit Merchant Appeal"
                          : "Submit Merchant Appeal"}
                      </h3>
                      <p className="text-xs text-muted">
                        Request compliance review for {store.storeName}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted leading-relaxed mb-4">
                    Provide context regarding your store policies or corrective actions to expedite resolution.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-muted mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        required
                        value={appealEmail}
                        onChange={(e) => setAppealEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-text outline-none focus:border-primary transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-muted mb-1">
                        Explanation & Remediation Plan *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={appealReason}
                        onChange={(e) => setAppealReason(e.target.value)}
                        placeholder="Please explain why your store should be reinstated and any corrective actions taken..."
                        className="w-full rounded-xl border border-border bg-background p-3 text-xs text-text outline-none focus:border-primary transition resize-none"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsAppealOpen(false)}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-muted hover:bg-muted-bg transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-black text-white hover:bg-primary-hover transition disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" /> Submit Appeal
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-black text-text">
                    Appeal Under Review
                  </h3>
                  <p className="mt-2 text-xs text-muted max-w-sm mx-auto leading-relaxed">
                    Your appeal for <strong>{store.storeName}</strong> has been logged. Updates will be sent to <strong>{appealEmail}</strong> within 24–48 hours.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setAppealSubmitted(false)}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:bg-primary-hover transition cursor-pointer"
                    >
                      ✍️ Edit Appeal
                    </button>
                    <button
                      onClick={() => setIsAppealOpen(false)}
                      className="rounded-xl bg-surface border border-border px-4 py-2 text-xs font-bold text-text hover:bg-muted-bg transition cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
