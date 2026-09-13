"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { Seller } from "./seller.types";

interface SellerCardProps {
  seller: Seller;
  isFollowed?: boolean;
  onToggleFollow?: (id: string) => void;
}

export default function SellerCard({
  seller,
  isFollowed = false,
  onToggleFollow,
}: SellerCardProps) {
  const fallbackLogo = "/assets/electronics/Wireless Charging Pad.png";
  const [logoUrl, setLogoUrl] = useState(seller.logo?.trim() || fallbackLogo);
  const [bannerUrl, setBannerUrl] = useState(seller.banner || seller.featuredProducts?.[0]?.image || fallbackLogo);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFollow?.(seller.id);
  };

  return (
    <div className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <div className="relative aspect-[3.5/1] overflow-hidden bg-muted-bg">
        <div className={`absolute inset-0 bg-gradient-to-br ${seller.gradient} opacity-25`} />
        <Image src={bannerUrl} alt={`${seller.name} banner`} fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setBannerUrl(seller.featuredProducts?.[0]?.image || fallbackLogo)} />
        <button type="button" onClick={handleFollowClick} title={isFollowed ? "Following store" : "Follow store"} className={`absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full border bg-surface/90 transition-colors ${isFollowed ? "border-rose-300 text-rose-500" : "border-border text-muted hover:text-rose-500"}`}>
          <Heart className={`h-3.5 w-3.5 ${isFollowed ? "fill-rose-500" : ""}`} />
        </button>
      </div>

      <div className="relative px-3 pb-3">
        <span className={`absolute right-3 top-1.5 rounded-md border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wide ${seller.badgeColor}`}>Verified Store</span>
        <div className="-mt-6 min-h-14">
          <div className={`relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border-2 border-surface bg-gradient-to-br ${seller.gradient} text-sm font-black text-white shadow-md`} role="img" aria-label={`${seller.name} logo`}>
            <Image src={logoUrl} alt={`${seller.name} logo`} width={48} height={48} unoptimized className="absolute inset-0 h-full w-full object-cover" onError={() => { if (logoUrl !== fallbackLogo) setLogoUrl(fallbackLogo); }} />
          </div>
          <div className="min-w-0 pt-1.5">
            <div className="flex items-center gap-1">
              <h3 className="truncate text-[13px] font-black text-text">{seller.name}</h3>
              <ShieldCheck className="h-3 w-3 shrink-0 text-primary" />
            </div>
            <p className="truncate text-[9px] font-medium text-muted">{seller.category}</p>
            <p className="mt-0.5 text-[8px] font-medium text-muted">Seller storefront</p>
          </div>
        </div>
        <p className="mt-0.5 line-clamp-2 min-h-7 text-[10px] leading-relaxed text-muted">{seller.tagline}</p>
        <div className="mt-1 flex items-center gap-2 text-[9px] font-semibold">
          <span className="flex items-center gap-1 text-amber-500"><Star className="h-2.5 w-2.5 fill-amber-400" /> <b className="text-text">{seller.rating}</b> ({seller.reviewsCount})</span>
          <span className="text-border">|</span>
          <span className="text-success">{seller.positiveRate}</span>
        </div>
        <p className="mt-2 text-[8px] font-bold uppercase tracking-wide text-muted">Featured products</p>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {(seller.featuredProducts?.length ? seller.featuredProducts : [{ image: logoUrl, title: seller.category }]).slice(0, 3).map((product, index) => (
            <div key={`${product.image}-${index}`} className="relative aspect-[1.15/1] overflow-hidden rounded-md bg-muted-bg" title={product.title}>
              <Image src={product.image} alt={product.title} fill unoptimized className="object-cover" onError={(event) => { event.currentTarget.src = fallbackLogo; }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
          <div className="flex items-center gap-1 text-[9px] font-semibold text-success"><CheckCircle2 className="h-2.5 w-2.5" />{seller.positiveRate} positive</div>
          <Link href={`/stores/${seller.storeSlug || seller.id}`} className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[9px] font-black text-white transition-colors hover:bg-primary-hover">Visit Store <ArrowRight className="h-2.5 w-2.5" /></Link>
        </div>
      </div>
    </div>
  );
}
