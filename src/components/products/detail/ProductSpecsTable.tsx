import React from "react";
import { FiSliders, FiLayers, FiCheckCircle } from "react-icons/fi";
import type { Product } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";

export interface ProductSpecsTableProps {
  product: Product;
}

export interface SpecVariant {
  name: string;
  sku?: string;
  stock?: number;
  price?: number;
  priceDelta?: number;
  color?: string;
  swatch?: string;
}

export function extractVariants(product: Product): SpecVariant[] {
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.map((v: any) => ({
      name: v.name || "",
      sku: v.sku,
      stock: typeof v.stock === "number" ? v.stock : Number(v.stock) || 0,
      price: typeof v.price === "number" ? v.price : Number(v.price) || undefined,
      color: v.color || v.swatch,
      swatch: v.swatch || v.color,
    }));
  }

  const rawSpecVariants = product.specifications?.["Variants"] || (product.specifications as any)?.["variants"];
  if (rawSpecVariants) {
    try {
      const parsed = typeof rawSpecVariants === "string" ? JSON.parse(rawSpecVariants) : rawSpecVariants;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((v: any) => {
          const basePrice = product.discountPrice || product.price || 0;
          const delta = typeof v.priceDelta === "number" ? v.priceDelta : Number(v.priceDelta) || 0;
          const price = typeof v.price === "number" ? v.price : delta ? basePrice + delta : undefined;
          return {
            name: v.name || "",
            sku: v.sku,
            stock: typeof v.stock === "number" ? v.stock : Number(v.stock) || 0,
            price,
            priceDelta: delta,
            color: v.swatch || v.color,
            swatch: v.swatch || v.color,
          };
        });
      }
    } catch {
      // ignore parse errors
    }
  }

  return [];
}

export function ProductSpecsTable({ product }: ProductSpecsTableProps) {
  const variants = extractVariants(product);

  // Filter out internal/reserved keys or raw JSON strings so the specs table stays clean
  const regularSpecs = Object.entries(product.specifications || {}).filter(([key, val]) => {
    const lower = key.toLowerCase().trim();
    if (lower === "variants" || lower === "package contents") return false;
    const strVal = String(val ?? "").trim();
    if (strVal.startsWith("[{") || strVal.startsWith("{\"")) return false;
    return true;
  });

  if (regularSpecs.length === 0 && variants.length === 0) {
    return null;
  }

  return (
    <div className="flex h-auto w-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <FiSliders size={18} />
          </div>
          <div>
            <h3 className="text-base font-black text-text">Technical Specs</h3>
            <p className="text-[11px] font-medium text-muted">Verified manufacturer specifications</p>
          </div>
        </div>
      </div>

      {/* Specifications list */}
      {regularSpecs.length > 0 && (
        <div className="flex flex-col divide-y divide-border/60 text-sm">
          {regularSpecs.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-2.5 transition-colors hover:bg-muted-bg/30 px-1 rounded-md">
              <span className="text-xs font-medium text-muted">{key}</span>
              <span className="text-xs font-bold text-text text-right max-w-[60%]">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Premium Variants & Editions Section */}
      {variants.length > 0 && (
        <div className="flex flex-col gap-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiLayers className="text-primary" size={16} />
              <span className="text-xs font-black uppercase tracking-wider text-text">
                Available Editions &amp; Variants
              </span>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
              {variants.length} {variants.length === 1 ? "Option" : "Options"}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {variants.map((v, idx) => {
              const swatchColor = v.swatch || v.color || "#4f46e5";
              const inStock = (v.stock ?? 0) > 0;
              return (
                <div
                  key={`${v.name}-${idx}`}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface-muted/40 p-3 transition-all duration-200 hover:border-primary/50 hover:bg-surface hover:shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-5 w-5 shrink-0 rounded-full border border-black/15 shadow-xs ring-2 ring-transparent transition group-hover:ring-primary/20"
                      style={{ backgroundColor: swatchColor }}
                      title={`Color: ${v.name}`}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-text capitalize truncate">
                        {v.name}
                      </span>
                      {v.sku && (
                        <span className="text-[10px] font-medium text-muted truncate">
                          SKU: {v.sku}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 text-right">
                    {v.price ? (
                      <span className="text-xs font-black text-text">
                        {formatCurrency(v.price)}
                      </span>
                    ) : v.priceDelta ? (
                      <span className="text-xs font-black text-primary">
                        +{formatCurrency(v.priceDelta)}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-muted">Standard</span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                        inStock ? "text-emerald-600 dark:text-emerald-400" : "text-error"
                      }`}
                    >
                      {inStock && <FiCheckCircle size={10} />}
                      {inStock ? `${v.stock} in stock` : "Sold out"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}