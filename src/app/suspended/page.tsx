"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  Mail,
  LogOut,
  FileQuestion,
  CheckCircle2,
  Lock,
  ShoppingBag,
  MessageSquare,
  Sparkles,
  HelpCircle,
  X,
  Send,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "@/context/ToastContext";

export default function SuspendedAccountPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [isAppealOpen, setIsAppealOpen] = useState(false);
  const [appealReason, setAppealReason] = useState("");
  const [appealEmail, setAppealEmail] = useState(user?.email || "");
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to sign out. Please refresh.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReason.trim()) {
      toast.error("Please provide a reason for your appeal");
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 900));
      setAppealSubmitted(true);
      toast.success("Appeal submitted for administrative review");
    } catch {
      toast.error("Could not submit appeal. Please email support directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const userRole = ((user as { role?: string } | undefined)?.role || "Customer").toUpperCase();

  return (
    <div className="h-full w-full flex-1 flex items-center justify-center p-3 sm:p-5 relative overflow-hidden bg-gradient-to-b from-background via-surface/40 to-background">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[250px] h-[200px] bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-xl bg-surface/95 dark:bg-surface/90 border border-rose-500/25 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl flex flex-col justify-between"
      >
        {/* Top Gradient Accent Line */}
        <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-80" />

        {/* Header Icon + Titles */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-rose-500/15 to-rose-500/5 dark:from-rose-500/25 dark:to-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-inner">
              <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-lg shadow border-2 border-surface">
              <Lock className="w-3 h-3" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
            <AlertTriangle className="w-3 h-3" />
            Account Suspended
          </span>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight mb-1.5">
            Access Restricted
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-md leading-relaxed">
            Your account has been suspended by platform administration. All dashboard access, checkout, and merchant actions are temporarily disabled.
          </p>
        </div>

        {/* User Badge Row */}
        {user && (
          <div className="my-3.5 rounded-xl bg-muted-bg/50 dark:bg-surface-muted/40 border border-border/70 px-3.5 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary font-black text-xs flex items-center justify-center border border-primary/20 shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-text truncate">{user.name || "ShopNest User"}</p>
                <p className="text-[11px] text-muted truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                Suspended
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-surface text-muted border border-border">
                {userRole}
              </span>
            </div>
          </div>
        )}

        {/* Two-Column Feature Summary */}
        <div className="grid grid-cols-2 gap-2.5 my-1">
          <div className="rounded-xl border border-border/70 bg-surface/60 p-3">
            <div className="flex items-center gap-1.5 text-rose-500 font-bold text-[11px] uppercase tracking-wider mb-1">
              <Lock className="w-3 h-3 shrink-0" />
              <span>Restricted Areas</span>
            </div>
            <p className="text-[11px] text-muted leading-tight">
              Dashboards, store management, and transactions are locked.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-surface/60 p-3">
            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[11px] uppercase tracking-wider mb-1">
              <HelpCircle className="w-3 h-3 shrink-0" />
              <span>Next Steps</span>
            </div>
            <p className="text-[11px] text-muted leading-tight">
              Submit an appeal or email our compliance desk for review.
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-4 pt-3 border-t border-border/60 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => setIsAppealOpen(true)}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 transition cursor-pointer"
          >
            <FileQuestion className="w-3.5 h-3.5" />
            <span>Submit Appeal</span>
          </button>

          <Link
            href="mailto:support@shopnest.com?subject=Account%20Suspension%20Inquiry"
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-border bg-surface hover:bg-muted-bg/50 text-text font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Mail className="w-3.5 h-3.5 text-primary" />
            <span>Contact Support</span>
          </Link>
        </div>

        {/* Bottom Navigation Links */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-text transition text-muted"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Browse as Guest</span>
          </Link>

          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold cursor-pointer transition"
          >
            <LogOut className="w-3 h-3" />
            <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </motion.div>

      {/* Appeal Submission Modal */}
      <AnimatePresence>
        {isAppealOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-surface border border-border p-5 sm:p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-text font-bold text-base">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span>Account Suspension Appeal</span>
                </div>
                <button
                  onClick={() => setIsAppealOpen(false)}
                  className="text-muted hover:text-text p-1 rounded-lg hover:bg-muted-bg transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {appealSubmitted ? (
                <div className="text-center py-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-text mb-1.5">Appeal Submitted</h3>
                  <p className="text-xs text-muted mb-5 max-w-xs mx-auto">
                    Your appeal has been forwarded to our Trust & Safety team. We will review your account and notify you at {appealEmail || "your registered email"} within 24–48 hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsAppealOpen(false);
                      setAppealSubmitted(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAppealSubmit} className="space-y-3">
                  <p className="text-xs text-muted leading-relaxed">
                    Please provide any context or clarification regarding your account activity for administrative review.
                  </p>

                  <div>
                    <label className="block text-[11px] font-semibold text-text mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      value={appealEmail}
                      onChange={(e) => setAppealEmail(e.target.value)}
                      required
                      placeholder="your.email@example.com"
                      className="w-full rounded-lg border border-border bg-muted-bg/30 px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-text mb-1">
                      Reason for Appeal
                    </label>
                    <textarea
                      rows={3}
                      value={appealReason}
                      onChange={(e) => setAppealReason(e.target.value)}
                      required
                      placeholder="Explain why your account should be reviewed or reinstated..."
                      className="w-full rounded-lg border border-border bg-muted-bg/30 px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAppealOpen(false)}
                      className="px-3 py-2 rounded-lg border border-border text-xs font-semibold text-muted hover:text-text transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{submitting ? "Sending..." : "Submit Appeal"}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
