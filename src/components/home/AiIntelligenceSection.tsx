"use client";

import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function AiIntelligenceSection() {
  return (
    <section className="relative my-10 overflow-hidden rounded-[2rem] border border-border bg-surface p-7 text-text sm:p-10">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <span className="rounded-full border border-border bg-muted-bg px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            ShopNest Intelligence
          </span>
          <h2 className="mt-4 text-3xl font-black text-text sm:text-4xl">
            Tell us what you need.
            <br />
            Let AI narrow it down.
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-muted">
            Get product recommendations, compare options and understand trade-offs without opening
            ten tabs.
          </p>
          <Link
            href="/ai-advisor"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-surface transition-colors hover:bg-primary-hover"
          >
            Try AI Advisor <FaArrowRight />
          </Link>
        </div>
        <div className="glass rounded-[1.5rem] p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-text">
            <span className="h-2.5 w-2.5 rounded-full bg-success" /> AI Advisor online
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl rounded-bl-sm bg-muted-bg p-4 text-text">
              I need headphones for remote work under $150.
            </div>
            <div className="ml-8 rounded-2xl rounded-br-sm border border-border bg-primary/10 p-4 text-primary">
              8 strong matches. I can rank them by calls, battery life or value.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
