"use client";

import { Button, Input, Label, TextArea } from "@heroui/react";
import { FaMagic } from "react-icons/fa";
import { Panel } from "@/components/dashboard/DashboardUI";

interface DescriptionSectionProps {
  description: string;
  tagsInput: string;
  isAiGenerating: boolean;
  onDescriptionChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onAiGenerate: () => void;
}

export function DescriptionSection({
  description,
  tagsInput,
  isAiGenerating,
  onDescriptionChange,
  onTagsChange,
  onAiGenerate,
}: DescriptionSectionProps) {
  return (
    <Panel
      title="Product Story & Description"
      action={
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onPress={onAiGenerate}
          className="text-xs font-bold"
        >
          {isAiGenerating ? "Generating..." : <><FaMagic size={11} /> Auto-Write with AI</>}
        </Button>
      }
    >
      <div className="space-y-3">
        <TextArea
          rows={8}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Detailed description of features, specifications, and warranty details..."
          required
          fullWidth
        />
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-bold text-muted">Tags / Keywords (comma separated)</Label>
        <Input
          value={tagsInput}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder="bluetooth, wireless, gaming, noise cancelling, bass"
          fullWidth
        />
        </div>
      </div>
    </Panel>
  );
}