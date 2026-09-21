"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaPlus, FaEdit, FaTrash, FaBox, FaSearch } from "react-icons/fa";
import { getProducts, getMyProducts, deleteProduct, Product } from "@/lib/api/products";
import { getMyStore } from "@/lib/api/sellers";
import { useSession } from "@/lib/auth-client";

export default function SellerProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [storeInfo, setStoreInfo] = useState<any>(null);

  const { data: session } = useSession();

  const load = async () => {
    setLoading(true);
    try {
      const [myProds, store] = await Promise.all([
        getMyProducts().catch(async () => {
          // Fallback to getProducts if getMyProducts is unavailable
          const fallback = await getProducts({ limit: 100 }).catch(() => []);
          return fallback;
        }),
        getMyStore().catch(() => null),
      ]);
      const storeObj: any = store && typeof store === "object" && "data" in store ? (store as any).data : store;
      setStoreInfo(storeObj);

      const userId = (session?.user as any)?.id;
      const validIds = new Set([
        storeObj?.id,
        storeObj?._id,
        storeObj?.slug,
        storeObj?.ownerId,
        userId,
      ].filter(Boolean));

      let prodsList = Array.isArray(myProds) ? myProds : ((myProds as any)?.data || []);
      if (!prodsList.length && userId) {
        const publicProds = await getProducts({ limit: 100 }).catch(() => []);
        prodsList = (publicProds || []).filter((p: any) =>
          validIds.has(p.storeId) || validIds.has(p.sellerId) || (!p.sellerId && !p.storeId && userId)
        );
      }

      setItems(prodsList);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [session]);

  const handleDelete = async (id: string, title: string) => {
    if (storeInfo?.status === "suspended") {
      setMsg("Cannot delete products while your store is suspended.");
      setTimeout(() => setMsg(""), 3500);
      return;
    }
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteProduct(id);
      setMsg(`Product "${title}" deleted`);
      load();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const filteredItems = search
    ? items.filter(
        (p) =>
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          p.category?.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  const isSuspended = storeInfo?.status === "suspended";

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Inventory Hub</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-text">Store Products</h1>
          <p className="mt-1 text-sm text-muted">
            Manage product listings, inventory levels, pricing, and promotions.
          </p>
        </div>
        <Link
          href={isSuspended ? "/become-seller" : "/dashboard/seller/products/add"}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition shadow-lg ${
            isSuspended
              ? "bg-rose-500/20 text-rose-600 border border-rose-500/30 hover:bg-rose-500/30"
              : "bg-primary text-white shadow-primary/25 hover:bg-primary-hover"
          }`}
        >
          <FaPlus size={12} /> {isSuspended ? "Listing Locked" : "Add New Product"}
        </Link>
      </div>

      {isSuspended && (
        <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 font-bold">
            <span>⚠️ Store Operations Suspended: Adding, editing, or deleting product listings is restricted while under administrative review.</span>
          </div>
          <Link href="/become-seller" className="underline font-bold shrink-0 hover:text-rose-800 dark:hover:text-rose-200">
            View Appeal Notice →
          </Link>
        </div>
      )}

      {msg && (
        <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 p-3 text-xs font-bold text-primary">
          {msg}
        </div>
      )}

      {/* Search Filter */}
      <div className="mt-6 flex items-center rounded-2xl border border-border bg-surface px-4 py-2">
        <FaSearch className="text-muted" size={14} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter products by title or category..."
          className="w-full bg-transparent px-3 py-2 text-sm text-text outline-none placeholder:text-muted"
        />
      </div>

      {/* Product List */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-3xl border border-border bg-surface p-12 text-center text-muted">
            Loading products...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-2xl text-primary">
              <FaBox />
            </div>
            <h3 className="mt-4 text-lg font-black text-text">No Products Listed Yet</h3>
            <p className="mt-1 text-sm text-muted">
              {isSuspended
                ? "Your store operations are currently locked by administration."
                : "Start listing products on ShopNest to begin receiving orders."}
            </p>
            <Link
              href={isSuspended ? "/become-seller" : "/dashboard/seller/products/add"}
              className={`mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold shadow-lg transition ${
                isSuspended
                  ? "bg-rose-500/20 text-rose-600 border border-rose-500/30 hover:bg-rose-500/30"
                  : "bg-primary text-white shadow-primary/20 hover:bg-primary-hover"
              }`}
            >
              <FaPlus size={12} /> {isSuspended ? "Review Suspension Notice" : "Add First Product"}
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredItems.map((p: any) => {
              const prodId = p.id || p._id;
              return (
                <div
                  key={prodId || p.title}
                  className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted-bg text-2xl">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                      ) : (
                        "🛍️"
                      )}
                    </div>
                    <div>
                      <span className="rounded-md bg-muted-bg px-2 py-0.5 text-[10px] font-bold uppercase text-muted">
                        {p.category}
                      </span>
                      <h3 className="mt-1 text-base font-black text-text group-hover:text-primary">
                        {p.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted">
                        <span className="font-black text-text">৳{(p.price || 0).toLocaleString()}</span>
                        {p.discountPrice && (
                          <span className="ml-1.5 text-[11px] text-muted line-through">
                            ৳{p.discountPrice.toLocaleString()}
                          </span>
                        )}
                        {" · "}
                        <span
                          className={
                            (p.stock || 0) > 5 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"
                          }
                        >
                          {p.stock ?? 0} in stock
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    {isSuspended ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted-bg/50 px-3.5 py-2 text-xs font-bold text-muted cursor-not-allowed opacity-60">
                        <FaEdit size={12} /> Edit Locked
                      </span>
                    ) : (
                      <Link
                        href={`/dashboard/seller/products/add?edit=${prodId}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-text transition hover:border-primary hover:text-primary"
                      >
                        <FaEdit size={12} /> Edit
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(prodId, p.title)}
                      disabled={isSuspended}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                        isSuspended
                          ? "border-border bg-muted-bg text-muted cursor-not-allowed opacity-60"
                          : "border-error/30 bg-error/10 text-error hover:bg-error hover:text-white"
                      }`}
                    >
                      <FaTrash size={12} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
