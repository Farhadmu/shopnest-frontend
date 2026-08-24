"use client";

import Link from "next/link";
import type React from "react";
import { motion } from "motion/react";
import {
  FaArrowRight,
  FaBolt,
  FaBrain,
  FaCheckCircle,
  FaImage,
  FaShieldAlt,
  FaStar,
  FaTruck,
  FaUserShield,
} from "react-icons/fa";
import { ProductCard } from "@/features/products/components/ProductCard";
import ShopByCategory from "@/components/home/ShopByCategory";
import TrustFeatures from "@/components/home/TrustFeatures";
import BannerSection from "@/components/home/Banner";
import { defaultBannerData } from "@/lib/banner/BannerData";

const products = [
  {
    id: "1",
    title: "AeroSound Pro Headphones",
    price: 129.99,
    category: "Electronics",
    rating: 4.9,
    imageUrl: "linear-gradient(135deg,#111827,#4f46e5)",
  },
  {
    id: "2",
    title: "Orbit Mechanical Keyboard",
    price: 94.5,
    category: "Accessories",
    rating: 4.8,
    imageUrl: "linear-gradient(135deg,#0f172a,#0891b2)",
  },
  {
    id: "3",
    title: "Nordic Leather Backpack",
    price: 79,
    category: "Fashion",
    rating: 4.9,
    imageUrl: "linear-gradient(135deg,#451a03,#ea580c)",
  },
  {
    id: "4",
    title: "Aura Smart Desk Lamp",
    price: 49.99,
    category: "Home",
    rating: 4.7,
    imageUrl: "linear-gradient(135deg,#312e81,#c026d3)",
  },
];

const sellers = [
  ["Nova Tech", "4.9", "12.4k+ sales", "NT", "#4f46e5"],
  ["Urban Loom", "4.8", "8.7k+ sales", "UL", "#db2777"],
  ["HomeAura", "4.9", "6.2k+ sales", "HA", "#0891b2"],
];

