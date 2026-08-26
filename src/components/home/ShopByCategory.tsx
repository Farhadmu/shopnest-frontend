"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  FaChevronRight, 
  FaLaptop, 
  FaTshirt, 
  FaBook, 
  FaHome, 
  FaMobileAlt, 
  FaRunning, 
  FaBicycle, 
  FaPumpSoap,
  FaBoxes
} from "react-icons/fa";
import { getCategories } from "@/lib/api/categories";

const STYLES = [
  {
    color:
      "from-amber-500/30 via-orange-500/15 to-transparent dark:from-amber-500/15 dark:via-orange-500/10 dark:to-transparent",
    borderHover: "hover:border-amber-400/80 dark:hover:border-amber-500/50",
    shadowHover: "hover:shadow-amber-500/20",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    textHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    barColor: "from-amber-500 to-orange-500",
  },
  {
    color:
      "from-pink-500/30 via-rose-500/15 to-transparent dark:from-pink-500/15 dark:via-rose-500/10 dark:to-transparent",
    borderHover: "hover:border-pink-400/80 dark:hover:border-pink-500/50",
    shadowHover: "hover:shadow-pink-500/20",
    iconBg: "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
    textHover: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
    barColor: "from-pink-500 to-rose-500",
  },
  {
    color:
      "from-emerald-500/30 via-teal-500/15 to-transparent dark:from-emerald-500/15 dark:via-teal-500/10 dark:to-transparent",
    borderHover: "hover:border-emerald-400/80 dark:hover:border-emerald-500/50",
    shadowHover: "hover:shadow-emerald-500/20",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    textHover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    barColor: "from-emerald-500 to-teal-500",
  },
  {
    color:
      "from-purple-500/30 via-indigo-500/15 to-transparent dark:from-purple-500/15 dark:via-indigo-500/10 dark:to-transparent",
    borderHover: "hover:border-purple-400/80 dark:hover:border-purple-500/50",
    shadowHover: "hover:shadow-purple-500/20",
    iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    textHover: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
    barColor: "from-purple-500 to-indigo-500",
  },
  {
    color:
      "from-blue-500/30 via-cyan-500/15 to-transparent dark:from-blue-500/15 dark:via-cyan-500/10 dark:to-transparent",
    borderHover: "hover:border-blue-400/80 dark:hover:border-blue-500/50",
    shadowHover: "hover:shadow-blue-500/20",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    textHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    barColor: "from-blue-500 to-cyan-500",
  },
  {
    color:
      "from-violet-500/30 via-fuchsia-500/15 to-transparent dark:from-violet-500/15 dark:via-fuchsia-500/10 dark:to-transparent",
    borderHover: "hover:border-violet-400/80 dark:hover:border-violet-500/50",
    shadowHover: "hover:shadow-violet-500/20",
    iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
    textHover: "group-hover:text-violet-600 dark:group-hover:text-violet-400",
    barColor: "from-violet-500 to-fuchsia-500",
  },
];


const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("beauty")) return <FaPumpSoap size={20} />;
  if (lowerName.includes("book")) return <FaBook size={20} />;
  if (lowerName.includes("electronic")) return <FaLaptop size={20} />;
  if (lowerName.includes("fashion") || lowerName.includes("cloth")) return <FaTshirt size={20} />;
  if (lowerName.includes("home") || lowerName.includes("kitchen")) return <FaHome size={20} />;
  if (lowerName.includes("mobile") || lowerName.includes("phone")) return <FaMobileAlt size={20} />;
  if (lowerName.includes("sport")) return <FaRunning size={20} />;
  if (lowerName.includes("cycle") || lowerName.includes("bike")) return <FaBicycle size={20} />;
  return <FaBoxes size={20} />;
};

type DisplayCategory = {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
} & (typeof STYLES)[number];

export default function ShopByCategory() {
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (cancelled) return;
        setCategories(
          cats.map((c, i) => ({
            id: c.id,
            name: c.name,
            desc: "Explore this category",
            icon: getCategoryIcon(c.name),
            ...STYLES[i % STYLES.length], 
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-12">
      {/* Section Header */}
      <div className="mb-8 flex items-end justify-between">
        <div className="relative">
          {/* Small Label */}
          <div className="mb-3 flex items-center gap-2">
            <span className="h-[2px] w-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
              Discover Categories
            </span>
            <span className="h-[2px] w-8 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
          </div>

          {/* Main Title */}
          <div className="relative inline-block">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Shop{" "}
              <span className="relative bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                by category
                <span className="absolute -right-4 -top-1 h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_14px_rgba(139,92,246,0.9)] animate-pulse" />
              </span>
            </h2>
          </div>

          {/* Subtitle */}
          <p className="mt-3 max-w-md text-sm font-medium text-slate-500 dark:text-slate-400">
            Explore our collections and find exactly what you need.
          </p>
        </div>

        {/* View All Button */}
        <Link
          href="/products"
          className="group hidden items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-4 py-2 text-sm font-bold text-indigo-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white sm:flex dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500 dark:hover:text-white"
        >
          <span>View all</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-indigo-600 transition-all duration-300 group-hover:translate-x-0.5 dark:bg-slate-800 dark:text-indigo-400 dark:group-hover:bg-white">
            <FaChevronRight size={9} />
          </span>
        </Link>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-[170px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            No categories found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link href={`/products?category=${encodeURIComponent(cat.name)}`}>
                <motion.div
                  animate={{ opacity: [0.95, 1, 0.95] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                  className={`
                    group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80
                    ${cat.borderHover} ${cat.shadowHover}
                  `}
                >
                  {/* Background Gradient */}
                  <motion.div
                    animate={{ opacity: [0.45, 0.8, 0.45] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br transition-opacity duration-500 group-hover:opacity-100 ${cat.color}`}
                  />

                  {/* Soft Glow */}
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/30 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-white/10" />

                  {/* Card Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className={`
                        mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:shadow-lg
                        ${cat.iconBg}
                      `}
                    >
                      {cat.icon}
                    </div>

                    {/* Category Name */}
                    <p className={`text-sm font-extrabold tracking-wide text-slate-900 transition-colors duration-300 dark:text-white ${cat.textHover}`}>
                      {cat.name}
                    </p>

                    {/* Description */}
                    <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                      {cat.desc}
                    </p>
                  </div>

                  {/* Bottom Color Bar */}
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
                    className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r transition-all duration-300 group-hover:h-1.5 ${cat.barColor}`}
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}