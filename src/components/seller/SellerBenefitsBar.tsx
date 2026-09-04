import React from "react";

export function SellerBenefitsBar() {
  const benefits = [
    { icon: "🚀", title: "Fast Setup", desc: "Go live in 24h" },
    { icon: "💳", title: "Direct Payouts", desc: "Bank & Wallet" },
    { icon: "🤖", title: "AI Copilot", desc: "Smart listing" },
    { icon: "🛡️", title: "Buyer Trust", desc: "Verified badge" },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {benefits.map((b, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-xs shadow-xs hover:border-primary/40 transition"
        >
          <span className="text-lg shrink-0">{b.icon}</span>
          <div className="min-w-0">
            <p className="font-bold text-text text-xs truncate">{b.title}</p>
            <p className="text-[10px] text-muted truncate">{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
