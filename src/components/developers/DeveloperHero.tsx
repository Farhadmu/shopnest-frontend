"use client";

import React from "react";
import { motion } from "motion/react";
import { FiCode, FiCpu, FiLayers, FiGitBranch } from "react-icons/fi";

const STATS = [
  { label: "Engineers", value: "6", sub: "Collaborative Minds", icon: FiCode, color: "text-primary" },
  { label: "Domains", value: "4", sub: "Frontend, Backend, Full-Stack, AI", icon: FiLayers, color: "text-accent" },
  { label: "Ecosystem", value: "1", sub: "Unified Commerce Architecture", icon: FiCpu, color: "text-emerald-500" },
  { label: "Iterations", value: "∞", sub: "Continuous Innovation", icon: FiGitBranch, color: "text-amber-500" },
];

export function DeveloperHero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 border-b border-border/60 bg-gradient-to-b from-background via-muted-bg/20 to-background">
      {/* Background Engineering Grid & Glow Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Ambient Luminescent Orbs */}
      <div className="absolute left-1/4 top-10 w-96 h-96 rounded-full bg-primary/15 dark:bg-primary/20 blur-3xl pointer-events-none -translate-x-1/2 animate-pulse duration-1000" />
      <div className="absolute right-1/4 top-24 w-96 h-96 rounded-full bg-accent/15 dark:bg-accent/20 blur-3xl pointer-events-none translate-x-1/2" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
        {/* Engineering Pill */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-wide shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span>ShopNest Engineering Network</span>
        </motion.div>

        {/* Main Title & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
            Meet the <span className="bg-gradient-to-r from-primary via-accent to-pink-500 bg-clip-text text-transparent">Developers</span>
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-foreground/90">
            The people behind ShopNest.
          </p>

          <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto leading-relaxed">
            Six developers. One vision. One connected commerce ecosystem. From frontend experiences to
            scalable backend architecture, AI intelligence, and full-stack systems — we built ShopNest together.
          </p>
        </motion.div>

        {/* Quick Engineering Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto"
        >
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="relative group rounded-2xl border border-border/70 dark:border-white/10 bg-card/75 dark:bg-card/50 backdrop-blur-md p-4 text-center transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5 shadow-xs hover:shadow-md"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-2xl sm:text-3xl font-black text-foreground">
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground">{stat.label}</p>
                <p className="text-[11px] text-muted truncate mt-0.5">{stat.sub}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
