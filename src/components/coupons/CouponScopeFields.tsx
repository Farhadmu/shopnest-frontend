"use client";

import { useEffect, useState } from "react";
import { Label, ListBox, Select } from "@heroui/react";
import { ProductPickerList } from "./ProductPickerList";
import { getCategories, type Category } from "@/lib/api/categories";
import { getCategoryLimit } from "@/lib/api/coupons";
import { useSession } from "@/lib/auth-client";
import type { CouponScope } from "@/types/coupon";

interface CouponScopeFieldsProps {
  scope: CouponScope;
  category: string;
  categories?: string[];
  productIds: string[];
  categoryLimit?: number;
  placement?: string;
  onScopeChange: (scope: CouponScope) => void;
  onCategoryChange: (category: string) => void;
  onCategoriesChange?: (categories: string[]) => void;
  onToggleProduct: (productId: string) => void;
}

const SCOPE_OPTIONS: { id: CouponScope; label: string }[] = [
  { id: "specific-products", label: "Specific Product(s)" },
  { id: "specific-category", label: "Specific Category" },
  { id: "all-products", label: "All Products" },
];

/** Reusable "what does this coupon apply to" block: scope select + the matching conditional picker. */
export function CouponScopeFields({
  scope,
  category,
  categories: selectedCategories = [],
  productIds,
  categoryLimit: propCategoryLimit,
  placement,
  onScopeChange,
  onCategoryChange,
  onCategoriesChange,
  onToggleProduct,
}: CouponScopeFieldsProps) {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [catSearch, setCatSearch] = useState("");
  const [limitError, setLimitError] = useState<string | null>(null);
  const [maxLimit, setMaxLimit] = useState<number | undefined>(propCategoryLimit);
  const { data: session } = useSession();
  const currentSellerId = (session?.user as any)?.id as string | undefined;

  const isHomepage = placement === "homepage";

  useEffect(() => {
    getCategories()
      .then(setCategoryList)
      .catch(() => setCategoryList([]));

    if (propCategoryLimit !== undefined) {
      setMaxLimit(propCategoryLimit);
    } else {
      getCategoryLimit()
        .then(setMaxLimit)
        .catch(() => setMaxLimit(undefined));
    }
  }, [propCategoryLimit]);

  const filteredCats = catSearch
    ? categoryList.filter((c) => c.name.toLowerCase().includes(catSearch.toLowerCase()))
    : categoryList;

  /** A category is off-limits if it's locked to a different seller than the current user. */
  const isLockedForCurrentSeller = (cat: Category) =>
    Boolean(cat.isLocked) && cat.assignedSellerId !== currentSellerId;

  const handleToggleCategory = (cat: Category) => {
    setLimitError(null);
    const catName = cat.name;
    if (isLockedForCurrentSeller(cat) && !selectedCategories.includes(catName)) return;

    const isSelecting = !selectedCategories.includes(catName);
    if (isHomepage && isSelecting && maxLimit !== undefined && selectedCategories.length >= maxLimit) {
      setLimitError(`Homepage category limit reached (${maxLimit} max allowed by admin).`);
      return;
    }

    if (!onCategoriesChange) {
      // fallback to old single-category if parent doesn't support multi
      onCategoryChange(catName);
      return;
    }
    const next = selectedCategories.includes(catName)
      ? selectedCategories.filter((c) => c !== catName)
      : [...selectedCategories, catName];
    onCategoriesChange(next);
    // Also keep legacy `category` in sync (first selected)
    onCategoryChange(next[0] || "");
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Select className="w-full" value={scope} onChange={(value) => onScopeChange(value as CouponScope)}>
          <Label className="font-semibold text-text">
            Coupon Scope <span className="text-error">*</span>
          </Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {SCOPE_OPTIONS.map((opt) => (
                <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                  {opt.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <p className="mt-1 text-[11px] text-muted">
          Define which items are eligible for this promotional discount.
        </p>
      </div>

      <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
        {scope === "specific-products" && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text">
              Select Eligible Products
            </span>
            <ProductPickerList selectedIds={productIds} onToggle={onToggleProduct} />
          </div>
        )}

        {scope === "specific-category" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text">
                Choose Categories
              </span>
              {isHomepage && maxLimit !== undefined && (
                <span className="text-[11px] font-semibold text-muted">
                  Homepage Max Limit: <span className="font-bold text-primary">{maxLimit}</span> ({selectedCategories.length}/{maxLimit} selected)
                </span>
              )}
            </div>

            {limitError && (
              <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning">
                {limitError}
              </p>
            )}

            {/* Selected chips */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleToggleCategory({ id: cat, name: cat, slug: cat })}
                      className="ml-0.5 rounded-full p-0.5 text-primary/60 hover:bg-primary/20 hover:text-primary transition-colors"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search */}
            <input
              type="text"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-lg border border-primary/20 bg-surface px-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />

            {/* Category list with checkboxes */}
            <div className="max-h-48 overflow-y-auto rounded-lg border border-primary/10 bg-surface">
              {filteredCats.length === 0 ? (
                <p className="p-3 text-center text-xs text-muted">No categories found</p>
              ) : (
                filteredCats.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.name);
                  const isLocked = isLockedForCurrentSeller(cat) && !isChecked;
                  return (
                    <label
                      key={cat.id}
                      className={`flex items-center gap-2.5 border-b border-primary/5 px-3 py-2 text-xs transition-colors last:border-0 ${
                        isLocked
                          ? "cursor-not-allowed opacity-50"
                          : `cursor-pointer hover:bg-primary/5 ${isChecked ? "bg-primary/8 font-medium text-primary" : "text-text"}`
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isLocked}
                        onChange={() => handleToggleCategory(cat)}
                        className="h-4 w-4 rounded border-gray-300 text-primary accent-primary cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span>{cat.name}</span>
                      {isLocked && (
                        <span className="ml-auto rounded-full bg-error/10 px-1.5 py-0.5 text-[10px] font-bold text-error">
                          🔒 Locked
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
            <p className="text-[11px] text-muted">
              Select one or more categories. Coupon applies to all products in selected categories.
            </p>
          </div>
        )}

        {scope === "all-products" && (
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] text-white">
              ✓
            </span>
            <div>
              <p className="text-xs font-semibold text-text">Store-wide Universal Discount</p>
              <p className="mt-0.5 text-[11px] text-muted">
                Applies to all current and newly added products.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
