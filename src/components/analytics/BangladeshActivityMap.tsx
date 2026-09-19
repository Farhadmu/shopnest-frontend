"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export interface DivisionItem {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  sellers: number;
  customers: number;
  growth: string;
  coordinates?: { latitude: number; longitude: number };
  keyHubs?: string[];
  slaRate?: string;
  avgDeliveryHours?: number;
  status?: string;
}

interface BangladeshActivityMapProps {
  divisions: DivisionItem[];
}

// Normalized SVG coordinates and paths for Bangladesh divisions (viewBox 0 0 500 620)
// Arranged according to real geographic topology of Bangladesh:
// Rangpur (NW), Rajshahi (W), Mymensingh (N-Central), Sylhet (NE),
// Dhaka (Central), Khulna (SW), Barishal (S), Chattogram (SE)
interface SvgDivisionGeo {
  id: string;
  path: string;
  labelX: number;
  labelY: number;
  hubX: number;
  hubY: number;
  capital: string;
}

const BD_SVG_DIVISIONS: Record<string, SvgDivisionGeo> = {
  rangpur: {
    id: "rangpur",
    capital: "Rangpur",
    path: "M 130 30 L 205 45 L 215 90 L 195 130 L 140 145 L 115 110 L 95 65 Z",
    labelX: 155,
    labelY: 90,
    hubX: 155,
    hubY: 80,
  },
  rajshahi: {
    id: "rajshahi",
    capital: "Rajshahi",
    path: "M 115 110 L 140 145 L 195 130 L 200 185 L 180 230 L 130 220 L 75 190 L 90 140 Z",
    labelX: 140,
    labelY: 175,
    hubX: 135,
    hubY: 165,
  },
  mymensingh: {
    id: "mymensingh",
    capital: "Mymensingh",
    path: "M 215 90 L 290 85 L 305 130 L 285 180 L 220 185 L 195 130 Z",
    labelX: 250,
    labelY: 140,
    hubX: 250,
    hubY: 130,
  },
  sylhet: {
    id: "sylhet",
    capital: "Sylhet",
    path: "M 290 85 L 395 95 L 420 155 L 380 205 L 315 200 L 285 180 L 305 130 Z",
    labelX: 350,
    labelY: 150,
    hubX: 350,
    hubY: 140,
  },
  dhaka: {
    id: "dhaka",
    capital: "Dhaka Central",
    path: "M 180 230 L 200 185 L 220 185 L 285 180 L 315 200 L 320 280 L 265 310 L 205 315 L 180 270 Z",
    labelX: 250,
    labelY: 250,
    hubX: 250,
    hubY: 240,
  },
  khulna: {
    id: "khulna",
    capital: "Khulna",
    path: "M 130 220 L 180 230 L 180 270 L 205 315 L 195 385 L 185 450 L 110 440 L 95 360 L 110 270 Z",
    labelX: 145,
    labelY: 345,
    hubX: 145,
    hubY: 335,
  },
  barisal: {
    id: "barisal",
    capital: "Barishal",
    path: "M 205 315 L 265 310 L 280 370 L 275 445 L 220 455 L 195 385 Z",
    labelX: 240,
    labelY: 390,
    hubX: 240,
    hubY: 380,
  },
  chittagong: {
    id: "chittagong",
    capital: "Chattogram",
    path: "M 315 200 L 380 205 L 415 270 L 440 370 L 420 485 L 385 530 L 360 480 L 320 380 L 280 370 L 265 310 L 320 280 Z",
    labelX: 365,
    labelY: 340,
    hubX: 360,
    hubY: 330,
  },
};

