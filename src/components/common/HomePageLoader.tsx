"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";

interface HomePageLoaderProps {
  /** Optional 0–100 progress value coordinated with data fetching */
  progress?: number;
  /** When true the loader is visible; when false it triggers exit animation */
  visible?: boolean;
  /** Optional callback after exit animation finishes */
  onComplete?: () => void;
}

export default function HomePageLoader({
  progress: externalProgress,
  visible = true,
  onComplete,
}: HomePageLoaderProps) {
  const [shouldRender, setShouldRender] = useState(true);
  const [targetProgress, setTargetProgress] = useState(0);

  // Smooth spring physics for both progress bar width and counter text
  const springProgress = useSpring(0, {
    stiffness: 90,
    damping: 25,
    mass: 0.6,
  });

  // Smooth animated percentage string without triggering React component re-renders
  const displayPercent = useTransform(springProgress, (latest) =>
    `${Math.min(100, Math.max(0, Math.round(latest)))}%`
  );

  const widthPercent = useTransform(springProgress, (latest) =>
    `${Math.min(100, Math.max(0, latest))}%`
  );

  // Asymptotic easing simulation for momentum feel
  useEffect(() => {
    let current = 38;
    let timerId: NodeJS.Timeout | null = null;
    let isCancelled = false;

    // Phase 1: Rapid glide from 0% to ~38% on initial mount
    setTargetProgress(38);

    // Phase 2 & 3: Decelerating trickle crawl towards 94% (never freezes!)
    const runTrickle = () => {
      if (isCancelled) return;

      if (current < 80) {
        const delta = Math.max(1, (82 - current) * 0.12);
        current = Math.min(80, current + delta);
      } else if (current < 94) {
        const delta = Math.max(0.4, (95 - current) * 0.05);
        current = Math.min(94, current + delta);
      }

      setTargetProgress((prev) => Math.max(prev, current));

      const nextInterval = current < 80 ? 120 : 180;
      timerId = setTimeout(runTrickle, nextInterval);
    };

    timerId = setTimeout(runTrickle, 200);

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  // Update target when external progress arrives
  useEffect(() => {
    if (typeof externalProgress === "number") {
      setTargetProgress((prev) => Math.max(prev, externalProgress));
    }
  }, [externalProgress]);

  // Sync spring target
  useEffect(() => {
    springProgress.set(targetProgress);
  }, [targetProgress, springProgress]);

  // Handle completion when visible becomes false or target reaches 100
  const isCompleted = !visible || (typeof externalProgress === "number" && externalProgress >= 100);

  useEffect(() => {
    if (!isCompleted) return;

    // Burst smoothly to 100%
    setTargetProgress(100);
    springProgress.set(100);

    // Give the user ~220ms to perceive completion before initiating exit fade
    const exitTimer = setTimeout(() => {
      setShouldRender(false);
    }, 220);

    return () => clearTimeout(exitTimer);
  }, [isCompleted, springProgress]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {shouldRender && (
        <motion.div
          key="antigravity-loader"
          initial={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          }}
          role="status"
          aria-label="Loading ShopNest"
          className="fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center bg-[#0B071B]"
        >
          {/* Subtle cosmic ambient background glow */}
          <div
            className="pointer-events-none absolute -top-32 left-1/2 h-[450px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-purple-600/15 via-indigo-600/10 to-transparent blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-center gap-8 px-4">
            {/* ── Levitation Brand Logo ── */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative flex items-center justify-center"
            >
              {/* Breathing soft glow behind logo */}
              <div
                className="absolute -inset-6 rounded-full bg-gradient-to-tr from-violet-600/25 via-purple-500/20 to-indigo-500/25 blur-2xl animate-pulse"
                aria-hidden="true"
              />

              <div className="relative h-14 w-40 sm:h-16 sm:w-48">
                <Image
                  src="/logo-white.png"
                  alt="ShopNest"
                  fill
                  className="object-contain drop-shadow-[0_4px_16px_rgba(147,51,234,0.35)]"
                  priority
                />
              </div>
            </motion.div>

            {/* ── Fluid Progress Bar + Percentage ── */}
            <div className="flex w-60 flex-col items-center gap-3 sm:w-72">
              {/* Progress Track */}
              <div
                className="relative h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-inner"
                aria-hidden="true"
              >
                {/* Fluid animated gradient fill */}
                <motion.div
                  style={{ width: widthPercent }}
                  className="relative h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 shadow-[0_0_14px_rgba(147,51,234,0.6)]"
                >
                  {/* Continuous liquid light shimmer wave */}
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                </motion.div>
              </div>

              {/* Status Text & Smooth Percentage Counter */}
              <div className="flex w-full items-center justify-between px-0.5">
                <span className="text-[11px] font-semibold tracking-wider text-white/60 uppercase">
                  Loading ShopNest…
                </span>
                <motion.span className="tabular-nums text-xs font-bold text-violet-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                  {displayPercent}
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}