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
        <div className="relative rounded-3xl overflow-hidden border border-border/70 bg-card p-8">
          <p className="text-xs font-black uppercase text-primary">ShopNest Engineering Spotlight</p>
        </div>
      </div>
    </section>
  );
}
