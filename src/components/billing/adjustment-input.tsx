"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdjustmentType } from "@/types/billing";

interface AdjustmentInputProps {
  label: string;
  type: AdjustmentType;
  value: number;
  onTypeChange: (type: AdjustmentType) => void;
  onValueChange: (value: number) => void;
}

export function AdjustmentInput({
  label,
  type,
  value,
  onTypeChange,
  onValueChange,
}: AdjustmentInputProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-sm font-medium">{label}</span>
      <div className="flex overflow-hidden rounded-md border">
        <Button
          type="button"
          size="sm"
          variant={type === "percentage" ? "default" : "ghost"}
          className="h-10 rounded-none px-3"
          onClick={() => onTypeChange("percentage")}
        >
          %
        </Button>
        <Button
          type="button"
          size="sm"
          variant={type === "fixed" ? "default" : "ghost"}
          className="h-10 rounded-none px-3"
          onClick={() => onTypeChange("fixed")}
        >
          ₹
        </Button>
      </div>
      <Input
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(event) => onValueChange(Number(event.target.value))}
        className="h-10 flex-1"
      />
    </div>
  );
}
