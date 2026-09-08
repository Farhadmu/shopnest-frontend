"use client";

import { FaCheckCircle, FaStar } from "react-icons/fa";

interface StatItem {
  label: string;
  value: string;
}

const stats: StatItem[] = [
  { label: "Fast discovery", value: "94%" },
  { label: "Trusted sellers", value: "91%" },
  { label: "Easy checkout", value: "96%" },
];

export default function ProofSection() {
  return (
    <section className="py-10">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-[2rem] border border-border bg-surface p-7 sm:p-9">
          <FaStar className="text-warning" />
          <p className="mt-5 text-3xl font-black text-text">4.8/5</p>
          <p className="mt-1 text-sm text-muted">Average shopper experience</p>
          <div className="mt-7 space-y-3">
            {stats.map(({ label, value }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs font-semibold">
                  <span className="text-text">{label}</span>
                  <span className="text-muted">{value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted-bg">
                  <div className="h-2 w-[94%] rounded-full bg-primary" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-border bg-muted-bg p-7 sm:p-9">
          <div className="flex items-center gap-2 text-sm font-bold text-primary">
            <FaCheckCircle /> What shoppers say
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <blockquote className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm leading-6 text-muted">
                “The AI comparison made it much easier to decide without reading dozens of product
                pages.”
              </p>
              <footer className="mt-5 text-xs font-bold text-text">
                — Ayesha, verified shopper
              </footer>
            </blockquote>
            <blockquote className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm leading-6 text-muted">
                “The seller trust signals give me much more confidence before ordering.”
              </p>
              <footer className="mt-5 text-xs font-bold text-text">
                — Rahim, verified shopper
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
