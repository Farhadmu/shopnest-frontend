"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [page, setPage] = useState(0);
  const pageSize = 4;
  const pageCount = Math.max(1, Math.ceil(sellers.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleSellers = sellers.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const showNextPage = () => {
    setPage((currentPage) => (currentPage + 1) % pageCount);
  };

  const showPreviousPage = () => {
    setPage((currentPage) => (currentPage - 1 + pageCount) % pageCount);
  };

  return (
    <div
      className="relative z-10 mt-6 overflow-hidden py-3"
    >
      {pageCount > 1 && (
        <div className="flex items-center gap-3 py-2">
          <button
            type="button"
            onClick={showPreviousPage}
            aria-label="Show previous sellers"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/30 bg-surface/95 text-primary shadow-lg backdrop-blur transition hover:bg-primary hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="grid min-w-0 flex-1 grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visibleSellers.map((seller) => (
              <div key={seller.id} className="min-w-0">
                <SellerCard
                  seller={seller}
                  isFollowed={!!followedStores[seller.id]}
                  onToggleFollow={onToggleFollow}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={showNextPage}
            aria-label="Show more sellers"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/30 bg-surface/95 text-primary shadow-lg backdrop-blur transition hover:bg-primary hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {pageCount === 1 && (
        <div className="grid grid-cols-1 items-stretch gap-4 py-2 sm:grid-cols-2 lg:grid-cols-4">
          {visibleSellers.map((seller) => (
            <div key={seller.id} className="min-w-0">
              <SellerCard
                seller={seller}
                isFollowed={!!followedStores[seller.id]}
                onToggleFollow={onToggleFollow}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
