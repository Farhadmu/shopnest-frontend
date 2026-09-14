"use client";

import React from "react";
import {
  Search,
  Sparkles,
  ShoppingBag,
  PackageCheck,
} from "lucide-react";

interface Milestone {
  step: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  position: "high" | "low";
  gradient: string;
  glow: string;
  ring: string;
  badgeBorder: string;
  accentText: string;
  iconColor: string;
}

const MILESTONES: Milestone[] = [
  {
    step: "01",
    title: "Discover & Search",
    subtitle: "Browse verified sellers and trending products with instant filters.",
    icon: Search,
    position: "high",
    gradient: "from-indigo-600 via-indigo-500 to-violet-600",
    glow: "shadow-indigo-500/25 dark:shadow-indigo-500/40",
    ring: "ring-indigo-400/20 dark:ring-indigo-400/30",
    badgeBorder: "border-indigo-500 text-indigo-600 dark:text-indigo-400",
    accentText: "text-indigo-600 dark:text-indigo-400",
    iconColor: "text-white",
  },
  {
    step: "02",
    title: "Decide with AI ✨",
    subtitle: "Smart sentiment analysis and personalized buying recommendations.",
    icon: Sparkles,
    position: "low",
    gradient: "from-violet-600 via-purple-600 to-fuchsia-600",
    glow: "shadow-purple-500/30 dark:shadow-purple-500/50",
    ring: "ring-purple-400/25 dark:ring-purple-400/35",
    badgeBorder: "border-purple-500 text-purple-600 dark:text-purple-400",
    accentText: "text-purple-600 dark:text-purple-400",
    iconColor: "text-amber-200",
  },
  {
    step: "03",
    title: "Secure Checkout",
    subtitle: "Apply discount vouchers and checkout seamlessly with escrow safety.",
    icon: ShoppingBag,
    position: "high",
    gradient: "from-indigo-600 via-violet-600 to-amber-500",
    glow: "shadow-amber-500/25 dark:shadow-amber-500/40",
    ring: "ring-amber-400/20 dark:ring-amber-400/30",
    badgeBorder: "border-amber-500 text-amber-600 dark:text-amber-400",
    accentText: "text-indigo-600 dark:text-indigo-400",
    iconColor: "text-white",
  },
  {
    step: "04",
    title: "Unbox with Shield",
    subtitle: "Express doorstep delivery with 7-day buyer guarantee & tracking.",
    icon: PackageCheck,
    position: "low",
    gradient: "from-emerald-600 via-teal-600 to-indigo-600",
    glow: "shadow-emerald-500/25 dark:shadow-emerald-500/40",
    ring: "ring-emerald-400/20 dark:ring-emerald-400/30",
    badgeBorder: "border-emerald-500 text-emerald-600 dark:text-emerald-400",
    accentText: "text-emerald-600 dark:text-emerald-400",
    iconColor: "text-emerald-100",
  },
];

