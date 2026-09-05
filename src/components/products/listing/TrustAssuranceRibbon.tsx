import React from "react";
import { FiShield, FiHome, FiZap } from "react-icons/fi";

const ITEMS = [
  {
    icon: FiShield,
    title: "Buyer Escrow Protection",
    description: "Funds are held securely until you receive and verify your ordered items.",
  },
  {
    icon: FiHome,
    title: "Vetted Independent Stores",
    description: "Every vendor submits national trade certification & identity credentials.",
  },
  {
    icon: FiZap,
    title: "Consolidated Delivery",
    description: "Single delivery tracking even when purchasing from multiple independent sellers.",
  },
];

export function TrustAssuranceRibbon() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {ITEMS.map(({ icon: Icon, title, description }) => (
        <div key={title} className="flex items-start gap-3 rounded-2xl bg-surface p-4 shadow-sm">
          <div className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-primary">
            <Icon size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-text">{title}</h4>
            <p className="mt-0.5 text-xs text-muted">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}