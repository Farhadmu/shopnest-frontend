"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
// Import your configured Better Auth client instance
import { authClient } from "@/lib/auth-client"; 

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Call Better Auth client API
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || "Something went wrong. Please try again.");
    } else {
      setSent(true);
    }
  };

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
            className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline mb-4 sm:mb-6 group transition-colors cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>

          {/* Header Icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-primary/15 to-accent/20 dark:from-primary/30 dark:to-accent/40 flex items-center justify-center text-primary mb-3 sm:mb-4 shadow-inner">
            <KeyIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text cursor-pointer">
            Forgot Password?
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
            No worries! Enter your registered email address and we&apos;ll send you instructions to reset your password.
          </p>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400"
            >
              {errorMessage}
            </motion.div>
          )}

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-5 sm:mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-300 space-y-2"
            >
              <div className="font-bold flex items-center gap-2">
                <span>✓</span> Reset Link Sent!
              </div>
              <p>
                If an account exists for <span className="font-semibold underline">{email}</span>, we&apos;ve sent an email with further instructions.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setErrorMessage(null);
                }}
                className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 underline hover:opacity-80"
              >
                Try another email
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 sm:mt-6 space-y-3.5 sm:space-y-4">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-[11px] sm:text-xs font-bold text-text mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-3.5 text-muted">
                    <MailIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-border bg-muted-bg pl-9 sm:pl-10 pr-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-text placeholder:text-muted shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-full py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent shadow-indigo-500/25 dark:shadow-purple-900/40"
              >
                {isLoading ? "Sending instructions..." : "Send Reset Instructions"}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-border py-2.5 sm:py-3 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted bg-surface dark:bg-background transition-colors">
        <span>© {new Date().getFullYear()} ShopNest, Inc. All rights reserved.</span>
        <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
        </nav>
      </footer>
    </div>
  );
}