export function BangladeshActivityMap({ divisions }: BangladeshActivityMapProps) {
  const [selectedMetric, setSelectedMetric] = useState<"orders" | "revenue" | "sellers" | "customers">("orders");
  const [activeDivisionId, setActiveDivisionId] = useState<string>("dhaka");
  const [hoveredDivisionId, setHoveredDivisionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"geo_map" | "grid_matrix">("geo_map");

  const activeDivision = divisions.find((d) => d.id === activeDivisionId) || divisions[0] || null;
  const hoveredDivision = divisions.find((d) => d.id === hoveredDivisionId);

  const maxVal = Math.max(...divisions.map((d) => d[selectedMetric] || 0), 1);

  // Choropleth color calculation for division polygons
  const getDivisionColor = (divId: string) => {
    const div = divisions.find((d) => d.id === divId);
    if (!div) return "#1e293b";
    const ratio = Math.min(1, Math.max(0.15, (div[selectedMetric] || 0) / maxVal));

    if (activeDivisionId === divId) {
      return "#8b5cf6"; // Vivid purple for active
    }
    if (hoveredDivisionId === divId) {
      return "#6366f1"; // Indigo for hover
    }

    // Gradient step shades from deep navy to vibrant cyan/indigo
    if (ratio > 0.75) return "#4f46e5";
    if (ratio > 0.5) return "#3b82f6";
    if (ratio > 0.25) return "#0284c7";
    return "#1e293b";
  };

  return (
    <div className="w-full space-y-5">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-text">
              Bangladesh Regional Logistics & Marketplace Activity
            </h3>
            <span className="rounded-md bg-primary/15 text-primary text-[11px] font-black px-2 py-0.5">
              8 Divisions Active
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Interactive geographical telemetry across Bangladesh: live orders, revenue distribution, registered merchants, and fulfillment SLA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl bg-muted-bg p-1 text-xs font-bold border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode("geo_map")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition cursor-pointer ${
                viewMode === "geo_map" ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-text"
              }`}
            >
              <span>🗺️ Radar Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid_matrix")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition cursor-pointer ${
                viewMode === "grid_matrix" ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-text"
              }`}
            >
              <span>📊 Matrix View</span>
            </button>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center rounded-xl bg-muted-bg p-1 text-xs font-bold border border-border/60">
            {(
              [
                { id: "orders", label: "📦 Orders" },
                { id: "revenue", label: "৳ Revenue" },
                { id: "sellers", label: "🏪 Sellers" },
                { id: "customers", label: "👤 Customers" },
              ] as const
            ).map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setSelectedMetric(m.id)}
                className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                  selectedMetric === m.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-text"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "geo_map" ? (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] items-start">
          {/* Interactive Bangladesh SVG Geographic Map */}
          <div className="relative rounded-2xl border border-border/80 bg-slate-950/80 p-5 shadow-inner overflow-hidden min-h-[520px] flex flex-col justify-between">
            {/* Ambient Background Grid & Radar Circle Overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-primary/10 pointer-events-none animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-primary/15 pointer-events-none" />

            {/* Map Top Status Ticker */}
            <div className="relative z-10 flex items-center justify-between text-xs font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                <span className="uppercase text-[11px] tracking-wider text-slate-400">
                  Metric: <strong className="text-white capitalize">{selectedMetric}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#4f46e5]" /> High Density
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#0284c7]" /> Moderate
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#8b5cf6]" /> Selected
                </span>
              </div>
            </div>

            {/* SVG Map Display */}
            <div className="relative z-10 my-auto flex justify-center py-2">
              <svg
                viewBox="0 0 500 580"
                className="w-full max-w-[440px] h-auto drop-shadow-2xl select-none"
                style={{ filter: "drop-shadow(0 10px 25px rgba(0, 0, 0, 0.6))" }}
              >
                {/* Connection lines between key regional logistics hubs */}
                <g stroke="#6366f1" strokeWidth="1" strokeDasharray="3,3" opacity="0.35">
                  <line x1="250" y1="240" x2="155" y2="80" />
                  <line x1="250" y1="240" x2="135" y2="165" />
                  <line x1="250" y1="240" x2="250" y2="130" />
                  <line x1="250" y1="240" x2="350" y2="140" />
                  <line x1="250" y1="240" x2="145" y2="335" />
                  <line x1="250" y1="240" x2="240" y2="380" />
                  <line x1="250" y1="240" x2="360" y2="330" />
                </g>

                {/* Division Polygons */}
                {Object.entries(BD_SVG_DIVISIONS).map(([key, geo]) => {
                  const div = divisions.find((d) => d.id === key);
                  const isSelected = activeDivisionId === key;
                  const isHovered = hoveredDivisionId === key;
                  const fillColor = getDivisionColor(key);

                  return (
                    <g
                      key={key}
                      onClick={() => setActiveDivisionId(key)}
                      onMouseEnter={() => setHoveredDivisionId(key)}
                      onMouseLeave={() => setHoveredDivisionId(null)}
                      className="cursor-pointer transition-transform duration-300"
                    >
                      {/* Polygon Path */}
                      <path
                        d={geo.path}
                        fill={fillColor}
                        stroke={isSelected ? "#ffffff" : isHovered ? "#38bdf8" : "#334155"}
                        strokeWidth={isSelected ? "2.5" : isHovered ? "2" : "1.2"}
                        className="transition-all duration-300 hover:opacity-90"
                      />

                      {/* Division Pulse Beacon on Hub Coordinate */}
                      <circle cx={geo.hubX} cy={geo.hubY} r={isSelected ? "7" : "5"} fill={isSelected ? "#a855f7" : "#38bdf8"} />
                      {isSelected && (
                        <circle
                          cx={geo.hubX}
                          cy={geo.hubY}
                          r="12"
                          fill="none"
                          stroke="#c084fc"
                          strokeWidth="1.5"
                          className="animate-ping"
                        />
                      )}

                      {/* Division Label */}
                      <text
                        x={geo.labelX}
                        y={geo.labelY}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight={isSelected ? "900" : "700"}
                        fill={isSelected ? "#ffffff" : "#f8fafc"}
                        className="pointer-events-none drop-shadow-md"
                      >
                        {geo.capital}
                      </text>

                      {/* Value Subtitle */}
                      <text
                        x={geo.labelX}
                        y={geo.labelY + 14}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="600"
                        fill={isSelected ? "#e9d5ff" : "#cbd5e1"}
                        className="pointer-events-none"
                      >
                        {selectedMetric === "revenue"
                          ? `৳${((div?.revenue || 0) / 1000).toFixed(0)}k`
                          : (div?.[selectedMetric] || 0).toLocaleString()}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Interactive Bottom Bar */}
            <div className="relative z-10 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>💡 Click on any division to inspect real-time regional logistics & merchant metrics</span>
              <span className="text-slate-300 font-bold">
                {hoveredDivision ? `Hovering: ${hoveredDivision.name}` : `Active: ${activeDivision?.name || "Dhaka"}`}
              </span>
            </div>
          </div>

          {/* Right Side: Deep-Dive Division Intelligence Dossier */}
          {activeDivision ? (
            <div className="rounded-2xl border border-primary/30 bg-surface p-6 shadow-xl space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📍</span>
                    <h3 className="text-2xl font-black text-text">{activeDivision.name}</h3>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Primary Regional Commercial Zone • {activeDivision.slaRate || "98.5%"} Delivery SLA
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs font-black">
                    {activeDivision.growth} Growth
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted">Status: Operational</span>
                </div>
              </div>

              {/* Four Primary Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="rounded-2xl border border-border/80 bg-muted-bg/50 p-4 transition hover:border-primary/50">
                  <div className="flex items-center justify-between text-muted text-xs font-semibold mb-1">
                    <span>Total Orders</span>
                    <span className="text-base">📦</span>
                  </div>
                  <p className="text-2xl font-black text-text">{activeDivision.orders.toLocaleString()}</p>
                  <span className="text-[10px] text-emerald-500 font-bold">Active in transit</span>
                </div>

                <div className="rounded-2xl border border-border/80 bg-muted-bg/50 p-4 transition hover:border-primary/50">
                  <div className="flex items-center justify-between text-muted text-xs font-semibold mb-1">
                    <span>GMV Revenue</span>
                    <span className="text-base">৳</span>
                  </div>
                  <p className="text-2xl font-black text-primary">
                    {activeDivision.revenue >= 1000000
                      ? `৳${(activeDivision.revenue / 1000000).toFixed(2)}M`
                      : `৳${(activeDivision.revenue / 1000).toFixed(0)}k`}
                  </p>
                  <span className="text-[10px] text-muted font-bold">Total completed volume</span>
                </div>

                <div className="rounded-2xl border border-border/80 bg-muted-bg/50 p-4 transition hover:border-primary/50">
                  <div className="flex items-center justify-between text-muted text-xs font-semibold mb-1">
                    <span>Registered Sellers</span>
                    <span className="text-base">🏪</span>
                  </div>
                  <p className="text-2xl font-black text-text">{activeDivision.sellers.toLocaleString()}</p>
                  <span className="text-[10px] text-emerald-500 font-bold">Verified store partners</span>
                </div>

                <div className="rounded-2xl border border-border/80 bg-muted-bg/50 p-4 transition hover:border-primary/50">
                  <div className="flex items-center justify-between text-muted text-xs font-semibold mb-1">
                    <span>Active Customers</span>
                    <span className="text-base">👤</span>
                  </div>
                  <p className="text-2xl font-black text-text">{activeDivision.customers.toLocaleString()}</p>
                  <span className="text-[10px] text-muted font-bold">Repeat buyers</span>
                </div>
              </div>

              {/* Regional Fulfillment Hubs */}
              <div className="rounded-xl border border-border p-4 bg-surface/50 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center justify-between">
                  <span>Major Logistics & Dispatch Hubs</span>
                  <span className="text-[10px] font-semibold text-primary">Live Tracking</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(
                    activeDivision.keyHubs || [
                      `${activeDivision.name.split(" ")[0]} Central Hub`,
                      `${activeDivision.name.split(" ")[0]} Gateway Terminal`,
                      "Regional Delivery Node",
                    ]
                  ).map((hub, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted-bg px-2.5 py-1 text-xs font-bold text-text"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {hub}
                    </span>
                  ))}
                </div>
              </div>

              {/* SLA & Speed Indicator */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">⚡</span>
                  <div>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold block">
                      Avg Delivery Time: {activeDivision.avgDeliveryHours || 18} Hours
                    </strong>
                    <span className="text-muted text-[11px]">
                      Same-day and next-day courier networks operational across all upazilas.
                    </span>
                  </div>
                </div>
                <span className="rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black px-2 py-1 text-xs">
                  {activeDivision.slaRate || "98.5%"}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        /* Matrix Grid View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {divisions.map((div) => {
            const isSelected = activeDivisionId === div.id;
            const val = div[selectedMetric] || 0;
            const percent = Math.max(12, Math.round((val / maxVal) * 100));

            return (
              <div
                key={div.id}
                onClick={() => {
                  setActiveDivisionId(div.id);
                  setViewMode("geo_map");
                }}
                className={`group rounded-2xl border p-4 transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-surface hover:border-primary/50 hover:bg-muted-bg/50"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📍</span>
                    <strong className="text-sm font-bold text-text">{div.name}</strong>
                  </div>
                  <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-black">
                    {div.growth}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-muted block uppercase">Orders</span>
                    <strong className="text-base font-black text-text">{div.orders.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-muted block uppercase">Revenue</span>
                    <strong className="text-base font-black text-primary">
                      ৳{(div.revenue / 1000).toFixed(0)}k
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-muted block uppercase">Sellers</span>
                    <strong className="text-sm font-bold text-text">{div.sellers.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-muted block uppercase">Customers</span>
                    <strong className="text-sm font-bold text-text">{div.customers.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted-bg">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
