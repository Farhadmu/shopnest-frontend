"use client";

import React from "react";
import { motion } from "motion/react";
import {
  FaShieldAlt,
  FaBrain,
  FaShippingFast,
  FaUserShield,
  FaShoppingCart,
} from "react-icons/fa";

interface FeatureItem {
  title: string;
  badge: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  borderHover: string;
  glow: string;
  badgeStyle: string;
  beam: string;
}

const features: FeatureItem[] = [
  {
    title: "Trusted Sellers",
    badge: "100% Verified",
    desc: "Shop confidently with verified merchants meeting strict authenticity & quality standards.",
    icon: FaShieldAlt,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20",
    borderHover: "group-hover:border-amber-500/40",
    glow: "from-amber-500/25 to-orange-500/0",
    badgeStyle: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    beam: "from-amber-500 to-orange-500",
  },
  {
    title: "AI Discovery",
    badge: "Neural Engine",
    desc: "Smart real-time product matching and trade-off insights tailored to your exact shopping intent.",
    icon: FaBrain,
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-500/10 dark:bg-pink-500/15 border-pink-500/20",
    borderHover: "group-hover:border-pink-500/40",
    glow: "from-pink-500/25 to-purple-500/0",
    badgeStyle: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
    beam: "from-pink-500 to-purple-500",
  },
  {
    title: "Live Tracking",
    badge: "Milestone GPS",
    desc: "Instant milestone updates from nationwide fulfilment warehouses straight to your doorstep.",
    icon: FaShippingFast,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/20",
    borderHover: "group-hover:border-cyan-500/40",
    glow: "from-cyan-500/25 to-blue-500/0",
    badgeStyle: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
    beam: "from-cyan-500 to-blue-500",
  },
  {
    title: "Buyer Protection",
    badge: "Escrow Secured",
    desc: "Guaranteed safe payments, 7-day hassle-free returns, and dedicated dispute resolution.",
    icon: FaUserShield,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20",
    borderHover: "group-hover:border-emerald-500/40",
    glow: "from-emerald-500/25 to-teal-500/0",
    badgeStyle: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    beam: "from-emerald-500 to-teal-500",
  },
  {
    title: "Easy Shopping",
    badge: "Instant COD",
    desc: "Frictionless 1-click checkout with bKash, cards, and Cash on Delivery everywhere in Bangladesh.",
    icon: FaShoppingCart,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/20",
    borderHover: "group-hover:border-indigo-500/40",
    glow: "from-indigo-500/25 to-purple-500/0",
    badgeStyle: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    beam: "from-indigo-500 to-purple-500",
  },
];

export default function TrustFeatures() {
  return (
    <section className="py-6 sm:py-8" aria-label="Platform Trust Standards">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {features.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: index * 0.07,
                ease: "easeOut",
              }}
              className="h-full"
            >
              <div
                className={`
                  group relative h-full min-h-[215px]
                  overflow-hidden rounded-2xl
                  border border-border/70 dark:border-white/10
                  bg-card/90 dark:bg-card/60 backdrop-blur-xl
                  p-5
                  shadow-sm dark:shadow-black/40
                  transition-all duration-300
                  hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5
                  dark:hover:shadow-2xl dark:hover:shadow-primary/10
                  ${item.borderHover}
                `}
              >
                {/* Ambient dynamic glow on hover */}
                <div
                  className={`
                    pointer-events-none absolute
                    -right-8 -top-8
                    h-32 w-32
                    rounded-full
                    bg-gradient-to-br ${item.glow}
                    opacity-0 blur-2xl
                    transition-opacity duration-500
                    group-hover:opacity-100
                  `}
                />

                <div className="relative z-10 flex h-full flex-col justify-between">
                  {/* Top Row: Icon + Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <motion.div
                        whileHover={{ scale: 1.08, rotate: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className={`
                          flex h-11 w-11
                          items-center justify-center
                          rounded-xl border
                          shadow-inner
                          text-lg
                          ${item.bg}
                          ${item.color}
                          transition-transform duration-300
                        `}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>

                      <span
                        className={`
                          text-[10px] font-black uppercase tracking-wider
                          px-2 py-0.5 rounded-full border
                          ${item.badgeStyle}
                        `}
                      >
                        {item.badge}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-sm font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed font-normal text-muted dark:text-muted/90 group-hover:text-foreground/90 transition-colors duration-200">
                      {item.desc}
                    </p>
                  </div>

                  {/* Sleek bottom indicator beam that expands smoothly on hover */}
                  <div className="pt-4 mt-auto">
                    <div className="h-[2.5px] w-8 rounded-full bg-border/80 group-hover:w-full transition-all duration-500 overflow-hidden">
                      <div
                        className={`h-full w-full bg-gradient-to-r ${item.beam} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
