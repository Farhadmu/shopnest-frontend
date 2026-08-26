"use client";

import React from "react";
import { Seller } from "./seller.types";
import SellerCard from "./SellerCard";

interface SellerMarqueeProps {
  sellers: Seller[];
  isPaused: boolean;
  followedStores: Record<string, boolean>;
  onToggleFollow: (id: string) => void;
}

export default function SellerMarquee({
  sellers,
  isPaused,
  followedStores,
  onToggleFollow,
}: SellerMarqueeProps) {
  // Duplicate list to achieve continuous seamless loop
  const marqueeList = [...sellers, ...sellers];
  const duration = Math.max(28, marqueeList.length * 4.5);

  return (
    <div
      className="relative z-10 mt-6 overflow-hidden py-3 pause-on-hover [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]"
    >
      {/* Infinite Scrolling Track */}
      <div
        className={`animate-marquee flex items-stretch gap-5 py-2 ${
          isPaused ? "[animation-play-state:paused]" : ""
        }`}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {marqueeList.map((seller, idx) => (
          <SellerCard
            key={`${seller.id}-${idx}`}
            seller={seller}
            isFollowed={!!followedStores[seller.id]}
            onToggleFollow={onToggleFollow}
          />
        ))}
      </div>
    </div>
  );
}
