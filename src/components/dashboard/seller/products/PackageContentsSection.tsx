"use client";

import { Button, Input, Tag } from "@heroui/react";
import { FaBoxOpen, FaPlus, FaTimes } from "react-icons/fa";
import { Panel } from "@/components/dashboard/DashboardUI";

interface PackageContentsSectionProps {
  items: string[];
  newItem: string;
  onNewItemChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
}

export function PackageContentsSection({
  items,
  newItem,
  onNewItemChange,
  onAdd,
  onRemove,
}: PackageContentsSectionProps) {
  return (
    <Panel title={'Package Contents ("What\'s In The Box")'}>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {items.length === 0 && <p className="text-xs text-muted">No items added yet.</p>}
          {items.map((item, idx) => (
            <Tag
              key={`${item}-${idx}`}
              size="sm"
              className="border border-border bg-muted-bg inline-flex items-center gap-1"
            >
              <FaBoxOpen size={10} className="text-primary" />
              <span className="text-xs font-semibold text-text">{item}</span>
              <Tag.RemoveButton onPress={() => onRemove(idx)}>
                <FaTimes size={10} />
              </Tag.RemoveButton>
            </Tag>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => onNewItemChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdd();
              }
            }}
            placeholder="e.g. 1x Type-C Fast Braided Cable (1m)"
            fullWidth
          />
          <Button
            type="button"
            variant="outline"
            onPress={onAdd}
            className="shrink-0"
          >
            <FaPlus size={11} /> Add
          </Button>
        </div>
      </div>
    </Panel>
  );
}