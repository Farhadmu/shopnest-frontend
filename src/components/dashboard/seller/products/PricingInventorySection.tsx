"use client";

import { Checkbox, Input, Label, ListBox, Select } from "@heroui/react";
import { ESCROW_OPTIONS, WARRANTY_OPTIONS } from "@/lib/constants/product-form";
import { Panel } from "@/components/dashboard/DashboardUI";
import type { ProductFormState } from "@/types/product-form";

interface PricingInventorySectionProps {
  form: ProductFormState;
  onChange: (patch: Partial<ProductFormState>) => void;
  regular: number;
  selling: number;
  discountPct: number;
  netPayout: number;
  hasVariants: boolean;
  variantStockTotal: number;
}

export function PricingInventorySection({
  form,
  onChange,
  regular,
  selling,
  discountPct,
  netPayout,
  hasVariants,
  variantStockTotal,
}: PricingInventorySectionProps) {
  return (
    <Panel
      title="Pricing, Inventory & Escrow Guarantee"
      action={<span className="text-[11px] font-bold text-muted">BDT (৳) Currency</span>}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-bold text-muted">Regular Price (MSRP)</Label>
            <Input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => onChange({ price: e.target.value })}
              placeholder="4000"
              fullWidth
            />
            <span className="text-[11px] text-muted">Strikethrough reference</span>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-bold text-muted">Selling Price</Label>
            <Input
              type="number"
              min="0"
              required
              value={form.discountPrice}
              onChange={(e) => onChange({ discountPrice: e.target.value })}
              placeholder="2490"
              fullWidth
            />
            <span className="text-[11px] font-bold text-accent">
              {discountPct > 0
                ? `${discountPct}% OFF · Saves ৳${(regular - selling).toLocaleString()}`
                : "Standard retail price"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-bold text-muted">Initial Stock (Units)</Label>
            <Input
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={(e) => onChange({ stock: e.target.value })}
              placeholder="150"
              fullWidth
              disabled={hasVariants}
            />
            <span className="text-[11px] text-muted">
              {hasVariants
                ? `Auto-summed from variant(s): ${variantStockTotal}`
                : "Live inventory quantity"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-bold text-muted">Low Stock Alert Level</Label>
            <Input
              type="number"
              min="0"
              value={form.lowStockAlert}
              onChange={(e) => onChange({ lowStockAlert: e.target.value })}
              placeholder="15"
              fullWidth
            />
            <span className="text-[11px] text-muted">Dispatches SMS / app alert</span>
          </div>
        </div>

        <div className="grid gap-4 rounded-xl bg-muted-bg/60 p-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-bold text-muted">ShopNest Escrow Guarantee</Label>
            <Select
              value={form.escrow || undefined}
              onChange={(value) => onChange({ escrow: value as string })}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {ESCROW_OPTIONS.map((opt) => (
                    <ListBox.Item key={opt} id={opt} textValue={opt}>
                      {opt}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-bold text-muted">Manufacturer Warranty</Label>
            <Select
              value={form.warranty || undefined}
              onChange={(value) => onChange({ warranty: value as string })}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {WARRANTY_OPTIONS.map((opt) => (
                    <ListBox.Item key={opt} id={opt} textValue={opt}>
                      {opt}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Checkbox
            isSelected={form.codEnabled}
            onChange={(checked) => onChange({ codEnabled: checked })}
          >
            <span className="text-xs font-bold text-text">Enable Cash on Delivery (COD)</span>
          </Checkbox>
          <Checkbox
            isSelected={form.expressDispatch}
            onChange={(checked) => onChange({ expressDispatch: checked })}
          >
            <span className="text-xs font-bold text-text">Express 24h Dispatch Available</span>
          </Checkbox>
          <div className="text-xs text-muted">
            Est. net payout: <strong className="text-text">৳{netPayout.toFixed(2)}</strong>{" "}
            <span className="text-[11px]">(after 6% fee)</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}