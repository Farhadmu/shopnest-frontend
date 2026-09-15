"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@heroui/react";
import { FaSpinner } from "react-icons/fa";
import { Package } from "lucide-react";
import { getProductsPaged, type Product } from "@/lib/api/products";
import { useSession } from "@/lib/auth-client";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency } from "@/lib/utils";

interface ProductPickerListProps {
  mode: "seller" | "admin";
  selectedIds: string[];
  onToggle: (productId: string) => void;
}

const PAGE_SIZE = 20;

function ProductThumbnail({ src, title }: { src?: string; title: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted-bg text-muted">
        <Package className="h-4 w-4 opacity-60" />
      </div>
    );
  }

  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted-bg">
      <Image
        src={src}
        alt={title}
        width={40}
        height={40}
        className="h-10 w-10 object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

/** Checklist of products, used by the coupon modal's "Specific Product(s)" scope. */
export function ProductPickerList({ mode, selectedIds, onToggle }: ProductPickerListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebounce(search, 400);
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  useEffect(() => {
    let active = true;
    const fetchFirstPage = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string | number | boolean | undefined> = {
          page: 1,
          limit: PAGE_SIZE,
          search: debouncedSearch.trim() || undefined,
          ...(mode === "seller" && userId ? { sellerId: userId } : {}),
        };
        const data = await getProductsPaged(params);
        if (!active) return;
        setProducts(data.items);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch {
        if (active) {
          setProducts([]);
          setTotal(0);
          setPage(1);
          setTotalPages(1);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchFirstPage();
    return () => {
      active = false;
    };
  }, [debouncedSearch, mode, userId]);

  const handleLoadMore = async () => {
    if (page >= totalPages || isLoadingMore || isLoading) return;
    setIsLoadingMore(true);
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page: page + 1,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        ...(mode === "seller" && userId ? { sellerId: userId } : {}),
      };
      const data = await getProductsPaged(params);
      setProducts((prev) => [...prev, ...data.items]);
      setPage(data.page);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // products stop loading more on error
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-lg border border-primary/20 bg-surface px-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
      />

      {isLoading ? (
        <p className="py-3 text-xs text-muted">{mode === "seller" ? "Loading your products…" : "Loading products…"}</p>
      ) : products.length === 0 ? (
        <p className="py-3 text-xs text-muted">
          {search
            ? "No products match your search."
            : mode === "seller"
              ? "You don&apos;t have any products yet."
              : "No products found."}
        </p>
      ) : (
        <>
          <div className="custom-scrollbar max-h-48 divide-y divide-border overflow-y-auto rounded-xl border border-border bg-surface">
            {products.map((product) => {
              const productId = product.id || (product as unknown as { _id?: string })._id || "";
              const isChecked = selectedIds.includes(productId);
              return (
                <label
                  key={productId}
                  className={`flex w-full cursor-pointer items-center gap-3 p-2.5 text-xs transition-colors hover:bg-background ${
                    isChecked ? "bg-primary/8 font-medium text-primary" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggle(productId)}
                    className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-primary accent-primary"
                  />
                  <ProductThumbnail src={product.images?.[0]} title={product.title} />
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate font-semibold text-text">{product.title}</p>
                    <p className="text-[11px] text-muted">{formatCurrency(product.price)}</p>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2">
            {page < totalPages ? (
              <Button
                size="sm"
                variant="outline"
                isDisabled={isLoadingMore}
                onClick={handleLoadMore}
                className="rounded-xl font-bold"
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-1.5">
                    <FaSpinner className="animate-spin" size={12} />
                    Loading…
                  </span>
                ) : (
                  "Load More"
                )}
              </Button>
            ) : (
              <div />
            )}

            {total > 0 && (
              <p className="text-[11px] text-muted">
                {products.length} of {total} product{total !== 1 ? "s" : ""} shown
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
