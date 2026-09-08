"use client";

import React from "react";
import { motion } from "motion/react";
import { TRUST_METRICS } from "./seller.data";

export default function SellerTrustPillars() {
  return (
    <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-border/70 bg-muted-bg/40 p-4 sm:grid-cols-4 sm:p-5">
      {TRUST_METRICS.map((metric, i) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="flex items-center gap-3 p-1"
          >
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface border border-border/60 ${metric.color} shadow-xs`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-text">{metric.title}</p>
              <p className="truncate text-[11px] font-medium text-muted">{metric.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
