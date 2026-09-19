"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { FaLinkedinIn } from "react-icons/fa";
import { FiArrowUpRight, FiCode, FiUser } from "react-icons/fi";
import { DEVELOPERS, Developer, CATEGORY_METADATA } from "@/data/developers";

export function DeveloperGrid() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  return (
    <section className="py-14 sm:py-20 border-t border-border/60 bg-muted-bg/10" aria-label="Team Profiles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
            <FiUser className="w-3.5 h-3.5" />
            <span>The ShopNest Core Team</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Meet the Engineers
          </h2>
          <p className="text-sm text-muted">
            Specialized engineering domains working in unison to power intelligent commerce.
          </p>
        </div>

        {/* 6 Profiles Grid (2 cols mobile, 3 cols desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEVELOPERS.map((dev, idx) => {
            const meta = CATEGORY_METADATA[dev.category];

            return (
              <motion.div
                key={dev.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="h-full"
              >
                <div
                  className="group relative h-full rounded-3xl border border-border/80 dark:border-white/10 bg-card/85 dark:bg-card/50 backdrop-blur-xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Hover ambient top glow */}
                  <div
                    className={`pointer-events-none absolute -right-12 -top-12 w-40 h-40 rounded-full bg-gradient-to-br ${meta.color} opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-500`}
                  />

                  {/* Top section: Avatar + Category Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden p-1 bg-card border-2 border-border/80 shadow-md group-hover:border-primary/50 transition-colors">
                        <Image
                          src={dev.image}
                          alt={dev.name}
                          width={80}
                          height={80}
                          className="w-full h-full rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${meta.badgeBg}`}
                      >
                        {dev.category.replace("_", "/")}
                      </span>
                    </div>

                    {/* Name & Role */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {dev.name}
                      </h3>
                      <p className="text-xs font-bold text-muted">
                        {dev.role}
                      </p>
                      <p className="text-[11px] font-semibold text-primary/90 pt-0.5">
                        Focus: {dev.focusArea}
                      </p>
                    </div>

                    {/* Bio */}
                    <p className="mt-3.5 text-xs text-muted leading-relaxed">
                      {dev.shortBio}
                    </p>

                    {/* Skills Chips */}
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FiCode className="w-3 h-3 text-primary" />
                        <span>Core Competencies</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {dev.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-lg bg-muted-bg/70 dark:bg-card text-[10px] font-semibold text-foreground/80 border border-border/60"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action: Direct Verified LinkedIn Profile */}
                  <div className="mt-6 pt-4 border-t border-border/60">
                    <a
                      href={dev.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted-bg hover:bg-[#0077b5] text-foreground hover:text-white text-xs font-bold transition-all duration-200 shadow-xs group/btn"
                    >
                      <FaLinkedinIn className="w-3.5 h-3.5 text-[#0077b5] group-hover/btn:text-white transition-colors" />
                      <span>Connect on LinkedIn</span>
                      <FiArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
