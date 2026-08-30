"use client";

import { useMemo } from "react";

type GlobalAnimatedBackgroundProps = {
  className?: string;
};

export function GlobalAnimatedBackground({ className }: GlobalAnimatedBackgroundProps) {
  const orbs = useMemo(
    () => [
      { id: "orb-1", left: "10%", top: "15%", size: 420, color: "rgba(99,102,241,0.18)", delay: "0s", duration: "18s" },
      { id: "orb-2", right: "8%", top: "25%", size: 360, color: "rgba(168,85,247,0.16)", delay: "3s", duration: "22s" },
      { id: "orb-3", left: "35%", bottom: "10%", size: 480, color: "rgba(236,72,153,0.12)", delay: "6s", duration: "24s" },
      { id: "orb-4", right: "25%", bottom: "20%", size: 300, color: "rgba(99,102,241,0.14)", delay: "9s", duration: "20s" },
      { id: "orb-5", left: "55%", top: "60%", size: 260, color: "rgba(168,85,247,0.10)", delay: "12s", duration: "26s" },
    ],
    []
  );

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 -z-50 overflow-hidden pointer-events-none ${className ?? ""}`}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#070514] dark:via-[#090616] dark:to-[#0f0920]" />

      {/* Soft grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.28] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating orbs */}
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full blur-3xl"
          style={{
            left: orb.left,
            right: orb.right,
            top: orb.top,
            bottom: orb.bottom,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            animation: `shopnest-orb-float ${orb.duration} ease-in-out infinite`,
            animationDelay: orb.delay,
            willChange: "transform",
          }}
        />
      ))}

      {/* Top glow line */}
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent dark:via-indigo-500/30"
        style={{ top: "18%" }}
      />

      {/* Bottom glow line */}
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent dark:via-purple-500/20"
        style={{ bottom: "22%" }}
      />
    </div>
  );
}
