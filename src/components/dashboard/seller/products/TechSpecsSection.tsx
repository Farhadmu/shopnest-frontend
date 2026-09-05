"use client";

import { Button, Input } from "@heroui/react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Panel } from "@/components/dashboard/DashboardUI";
import type { SpecRow } from "@/types/product-form";

interface TechSpecsSectionProps {
  specs: SpecRow[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<SpecRow>) => void;
  onRemove: (id: string) => void;
}

export function TechSpecsSection({ specs, onAdd, onUpdate, onRemove }: TechSpecsSectionProps) {
  return (
    <Panel
      title="Technical Specifications Table"
      action={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onPress={onAdd}
        >
          <FaPlus size={10} /> Add Spec Row
        </Button>
      }
    >
      <div className="space-y-2">
        {specs.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-1 gap-2 rounded-lg bg-muted-bg/50 p-2 sm:grid-cols-12 sm:items-center"
          >
            <Input
              value={row.key}
              onChange={(e) => onUpdate(row.id, { key: e.target.value })}
              placeholder="Attribute (e.g. Driver Size)"
              className="sm:col-span-5"
            />
            <Input
              value={row.value}
              onChange={(e) => onUpdate(row.id, { value: e.target.value })}
              placeholder="Value (e.g. 40mm Dynamic Driver)"
              className="sm:col-span-6"
            />
            <div className="flex justify-end sm:col-span-1">
              <button
                type="button"
                onClick={() => onRemove(row.id)}
                className="p-1 text-muted transition hover:text-error"
              >
                <FaTrash size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}