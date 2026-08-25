"use client";

import Link from "next/link";

export default function FinalCtaSection() {
    return (
        <section className="relative overflow-hidden rounded-[2rem] bg-linear-to-r from-primary via-primary-hover to-accent p-8 text-white shadow-2xl sm:p-12">
            {/* Glow Effect */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
                <div>
                    <p className="text-xs font-black uppercase tracking-[.2em] text-white/80">
                        Ready when you are
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                        Make your next shopping decision smarter.
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90">
                        Explore products, ask the AI advisor or start your seller journey with ShopNest.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/products"
                        className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-100"
                    >
                        Start shopping
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20"
                    >
                        Create account
                    </Link>
                </div>
            </div>
        </section>
    );
}