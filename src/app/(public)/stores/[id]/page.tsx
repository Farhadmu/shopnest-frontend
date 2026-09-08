import Link from "next/link";
import { FaArrowLeft, FaShieldAlt, FaStar, FaStore, FaTruck } from "react-icons/fa";

interface StorePageProps {
  params: Promise<{ id: string }>;
}

const storeData: Record<
  string,
  { name: string; rating: string; sales: string; category: string; description: string }
> = {
  "nova-tech": {
    name: "Nova Tech",
    rating: "4.9",
    sales: "12.4k+ sales",
    category: "Electronics",
    description:
      "Smart devices, headphones, keyboards and practical technology for modern workspaces.",
  },
  "urban-loom": {
    name: "Urban Loom",
    rating: "4.8",
    sales: "8.7k+ sales",
    category: "Fashion",
    description:
      "Contemporary fashion, accessories and everyday essentials curated for modern lifestyles.",
  },
  "home-aura": {
    name: "HomeAura",
    rating: "4.9",
    sales: "6.2k+ sales",
    category: "Home & Living",
    description:
      "Workspace, home and lifestyle pieces designed to make everyday spaces feel better.",
  },
};

export default async function StorePage({ params }: StorePageProps) {
  const { id } = await params;
  const store = storeData[id] ?? {
    name: "ShopNest Store",
    rating: "4.8",
    sales: "Verified marketplace seller",
    category: "Marketplace",
    description: "A ShopNest seller storefront.",
  };
  return (
    <div className="py-6">
      <Link
        href="/stores"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary"
      >
        <FaArrowLeft size={12} /> All stores
      </Link>
      <section className="mt-5 overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-primary to-violet-500 text-2xl font-black">
            {store.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black">{store.name}</h1>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                Verified seller
              </span>
            </div>
            <p className="mt-2 text-slate-400">
              {store.category} · {store.sales}
            </p>
          </div>
        </div>
      </section>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-3xl border border-border bg-surface p-7">
          <h2 className="text-2xl font-black">About this store</h2>
          <p className="mt-3 leading-7 text-muted">{store.description}</p>
          <Link
            href={`/products?store=${id}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white"
          >
            Browse store products <FaTruck />
          </Link>
        </div>
        <div className="rounded-3xl border border-border bg-muted-bg p-7">
          <h2 className="text-xl font-black">Trust overview</h2>
          <div className="mt-5 grid gap-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm text-muted">
                <FaStar className="text-amber-400" /> Rating
              </span>
              <b>{store.rating}/5</b>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm text-muted">
                <FaShieldAlt className="text-emerald-500" /> Seller status
              </span>
              <b className="text-emerald-600 dark:text-emerald-300">Trusted</b>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm text-muted">
                <FaStore className="text-primary" /> Sales
              </span>
              <b>{store.sales}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
