"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/common/lib/utils";

export interface SelectAndComboProps {
  value: number;
  onChange: (nextValue: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function SelectAndCombo({
  value,
  onChange,
  min = 1,
  max,
  className,
}: SelectAndComboProps) {
  const canDecrement = value > min;
  const canIncrement = max !== undefined ? value < max : true;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-between gap-1 rounded-2xl border border-[--unofficial-border-3] bg-background px-1 py-1 text-sm text-foreground",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={!canDecrement}
        className="flex size-5 items-center justify-center text-muted-foreground transition-opacity disabled:opacity-40"
        aria-label="Decrease value"
      >
        <Minus className="size-3.5" strokeWidth={2.25} />
      </button>

      <span
        className="flex size-5 items-center justify-center text-center"
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() =>
          onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)
        }
        disabled={!canIncrement}
        className="flex size-5 items-center justify-center text-foreground transition-opacity disabled:opacity-40"
        aria-label="Increase value"
      >
        <Plus className="size-3.5" strokeWidth={2.25} />
      </button>
    </div>
  );
}

export { SelectAndCombo as QuantityCounter };
export default SelectAndCombo;
