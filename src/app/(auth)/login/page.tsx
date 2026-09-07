"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { authClient } from "@/lib/auth-client";

/* ─── SVG Icons ─────────────────────────────────────────────────────────────── */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
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

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

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
            y: [0, -32, 0],
            x: [0, p.id % 2 === 0 ? 12 : -12, 0],
            opacity: [0.1, 0.7, 0.1],
            scale: [0.6, 1.2, 0.6],
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
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.45,
      delay: i * 0.055,
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

import { useSearchParams } from "next/navigation";
import { syncGuestDataToServer } from "@/lib/guest-store";

/* ─── Main Login Page Component ───────────────────────────────────────────── */
export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-surface dark:bg-background" />}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || socialLoading) return;
    setErrorMsg("");
    setIsLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
        callbackURL: next,
      });
      if (result.error) {
        setErrorMsg(result.error.message || "Invalid email or password.");
        return;
      }
      // Sync guest cart & wishlist to database
      await syncGuestDataToServer();
      router.replace(next);
      router.refresh();
    } catch (err) {
      console.error("Sign in error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading || socialLoading) return;
    setErrorMsg("");
    setSocialLoading("google");
    try {
      const callbackURL = `/sync?next=${encodeURIComponent(next)}`;
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
      if (res?.error) {
        setErrorMsg(res.error.message || "Failed to sign in with Google.");
        setSocialLoading(null);
      }
    } catch (err) {
      console.error("Google sign in error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to sign in with Google.");
      setSocialLoading(null);
    }
  };

  const handleFacebookSignIn = async () => {
    if (isLoading || socialLoading) return;
    setErrorMsg("");
    setSocialLoading("facebook");
    try {
      const callbackURL = `/sync?next=${encodeURIComponent(next)}`;
      const res = await authClient.signIn.social({
        provider: "facebook",
        callbackURL,
      });
      if (res?.error) {
        setErrorMsg(res.error.message || "Failed to sign in with Facebook.");
        setSocialLoading(null);
      }
    } catch (err) {
      console.error("Facebook sign in error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to sign in with Facebook.");
      setSocialLoading(null);
    }
  };

  /* stagger index counter for smooth sequential reveals */
  let s = 0;

  const headlineWords = "Very good deals & AI curation are waiting for you. ".trim().split(" ");

  return (
    <div className="h-full flex-1 flex flex-col justify-between bg-surface dark:bg-background text-text transition-colors overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">

        {/* ── LEFT: Visual Showcase Panel (Shown on Desktop, sleek and compact) ── */}
        <motion.div
          variants={panelLeft}
          initial="hidden"
          animate="show"
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-4 xl:p-8 bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#7C3AED] dark:from-[#1E124A] dark:via-[#120B2E] dark:to-[#090614] text-white select-none transition-colors duration-500"
        >
          {/* Subtle dot-matrix overlay pattern (15% in light, 10% in dark) */}
          <svg className="absolute inset-0 w-full h-full opacity-15 dark:opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-matrix-login" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2.5" cy="2.5" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-matrix-login)" />
          </svg>

          {/* Deep ambient purple glow in dark mode */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 xl:w-[26rem] xl:h-[26rem] rounded-full bg-purple-600/20 dark:bg-purple-600/30 blur-[80px]" />

            <motion.div
              animate={{
                scale: [1, 1.15, 0.95, 1.08, 1],
                opacity: [0.35, 0.65, 0.4, 0.6, 0.35],
                borderRadius: ["50%", "42%", "55%", "48%", "50%"],
              }}
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              className="absolute -top-20 -left-20 w-64 h-64 bg-white/20 dark:bg-indigo-500/20 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.18, 0.92, 1.1, 1],
                opacity: [0.3, 0.55, 0.35, 0.5, 0.3],
                borderRadius: ["50%", "38%", "52%", "45%", "50%"],
              }}
              transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-24 -right-12 w-72 h-72 bg-purple-900/40 dark:bg-purple-950/60 blur-3xl"
            />
          </div>

          {/* Floating subtle particles */}
          <FloatingParticles />

          {/* ShopNest wordmark header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="relative z-10 flex items-center gap-2 mb-2 xl:mb-3 shrink-0"
          >
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
          </motion.div>

          {/* Glassmorphic Hero Container */}
          <div className="relative z-10 flex-1 flex items-center py-1 my-auto">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
              className="w-full max-w-md xl:max-w-lg mx-auto backdrop-blur-xl bg-white/15 border border-white/25 dark:backdrop-blur-2xl dark:bg-black/40 dark:border-purple-500/20 rounded-2xl xl:rounded-3xl p-4 xl:p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Lightning badge */}
              <motion.div
                aria-hidden="true"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -left-2 top-4 xl:top-5 w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-[#FBBF24] border-2 border-white/50 dark:border-amber-200/60 flex items-center justify-center shadow-[0_0_16px_rgba(251,191,36,0.65)] z-20"
              >
                <span className="text-sm xl:text-base leading-none text-slate-950" role="img" aria-label="Lightning bolt">⚡</span>
              </motion.div>

              {/* Tag / Micro-copy */}
              <motion.p
                initial={{ opacity: 0, x: -12, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.25, duration: 0.45 }}
                className="text-[9px] xl:text-[10px] font-bold uppercase tracking-[.2em] text-[#EDE9FE] dark:text-purple-200/80 mb-1 pl-1"
              >
                ShopNest Intelligence
              </motion.p>

              {/* Main Title */}
              <h2
                className="text-white font-black text-base xl:text-xl 2xl:text-2xl leading-snug tracking-tight max-w-md"
                style={{ perspective: "600px" }}
              >
                {headlineWords.map((word, wIdx, arr) => {
                  const charOffset = arr.slice(0, wIdx).reduce((acc, w) => acc + w.length + 1, 0);
                  return (
                    <span key={`w-${wIdx}`} className="inline-block whitespace-nowrap mr-[0.28em]">
                      {word.split("").map((char, cIdx) => (
                        <motion.span
                          key={`c-${wIdx}-${cIdx}`}
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
                  Login Now!
                </motion.span>
              </h2>

              {/* Perks / Features list */}
              <ul className="mt-2.5 xl:mt-3 space-y-1 xl:space-y-1.5">
                {[
                  { icon: "⚡", label: "Smart AI Deals", desc: "Real-time discounts curated for your taste" },
                  { icon: "🛡️", label: "Buyer Protection", desc: "Safe payments with guaranteed refunds" },
                  { icon: "🏪", label: "2,000+ Boutiques", desc: "Verified sellers and express delivery" },
                ].map(({ icon, label, desc }, i) => (
                  <motion.li
                    key={label}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28 + i * 0.1, duration: 0.4, ease: EASE }}
                    className="flex items-start gap-2"
                  >
                    <span className="w-5 h-5 xl:w-6 xl:h-6 rounded-lg flex items-center justify-center text-[10px] xl:text-xs shrink-0 bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/15 text-white">
                      {icon}
                    </span>
                    <div>
                      <p className="text-white font-bold text-[11px] xl:text-xs leading-tight">{label}</p>
                      <p className="text-[#EDE9FE] dark:text-purple-200/80 text-[9px] xl:text-[10px] mt-0.5">{desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>

              {/* Product showcase widgets */}
              <div className="mt-2.5 xl:mt-3 flex items-end justify-between gap-2.5">
                {/* "AI Recommended" glass widget card */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/15 text-white rounded-xl p-2 xl:p-2.5 shadow-lg flex-1 max-w-[9.5rem] xl:max-w-[11rem] cursor-default"
                >
                  <div className="flex items-center gap-1 text-[9px] xl:text-[10px] text-[#EDE9FE] dark:text-purple-200/80 font-semibold mb-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
                    AI Recommended
                  </div>
                  <div className="relative w-full h-11 xl:h-14">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6HreEvV6fYiuxEjQ9RL2P_vKICkXpEMiv7M2fT_zUi_Hd0a9gT4ng_a3iCk-PDkXOcdoz01gojbVpxiuoKSL3W6MRQ3Dx28FiUd3Bvv7cxfeuQy3rTWycxnCLNloIkm-wbfLpQ__Yf2nneUbojHp4GAxra0tcwtRNLa57mX0-cle52a4_DN4QoupV-R96YkVaK2bmZitU_0dNLgHfgzciB2kI0WDaiGtlK9lh73jmCqMYjePoyiu_abWVnC_-gofaazk"
                      alt="AeroSound Pro headphones"
                      fill
                      sizes="140px"
                      className="object-contain drop-shadow-md mix-blend-luminosity"
                    />
                  </div>
                  <p className="mt-0.5 text-white font-bold text-[9px] xl:text-[10px]">AeroSound Pro · $129</p>
                </motion.div>

                {/* Floating sneaker graphic */}
                <motion.div
                  className="shrink-0 -mb-2 xl:-mb-3"
                  animate={{ y: [0, -5, 0], rotate: [12, 14, 12] }}
                  transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut", delay: 0.5 }}
                >
                  <div className="relative w-16 xl:w-24 h-12 xl:h-16">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-GWxFQcDLwQZBZ7v_A-t8LagrYGornlbyaQ1-tp_8aaheqy9nY0UbU6NfB81br1Rvtm6V1V_kGtDwmC8SWWlQka0S_HHCkWvZxWXFQoJjLXtifgD-jA8JusrrIBOCFChUMw011N8oVShS-NgWuC5qPi5aCmoDTvwo0WJfsgjdTKsHO2VrfzB0ku-FfuZvkg5lPgE4Jn_guSr09iqRkB8ZOMAWaY63g9Th6hzyh2Xdagxf-SAJ0hhPXg"
                      alt="Minimalist sneaker"
                      fill
                      sizes="100px"
                      className="object-contain drop-shadow-2xl"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.35 }}
                className="mt-2.5 xl:mt-3 grid grid-cols-3 gap-2 border-t border-white/20 dark:border-white/10 pt-2 xl:pt-2.5"
              >
                {[["10k+", "Products"], ["2k+", "Sellers"], ["4.9★", "AI Curated"]].map(([v, l]) => (
                  <div key={l} className="text-center">
                    <p className="text-white font-black text-xs xl:text-sm">{v}</p>
                    <p className="text-[#EDE9FE] dark:text-purple-200/70 text-[8px] xl:text-[9px] mt-0.5">{l}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="relative z-10 shrink-0 mt-2 text-[10px] xl:text-[11px] text-[#EDE9FE]/80 dark:text-purple-200/60 font-medium"
          >
            © {new Date().getFullYear()} ShopNest · Discover · Compare · Buy with confidence
          </motion.p>
        </motion.div>

        {/* ── RIGHT: Form Panel (Compact & Fluid, 0 scrollbars across devices) ── */}
        <motion.div
          variants={panelRight}
          initial="hidden"
          animate="show"
          className="flex-1 flex flex-col items-center justify-center overflow-y-auto lg:overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 py-2 sm:px-6 sm:py-3 lg:px-8 xl:px-12 bg-surface dark:bg-background transition-colors"
        >
          <div className="w-full max-w-[22rem] sm:max-w-[24rem] xl:max-w-[25rem] my-auto flex flex-col justify-center">

            {/* Mobile-only brand mark */}
            <motion.div
              custom={s++}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex lg:hidden items-center gap-2 mb-1.5"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-md">
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
              className="mb-2 sm:mb-3"
            >
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text" style={{ perspective: "400px" }}>
                {"LOGIN".split("").map((char, i) => (
                  <motion.span
                    key={`title-${i}`}
                    initial={{ opacity: 0, y: 12, rotateX: 55 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      delay: 0.15 + i * 0.05,
                      duration: 0.4,
                      ease: EASE,
                    }}
                    style={{ display: "inline-block" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </h1>
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45, duration: 0.35 }}
                className="mt-0.5 text-[11px] sm:text-xs text-muted"
              >
                Welcome back! Enter your details to continue.
              </motion.p>
            </motion.div>

            {/* Error alert */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  key="login-error"
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  role="alert"
                  className="mb-2 flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-[11px] sm:text-xs font-medium text-rose-600 dark:text-rose-400 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2 sm:gap-2.5">

              {/* ── Email Field ── */}
              <motion.div
                custom={s++}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-1"
              >
                <label htmlFor="login-email" className="text-[10px] sm:text-[11px] font-bold text-muted uppercase tracking-widest pl-0.5">
                  Email
                </label>
                <div className="relative flex items-center">
                  <MailIcon className="absolute left-3 w-3.5 h-3.5 text-muted pointer-events-none" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl py-2 sm:py-2.5 pl-8 sm:pl-9 pr-3 text-xs sm:text-sm text-text placeholder:text-muted bg-muted-bg border border-border outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </motion.div>

              {/* ── Password Field ── */}
              <motion.div
                custom={s++}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-1"
              >
                <label htmlFor="login-password" className="text-[10px] sm:text-[11px] font-bold text-muted uppercase tracking-widest pl-0.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <LockIcon className="absolute left-3 w-3.5 h-3.5 text-muted pointer-events-none" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl py-2 sm:py-2.5 pl-8 sm:pl-9 pr-9 sm:pr-10 text-xs sm:text-sm text-text placeholder:text-muted bg-muted-bg border border-border outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2.5 text-muted hover:text-primary transition-colors p-1"
                  >
                    {showPassword ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </motion.div>

              {/* ── Remember me & Forgot password ── */}
              <motion.div
                custom={s++}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex flex-wrap items-center justify-between gap-1.5"
              >
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="login-remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-2 border-border cursor-pointer accent-primary"
                  />
                  <span className="text-[11px] sm:text-xs text-muted">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] sm:text-xs font-semibold text-primary hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </motion.div>

              {/* ── CTA Button ── */}
              <motion.div
                custom={s++}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="relative mt-0.5"
              >
                <motion.button
                  id="login-submit"
                  type="submit"
                  disabled={isLoading || Boolean(socialLoading)}
                  whileHover={{ scale: 1.015, boxShadow: "0 6px 22px rgba(91,92,240,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative w-full rounded-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white overflow-hidden shadow-md transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.75, ease: "linear" }}
                      />
                      Signing in…
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-1.5 cursor-pointer">
                      Login Now
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

              {/* ── Divider ── */}
              <motion.div
                custom={s++}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex items-center gap-2.5 my-0.5"
              >
                <div className="flex-1 h-px bg-border" />
                <span className="text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-widest whitespace-nowrap">
                  Login with Others
                </span>
                <div className="flex-1 h-px bg-border" />
              </motion.div>

              {/* ── Social Buttons (2-column side-by-side for optimal vertical fit) ── */}
              <motion.div
                custom={s++}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-2"
              >
                {/* Google */}
                <motion.button
                  id="login-google"
                  type="button"
                  disabled={isLoading || Boolean(socialLoading)}
                  onClick={handleGoogleSignIn}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-surface py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-text shadow-sm hover:bg-muted-bg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{socialLoading === "google" ? "Connecting…" : "Google"}</span>
                </motion.button>

                {/* Facebook */}
                <motion.button
                  id="login-facebook"
                  type="button"
                  disabled={isLoading || Boolean(socialLoading)}
                  onClick={handleFacebookSignIn}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-surface py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-text shadow-sm hover:bg-muted-bg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{socialLoading === "facebook" ? "Connecting…" : "Facebook"}</span>
                </motion.button>
              </motion.div>
            </form>

            {/* Sign up prompt */}
            <motion.p
              custom={s++}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-2.5 sm:mt-3 text-center text-[11px] sm:text-xs text-muted"
            >
              Don&apos;t have an account?{" "}
              <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                <Link
                  href="/register"
                  className="font-bold text-primary hover:underline"
                >
                  Sign Up
                </Link>
              </motion.span>
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* ── Minimalist Footer ── */}
      <footer className="flex-shrink-0 border-t border-border py-1.5 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] sm:text-xs text-muted bg-surface dark:bg-background transition-colors">
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
