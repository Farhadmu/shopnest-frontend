"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

/* ─── SVG Icons ─────────────────────────────────────────────────────────────── */
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

const UserIcon = ({ c }: { c: string }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const StoreIcon = ({ c }: { c: string }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" /></svg>;
const MailIcon = ({ c }: { c: string }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const PhoneIcon = ({ c }: { c: string }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const LockIcon = ({ c }: { c: string }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const EyeIcon = ({ c }: { c: string }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon = ({ c }: { c: string }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>;

/* ─── Floating Particles ─────────────────────────────────────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: (i * 19) % 100,
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
            y: [0, -30, 0],
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

/* ─── Motion Variants ───────────────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.42,
      delay: i * 0.045,
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

const letterReveal = {
  hidden: { opacity: 0, y: 10, rotateX: 40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.35,
      delay: 0.25 + i * 0.018,
      ease: EASE,
    },
  }),
};

/* ─── Compact Form Field ─────────────────────────────────────────────────────── */
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: React.ReactNode;
  right?: React.ReactNode;
  err?: boolean;
  ok?: boolean;
}
function F({ id, label, icon, right, err, ok, ...rest }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[10px] sm:text-[11px] font-bold text-muted uppercase tracking-[.12em] pl-0.5">
        {label}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-3 text-muted pointer-events-none">
          {icon}
        </span>
        <input
          id={id}
          {...rest}
          className={`w-full rounded-xl py-2 sm:py-2.5 pl-8 sm:pl-9 pr-8 sm:pr-9 text-xs sm:text-sm text-text placeholder:text-muted bg-muted-bg border outline-none transition-all focus:ring-2 ${
            err
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              : ok
              ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              : "border-border focus:border-primary focus:ring-primary/20"
          }`}
        />
        {right && <span className="absolute right-2.5">{right}</span>}
      </div>
    </div>
  );
}

/* ─── Eye-toggle helper ──────────────────────────────────────────────────────── */
const Eye = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
  <button
    type="button"
    aria-label={show ? "Hide" : "Show"}
    onClick={onToggle}
    className="text-muted hover:text-primary transition-colors leading-none p-1"
  >
    {show ? <EyeOffIcon c="w-3.5 h-3.5" /> : <EyeIcon c="w-3.5 h-3.5" />}
  </button>
);

/* ─── Types ──────────────────────────────────────────────────────────────────── */
type Role = "customer" | "seller";

/* ═══════════════════════════════════════════════════════════════════════════════
   Register Page Component
═══════════════════════════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const [role, setRole] = useState<Role>("customer");
  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");
  const [cf, setCf] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const pwOk = cf !== "" && pw === cf;
  const pwBad = cf !== "" && pw !== cf;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please accept the Terms & Conditions.");
      return;
    }
    if (pw !== cf) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { signUp } = await import("@/lib/auth-client");
      const res = await signUp.email({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: pw,
        callbackURL: "/",
        // @ts-expect-error – role is a custom field in auth.ts
        role,
      });
      if (res.error) {
        setError(res.error.message || "Registration failed.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    const { signIn } = await import("@/lib/auth-client");
    await signIn.social({ provider: "google", callbackURL: "/" });
  };

  const onFacebook = async () => {
    const { signIn } = await import("@/lib/auth-client");
    await signIn.social({ provider: "facebook", callbackURL: "/" });
  };

  /* Stagger counter */
  let s = 0;

  const headlineWords = "Start your journey with verified boutiques & AI power. ".trim().split(" ");

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between bg-surface dark:bg-background text-text transition-colors">
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">

        {/* ── LEFT: Form Panel (Fully fluid and scrollable on all devices) ── */}
        <motion.div
          variants={panelLeft}
          initial="hidden"
          animate="show"
          className="flex-1 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar px-4 py-5 sm:px-6 sm:py-8 lg:px-8 xl:px-12 bg-surface dark:bg-background transition-colors"
        >
          <div className="w-full max-w-[24rem] sm:max-w-[26rem] my-auto">

            {/* Mobile brand mark */}
            <motion.div
              custom={s++}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex lg:hidden items-center gap-2 mb-2 sm:mb-3"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center shrink-0 shadow-md">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                </svg>
              </div>
              <span className="font-black text-sm text-text">ShopNest</span>
            </motion.div>

            {/* Form Header */}
            <motion.div
              custom={s++}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mb-2.5 sm:mb-3"
            >
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text leading-tight" style={{ perspective: "400px" }}>
                {"CREATE ACCOUNT".split("").map((char, i) => (
                  <motion.span
                    key={`rtitle-${i}`}
                    initial={{ opacity: 0, y: 12, rotateX: 50 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      delay: 0.1 + i * 0.035,
                      duration: 0.35,
                      ease: EASE,
                    }}
                    style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : undefined }}
                  >
                    {char}
                  </motion.span>
                ))}
              </h1>
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mt-0.5 text-xs text-muted"
              >
                Join ShopNest as a customer or verified vendor.
              </motion.p>
            </motion.div>

            {/* Role tabs */}
            <motion.div
              custom={s++}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="relative flex p-1 rounded-full mb-2.5 sm:mb-3 bg-muted-bg border border-border"
              role="tablist"
              aria-label="Account type"
            >
              {(["customer", "seller"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={role === r}
                  onClick={() => { setRole(r); setError(""); }}
                  className={`relative flex-1 z-10 rounded-full py-1.5 text-xs font-bold transition-colors duration-200 ${
                    role === r
                      ? "text-white"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {role === r && (
                    <motion.span
                      layoutId="reg-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent shadow-sm"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{r === "customer" ? "🛍 Customer" : "🏪 Seller"}</span>
                </button>
              ))}
            </motion.div>

            {/* Error alert */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, y: -5, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  role="alert"
                  className="mb-2 flex items-start gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400"
                >
                  <svg className="w-3.5 h-3.5 mt-px shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={onSubmit} noValidate>
              <motion.div custom={s++} variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-1.5">
                {/* Full Name */}
                <F
                  id="reg-name"
                  label="Full Name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={<UserIcon c="w-3.5 h-3.5" />}
                />

                {/* Email */}
                <F
                  id="reg-email"
                  label="Email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<MailIcon c="w-3.5 h-3.5" />}
                />

                {/* Phone */}
                <F
                  id="reg-phone"
                  label="Phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<PhoneIcon c="w-3.5 h-3.5" />}
                />

                {/* Password */}
                <F
                  id="reg-pw"
                  label="Password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  icon={<LockIcon c="w-3.5 h-3.5" />}
                  right={<Eye show={showPw} onToggle={() => setShowPw((p) => !p)} />}
                />

                {/* Confirm Password */}
                <F
                  id="reg-cf"
                  label="Confirm Password"
                  type={showCf ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  value={cf}
                  onChange={(e) => setCf(e.target.value)}
                  icon={<LockIcon c="w-3.5 h-3.5" />}
                  err={pwBad}
                  ok={pwOk}
                  right={<Eye show={showCf} onToggle={() => setShowCf((p) => !p)} />}
                />
              </motion.div>

              {/* Password match hint */}
              <AnimatePresence mode="wait">
                {cf && (
                  <motion.p
                    key={pwBad ? "bad" : "ok"}
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`text-[10px] font-semibold mt-1 ml-0.5 ${
                      pwBad ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {pwBad ? "✗ Passwords don't match" : "✓ Passwords match"}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Terms checkbox */}
              <motion.label
                custom={s++}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                htmlFor="reg-agree"
                className="flex items-start gap-2 mt-1.5 sm:mt-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  id="reg-agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 shrink-0 rounded cursor-pointer accent-primary"
                />
                <span className="text-[10px] sm:text-[11px] text-muted leading-snug">
                  I agree to the{" "}
                  <Link href="/terms" className="font-semibold text-primary hover:underline">
                    Terms
                  </Link>
                  {" "}&amp;{" "}
                  <Link href="/privacy" className="font-semibold text-primary hover:underline">
                    Privacy Policy
                  </Link>.
                </span>
              </motion.label>

              {/* Register CTA Button */}
              <motion.div
                custom={s++}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="mt-2.5 relative"
              >
                <motion.button
                  id="register-submit"
                  type="submit"
                  disabled={loading || !agreed}
                  whileHover={{ scale: 1.015, boxShadow: "0 6px 24px rgba(91,92,240,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative w-full rounded-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white overflow-hidden shadow-md disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <motion.span
                        className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent cursor-pointer"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.75, ease: "linear" }}
                      />
                      Creating…
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-1.5">
                      Register Now
                      <motion.svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden="true"
                        animate={{ x: [0, 2.5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </motion.svg>
                    </span>
                  )}
                </motion.button>
              </motion.div>

              {/* Divider */}
              <motion.div
                custom={s++}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex items-center gap-2 my-1.5 sm:my-2"
              >
                <div className="flex-1 h-px bg-border" />
                <span className="text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-widest whitespace-nowrap">
                  Or Register With
                </span>
                <div className="flex-1 h-px bg-border" />
              </motion.div>

              {/* Social Buttons */}
              <motion.div
                custom={s++}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-2"
              >
                <motion.button
                  id="reg-google"
                  type="button"
                  onClick={onGoogle}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-surface py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-text shadow-sm hover:bg-muted-bg transition-colors cursor-pointer"
                >
                  <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                  Google
                </motion.button>
                <motion.button
                  id="reg-facebook"
                  type="button"
                  onClick={onFacebook}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-surface py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-text shadow-sm hover:bg-muted-bg transition-colors cursor-pointer"
                >
                  <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                  Facebook
                </motion.button>
              </motion.div>
            </form>

            {/* Sign in prompt */}
            <motion.p
              custom={s++}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-2.5 sm:mt-3 text-center text-xs text-muted"
            >
              Already have an account?{" "}
              <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                <Link href="/login" className="font-bold text-primary hover:underline cursor-pointer">
                  Sign In
                </Link>
              </motion.span>
            </motion.p>
          </div>
        </motion.div>

        {/* ── RIGHT: Visual Showcase Panel (Shown on Desktop, gracefully scrollable on short heights) ── */}
        <motion.div
          variants={panelRight}
          initial="hidden"
          animate="show"
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-6 xl:p-10 bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#7C3AED] dark:from-[#1E124A] dark:via-[#120B2E] dark:to-[#090614] text-white select-none transition-colors duration-500"
        >
          {/* Subtle dot-matrix overlay pattern (15% in light, 10% in dark) */}
          <svg className="absolute inset-0 w-full h-full opacity-15 dark:opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-matrix-reg" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2.5" cy="2.5" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-matrix-reg)" />
          </svg>

          {/* Deep ambient purple glow in dark mode */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {/* Ambient center glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full bg-purple-600/20 dark:bg-purple-600/30 blur-[90px]" />

            <motion.div
              animate={{
                scale: [1, 1.15, 0.95, 1.08, 1],
                opacity: [0.35, 0.65, 0.4, 0.6, 0.35],
                borderRadius: ["50%", "42%", "55%", "48%", "50%"],
              }}
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              className="absolute -top-24 -right-24 w-80 h-80 bg-white/20 dark:bg-indigo-500/20 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.18, 0.92, 1.1, 1],
                opacity: [0.3, 0.55, 0.35, 0.5, 0.3],
                borderRadius: ["50%", "38%", "52%", "45%", "50%"],
              }}
              transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-32 -left-16 w-96 h-96 bg-purple-900/40 dark:bg-purple-950/60 blur-3xl"
            />
            {/* Sweeping ambient beam */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[38rem]"
              style={{
                background: "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.07) 12%, transparent 24%)",
              }}
            />
          </div>

          {/* Floating subtle particles */}
          <FloatingParticles />

          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="relative z-10 flex items-center gap-2.5 mb-3 xl:mb-4 shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/15 flex items-center justify-center shadow-md text-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <span className="text-white font-black text-lg tracking-tight">ShopNest</span>
          </motion.div>

          {/* Glassmorphic Hero Container */}
          <div className="relative z-10 flex-1 flex items-center py-2 my-auto">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
              className="w-full backdrop-blur-xl bg-white/15 border border-white/25 dark:backdrop-blur-2xl dark:bg-black/40 dark:border-purple-500/20 rounded-2xl xl:rounded-3xl p-5 xl:p-7 shadow-2xl relative overflow-hidden"
            >
              {/* Lightning / Spark badge */}
              <motion.div
                aria-hidden="true"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -left-3 top-5 xl:top-6 w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-[#FBBF24] border-2 border-white/50 dark:border-amber-200/60 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.65)] z-20"
              >
                <span className="text-lg xl:text-xl leading-none text-slate-950" role="img" aria-label="Spark">✨</span>
              </motion.div>

              {/* Tag / Micro-copy */}
              <motion.p
                initial={{ opacity: 0, x: -14, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.25, duration: 0.45 }}
                className="text-[10px] xl:text-[11px] font-bold uppercase tracking-[.2em] text-[#EDE9FE] dark:text-purple-200/80 mb-1.5 pl-1"
              >
                ShopNest Marketplace
              </motion.p>

              {/* Main Title */}
              <h2
                className="text-white font-black text-xl xl:text-2xl 2xl:text-3xl leading-snug tracking-tight max-w-md"
                style={{ perspective: "600px" }}
              >
                {headlineWords.map((word, wIdx, arr) => {
                  const charOffset = arr.slice(0, wIdx).reduce((acc, w) => acc + w.length + 1, 0);
                  return (
                    <span key={`rw-${wIdx}`} className="inline-block whitespace-nowrap mr-[0.28em]">
                      {word.split("").map((char, cIdx) => (
                        <motion.span
                          key={`rc-${wIdx}-${cIdx}`}
                          custom={charOffset + cIdx}
                          variants={letterReveal}
                          initial="hidden"
                          animate="show"
                          className="inline-block text-white"
                        >
                          {char}
                        </motion.span>
                      ))}
                    </span>
                  );
                })}
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.85, duration: 0.45, type: "spring", stiffness: 220 }}
                  className="text-[#FBBF24] font-black inline-block whitespace-nowrap drop-shadow-[0_2px_10px_rgba(251,191,36,0.4)]"
                >
                  Register Today!
                </motion.span>
              </h2>

              {/* Perks list */}
              <ul className="mt-3.5 xl:mt-4 space-y-1.5 xl:space-y-2">
                {[
                  { icon: "🛍", label: "Customer", desc: "Browse 10k+ curated products with AI guidance" },
                  { icon: "🏪", label: "Seller", desc: "Open your store, track orders & trust score" },
                  { icon: "🤖", label: "AI Advisor", desc: "Smart recommendations tailored to your taste" },
                ].map(({ icon, label, desc }, i) => (
                  <motion.li
                    key={label}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28 + i * 0.1, duration: 0.4, ease: EASE }}
                    className="flex items-start gap-2.5"
                  >
                    <span className="w-6 h-6 xl:w-7 xl:h-7 rounded-xl flex items-center justify-center text-xs shrink-0 bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/15 text-white">
                      {icon}
                    </span>
                    <div>
                      <p className="text-white font-bold text-xs leading-tight">{label}</p>
                      <p className="text-[#EDE9FE] dark:text-purple-200/80 text-[10px] xl:text-[11px] mt-0.5">{desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>

              {/* Product showcase widget */}
              <div className="mt-3.5 xl:mt-4 flex items-end justify-between gap-3">
                <motion.div
                  className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/15 text-white rounded-2xl p-2.5 xl:p-3 shadow-lg flex-1 max-w-[10rem] xl:max-w-[12rem] cursor-default"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#EDE9FE] dark:text-purple-200/80 font-semibold mb-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
                    Trusted Seller
                  </div>
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6HreEvV6fYiuxEjQ9RL2P_vKICkXpEMiv7M2fT_zUi_Hd0a9gT4ng_a3iCk-PDkXOcdoz01gojbVpxiuoKSL3W6MRQ3Dx28FiUd3Bvv7cxfeuQy3rTWycxnCLNloIkm-wbfLpQ__Yf2nneUbojHp4GAxra0tcwtRNLa57mX0-cle52a4_DN4QoupV-R96YkVaK2bmZitU_0dNLgHfgzciB2kI0WDaiGtlK9lh73jmCqMYjePoyiu_abWVnC_-gofaazk"
                    alt="Featured product"
                    className="w-full h-14 xl:h-16 object-contain drop-shadow-xl mix-blend-luminosity"
                  />
                  <p className="mt-1 text-white font-bold text-[10px] xl:text-[11px]">Nova Tech · 4.9 ★</p>
                </motion.div>

                <motion.div
                  className="flex-shrink-0 -mb-4 xl:-mb-6"
                  animate={{ y: [0, -7, 0], rotate: [-12, -10, -12] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
                >
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-GWxFQcDLwQZBZ7v_A-t8LagrYGornlbyaQ1-tp_8aaheqy9nY0UbU6NfB81br1Rvtm6V1V_kGtDwmC8SWWlQka0S_HHCkWvZxWXFQoJjLXtifgD-jA8JusrrIBOCFChUMw011N8oVShS-NgWuC5qPi5aCmoDTvwo0WJfsgjdTKsHO2VrfzB0ku-FfuZvkg5lPgE4Jn_guSr09iqRkB8ZOMAWaY63g9Th6hzyh2Xdagxf-SAJ0hhPXg"
                    alt="Minimalist sneaker"
                    className="w-20 xl:w-32 h-auto drop-shadow-2xl"
                  />
                </motion.div>
              </div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.35 }}
                className="mt-3 xl:mt-4 grid grid-cols-3 gap-2 border-t border-white/20 dark:border-white/10 pt-2.5 xl:pt-3"
              >
                {[["10k+", "Products"], ["2k+", "Sellers"], ["4.9★", "AI Curated"]].map(([v, l]) => (
                  <div key={l} className="text-center">
                    <p className="text-white font-black text-xs xl:text-sm">{v}</p>
                    <p className="text-[#EDE9FE] dark:text-purple-200/70 text-[9px] xl:text-[10px] mt-0.5">{l}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="relative z-10 shrink-0 mt-3 xl:mt-4 text-[10px] xl:text-xs text-[#EDE9FE]/80 dark:text-purple-200/60 font-medium"
          >
            © {new Date().getFullYear()} ShopNest · Discover · Compare · Buy with confidence
          </motion.p>
        </motion.div>
      </div>

      {/* ── Minimalist Footer ── */}
      <footer className="flex-shrink-0 border-t border-border py-2 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-muted bg-surface dark:bg-background transition-colors">
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
