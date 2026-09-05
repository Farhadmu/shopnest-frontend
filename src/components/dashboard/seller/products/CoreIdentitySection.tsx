
"use client";

import { Button, Input, Label, ListBox, Select } from "@heroui/react";
import { FaMagic } from "react-icons/fa";
import { Panel } from "@/components/dashboard/DashboardUI";
import type { ProductFormState } from "@/types/product-form";

interface CoreIdentitySectionProps {
  form: ProductFormState;
  categories: string[];
  onChange: (patch: Partial<ProductFormState>) => void;
  onAutoImproveTitle: () => void;
}

export function CoreIdentitySection({
  form,
  categories,
  onChange,
  onAutoImproveTitle,
}: CoreIdentitySectionProps) {
  return (
    <Panel title="Core Product Identity">
      <div className="space-y-4">
        {/* Listing Title */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            Listing Title <span className="text-error">*</span>
          </label>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onPress={onAutoImproveTitle}
              className="text-[11px]"
            >
              <FaMagic size={10} /> Auto-Improve Title
            </Button>

            <span className="text-[11px] text-muted">
              {form.title.length}/120
            </span>
          </div>
        </div>

        <Input
          value={form.title}
          onChange={(e) =>
            onChange({
              title: e.target.value.slice(0, 120),
            })
          }
          placeholder="e.g., Brand + Model + Key Feature (Color, Capacity)"
          fullWidth
        />

        <p className="text-xs text-muted">
          Recommended pattern:{" "}
          <span className="text-text">
            Brand + Model + Key Specs + Variant
          </span>
          . Avoid keyword stuffing.
        </p>

        {/* Category / Brand / Model */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            className="w-full"
            placeholder="Select category"
            value={form.category || undefined}
            onChange={(value) =>
              onChange({
                category: value as string,
              })
            }
          >
            <Label>
              Category <span className="text-error">*</span>
            </Label>

            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>

            <Select.Popover>
              <ListBox>
                {categories.map((category) => (
                  <ListBox.Item
                    key={category}
                    id={category}
                    textValue={category}
                  >
                    {category}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          <div className="flex flex-col gap-1">
            <Label className="text-xs font-bold text-muted">Brand</Label>
            <Input
              value={form.brand}
              onChange={(e) =>
                onChange({
                  brand: e.target.value,
                })
              }
              placeholder="e.g. Hoco"
              fullWidth
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-xs font-bold text-muted">Model</Label>
            <Input
              value={form.model}
              onChange={(e) =>
                onChange({
                  model: e.target.value,
                })
              }
              placeholder="e.g. W35 Air"
              fullWidth
            />
          </div>
        </div>

        {/* SKU / Barcode */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-bold text-muted">Master SKU</Label>
            <Input
              value={form.masterSku}
              onChange={(e) =>
                onChange({
                  masterSku: e.target.value,
                })
              }
              placeholder="e.g. HOC-W35-AIR-001"
              fullWidth
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-xs font-bold text-muted">EAN-13 / Barcode</Label>
            <Input
              value={form.barcode}
              onChange={(e) =>
                onChange({
                  barcode: e.target.value,
                })
              }
              placeholder="e.g. 6957531093125"
              fullWidth
            />
          </div>
        </div>
      </div>
    </Panel>
  );
}
