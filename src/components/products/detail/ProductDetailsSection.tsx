"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Product } from "@/lib/api/products";
import { ProductOverviewSection } from "./ProductOverviewSection";
import { ProductSpecsTable } from "./ProductSpecsTable";
import { ProductPackageContents } from "./ProductPackageContents";

export interface ProductDetailsSectionProps {
  product: Product;
}

export function ProductDetailsSection({ product }: ProductDetailsSectionProps) {
  const overviewRef = useRef<HTMLDivElement | null>(null);
  const [overviewHeight, setOverviewHeight] = useState<number | null>(null);

  const hasSpecs = Boolean(
    product.specifications && Object.keys(product.specifications).length > 0
  );

  useEffect(() => {
    if (!hasSpecs) return;

    const measure = () => {
      if (overviewRef.current) {
        setOverviewHeight(overviewRef.current.offsetHeight);
      }
    };

    measure();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && overviewRef.current) {
      observer = new ResizeObserver(() => {
        measure();
      });
      observer.observe(overviewRef.current);
    }

    window.addEventListener("resize", measure);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [hasSpecs, product]);

  if (!hasSpecs) {
    return (
      <div className="space-y-8">
        <ProductOverviewSection product={product} />
        <ProductPackageContents product={product} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 2-column grid aligned to items-start so specs expansion doesn't stretch overview */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <div ref={overviewRef} className="w-full">
          <ProductOverviewSection product={product} />
        </div>
        <div className="w-full">
          <ProductSpecsTable product={product} overviewHeight={overviewHeight} />
        </div>
      </div>

      <ProductPackageContents product={product} />
    </div>
  );
}

export default ProductDetailsSection;
