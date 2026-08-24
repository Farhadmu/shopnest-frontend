import Link from "next/link";
import { FaArrowRight, FaShieldAlt, FaStar } from "react-icons/fa";

const stores = [
  { id: "nova-tech", name: "Nova Tech", rating: "4.9", sales: "12.4k+ sales", desc: "Consumer electronics, smart devices and accessories." },
  { id: "urban-loom", name: "Urban Loom", rating: "4.8", sales: "8.7k+ sales", desc: "Modern fashion and everyday essentials." },
  { id: "home-aura", name: "HomeAura", rating: "4.9", sales: "6.2k+ sales", desc: "Home, workspace and lifestyle products." },
];

export default function StoresPage() {
  return <div className="py-6"><div className="rounded-[2rem] bg-slate-950 p-8 text-white sm:p-12"><p className="text-xs font-black uppercase tracking-[.2em] text-indigo-300">Shop with confidence</p><h1 className="mt-3 text-4xl font-black">Trusted ShopNest stores</h1><p className="mt-4 max-w-2xl text-slate-300">Explore sellers with transparent ratings, sales history and trust signals.</p></div><div className="mt-8 grid gap-5 md:grid-cols-3">{stores.map(s=><Link key={s.id} href={`/stores/${s.id}`} className="group rounded-3xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"><div className="flex items-center justify-between"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 font-black text-white">{s.name.slice(0,2).toUpperCase()}</div><span className="inline-flex items-center gap-1 text-sm font-bold text-amber-500"><FaStar size={11}/>{s.rating}</span></div><h2 className="mt-8 text-xl font-black">{s.name}</h2><p className="mt-2 text-sm leading-6 text-muted">{s.desc}</p><div className="mt-5 flex items-center justify-between text-xs"><span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-300"><FaShieldAlt/> Trusted · {s.sales}</span><FaArrowRight className="text-primary transition group-hover:translate-x-1"/></div></Link>)}</div></div>;
}