export default function HowItWorksSection() {
  const wavePathD =
    "M 125 44 C 225 44, 275 256, 375 256 C 475 256, 525 44, 625 44 C 725 44, 775 256, 875 256";

  return (
    <section className="relative w-full my-6 overflow-hidden rounded-[2.5rem] bg-slate-50/70 px-4 py-8 transition-colors duration-300 dark:bg-[#090614]/80 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* Background soft ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/4 -z-10 h-64 w-80 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 right-1/4 -z-10 h-64 w-80 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-600/15"
      />

      {/* Section Header */}
      <div className="mb-8 text-center sm:mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-2xs dark:border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-300">
          Simple By Design • ShopNest Flow
        </span>
        <h2 className="mt-2.5 font-black text-2xl tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
          HOW WE WORK?
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500 leading-relaxed dark:text-slate-400 sm:text-sm">
          Four simple milestones to effortless shopping.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (lg+): Compact Alternating Zig-Zag Curved Wave Layout       */}
      {/* ========================================================================= */}
      <div className="relative mx-auto hidden h-[300px] w-full lg:block">
        {/* Continuous Connecting Curved SVG Wave with Live Flow Animation */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="flowWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#A855F7" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#6366F1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.85" />
            </linearGradient>

            <filter id="waveGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#8B5CF6" floodOpacity="0.25" />
            </filter>

            {/* Glowing filter for traveling energy pulse */}
            <filter id="particleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Glowing subtle underlay path */}
          <path
            d={wavePathD}
            stroke="#8B5CF6"
            strokeWidth="4"
            strokeOpacity="0.1"
            strokeLinecap="round"
          />

          {/* Animated flowing dashed path */}
          <path
            d={wavePathD}
            stroke="url(#flowWaveGradient)"
            strokeWidth="2.5"
            strokeDasharray="7 7"
            strokeLinecap="round"
            filter="url(#waveGlow)"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-28"
              dur="1.3s"
              repeatCount="indefinite"
            />
          </path>

          {/* Traveling Energy Pulse Dots along the dotted curve */}
          {/* Pulse 1: Lead Purple/White Energy Bead */}
          <circle r="5" fill="#C084FC" filter="url(#particleGlow)" opacity="0.95">
            <animateMotion
              path={wavePathD}
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="2.5" fill="#FFFFFF">
            <animateMotion
              path={wavePathD}
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Pulse 2: Trailing Indigo/Cyan Energy Bead (staggered by 2s) */}
          <circle r="4.5" fill="#6366F1" filter="url(#particleGlow)" opacity="0.9">
            <animateMotion
              path={wavePathD}
              dur="4s"
              begin="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="2" fill="#FFFFFF">
            <animateMotion
              path={wavePathD}
              dur="4s"
              begin="2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Directional Wave Markers */}
          <g transform="translate(250, 150) rotate(52)">
            <polygon points="0,-3 6,0 0,3" fill="#8B5CF6" className="opacity-70" />
          </g>
          <g transform="translate(500, 150) rotate(-52)">
            <polygon points="0,-3 6,0 0,3" fill="#A855F7" className="opacity-70" />
          </g>
          <g transform="translate(750, 150) rotate(52)">
            <polygon points="0,-3 6,0 0,3" fill="#10B981" className="opacity-70" />
          </g>
        </svg>

        {/* 4 Alternating Milestone Columns */}
        <div className="relative z-10 grid h-full grid-cols-4">
          {MILESTONES.map((item) => {
            const Icon = item.icon;
            const isHigh = item.position === "high";

            return (
              <div
                key={item.step}
                className="flex flex-col items-center justify-between px-2 text-center"
              >
                {/* High Node (Step 01 & 03): Circular Badge at TOP, Text at BOTTOM */}
                {isHigh ? (
                  <>
                    {/* Circular Badge */}
                    <div className="relative group pt-0.5">
                      <div
                        className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} ${item.glow} shadow-lg ring-6 ${item.ring} transition-transform duration-300 group-hover:scale-105 sm:h-22 sm:w-22`}
                      >
                        {/* Inner specular sheen */}
                        <div className="absolute inset-1 rounded-full border border-white/30 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                        {/* Icon */}
                        <Icon className={`h-7 w-7 ${item.iconColor} drop-shadow-md`} />

                        {/* Step Number Badge */}
                        <span
                          className={`absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white shadow-sm font-black text-[10px] ${item.badgeBorder} dark:bg-slate-900`}
                        >
                          {item.step}
                        </span>
                      </div>
                    </div>

                    {/* Text Block at Bottom */}
                    <div className="flex flex-col items-center pb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.accentText}`}>
                        Milestone {item.step}
                      </span>
                      <h3 className="mt-0.5 font-black text-base text-slate-900 tracking-tight dark:text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1 max-w-[220px] text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                        {item.subtitle}
                      </p>
                    </div>
                  </>
                ) : (
                  /* Low Node (Step 02 & 04): Text at TOP, Circular Badge at BOTTOM */
                  <>
                    {/* Text Block at Top */}
                    <div className="flex flex-col items-center pt-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.accentText}`}>
                        Milestone {item.step}
                      </span>
                      <h3 className="mt-0.5 font-black text-base text-slate-900 tracking-tight dark:text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1 max-w-[220px] text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Circular Badge at Bottom */}
                    <div className="relative group pb-0.5">
                      <div
                        className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} ${item.glow} shadow-lg ring-6 ${item.ring} transition-transform duration-300 group-hover:scale-105 sm:h-22 sm:w-22`}
                      >
                        {/* Inner specular sheen */}
                        <div className="absolute inset-1 rounded-full border border-white/30 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                        {/* Icon */}
                        <Icon className={`h-7 w-7 ${item.iconColor} drop-shadow-md`} />

                        {/* Step Number Badge */}
                        <span
                          className={`absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white shadow-sm font-black text-[10px] ${item.badgeBorder} dark:bg-slate-900`}
                        >
                          {item.step}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET VIEW (< lg): Vertical Timeline with animated guide        */}
      {/* ========================================================================= */}
      <div className="relative mx-auto max-w-lg lg:hidden">
        {/* Continuous Guide Line */}
        <div
          aria-hidden="true"
          className="absolute top-8 bottom-8 left-10 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-indigo-400/40 dark:border-purple-500/40"
        />

        <div className="flex flex-col gap-8 sm:gap-10">
          {MILESTONES.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.step} className="relative flex items-center gap-5 sm:gap-6">
                {/* Circular Badge Node */}
                <div className="relative shrink-0">
                  <div
                    className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} ${item.glow} shadow-md ring-5 ${item.ring}`}
                  >
                    <div className="absolute inset-1 rounded-full border border-white/30 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    <Icon className={`h-7 w-7 ${item.iconColor} drop-shadow-md`} />

                    {/* Step Number Badge */}
                    <span
                      className={`absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white shadow-sm font-black text-[10px] ${item.badgeBorder} dark:bg-slate-900`}
                    >
                      {item.step}
                    </span>
                  </div>
                </div>

                {/* Text Block */}
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.accentText}`}>
                    Milestone {item.step}
                  </span>
                  <h3 className="mt-0.5 font-black text-base text-slate-900 tracking-tight dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
