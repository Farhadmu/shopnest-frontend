"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { FaLinkedinIn } from "react-icons/fa";
import { FiFilter, FiActivity, FiShare2 } from "react-icons/fi";
import {
  DEVELOPERS,
  DEVELOPER_CONNECTIONS,
  Developer,
  DeveloperCategory,
  CATEGORY_METADATA,
} from "@/data/developers";

// Expanded desktop topology for engineering network mesh (viewBox: 0 0 1120 740)
const DESKTOP_NODE_COORDS: Record<string, { x: number; y: number }> = {
  "member-4": { x: 160, y: 200 }, // Hasina Akter (Frontend)
  "member-2": { x: 240, y: 520 }, // Nusrat Jahan (Frontend)
  "member-6": { x: 440, y: 280 }, // Md. Farhadul Islam (Full Stack Bridge)
  "member-1": { x: 660, y: 560 }, // MD Moynul Islam (AI/ML Intelligence)
  "member-3": { x: 860, y: 520 }, // Aminul Islam (Backend)
  "member-5": { x: 940, y: 200 }, // Abu Bakkar Siddique (Backend)
};

export function DeveloperNetworkVisualization() {
  const [activeCategory, setActiveCategory] = useState<"ALL" | DeveloperCategory>("ALL");
  const [hoveredDevId, setHoveredDevId] = useState<string | null>(null);


  // Determine active collaboration count for hovered developer
  const hoveredDevConnectionsCount = useMemo(() => {
    if (!hoveredDevId) return 0;
    return directlyConnectedDevIds.size - 1;
  }, [hoveredDevId, directlyConnectedDevIds]);
  const [activeCategory, setActiveCategory] = useState<"ALL" | DeveloperCategory>("ALL");
  const [hoveredDevId, setHoveredDevId] = useState<string | null>(null);

  // Set of connected developers for the currently hovered developer
  const directlyConnectedDevIds = useMemo(() => {
    if (!hoveredDevId) return new Set<string>();
    const set = new Set<string>([hoveredDevId]);
    for (const conn of DEVELOPER_CONNECTIONS) {
      if (conn.from === hoveredDevId) set.add(conn.to);
      if (conn.to === hoveredDevId) set.add(conn.from);
    }
    return set;
  }, [hoveredDevId]);

  // Determine if a connection line should be highlighted
  const isLineHighlighted = (from: string, to: string) => {
    if (hoveredDevId) {
      return (from === hoveredDevId && directlyConnectedDevIds.has(to)) ||
             (to === hoveredDevId && directlyConnectedDevIds.has(from));
    }
    if (activeCategory !== "ALL") {
      const fromDev = DEVELOPERS.find((d) => d.id === from);
      const toDev = DEVELOPERS.find((d) => d.id === to);
      return fromDev?.category === activeCategory || toDev?.category === activeCategory;
    }
    return false;
  };

  // Determine if a developer node is dimmed
  const isDevDimmed = (dev: Developer) => {
    if (hoveredDevId) {
      return !directlyConnectedDevIds.has(dev.id);
    }
    if (activeCategory !== "ALL") {
      return dev.category !== activeCategory;
    }
    return false;
  };

  return (
    <section id="network" className="py-14 sm:py-20 relative overflow-hidden" aria-label="Interactive Team Network">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Header & Interactive Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mb-2">
              <FiActivity className="w-3.5 h-3.5" />
              <span>Interactive Engineering Mesh</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              Collaborative Architecture
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-xl">
              Hover over an engineer to trace their direct collaboration channels, or filter by domain.
            </p>
          </div>

          {/* Role Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-muted-bg/60 dark:bg-card/70 border border-border/80 backdrop-blur-md self-start sm:self-auto">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === "ALL"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              All (6)
            </button>
            <button
              onClick={() => setActiveCategory("FRONTEND")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === "FRONTEND"
                  ? "bg-pink-600 text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Frontend (2)
            </button>
            <button
              onClick={() => setActiveCategory("BACKEND")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === "BACKEND"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Backend (2)
            </button>
            <button
              onClick={() => setActiveCategory("FULLSTACK")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === "FULLSTACK"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Full Stack (1)
            </button>
            <button
              onClick={() => setActiveCategory("AI_ML")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === "AI_ML"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              AI/ML (1)
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* DESKTOP NETWORK CANVAS (Hidden on mobile/tablet < 1024px)       */}
        {/* ---------------------------------------------------------------- */}
        <div className="hidden lg:block relative rounded-3xl border border-border/70 dark:border-white/10 bg-card/60 dark:bg-card/40 backdrop-blur-xl p-6 shadow-2xl overflow-hidden w-full aspect-[1120/740] min-h-[680px] max-h-[820px]">
          {/* Subtle Grid Backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* ShopNest Core Ecosystem Apex Node */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
            <div className="px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-black tracking-widest uppercase shadow-md backdrop-blur-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>ShopNest Core Platform</span>
            </div>
            {hoveredDevId && (
              <span className="mt-2 text-[11px] font-bold px-3 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 backdrop-blur-md">
                Active Channels: {hoveredDevConnectionsCount} direct link
                {hoveredDevConnectionsCount === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {/* SVG Connection Lines Canvas */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 1120 740"
            preserveAspectRatio="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5b5cf0" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="activeLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="1" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
              </linearGradient>
              {/* Radial glow filter */}
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Core Platform feeder lines */}
            <path
              d="M 480 75 C 480 110, 190 110, 190 160"
              fill="none"
              stroke="currentColor"
              className="text-border/60 dark:text-white/10"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M 480 75 C 480 110, 770 110, 770 160"
              fill="none"
              stroke="currentColor"
              className="text-border/60 dark:text-white/10"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Render Team Collaboration Connection Lines */}
            {DEVELOPER_CONNECTIONS.map((conn, idx) => {
              const start = DESKTOP_NODE_COORDS[conn.from];
              const end = DESKTOP_NODE_COORDS[conn.to];
              if (!start || !end) return null;

              const highlighted = isLineHighlighted(conn.from, conn.to);
              // Dynamic curved bezier control point
              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;
              const dx = end.x - start.x;
              const dy = end.y - start.y;
              const curvature = 25;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const ctrlX = midX - (dy / len) * curvature;
              const ctrlY = midY + (dx / len) * curvature;

              const pathD = `M ${start.x} ${start.y} Q ${ctrlX} ${ctrlY} ${end.x} ${end.y}`;

              return (
                <g key={`conn-${idx}`}>
                  {/* Base path line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={highlighted ? "url(#activeLineGrad)" : "currentColor"}
                    strokeWidth={highlighted ? 3 : 1.5}
                    className={`transition-all duration-300 ${
                      highlighted
                        ? "filter drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                        : "text-border/70 dark:text-white/10 opacity-60"
                    }`}
                  />

                  {/* Animated traveling pulse dot for highlighted line */}
                  {/* Animated traveling energy pulse dot */}
                  <circle r={highlighted ? 5 : 3} fill={highlighted ? "#f43f5e" : "#8b5cf6"} opacity={highlighted ? 1 : 0.6}>
                    <animateMotion
                      path={pathD}
                      dur={highlighted ? "2s" : "4s"}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Render Developer Nodes on Desktop Canvas */}
          <div className="relative z-20 w-full h-full pointer-events-none">
            {DEVELOPERS.map((dev) => {
              const coords = DESKTOP_NODE_COORDS[dev.id];
              if (!coords) return null;

              const isDimmed = isDevDimmed(dev);
              const isHovered = hoveredDevId === dev.id;
              const meta = CATEGORY_METADATA[dev.category];

              return (
                <div
                  key={dev.id}
                  style={{
                    position: "absolute",
                    left: `${(coords.x / 1120) * 100}%`,
                    top: `${(coords.y / 740) * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className={`pointer-events-auto transition-all duration-300 ${
                    isDimmed ? "opacity-25 grayscale scale-95" : "opacity-100 scale-100"
                  }`}
                  onMouseEnter={() => setHoveredDevId(dev.id)}
                  onMouseLeave={() => setHoveredDevId(null)}
                >
                  <div className="flex flex-col items-center text-center group cursor-pointer">
                    {/* Outer Glowing Ring & Profile Image */}
                    <div className="relative mb-2">
                      <div
                        className={`absolute -inset-1.5 rounded-full bg-gradient-to-r ${meta.color} opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300`}
                      />

                      <div
                        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-card border-2 ${
                          isHovered
                            ? `${meta.borderColor} ring-4 ${meta.ringColor}`
                            : "border-border/80"
                        } shadow-lg transition-all duration-300 group-hover:scale-105 overflow-hidden`}
                      >
                        <Image
                          src={dev.image}
                          alt={dev.name}
                          width={96}
                          height={96}
                          className="w-full h-full rounded-full object-cover"
                          priority
                        />
                      </div>

                      {/* Small floating category status pip */}
                      <span
                        className={`absolute bottom-0 right-1 w-4 h-4 rounded-full border-2 border-card ${
                          dev.category === "FRONTEND"
                            ? "bg-pink-500"
                            : dev.category === "BACKEND"
                            ? "bg-cyan-500"
                            : dev.category === "FULLSTACK"
                            ? "bg-purple-500"
                            : "bg-amber-500"
                        }`}
                      />
                    </div>

                    {/* Member Details */}
                    <div className="space-y-0.5 max-w-[190px]">
                      <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">
                        {dev.name}
                      </h3>
                      <p className="text-[11px] font-bold text-muted truncate">
                        {dev.role}
                      </p>

                      <div className="pt-1 flex items-center justify-center gap-2">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${meta.badgeBg}`}
                        >
                          {dev.category.replace("_", "/")}
                        </span>

                        <a
                          href={dev.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-md bg-muted-bg/60 hover:bg-[#0077b5] text-muted hover:text-white transition-colors"
                          title="View LinkedIn Profile"
                          aria-label={`${dev.name} LinkedIn`}
                        >
                          <FaLinkedinIn className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* MOBILE & TABLET STREAM VIEW (< 1024px)                          */}
        {/* Responsive, connected vertical flow that never overflows         */}
        {/* ---------------------------------------------------------------- */}
        <div className="lg:hidden space-y-4">
          <div className="relative pl-6 sm:pl-8 border-l-2 border-primary/30 space-y-6 my-4">
            {DEVELOPERS.map((dev, idx) => {
              const meta = CATEGORY_METADATA[dev.category];
              const isDimmed = isDevDimmed(dev);

              return (
                <div
                  key={dev.id}
                  className={`relative transition-all duration-300 ${
                    isDimmed ? "opacity-30 grayscale" : "opacity-100"
                  }`}
                  onClick={() => setHoveredDevId(hoveredDevId === dev.id ? null : dev.id)}
                >
                  {/* Glowing Node Dot on Timeline */}
                  <span
                    className={`absolute -left-[31px] sm:-left-[39px] top-6 w-4 h-4 rounded-full border-2 border-card ${
                      dev.category === "FRONTEND"
                        ? "bg-pink-500"
                        : dev.category === "BACKEND"
                        ? "bg-cyan-500"
                        : dev.category === "FULLSTACK"
                        ? "bg-purple-500"
                        : "bg-amber-500"
                    } ring-4 ring-primary/20`}
                  />

                  {/* Member Mobile Card */}
                  <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-sm flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-border">
                      <Image
                        src={dev.image}
                        alt={dev.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${meta.badgeBg}`}>
                          {dev.category.replace("_", "/")}
                        </span>
                        <a
                          href={dev.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0077b5] p-1 text-xs hover:scale-110 transition-transform"
                          aria-label={`${dev.name} LinkedIn`}
                        >
                          <FaLinkedinIn className="w-4 h-4" />
                        </a>
                      </div>

                      <h3 className="text-sm font-black text-foreground mt-1 truncate">
                        {dev.name}
                      </h3>
                      <p className="text-xs font-bold text-muted truncate">
                        {dev.role}
                      </p>
                      <p className="text-[11px] text-muted line-clamp-2 mt-1">
                        {dev.shortBio}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
