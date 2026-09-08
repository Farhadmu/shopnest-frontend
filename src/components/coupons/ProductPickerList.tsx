"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@heroui/react";
import { getProducts, type Product } from "@/lib/api/products";
import { useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/utils";

interface ProductPickerListProps {
  selectedIds: string[];
  onToggle: (productId: string) => void;
}

/** Checklist of the logged-in seller's own products, used by the coupon modal's "Specific Product(s)" scope. */
export function ProductPickerList({ selectedIds, onToggle }: ProductPickerListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    let active = true;
    getProducts({ page: 1, limit: 100 })
      .then((data) => {
        if (!active) return;
        const userId = (session?.user as { id?: string } | undefined)?.id;
        setProducts(userId ? data.filter((p) => !p.sellerId || p.sellerId === userId) : data);
      })
      .catch(() => active && setProducts([]))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [session]);

  if (isLoading) {
    return <p className="py-3 text-xs text-muted">Loading your products…</p>;
  }

  if (products.length === 0) {
    return <p className="py-3 text-xs text-muted">You don&apos;t have any products yet.</p>;
  }

  return (
    <div className="custom-scrollbar max-h-40 divide-y divide-border overflow-y-auto rounded-xl border border-border bg-surface">
      {products.map((product) => (
        <Checkbox
          key={product.id}
          isSelected={selectedIds.includes(product.id)}
          onChange={() => onToggle(product.id)}
          className="flex w-full items-center gap-3 p-2.5 text-xs transition-colors hover:bg-background"
        >
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate font-semibold text-text">{product.title}</p>
            <p className="text-[11px] text-muted">{formatCurrency(product.price)}</p>
          </div>
        </Checkbox>
      ))}
    </div>
  );
}
