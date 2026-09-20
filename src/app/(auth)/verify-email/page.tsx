"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { authClient } from "@/lib/auth-client";
import { normalizeAuthRedirect } from "@/lib/auth-redirect";
import { syncGuestDataToServer } from "@/lib/guest-store";

/* ─── Motion Variants ───────────────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.45,
      delay: i * 0.05,
      ease: EASE,
    },
  }),
};

const panelLeft = {
  hidden: { opacity: 0, x: -40, scale: 0.97 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

const panelRight = {
  hidden: { opacity: 0, x: 40, scale: 0.97 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

/* ─── Floating Particles ─────────────────────────────────────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: (i * 17) % 100,
    y: (i * 23) % 100,
    size: (i % 3) * 1.5 + 2,
    dur: (i % 4) + 6,
    delay: (i % 5) * 0.8,
  }));

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20 dark:bg-purple-300/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -28, 0],
            x: [0, p.id % 2 === 0 ? 10 : -10, 0],
            opacity: [0.1, 0.65, 0.1],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: p.dur,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Main Verify Email Page
═══════════════════════════════════════════════════════════════════════════════ */
export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-surface dark:bg-background" />}>
      <VerifyEmailContent />
    </React.Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email") || "";
  const nextParam = normalizeAuthRedirect(searchParams.get("next"));
  const roleParam = searchParams.get("role") || "customer";

  const [email, setEmail] = useState(emailParam);
  const [isEditingEmail, setIsEditingEmail] = useState(!emailParam);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successVerified, setSuccessVerified] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update email if query param changes
  useEffect(() => {
    if (emailParam && !email) {
      setEmail(emailParam);
      setIsEditingEmail(false);
    }
  }, [emailParam, email]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first input on load
  useEffect(() => {
    if (!isEditingEmail) {
      inputRefs.current[0]?.focus();
    }
  }, [isEditingEmail]);

  // Handle OTP slot change
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setErrorMessage("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle KeyDown (Backspace & arrow navigation)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtp(newOtp);
    setErrorMessage("");

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const otpCode = otp.join("");
  const isOtpComplete = otpCode.length === 6;

  // Submit OTP Verification
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isVerifying || !isOtpComplete || !email.trim()) return;

    setErrorMessage("");
    setIsVerifying(true);

    try {
      const res = await authClient.emailOtp.verifyEmail({
        email: email.trim().toLowerCase(),
        otp: otpCode,
      });

      if (res.error) {
        const code = res.error.code;
        const msg = res.error.message?.toLowerCase() || "";

        if (code === "OTP_EXPIRED" || msg.includes("expired")) {
          setErrorMessage("This verification code has expired. Please request a new code below.");
        } else if (code === "TOO_MANY_ATTEMPTS" || msg.includes("too many attempts")) {
          setErrorMessage("Too many invalid attempts. Please request a new verification code.");
        } else if (code === "INVALID_OTP" || msg.includes("invalid otp")) {
          setErrorMessage("The verification code is incorrect. Please check the code and try again.");
        } else {
          setErrorMessage(res.error.message || "Verification failed. Please try again.");
        }
        return;
      }

      // Successful verification
      setSuccessVerified(true);
      await syncGuestDataToServer();

      // Delay briefly to show the success state before redirecting
      setTimeout(() => {
        if (roleParam === "delivery_man") {
          router.replace("/delivery/register");
        } else if (roleParam === "seller") {
          router.replace("/become-seller");
        } else {
          router.replace(nextParam || "/");
        }
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error("Verification error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Unable to verify code.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (isResending || resendCooldown > 0 || !email.trim()) return;

    setErrorMessage("");
    setIsResending(true);
    setResendSuccess(false);

    try {
      const res = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: "email-verification",
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Failed to resend verification code.");
        return;
      }

      setResendSuccess(true);
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error("Resend OTP error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  let s = 0;

  return (
    <div className="h-full flex-1 flex flex-col justify-between bg-surface dark:bg-background text-text transition-colors overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">

        {/* ── LEFT: Form Panel ── */}
        <motion.div
          variants={panelLeft}
          initial="hidden"
          animate="show"
          className="flex-1 flex flex-col items-center justify-center overflow-y-auto lg:overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8 xl:px-12 bg-surface dark:bg-background transition-colors"
        >
          <div className="w-full max-w-[22rem] sm:max-w-[24rem] xl:max-w-[26rem] my-auto flex flex-col justify-center">

            {/* Mobile Brand Mark */}
            <motion.div
              custom={s++}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex lg:hidden items-center gap-1.5 mb-2"
            >
              <div className="w-7 h-7 rounded-lg bg-linear-to-r from-primary to-accent flex items-center justify-center shrink-0 shadow-md">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                </svg>
              </div>
              <span className="font-black text-sm text-text">ShopNest</span>
            </motion.div>

            {/* Header Icon */}
            <motion.div
              custom={s++}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-3 shadow-xs"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </motion.div>

            {/* Header Title */}
            <motion.div
              custom={s++}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mb-3"
            >
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text leading-tight">
                Verify Your Email
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted">
                Enter the 6-digit verification code sent to:
              </p>

              {/* Email indicator with edit capability */}
              <div className="mt-1.5 flex items-center gap-2">
                {isEditingEmail ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 rounded-lg border border-border bg-muted-bg px-2.5 py-1 text-xs text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(false)}
                      className="rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-text bg-muted-bg px-2.5 py-1 rounded-md border border-border">
                      {email || "No email provided"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(true)}
                      className="text-primary hover:underline text-[11px] font-semibold cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Error Notification */}
            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div
                  key="err-alert"
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  role="alert"
                  className="mb-3 flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resend Success Notification */}
            <AnimatePresence mode="wait">
              {resendSuccess && !errorMessage && (
                <motion.div
                  key="resend-success"
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  role="status"
                  className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  A new verification code has been dispatched to your email.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verification Success State */}
            {successVerified ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="my-4 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-400">Email Verified!</h3>
                  <p className="text-xs text-muted mt-1">Redirecting you to your account…</p>
                </div>
              </motion.div>
            ) : (
              /* OTP Form */
              <form onSubmit={handleVerify} noValidate>
                {/* 6-Digit OTP Inputs */}
                <motion.div
                  custom={s++}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="flex items-center justify-between gap-1.5 sm:gap-2 my-3"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      autoComplete="one-time-code"
                      aria-label={`Digit ${idx + 1}`}
                      className={`w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-xl border bg-muted-bg text-text outline-none transition-all ${
                        errorMessage
                          ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                          : digit
                            ? "border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                            : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    />
                  ))}
                </motion.div>

                {/* Expiry Notice */}
                <motion.p
                  custom={s++}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="text-[11px] sm:text-xs text-muted text-center mb-3"
                >
                  Code expires in <strong>5 minutes</strong>.
                </motion.p>

                {/* Verify Button */}
                <motion.div custom={s++} variants={fadeUp} initial="hidden" animate="show">
                  <motion.button
                    id="verify-otp-submit"
                    type="submit"
                    disabled={isVerifying || !isOtpComplete}
                    whileHover={{ scale: 1.015, boxShadow: "0 6px 20px rgba(91,92,240,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full rounded-full py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white overflow-hidden shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-linear-to-r from-primary to-accent hover:from-primary-hover hover:to-accent transition-all cursor-pointer"
                  >
                    {isVerifying ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <motion.span
                          className="w-4 h-4 rounded-full border-2 border-white border-t-transparent cursor-pointer"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.75, ease: "linear" }}
                        />
                        Verifying Code…
                      </span>
                    ) : (
                      <span>Verify &amp; Continue</span>
                    )}
                  </motion.button>
                </motion.div>

                {/* Resend Action */}
                <motion.div
                  custom={s++}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="mt-3 text-center text-xs text-muted flex items-center justify-center gap-1.5"
                >
                  <span>Didn&apos;t receive the code?</span>
                  {resendCooldown > 0 ? (
                    <span className="font-semibold text-muted">
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      id="resend-otp-btn"
                      type="button"
                      disabled={isResending}
                      onClick={handleResend}
                      className="font-bold text-primary hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isResending ? "Sending…" : "Resend Code"}
                    </button>
                  )}
                </motion.div>
              </form>
            )}

            {/* Back to sign in */}
            <motion.div
              custom={s++}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-4 pt-3 border-t border-border text-center text-xs text-muted"
            >
              <span>Already verified or want to sign in? </span>
              <Link href="/login" className="font-bold text-primary hover:underline cursor-pointer">
                Return to Login
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ── RIGHT: Visual Showcase Panel ── */}
        <motion.div
          variants={panelRight}
          initial="hidden"
          animate="show"
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-4 xl:p-8 bg-linear-to-br from-[#4F46E5] via-[#6366F1] to-[#7C3AED] dark:from-[#1E124A] dark:via-[#120B2E] dark:to-[#090614] text-white select-none transition-colors duration-500"
        >
          {/* Subtle dot-matrix overlay pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-15 dark:opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-matrix-verify" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2.5" cy="2.5" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-matrix-verify)" />
          </svg>

          {/* Ambient Glows */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 xl:w-[26rem] xl:h-[26rem] rounded-full bg-purple-600/20 dark:bg-purple-600/30 blur-[80px]" />
          </div>

          {/* Floating Particles */}
          <FloatingParticles />

          {/* Wordmark */}
          <div className="relative z-10 flex items-center gap-2 mb-2 xl:mb-3 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/15 flex items-center justify-center shadow-md text-white transition-transform group-hover:scale-105">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <span className="text-white font-black text-base xl:text-lg tracking-tight">ShopNest</span>
            </Link>
          </div>

          {/* Glass Showcase Widget */}
          <div className="relative z-10 flex-1 flex items-center py-1 my-auto">
            <div className="w-full backdrop-blur-xl bg-white/15 border border-white/25 dark:backdrop-blur-2xl dark:bg-black/40 dark:border-purple-500/20 rounded-2xl xl:rounded-3xl p-5 xl:p-7 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span className="text-[10px] xl:text-[11px] font-bold uppercase tracking-widest text-[#EDE9FE] dark:text-purple-200/80">
                  Secure Email Verification
                </span>
              </div>
              <h2 className="text-white font-black text-lg xl:text-2xl leading-snug tracking-tight mb-2">
                One Step Away From Complete Access
              </h2>
              <p className="text-xs xl:text-sm text-[#EDE9FE]/90 dark:text-purple-200/80 leading-relaxed mb-4">
                Verifying your email ensures genuine communication, protects your orders, and activates personalized AI recommendations for your account.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-white/20 dark:border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white/20 dark:bg-white/10 flex items-center justify-center text-xs">
                    🔒
                  </span>
                  <span className="font-semibold text-white text-[11px] xl:text-xs">Account Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white/20 dark:bg-white/10 flex items-center justify-center text-xs">
                    📦
                  </span>
                  <span className="font-semibold text-white text-[11px] xl:text-xs">Order Tracking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="relative z-10 shrink-0 mt-2 text-[10px] xl:text-[11px] text-[#EDE9FE]/80 dark:text-purple-200/60 font-medium">
            © {new Date().getFullYear()} ShopNest · Discover · Compare · Buy with confidence
          </p>
        </motion.div>
      </div>

      {/* Minimal Footer */}
      <footer className="flex-shrink-0 border-t border-border py-2 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] sm:text-xs text-muted bg-surface dark:bg-background transition-colors">
        <span>© {new Date().getFullYear()} ShopNest, Inc. All rights reserved.</span>
        <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4" aria-label="Legal">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
        </nav>
      </footer>
    </div>
  );
}
