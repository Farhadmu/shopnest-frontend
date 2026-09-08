import React from "react";
import { FiBatteryCharging, FiActivity, FiWifi, FiMic } from "react-icons/fi";
import type { Product } from "@/lib/api/products";

export interface ProductFeaturesBentProps {
  product: Product;
}

/**
 * TODO(backend): `Product` has no structured "highlight features" field.
 * Rendering generic, category-agnostic highlights until the schema grows
 * one (e.g. `product.highlights: { icon, title, description }[]`).
 */
const DUMMY_FEATURES = [
  { icon: FiBatteryCharging, title: "Long-Lasting Build", description: "Engineered for extended day-to-day use without early wear." },
  { icon: FiActivity, title: "Reliable Performance", description: "Consistently rated highly by verified buyers for durability." },
  { icon: FiWifi, title: "Easy Setup", description: "Ready to use out of the box with minimal configuration required." },
  { icon: FiMic, title: "Responsive Support", description: "Backed by the seller's official warranty and after-sales support." },
];

export function ProductFeaturesBent({ product }: ProductFeaturesBentProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {DUMMY_FEATURES.map(({ icon: Icon, title, description }) => (
        <div key={title} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-1 grid h-11 w-11 place-items-center rounded-xl bg-muted-bg text-primary">
            <Icon size={22} />
          </div>
          <h4 className="text-sm font-black text-text">{title}</h4>
          <p className="text-xs text-muted">{description}</p>
        </div>
      ))}
    </div>
  );
}