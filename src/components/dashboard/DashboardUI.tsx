"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion } from "motion/react";

export type DashboardLink = { label: string; href: string; icon: string; description: string };

export function DashboardShell({ title, subtitle, role, links, children }: { title: string; subtitle: string; role: string; links: DashboardLink[]; children: ReactNode }) {
  return <div className="min-h-[calc(100vh-9rem)] py-2"><div className="grid gap-6 lg:grid-cols-[250px_1fr]"><aside className="hidden rounded-2xl border border-border bg-surface p-3 shadow-sm lg:block lg:sticky lg:top-24 lg:h-fit"><div className="mb-4 rounded-xl bg-gradient-to-br from-primary/15 via-accent/10 to-transparent p-4"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">ShopNest</p><p className="mt-1 text-lg font-black text-text">{role} Hub</p></div><nav className="grid gap-1">{links.map((item) => <Link key={item.href} href={item.href} className="group rounded-xl p-3 transition hover:bg-muted-bg"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-base">{item.icon}</span><span className="min-w-0"><span className="block text-sm font-bold text-text">{item.label}</span><span className="mt-0.5 block text-[11px] leading-4 text-muted">{item.description}</span></span></div></Link>)}</nav></aside><main className="min-w-0"><div className="mb-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{role} dashboard</p><h1 className="mt-2 text-2xl font-black tracking-tight text-text sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p></div><Link href="/products" className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-bold text-text transition hover:border-primary/40 hover:text-primary">Continue shopping →</Link></div></div>{children}</main></div></div>;
}

export function StatCard({ icon, label, value, note }: { icon: string; label: string; value: string; note: string }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-lg">{icon}</span><span className="text-[10px] font-bold uppercase tracking-wider text-success">Live</span></div><p className="mt-4 text-xs font-semibold text-muted">{label}</p><p className="mt-1 text-2xl font-black text-text">{value}</p><p className="mt-1 text-xs text-muted">{note}</p></motion.div>;
}

export function FeatureGrid({ links }: { links: DashboardLink[] }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{links.map((item, index) => <motion.div key={item.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .03 }}><Link href={item.href} className="block h-full rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-xl">{item.icon}</span><div><h3 className="font-extrabold text-text">{item.label}</h3><p className="mt-1 text-xs leading-5 text-muted">{item.description}</p></div></div><span className="mt-4 inline-flex text-xs font-bold text-primary">Open feature →</span></Link></motion.div>)}</div>;
}

export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-black text-text">{title}</h2>{action}</div>{children}</section>;
}
