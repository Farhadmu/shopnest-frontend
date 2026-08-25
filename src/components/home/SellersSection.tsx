"use client";

import Link from "next/link";
import { FaStar } from "react-icons/fa";

interface Seller {
  name: string;
  rating: string;
  sales: string;
  initials: string;
  accent: string;
}

const sellers: Seller[] = [
  { name: "Nova Tech", rating: "4.9", sales: "12.4k+ sales", initials: "NT", accent: "var(--color-primary)" },
  { name: "Urban Loom", rating: "4.8", sales: "8.7k+ sales", initials: "UL", accent: "var(--color-accent)" },
  { name: "HomeAura", rating: "4.9", sales: "6.2k+ sales", initials: "HA", accent: "var(--color-warm)" },
];

export default function SellersSection() {
  return (
    <section className="rounded-[2rem] border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Marketplace</p>
          <h2 className="mt-2 text-3xl font-black text-text">Meet trusted sellers</h2>
        </div>
        <Link href="/stores" className="text-sm font-bold text-primary hover:text-primary-hover">
          Explore stores
        </Link>
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {sellers.map(({ name, rating, sales, initials, accent }) => (
          <Link
            href="/stores"
            key={name}
            className="flex items-center gap-4 rounded-2xl border border-border p-4 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
          >
            <div
              style={{ background: accent }}
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-black text-white"
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-text">{name}</p>
              <p className="mt-1 text-xs text-muted">{sales}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-bold text-warning">
                <FaStar size={11} /> {rating}
              </div>
              <p className="mt-1 text-[11px] text-success">
                Trusted seller
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}