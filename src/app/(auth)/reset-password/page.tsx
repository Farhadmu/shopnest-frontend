"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { authClient } from "@/lib/auth-client";

/* ─── SVG Icons ────────────────────────────────────────────────────────────── */

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

/* ─── Password strength meter ──────────────────────────────────────────────── */
function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Very weak", color: "bg-red-500" };
  if (score === 2) return { score, label: "Weak", color: "bg-orange-400" };
  if (score === 3) return { score, label: "Fair", color: "bg-yellow-400" };
  if (score === 4) return { score, label: "Strong", color: "bg-emerald-400" };
  return { score, label: "Very strong", color: "bg-emerald-500" };
}

/* ─── Footer (shared) ──────────────────────────────────────────────────────── */
function PageFooter() {
  return (
    <footer className="flex-shrink-0 border-t border-border py-2.5 sm:py-3 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted bg-surface dark:bg-background transition-colors">
      <span>&copy; {new Date().getFullYear()} ShopNest, Inc. All rights reserved.</span>
      <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
        <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
        <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
      </nav>
    </footer>
  );
}

/* ─── Main page content (uses useSearchParams, needs Suspense) ─────────────── */
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  const strength = getStrength(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = Boolean(token) && password.length >= 8 && passwordsMatch;

  /* Countdown redirect after success */
  useEffect(() => {
    if (!success) return;
    if (countdown <= 0) {
      router.push("/login");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [success, countdown, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token: token!,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || "Failed to reset password. The link may have expired.");
    } else {
      setSuccess(true);
    }
  };

  /* ── No token in URL ──────────────────────────────────────────────────────── */
  if (!token) {
    return (
      <div className="min-h-full flex-1 flex flex-col justify-between bg-surface dark:bg-background text-text transition-colors">
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[24rem] sm:max-w-md bg-surface dark:bg-[#120B2E]/70 border border-border shadow-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 backdrop-blur-xl text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 dark:bg-red-500/25 flex items-center justify-center text-red-500 mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-text mb-2">Invalid Reset Link</h1>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              This password reset link is missing a token. Please request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent shadow-lg transition-all hover:scale-[1.02]"
            >
              Request New Link
            </Link>
          </motion.div>
        </div>
        <PageFooter />
      </div>
    );
  }

  /* ── Success state ──────────────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="min-h-full flex-1 flex flex-col justify-between bg-surface dark:bg-background text-text transition-colors">
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[24rem] sm:max-w-md bg-surface dark:bg-[#120B2E]/70 border border-border shadow-xl rounded-2xl sm:rounded-3xl p-8 sm:p-10 backdrop-blur-xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400/20 to-emerald-500/30 border border-emerald-400/30 flex items-center justify-center text-emerald-500 mx-auto mb-5 shadow-lg"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>

            <h1 className="text-2xl font-black text-text mb-2">Password Updated!</h1>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Your password has been reset successfully. You can now sign in with your new credentials.
            </p>

            <div className="mb-5">
              <div className="text-xs text-muted mb-2">
                Redirecting to login in{" "}
                <span className="font-bold text-primary">{countdown}s</span>&hellip;
              </div>
              <div className="h-1 w-full rounded-full bg-muted-bg overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent shadow-lg shadow-indigo-500/25 dark:shadow-purple-900/40 transition-all hover:scale-[1.02]"
            >
              Sign In Now
            </Link>
          </motion.div>
        </div>
        <PageFooter />
      </div>
    );
  }

  /* ── Main form ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-full flex-1 flex flex-col justify-between bg-surface dark:bg-background text-text transition-colors">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[24rem] sm:max-w-md bg-surface dark:bg-[#120B2E]/70 border border-border shadow-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 backdrop-blur-xl my-auto"
        >
          {/* Back link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline mb-4 sm:mb-6 group transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </Link>

          {/* Header icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-primary/15 to-accent/20 dark:from-primary/30 dark:to-accent/40 flex items-center justify-center text-primary mb-3 sm:mb-4 shadow-inner">
            <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text">
            Reset Your Password
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
            Choose a strong, unique password to secure your ShopNest account.
          </p>

          {/* Error banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-5 sm:mt-6 space-y-4">
            {/* New password */}
            <div>
              <label
                htmlFor="reset-password"
                className="block text-[11px] sm:text-xs font-bold text-text mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-3.5 text-muted">
                  <LockIcon className="w-4 h-4" />
                </div>
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-border bg-muted-bg pl-9 sm:pl-10 pr-10 sm:pr-11 py-2.5 sm:py-3 text-xs sm:text-sm text-text placeholder:text-muted shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-3.5 text-muted hover:text-text transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength meter */}
              <AnimatePresence>
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength.score ? strength.color : "bg-muted-bg"
                            }`}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <p className={`text-[10px] font-semibold ${
                          strength.score <= 1 ? "text-red-500" :
                          strength.score === 2 ? "text-orange-400" :
                          strength.score === 3 ? "text-yellow-500" :
                          "text-emerald-500"
                        }`}>
                          {strength.label}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block text-[11px] sm:text-xs font-bold text-text mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-3.5 text-muted">
                  <LockIcon className="w-4 h-4" />
                </div>
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className={`w-full rounded-xl border bg-muted-bg pl-9 sm:pl-10 pr-10 sm:pr-11 py-2.5 sm:py-3 text-xs sm:text-sm text-text placeholder:text-muted shadow-sm outline-none transition-all focus:ring-2 disabled:opacity-50 ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20"
                        : "border-red-400/60 focus:border-red-400 focus:ring-red-400/20"
                      : "border-border focus:border-primary focus:ring-primary/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-3.5 text-muted hover:text-text transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              <AnimatePresence>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <motion.p
                    key="no-match"
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    className="mt-1.5 text-[10px] text-red-500 font-medium"
                  >
                    Passwords do not match
                  </motion.p>
                )}
                {passwordsMatch && (
                  <motion.p
                    key="match"
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    className="mt-1.5 text-[10px] text-emerald-500 font-medium flex items-center gap-1"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Passwords match
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Requirements checklist */}
            <ul className="space-y-1.5 rounded-xl border border-border bg-muted-bg/50 p-3 text-[10px] sm:text-xs text-muted">
              {[
                { label: "At least 8 characters", met: password.length >= 8 },
                { label: "One uppercase letter", met: /[A-Z]/.test(password) },
                { label: "One number", met: /[0-9]/.test(password) },
                { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
              ].map(({ label, met }) => (
                <li key={label} className={`flex items-center gap-2 transition-colors ${met ? "text-emerald-500" : ""}`}>
                  <svg viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${met ? "text-emerald-500" : "text-muted/40"}`} aria-hidden="true">
                    {met ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    )}
                  </svg>
                  {label}
                </li>
              ))}
            </ul>

            <motion.button
              type="submit"
              disabled={!isFormValid || isLoading}
              whileHover={{ scale: isFormValid && !isLoading ? 1.015 : 1 }}
              whileTap={{ scale: isFormValid && !isLoading ? 0.98 : 1 }}
              className="w-full rounded-full py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent shadow-indigo-500/25 dark:shadow-purple-900/40"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Updating Password&hellip;
                </span>
              ) : (
                "Reset Password"
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>

      <PageFooter />
    </div>
  );
}

/* ─── Export wrapped in Suspense (useSearchParams requires it) ─────────────── */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full flex-1 flex items-center justify-center bg-surface dark:bg-background">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
