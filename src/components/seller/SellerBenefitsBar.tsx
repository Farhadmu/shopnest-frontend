import React from "react";

export function SellerBenefitsBar() {
  const benefits = [
    { icon: "🚀", title: "Fast Setup", desc: "Go live in 24h" },
    { icon: "💳", title: "Direct Payouts", desc: "Bank & Mobile wallets" },
    { icon: "🤖", title: "AI Copilot", desc: "Smart listing generator" },
    { icon: "🛡️", title: "Buyer Trust", desc: "Verified merchant badge" },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {benefits.map((b, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface p-3.5 text-xs shadow-xs"
        >
          <span className="text-xl">{b.icon}</span>
          <div>
            <p className="font-bold text-text">{b.title}</p>
            <p className="text-[10px] text-muted">{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
