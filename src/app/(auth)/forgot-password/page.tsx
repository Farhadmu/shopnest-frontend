"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    // Simulate / Trigger request
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
    }, 600);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-[#FFFFFF] dark:bg-[#090614] text-[#0F172A] dark:text-[#F8FAFC] transition-colors">
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-white dark:bg-[#120B2E]/70 border border-[#E2E8F0] dark:border-[#2D2250] shadow-xl rounded-3xl p-7 sm:p-8 backdrop-blur-xl"
        >
          {/* Back link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#4F46E5] dark:text-[#A78BFA] hover:underline mb-6 group transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>

          {/* Header Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F46E5]/15 to-[#7C3AED]/20 dark:from-[#4F46E5]/30 dark:to-[#7C3AED]/40 flex items-center justify-center text-[#4F46E5] dark:text-[#A78BFA] mb-4 shadow-inner">
            <KeyIcon className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Forgot Password?
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            No worries! Enter your registered email address and we&apos;ll send you instructions to reset your password.
          </p>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-300 space-y-2"
            >
              <div className="font-bold flex items-center gap-2">
                <span>✓</span> Reset Link Sent!
              </div>
              <p>
                If an account exists for <span className="font-semibold underline">{email}</span>, we&apos;ve sent an email with further instructions.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 underline hover:opacity-80"
              >
                Try another email
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
                    <MailIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#2D2250] bg-[#FFFFFF] dark:bg-[#160F30] pl-10 pr-3.5 py-3 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] shadow-sm outline-none transition-all focus:border-[#4F46E5] dark:focus:border-[#7C3AED] focus:ring-2 focus:ring-[#4F46E5]/20"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-full py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] shadow-indigo-500/25 dark:shadow-purple-900/40"
              >
                {isLoading ? "Sending instructions..." : "Send Reset Instructions"}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-[#E2E8F0] dark:border-[#2D2250] py-3 px-6 flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
        <span>© {new Date().getFullYear()} ShopNest, Inc.</span>
        <nav className="flex items-center gap-4">
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/support" className="hover:underline">Support</Link>
        </nav>
      </footer>
    </div>
  );
}