const trustItems: Array<[React.ComponentType<{ className?: string }>, string, string]> = [
  [FaShieldAlt, "Trusted sellers", "Transparent trust signals"],
  [FaBrain, "AI discovery", "Smarter recommendations"],
  [FaTruck, "Order tracking", "Clear delivery milestones"],
  [FaUserShield, "Buyer protection", "Security-first shopping"],
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* 01 — Hero */}
      <BannerSection data={defaultBannerData} />
      {/* 02 — Trust */}
      <TrustFeatures />

      {/* 03 — Categories */}
      <ShopByCategory />

      {/* 04 — Trending */}
      <section className="rounded-[2rem] border border-border bg-muted-bg p-5 sm:p-8">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-warm">
              <FaBolt /> Trending now
            </div>
            <h2 className="mt-2 text-3xl font-black">Customer favorites</h2>
          </div>
          <Link href="/products" className="text-sm font-bold text-primary">
            See more <FaArrowRight className="ml-1 inline" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 05 — AI */}
      <section className="relative my-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950 p-7 text-white sm:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest">
              ShopNest Intelligence
            </span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Tell us what you need.
              <br />
              Let AI narrow it down.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-300">
              Get product recommendations, compare options and understand trade-offs without opening
              ten tabs.
            </p>
            <Link
              href="/ai-advisor"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-950"
            >
              Try AI Advisor <FaArrowRight />
            </Link>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[.06] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> AI Advisor online
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl rounded-bl-sm bg-white/[.07] p-4 text-slate-300">
                I need headphones for remote work under $150.
              </div>
              <div className="ml-8 rounded-2xl rounded-br-sm bg-indigo-500/30 p-4 text-indigo-100">
                8 strong matches. I can rank them by calls, battery life or value.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 06 — Deals */}
      <section className="py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-warm">Limited time</p>
            <h2 className="mt-2 text-3xl font-black">Deals worth opening</h2>
          </div>
          <Link href="/products" className="text-sm font-bold text-primary">
            Browse deals <FaArrowRight className="ml-1 inline" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Weekend Tech Drop", "Up to 35% off", "⚡", "/products?category=Electronics"],
            ["Home Refresh", "Save up to $80", "⌂", "/products?category=Home"],
            ["Style Edit", "Extra 15% off", "✦", "/products?category=Fashion"],
          ].map(([t, s, icon, href]) => (
            <Link
              href={href}
              key={t}
              className="group rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{icon}</span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                  LIVE
                </span>
              </div>
              <h3 className="mt-8 text-xl font-black">{t}</h3>
              <p className="mt-1 text-muted">{s}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                Shop deal <FaArrowRight />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 07 — Sellers */}
      <section className="rounded-[2rem] border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-primary">Marketplace</p>
            <h2 className="mt-2 text-3xl font-black">Meet trusted sellers</h2>
          </div>
          <Link href="/stores" className="text-sm font-bold text-primary">
            Explore stores
          </Link>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {sellers.map(([name, rating, sales, initials, accent]) => (
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
                <p className="font-black">{name}</p>
                <p className="mt-1 text-xs text-muted">{sales}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <FaStar size={11} /> {rating}
                </div>
                <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-300">
                  Trusted seller
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 08 — Visual search */}
      <section className="my-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-border bg-surface p-7 sm:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FaImage />
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[.2em] text-primary">
            Visual search
          </p>
          <h2 className="mt-2 text-3xl font-black">See something you love? Search by image.</h2>
          <p className="mt-4 leading-7 text-muted">
            Upload a product photo and ShopNest can help you discover visually similar products
            across the marketplace.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm font-bold text-text transition hover:border-primary/30"
          >
            Explore visual search <FaArrowRight />
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-7 text-white sm:p-9">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative grid h-full place-items-center rounded-[1.5rem] border border-dashed border-white/20 bg-white/[.04] p-8 text-center">
            <FaImage className="text-4xl text-indigo-300" />
            <p className="mt-4 font-bold">Drop an image here</p>
            <p className="mt-1 text-sm text-slate-400">AI-powered product discovery</p>
          </div>
        </div>
      </section>

      {/* 09 — Recommendations */}
      <section className="py-8">
        <div className="grid items-center gap-8 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-primary">
              Personalized for you
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Your next favorite thing is closer.
            </h2>
            <p className="mt-4 leading-7 text-muted">
              ShopNest learns from your browsing and shopping intent to make product discovery more
              relevant.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary"
            >
              Sign in for recommendations <FaArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-border bg-surface p-5">
              <div className="text-2xl">🎧</div>
              <p className="mt-8 font-black">For your workspace</p>
              <p className="mt-1 text-xs text-muted">Audio · productivity · comfort</p>
            </div>
            <div className="mt-8 rounded-3xl border border-border bg-surface p-5">
              <div className="text-2xl">🎒</div>
              <p className="mt-8 font-black">Based on your style</p>
              <p className="mt-1 text-xs text-muted">Travel · fashion · everyday carry</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10 — How it works */}
      <section className="rounded-[2rem] bg-slate-950 p-7 text-white sm:p-10">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[.2em] text-indigo-300">
            Simple by design
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">How ShopNest works</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["01", "Discover", "Browse products, categories and trusted stores."],
            ["02", "Decide with AI", "Compare options and get a recommendation."],
            ["03", "Buy with confidence", "Checkout, track and review your order."],
          ].map(([num, title, desc]) => (
            <div key={num} className="rounded-2xl border border-white/10 bg-white/[.04] p-6">
              <span className="text-sm font-black text-indigo-300">{num}</span>
              <h3 className="mt-8 text-xl font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 11 — Proof */}
      <section className="py-10">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-[2rem] border border-border bg-surface p-7 sm:p-9">
            <FaStar className="text-amber-400" />
            <p className="mt-5 text-3xl font-black">4.8/5</p>
            <p className="mt-1 text-sm text-muted">Average shopper experience</p>
            <div className="mt-7 space-y-3">
              {[
                ["Fast discovery", "94%"],
                ["Trusted sellers", "91%"],
                ["Easy checkout", "96%"],
              ].map(([t, v]) => (
                <div key={t}>
                  <div className="mb-1 flex justify-between text-xs font-semibold">
                    <span>{t}</span>
                    <span className="text-muted">{v}</span>
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
                <footer className="mt-5 text-xs font-bold">— Ayesha, verified shopper</footer>
              </blockquote>
              <blockquote className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-sm leading-6 text-muted">
                  “The seller trust signals give me much more confidence before ordering.”
                </p>
                <footer className="mt-5 text-xs font-bold">— Rahim, verified shopper</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* 12 — Final CTA */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-primary via-indigo-600 to-violet-600 p-8 text-white shadow-2xl sm:p-12">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-indigo-100">
              Ready when you are
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Make your next shopping decision smarter.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100">
              Explore products, ask the AI advisor or start your seller journey with ShopNest.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5"
            >
              Start shopping
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
