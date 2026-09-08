import React from "react";
import { FiCheckCircle, FiShield, FiClock } from "react-icons/fi";
import { FaStore } from "react-icons/fa";

export function SellerPendingTimeline() {
  const milestones = [
    {
      step: 1,
      title: "Application Submitted",
      desc: "Store profile & contact received",
      status: "done" as const,
      icon: FiCheckCircle,
    },
    {
      step: 2,
      title: "KYC & Identity Check",
      desc: "Validating NID & business address",
      status: "active" as const,
      icon: FiShield,
    },
    {
      step: 3,
      title: "Admin Moderation",
      desc: "Trust scoring & catalog review",
      status: "pending" as const,
      icon: FiClock,
    },
    {
      step: 4,
      title: "Store Go-Live",
      desc: "Unlock dashboard & sales access",
      status: "pending" as const,
      icon: FaStore,
    },
  ];

  return (
    <div className="mb-8 rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="text-xs font-black uppercase tracking-wider text-muted mb-6">
        Verification Milestones
      </h3>

      <div className="grid gap-6 sm:grid-cols-4 relative">
        {milestones.map((milestone) => {
          const Icon = milestone.icon;
          return (
            <div key={milestone.step} className="flex flex-col items-center text-center space-y-2">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
                  milestone.status === "done"
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : milestone.status === "active"
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 animate-pulse"
                    : "bg-muted-bg text-muted"
                }`}
              >
                <Icon size={20} />
              </div>
              <h4 className="text-xs font-black text-text">{milestone.title}</h4>
              <p className="text-[11px] text-muted leading-tight">{milestone.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
