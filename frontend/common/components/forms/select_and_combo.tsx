"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/common/lib/utils";

export interface FurnitureItemCardProps {
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
}: FurnitureItemCardProps) {
  const canDecrement = value > min;
  const canIncrement = max !== undefined ? value < max : true;

  return (
    <div
      className={cn(
        "inline-flex h-16 min-w-[13rem] items-center justify-between rounded-[24px] border-2 border-border bg-muted/35 px-6 font-sans",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={!canDecrement}
        className="inline-flex size-9 items-center justify-center text-muted-foreground transition-opacity disabled:opacity-35"
        aria-label="Decrease value"
      >
        <Minus className="size-7" strokeWidth={1.75} />
      </button>

      <span
        className="text-heading-1 min-w-[2ch] text-center font-normal text-foreground"
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
        className="inline-flex size-9 items-center justify-center text-muted-foreground transition-opacity disabled:opacity-35"
        aria-label="Increase value"
      >
        <Plus className="size-7" strokeWidth={1.75} />
      </button>
    </div>
  );
}

export { SelectAndCombo as QuantityCounter };
export default SelectAndCombo;
