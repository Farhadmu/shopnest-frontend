"use client";

import { useState } from "react";

export default function RevenueCalculator() {
  const [orders, setOrders] = useState<number>(450);
  const [aov, setAov] = useState<number>(99);

  const grossRevenue = orders * aov;
  const netPayout = Math.round(grossRevenue * 0.94);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-white/15 dark:bg-gradient-to-br dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 p-6 backdrop-blur-2xl shadow-xl dark:shadow-2xl text-slate-900 dark:text-white transition-all">
      {/* GLOWING BACKGROUND EFFECT */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10px] top-[-10px] h-[140px] w-[140px] rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-[50px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
            Revenue Calculator
          </span>
          <span className="rounded-full bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/20 px-2.5 py-1 text-[10px] font-bold dark:text-blue-300 dark:border-blue-500/30 backdrop-blur-md">
            LIVE ESTIMATE
          </span>
        </div>

        {/* Slider 1: Estimated Monthly Orders */}
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-600 dark:text-slate-300">Estimated Monthly Orders</span>
            <span className="font-bold text-slate-900 dark:text-white">{orders} units</span>
          </div>
          <input
            type="range"
            min="50"
            max="2000"
            step="10"
            value={orders}
            onChange={(e) => setOrders(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
          />
        </div>

        {/* Slider 2: Average Order Value (AOV) */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-600 dark:text-slate-300">Average Order Value (AOV)</span>
            <span className="font-bold text-slate-900 dark:text-white">৳{aov}.00</span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="1"
            value={aov}
            onChange={(e) => setAov(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
          />
        </div>

        {/* Payout Box */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-white/10 p-4 shadow-sm dark:shadow-inner mt-4">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            NET MERCHANT PAYOUT (EST.)
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ${netPayout.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/mo</span>
          </p>
          <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            After ShopNest low 6% gateway and escrow coverage
          </p>
        </div>
      </div>
    </div>
  );
}