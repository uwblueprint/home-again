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
        "inline-flex items-center gap-2 rounded-2xl border border-[--unofficial-border-3] bg-background px-3 py-1.5 text-base text-foreground",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={!canDecrement}
        className="text-2xl text-muted-foreground transition-opacity disabled:opacity-40"
        aria-label="Decrease value"
      >
        <Minus className="h-4 w-4" strokeWidth={2.25} />
      </button>

      <span className="min-w-[1.5ch] text-center" aria-live="polite">
        {value}
      </span>

      <button
        type="button"
        onClick={() =>
          onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)
        }
        disabled={!canIncrement}
        className="text-2xl text-foreground transition-opacity disabled:opacity-40"
        aria-label="Increase value"
      >
        <Plus className="h-4 w-4" strokeWidth={2.25} />
      </button>
    </div>
  );
}

export { SelectAndCombo as QuantityCounter };
export default SelectAndCombo;
