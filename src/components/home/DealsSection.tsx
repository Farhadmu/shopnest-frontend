"use client";

import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

interface DealItem {
  title: string;
  subtitle: string;
  icon: string;
  href: string;
}

const deals: DealItem[] = [
  {
    title: "Weekend Tech Drop",
    subtitle: "Up to 35% off",
    icon: "⚡",
    href: "/products?category=Electronics",
  },
  { title: "Home Refresh", subtitle: "Save up to $80", icon: "⌂", href: "/products?category=Home" },
  { title: "Style Edit", subtitle: "Extra 15% off", icon: "✦", href: "/products?category=Fashion" },
];

export default function DealsSection() {
  return (
    <section className="py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-warm">Limited time</p>
          <h2 className="mt-2 text-3xl font-black text-text">Deals worth opening</h2>
        </div>
        <Link href="/products" className="text-sm font-bold text-primary hover:text-primary-hover">
          Browse deals <FaArrowRight className="ml-1 inline" />
        </Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {deals.map(({ title, subtitle, icon, href }) => (
          <Link
            href={href}
            key={title}
            className="group rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl">{icon}</span>
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
                LIVE
              </span>
            </div>
            <h3 className="mt-8 text-xl font-black text-text">{title}</h3>
            <p className="mt-1 text-muted">{subtitle}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:text-primary-hover">
              Shop deal <FaArrowRight />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
