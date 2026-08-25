"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FaChevronRight } from "react-icons/fa";
import {
  FaLaptop,
  FaShirt,
  FaHouse,
  FaSpa,
  FaDumbbell,
  FaBookOpen,
} from "react-icons/fa6";

interface CategoryItem {
  name: string;
  icon: React.ReactNode;
  desc: string;
  accentColor: string;
  barColor: string;
}

const categories: CategoryItem[] = [
  {
    name: "Electronics",
    icon: <FaLaptop size={22} />,
    desc: "Smart tech & gadgets",
    accentColor: "var(--color-primary)",
    barColor: "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
  },
  {
    name: "Fashion",
    icon: <FaShirt size={22} />,
    desc: "Everyday essentials",
    accentColor: "var(--color-warm)",
    barColor: "linear-gradient(90deg, var(--color-warm), var(--color-warning))",
  },
  {
    name: "Home & Living",
    icon: <FaHouse size={22} />,
    desc: "Make space beautiful",
    accentColor: "var(--color-success)",
    barColor: "linear-gradient(90deg, var(--color-success), var(--color-primary))",
  },
  {
    name: "Beauty",
    icon: <FaSpa size={22} />,
    desc: "Care & wellness",
    accentColor: "var(--color-accent)",
    barColor: "linear-gradient(90deg, var(--color-accent), var(--color-primary))",
  },
  {
    name: "Sports",
    icon: <FaDumbbell size={22} />,
    desc: "Move with confidence",
    accentColor: "var(--color-primary-hover)",
    barColor: "linear-gradient(90deg, var(--color-primary-hover), var(--color-accent))",
  },
  {
    name: "Books",
    icon: <FaBookOpen size={22} />,
    desc: "Ideas worth keeping",
    accentColor: "var(--color-warm)",
    barColor: "linear-gradient(90deg, var(--color-warm), var(--color-accent))",
  },
];

export default function ShopByCategory() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mb-8 flex items-end justify-between">
        <div className="relative">
          {/* Small Label */}
          <div className="mb-3 flex items-center gap-2">
            <span className="h-0.5 w-8 rounded-full bg-primary" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              Discover Categories
            </span>
            <span className="h-0.5 w-8 rounded-full bg-accent" />
          </div>

          {/* Main Title */}
          <div className="relative inline-block">
            <h2 className="text-3xl font-black tracking-tight text-text sm:text-4xl">
              Shop{" "}
              <span className="relative text-primary">
                by category
                {/* Small Glow Dot */}
                <span className="absolute -right-4 -top-1 h-2 w-2 animate-pulse rounded-full bg-accent shadow-[0_0_14px_var(--color-accent)]" />
              </span>
            </h2>
          </div>

          {/* Subtitle */}
          <p className="mt-3 max-w-md text-sm font-medium text-muted">
            Explore our collections and find exactly what you need.
          </p>
        </div>

        {/* View All Button (Desktop) */}
        <Link
          href="/products"
          className="group hidden items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-bold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-surface sm:flex"
        >
          <span>View all</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted-bg text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-surface group-hover:text-primary">
            <FaChevronRight size={9} />
          </span>
        </Link>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            <Link href={`/products?category=${encodeURIComponent(cat.name)}`}>
              <motion.div
                animate={{ opacity: [0.95, 1, 0.95] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
                className="group relative flex min-h-42.5 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-xl"
              >
                {/* Background Dynamic Color Glow */}
                <div
                  style={{
                    background: `radial-gradient(circle at top left, color-mix(in srgb, ${cat.accentColor} 15%, transparent), transparent 70%)`,
                  }}
                  className="pointer-events-none absolute inset-0 opacity-45 transition-opacity duration-500 group-hover:opacity-100"
                />

                {/* Soft Corner Glow */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-surface opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div
                    style={{
                      backgroundColor: `color-mix(in srgb, ${cat.accentColor} 15%, transparent)`,
                      color: cat.accentColor,
                    }}
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:shadow-lg"
                  >
                    {cat.icon}
                  </div>

                  {/* Category Name */}
                  <p className="text-sm font-extrabold tracking-wide text-text transition-colors duration-300 group-hover:text-primary">
                    {cat.name}
                  </p>

                  {/* Description */}
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-muted">
                    {cat.desc}
                  </p>
                </div>

                {/* Bottom Central Color Bar */}
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.25,
                  }}
                  style={{ background: cat.barColor }}
                  className="absolute bottom-0 left-0 h-1 w-full transition-all duration-300 group-hover:h-1.5"
                />

                {/* Hover Shine Effect */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-surface/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Mobile View All */}
      <div className="mt-6 flex justify-center sm:hidden">
        <Link
          href="/products"
          className="group flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-bold text-primary transition-all duration-300 hover:bg-primary hover:text-surface"
        >
          <span>View all categories</span>
          <FaChevronRight
            size={10}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}