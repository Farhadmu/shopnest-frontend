"use client";

import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function RecommendationsSection() {
  return (
    <section className="py-8">
      <div className="grid items-center gap-8 lg:grid-cols-[.75fr_1.25fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-primary">
            Personalized for you
          </p>
          <h2 className="mt-2 text-3xl font-black text-text sm:text-4xl">
            Your next favorite thing is closer.
          </h2>
          <p className="mt-4 leading-7 text-muted">
            ShopNest learns from your browsing and shopping intent to make product discovery more relevant.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover"
          >
            Sign in for recommendations <FaArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl border border-border bg-surface p-5">
            <div className="text-2xl">🎧</div>
            <p className="mt-8 font-black text-text">For your workspace</p>
            <p className="mt-1 text-xs text-muted">Audio · productivity · comfort</p>
          </div>
          <div className="mt-8 rounded-3xl border border-border bg-surface p-5">
            <div className="text-2xl">🎒</div>
            <p className="mt-8 font-black text-text">Based on your style</p>
            <p className="mt-1 text-xs text-muted">Travel · fashion · everyday carry</p>
          </div>
        </div>
      </div>
    </section>
  );
}