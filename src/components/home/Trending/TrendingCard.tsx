"use client";

import React from "react";
import { Product } from "@/lib/api/products";
import { ProductCard } from "@/components/products/ProductCard";

interface TrendingCardProps {
  product: Product;
  index: number;
  isAdded: boolean;
  onAddToCart: (
    product: Product,
    e: React.MouseEvent<HTMLButtonElement>
  ) => void;
  onAddToWishlist: (
    product: Product,
    e: React.MouseEvent<HTMLButtonElement>
  ) => void;
}

export default function TrendingCard({
  product,
  index,
  isAdded,
  onAddToCart,
  onAddToWishlist,
}: TrendingCardProps) {
  return (
    <ProductCard
      product={product}
      index={index}
      isAdded={isAdded}
      onAddToCart={(prod, e) => onAddToCart(prod as Product, e as React.MouseEvent<HTMLButtonElement>)}
      onAddToWishlist={(prod, e) => onAddToWishlist(prod as Product, e as React.MouseEvent<HTMLButtonElement>)}
    />
  );
}