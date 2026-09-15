"use client";

import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaHeart, FaShoppingBag, FaTag, FaTrashAlt } from "react-icons/fa";
import type { Product } from "@/lib/api/products";
import type { WishlistItem } from "@/lib/api/wishlist";
import type { WishlistGroupItem } from "@/lib/api/customer-intelligence-features";

interface WishlistProductCardProps {
  item: WishlistItem;
  product?: Product;
  groups: WishlistGroupItem[];
  onToggleCollection: (group: WishlistGroupItem, productId: string) => void;
  onRemove: (productId: string) => void;
}

export function WishlistProductCard({ item, product, groups, onToggleCollection, onRemove }: WishlistProductCardProps) {
  const imageUrl = product?.images?.[0] || item.image || item.images?.[0];
  const title = product?.title || item.title || `Product #${item.productId.slice(-8)}`;

  return (
    <div className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
      <div className="relative aspect-video w-full overflow-hidden bg-muted-bg">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-primary/60">
            <FaShoppingBag />
          </div>
        )}
        <div className="absolute left-2.5 top-2.5 rounded-full bg-surface/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-pink-500 shadow-sm backdrop-blur-sm">
          Saved
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h2 className="line-clamp-2 min-h-8 flex-1 text-xs font-extrabold leading-tight text-text sm:text-sm">
            {title}
          </h2>
          <FaHeart className="mt-0.5 shrink-0 text-pink-500" size={11} />
        </div>
        <p className="text-[10px] font-semibold text-muted/80">Product #{item.productId.slice(-8)}</p>
        {groups.length > 0 && (
          <details className="relative mt-2 text-[10px]">
            <summary className="cursor-pointer font-bold text-primary">Add to Collection</summary>
            <div className="absolute left-0 top-5 z-20 min-w-40 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
              {groups.map((group) => {
                const isAdded = group.productIds.includes(item.productId);
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={(event) => {
                      onToggleCollection(group, item.productId);
                      event.currentTarget.closest("details")?.removeAttribute("open");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left font-semibold text-text hover:bg-muted-bg"
                  >
                    <span>{group.icon}</span>
                    <span className="truncate">{group.name}</span>
                    <span className="ml-auto text-primary">{isAdded ? "✓" : "+"}</span>
                  </button>
                );
              })}
            </div>
          </details>
        )}
        {product?.category && (
          <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-muted">
            <FaTag size={10} /> {product.category}
          </p>
        )}
        {product?.price !== undefined && (
          <p className="mt-1.5 text-sm font-black text-primary">৳{product.price.toLocaleString()}</p>
        )}
        <p className="mt-1 text-[10px] text-muted">Saved {new Date(item.addedAt).toLocaleDateString()}</p>
        <div className="mt-3 flex gap-1">
          <Link
            href={`/products/${item.productId}`}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-2 py-1.5 text-[10px] font-bold text-white transition hover:bg-primary-hover"
          >
            View Product <FaArrowRight size={10} />
          </Link>
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            title="Remove from wishlist"
            aria-label={`Remove ${title} from wishlist`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-error/25 bg-error/5 text-error transition hover:bg-error hover:text-white"
          >
            <FaTrashAlt size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
