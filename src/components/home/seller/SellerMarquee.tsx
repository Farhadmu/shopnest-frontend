"use client";

import React from "react";
import { Seller } from "./seller.types";
import SellerCard from "./SellerCard";

interface SellerMarqueeProps {
  sellers: Seller[];
  followedStores: Record<string, boolean>;
  onToggleFollow: (id: string) => void;
}

export default function SellerMarquee({
  sellers,
  followedStores,
  onToggleFollow,
}: SellerMarqueeProps) {
  const marqueeList = [...sellers, ...sellers];
  const duration = Math.max(28, sellers.length * 6);

  return (
    <div
      className="pause-on-hover relative z-10 mt-6 overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)]"
    >
      <div
        className="animate-marquee flex w-max items-stretch gap-4 py-2"
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {marqueeList.map((seller, index) => (
          <div key={`${seller.id}-${index}`} className="w-[280px] shrink-0 sm:w-[320px]">
            <SellerCard
              seller={seller}
              isFollowed={!!followedStores[seller.id]}
              onToggleFollow={onToggleFollow}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
