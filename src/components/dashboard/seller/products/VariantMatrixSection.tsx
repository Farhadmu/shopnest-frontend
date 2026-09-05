"use client";

import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
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
        <Table aria-label="Product variants">
          <TableHeader>
            <TableColumn>VARIANT</TableColumn>
            <TableColumn>STOCK</TableColumn>
            <TableColumn>PRICE DELTA (৳)</TableColumn>
            <TableColumn>ACTION</TableColumn>
          </TableHeader>
          <TableBody>
            {variants.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={v.swatch}
                      onChange={(e) => onUpdate(v.id, { swatch: e.target.value })}
                      className="h-6 w-6 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    />
                    <Input
                      value={v.name}
                      onChange={(e) => onUpdate(v.id, { name: e.target.value })}
                      placeholder="e.g. Matte Black"
                      className="w-32"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={Number(v.stock)}
                    onChange={(e) => onUpdate(v.id, { stock: e.target.value })}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={Number(v.priceDelta)}
                    onChange={(e) => onUpdate(v.id, { priceDelta: e.target.value })}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onRemove(v.id)}
                    className="p-1 text-muted transition hover:text-error"
                  >
                    <FaTrash size={13} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}