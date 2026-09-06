"use client";

import { Button, Input } from "@heroui/react";
import { FaPalette, FaPlus, FaTrash } from "react-icons/fa";
import { Panel } from "@/components/dashboard/DashboardUI";
import type { VariantRow } from "@/types/product-form";

interface VariantMatrixSectionProps {
  variants: VariantRow[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<VariantRow>) => void;
  onRemove: (id: string) => void;
}

export function VariantMatrixSection({
  variants,
  onAdd,
  onUpdate,
  onRemove,
}: VariantMatrixSectionProps) {
  return (
    <Panel
      title="SKU Variant & Color Matrix"
      action={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onPress={onAdd}
        >
          <FaPlus size={10} /> Add Variant
        </Button>
      }
    >
      {variants.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
          <FaPalette className="text-2xl text-muted" />
          <p className="text-xs text-muted">
            No variants yet — stock and price use the base fields above. Add a variant to split stock
            across colors.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted-bg/50 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Variant</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Price Delta (৳)</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {variants.map((v) => (
                <tr key={v.id} className="transition hover:bg-muted-bg/30">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={v.swatch}
                        onChange={(e) => onUpdate(v.id, { swatch: e.target.value })}
                        className="h-7 w-7 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
                        title="Choose variant color swatch"
                      />
                      <Input
                        value={v.name}
                        onChange={(e) => onUpdate(v.id, { name: e.target.value })}
                        placeholder="e.g. Matte Black"
                        className="w-36"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Input
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={(e) => onUpdate(v.id, { stock: e.target.value })}
                      className="w-24"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Input
                      type="number"
                      value={v.priceDelta}
                      onChange={(e) => onUpdate(v.id, { priceDelta: e.target.value })}
                      className="w-28"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onRemove(v.id)}
                      className="rounded-lg p-2 text-muted transition hover:bg-error/10 hover:text-error"
                      title="Delete variant"
                    >
                      <FaTrash size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}