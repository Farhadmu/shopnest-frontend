"use client";

import React from "react";
import { motion } from "motion/react";
import { FiLayout, FiServer, FiLayers, FiCpu } from "react-icons/fi";

const DOMAINS = [
  {
    title: "Frontend Engineering",
    icon: FiLayout,
    accent: "from-pink-500 to-rose-500",
    textColor: "text-pink-500",
    badge: "2 Engineers",
    desc: "Building intuitive customer experiences, responsive seller dashboards, accessible design systems, and fluid micro-interactions with Next.js & React 19.",
    responsibilities: [
      "Dynamic Multi-Vendor Marketplace Views",
      "Interactive Product Comparison Engine",
      "Seller Inventory & Order Dashboards",
      "Accessible & High-Performance UI Patterns",
    ],
  },
  {
    title: "Backend Architecture",
    icon: FiServer,
    accent: "from-cyan-500 to-blue-500",
    textColor: "text-cyan-500",
    badge: "2 Engineers",
    desc: "Architecting high-throughput REST APIs, multi-tenant MongoDB schemas, session security, Bangladesh courier logistics, and automated order fulfillment pipelines.",
    responsibilities: [
      "Robust Express & TypeScript API Micro-modules",
      "Complex MongoDB Aggregations & Caching",
      "Better-Auth Session Security & RBAC",
      "Dynamic Courier & Cash-on-Delivery Systems",
    ],
  },
  {
    title: "Full-Stack Systems",
    icon: FiLayers,
    accent: "from-purple-500 to-indigo-500",
    textColor: "text-purple-500",
    badge: "1 Engineer",
    desc: "Bridging client interfaces with server-side infrastructure, real-time WebSocket communication, SSLCommerz & Stripe payment gateways, and end-to-end reliability.",
    responsibilities: [
      "Client-Server Data Contract Alignment",
      "Real-Time Socket.IO Notifications & Live Carts",
      "Payment Gateway Integration & Webhooks",
      "Cross-Platform Deployment & DevOps Pipeline",
    ],
  },
  {
    title: "AI & ML Intelligence",
    icon: FiCpu,
    accent: "from-amber-500 to-emerald-500",
    textColor: "text-amber-500",
    badge: "1 Engineer",
    desc: "Developing next-generation commerce AI: conversational shopping assistants, multi-model trade-off analysis, product recommendations, and automated seller copilot tooling.",
    responsibilities: [
      "Gemini & Claude Multi-Model Orchestration",
      "Evidence-Based Product Comparison Engine",
      "RAG Pipelines for Store Knowledge Bases",
      "Predictive Marketplace Intelligence & Tooling",
    ],
  },
];

export function DeveloperRoleDomains() {
  return (
    <section className="py-14 sm:py-20 border-t border-border/60" aria-label="Engineering Domains">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
            <FiLayers className="w-3.5 h-3.5" />
            <span>Functional Specialization</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Engineering Domains
          </h2>
          <p className="text-sm text-muted">
            How our team divides and conquers the complexities of modern multi-vendor commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DOMAINS.map((domain, idx) => {
            const Icon = domain.icon;
            return (
              <motion.div
                key={domain.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="rounded-3xl border border-border/80 dark:border-white/10 bg-card p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
              >
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 w-36 h-36 rounded-full bg-gradient-to-br ${domain.accent} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity`}
                />

                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-muted-bg flex items-center justify-center ${domain.textColor} shadow-inner`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-muted-bg/80 border border-border text-foreground/80">
                    {domain.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black text-foreground mb-2">{domain.title}</h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6">
                  {domain.desc}
                </p>

                <div className="space-y-2 pt-4 border-t border-border/60">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
                    Key Focus Deliverables:
                  </p>
                  <ul className="grid grid-cols-1 gap-2 text-xs text-foreground/90 font-medium">
                    {domain.responsibilities.map((r) => (
                      <li key={r} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${domain.accent}`} />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
