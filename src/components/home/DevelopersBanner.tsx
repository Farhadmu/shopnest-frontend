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
          <p className="text-xs font-black uppercase text-primary">ShopNest Engineering Spotlight</p>
        </motion.div>
      </div>
    </section>
  );
}
