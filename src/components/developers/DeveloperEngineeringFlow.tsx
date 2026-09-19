"use client";

import React from "react";
import { motion } from "motion/react";
import {
  FiCompass,
  FiLayout,
  FiRepeat,
  FiServer,
  FiDatabase,
  FiCpu,
  FiZap,
  FiSmile,
} from "react-icons/fi";

const FLOW_STEPS = [
  {
    step: "01",
    title: "Idea & UX",
    role: "All Engineers",
    desc: "Collaborative design, customer empathy & architecture blueprints.",
    icon: FiCompass,
    color: "from-blue-500 to-indigo-500",
  },
  {
    step: "02",
    title: "Frontend UI",
    role: "Frontend Team",
    desc: "Next.js components, responsive views & micro-interactions.",
    icon: FiLayout,
    color: "from-pink-500 to-rose-500",
  },
  {
    step: "03",
    title: "API Layer",
    role: "Full-Stack & Backend",
    desc: "Strict request validation, security tokens & rate limiting.",
    icon: FiRepeat,
    color: "from-purple-500 to-violet-500",
  },
  {
    step: "04",
    title: "Backend Core",
    role: "Backend Team",
    desc: "Modular Express controllers, order processing & courier fees.",
    icon: FiServer,
    color: "from-cyan-500 to-blue-500",
  },
  {
    step: "05",
    title: "Database & Cache",
    role: "Backend Team",
    desc: "High-performance MongoDB aggregation & in-memory cache.",
    icon: FiDatabase,
    color: "from-teal-500 to-emerald-500",
  },
  {
    step: "06",
    title: "AI Intelligence",
    role: "AI/ML Engineer",
    desc: "Gemini & Claude multi-model inference, RAG & comparison math.",
    icon: FiCpu,
    color: "from-amber-500 to-orange-500",
  },
  {
    step: "07",
    title: "Real-Time Sync",
    role: "Full-Stack Engineer",
    desc: "Live Socket.IO order tracking, notifications & cart updates.",
    icon: FiZap,
    color: "from-violet-500 to-purple-500",
  },
  {
    step: "08",
    title: "Delight & Scale",
    role: "Customer Impact",
    desc: "Frictionless multi-vendor shopping for buyers and sellers.",
    icon: FiSmile,
    color: "from-emerald-500 to-green-500",
  },
];

export function DeveloperEngineeringFlow() {
  return (
    <section className="py-14 sm:py-20 border-t border-border/60" aria-label="Engineering Workflow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
            <FiRepeat className="w-3.5 h-3.5" />
            <span>End-to-End Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            How We Build ShopNest
          </h2>
          <p className="text-sm text-muted">
            From whiteboard concept to production execution — a seamless engineering journey.
          </p>
        </div>

        {/* Step Flow Ribbon / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FLOW_STEPS.map((item, idx) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="relative group rounded-2xl border border-border/80 dark:border-white/10 bg-card p-5 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
              >
                {/* Accent top stripe */}
                <div className={`h-1 w-full bg-gradient-to-r ${item.color} rounded-t-xl mb-4`} />

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-primary/80 tracking-widest">
                    STEP {item.step}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-muted-bg flex items-center justify-center text-foreground">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="text-sm font-black text-foreground mb-0.5">{item.title}</h3>
                <p className="text-[11px] font-bold text-primary mb-2">{item.role}</p>
                <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
