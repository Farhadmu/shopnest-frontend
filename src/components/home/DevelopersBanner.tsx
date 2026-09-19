"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { FiUsers, FiArrowRight, FiActivity, FiCpu, FiCode, FiLayers } from "react-icons/fi";
import { DEVELOPERS } from "@/data/developers";

export default function DevelopersBanner() {
  return (
    <section
      className="py-12 sm:py-16 relative overflow-hidden"
      aria-label="Engineering Team Spotlight"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden border border-border/70 dark:border-white/10 bg-gradient-to-br from-card/90 via-card/50 to-primary/5 dark:from-card/80 dark:via-card/40 dark:to-primary/10 backdrop-blur-xl p-8 sm:p-12 shadow-2xl"
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary/15 dark:bg-primary/25 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-pink-500/10 dark:bg-pink-500/20 blur-3xl pointer-events-none" />

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="space-y-6 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-black tracking-widest uppercase">
                <FiActivity className="w-3.5 h-3.5 animate-pulse" />
                <span>ShopNest Engineering Spotlight</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
                Meet the Minds{" "}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Architecting ShopNest
                </span>
              </h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                From high-speed AI product comparison algorithms and distributed backend microservices
                to real-time WebSockets and responsive multi-vendor commerce UX — explore our 6-engineer
                team and interactive collaboration network.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-muted-bg/60 border border-border/80 text-foreground">
                  <FiCode className="w-3.5 h-3.5 text-pink-500" />
                  Frontend & Mobile UX
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-muted-bg/60 border border-border/80 text-foreground">
                  <FiLayers className="w-3.5 h-3.5 text-cyan-500" />
                  Backend Cluster & Auth
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-muted-bg/60 border border-border/80 text-foreground">
                  <FiCpu className="w-3.5 h-3.5 text-amber-500" />
                  AI/ML Decision Core
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center lg:items-end gap-5">
              <div className="p-4 sm:p-6 rounded-2xl bg-card/80 dark:bg-card/60 border border-border/80 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col items-center gap-4">
                <div className="text-center">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">
                    6 Full-Stack & AI Builders
                  </p>
                </div>
                <div className="flex items-center -space-x-3 hover:space-x-1 transition-all duration-300 py-1">
                  {DEVELOPERS.map((dev) => (
                    <div
                      key={dev.id}
                      className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-card shadow-md transition-transform duration-200 hover:scale-125 hover:z-30 overflow-hidden cursor-pointer group"
                      title={`${dev.name} • ${dev.role}`}
                    >
                      <Image
                        src={dev.image}
                        alt={dev.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
