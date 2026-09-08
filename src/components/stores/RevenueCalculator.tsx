"use client";

import { useState } from "react";

export default function RevenueCalculator() {
  const [orders, setOrders] = useState<number>(450);
  const [aov, setAov] = useState<number>(99);

 
  const grossRevenue = orders * aov;
  const netPayout = Math.round(grossRevenue * 0.94);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Revenue Calculator
        </span>
        <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-400 border border-blue-500/20">
          LIVE ESTIMATE
        </span>
      </div>

      {/* Slider 1: Estimated Monthly Orders */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-400">Estimated Monthly Orders</span>
          <span className="font-bold text-white">{orders} units</span>
        </div>
        <input
          type="range"
          min="50"
          max="2000"
          step="10"
          value={orders}
          onChange={(e) => setOrders(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* Slider 2: Average Order Value (AOV) */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-400">Average Order Value (AOV)</span>
          <span className="font-bold text-white">৳{aov}.00</span>
        </div>
        <input
          type="range"
          min="10"
          max="500"
          step="1"
          value={aov}
          onChange={(e) => setAov(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* Payout Box */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          NET MERCHANT PAYOUT (EST.)
        </p>
        <p className="text-2xl font-black text-white mt-1">
          ${netPayout.toLocaleString()}{" "}
          <span className="text-xs font-normal text-slate-400">/mo</span>
        </p>
        <p className="mt-1 text-[10px] text-slate-500">
          After ShopNest low 6% gateway and escrow coverage
        </p>
      </div>
    </div>
  );
}