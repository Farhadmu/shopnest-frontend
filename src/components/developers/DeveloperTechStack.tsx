"use client";

import React from "react";
import { motion } from "motion/react";
import { FiCode, FiDatabase, FiCpu, FiCloud } from "react-icons/fi";

const STACK_GROUPS = [
  {
    category: "Frontend Stack",
    icon: FiCode,
    badge: "Client Layer",
    techs: [
      { name: "Next.js", desc: "App Router & Server Components" },
      { name: "React 19", desc: "Modern declarative UI library" },
      { name: "TypeScript", desc: "End-to-end static type safety" },
      { name: "Tailwind CSS", desc: "Utility-first design tokens" },
      { name: "Motion", desc: "Fluid hardware-accelerated animations" },
      { name: "HeroUI", desc: "Accessible UI component primitives" },
    ],
  },
  {
    category: "Backend Engine",
    icon: FiDatabase,
    badge: "Server & Data",
    techs: [
      { name: "Node.js & Express", desc: "High-throughput modular API gateway" },
      { name: "TypeScript", desc: "Strict domain modeling & schemas" },
      { name: "MongoDB & Mongoose", desc: "Scalable multi-tenant document store" },
      { name: "Socket.IO", desc: "Real-time bidirectional order updates" },
      { name: "Better-Auth", desc: "Session security & role-based RBAC" },
      { name: "Zod", desc: "Strict runtime request schema validation" },
    ],
  },
  {
    category: "AI & Intelligence Core",
    icon: FiCpu,
    badge: "Cognitive Engine",
    techs: [
      { name: "Google Gemini 3.6", desc: "Primary multimodal reasoning model" },
      { name: "Anthropic Claude", desc: "High-precision conversational logic" },
      { name: "Groq (LLaMA 3.3)", desc: "Ultra-low-latency fallback inference" },
      { name: "Mistral Small", desc: "High-availability secondary fallback" },
      { name: "RAG & Tool Calling", desc: "Grounded catalog knowledge retrieval" },
      { name: "Comparison Matrix", desc: "Evidence-based mathematical scoring" },
    ],
  },
  {
    category: "DevOps & Integrations",
    icon: FiCloud,
    badge: "Cloud & APIs",
    techs: [
      { name: "Vercel", desc: "Edge-distributed frontend CDN deployment" },
      { name: "Render", desc: "Autoscaling cloud container for backend" },
      { name: "GitHub Actions", desc: "Automated continuous integration & tests" },
      { name: "SSLCommerz", desc: "Bangladesh payment gateway & bKash" },
      { name: "Stripe", desc: "International credit & debit card processing" },
      { name: "Google Maps API", desc: "Geo-location & address autocomplete" },
    ],
  },
];

export function DeveloperTechStack() {
  return (
    <section className="py-14 sm:py-20 border-t border-border/60 bg-muted-bg/15" aria-label="Engineering Stack">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
            <FiCode className="w-3.5 h-3.5" />
            <span>Under the Hood</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Our Engineering Stack
          </h2>
          <p className="text-sm text-muted">
            The modern, battle-tested technologies and cloud infrastructure powering the ShopNest ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STACK_GROUPS.map((group, idx) => {
            const Icon = group.icon;

            return (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="rounded-3xl border border-border/80 dark:border-white/10 bg-card p-6 shadow-sm hover:shadow-md transition-all space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-black text-foreground">{group.category}</h3>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-muted-bg border border-border text-muted">
                    {group.badge}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.techs.map((tech) => (
                    <div
                      key={tech.name}
                      className="p-3 rounded-2xl bg-muted-bg/50 dark:bg-muted-bg/20 border border-border/60 hover:border-primary/40 transition-colors"
                    >
                      <p className="text-xs font-black text-foreground">{tech.name}</p>
                      <p className="text-[11px] text-muted mt-0.5 leading-snug">{tech.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
