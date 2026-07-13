"use client";

import type { ReactNode } from "react";

import { BigToggleButton } from "./BigToggleButton";
import { cn } from "@/common/lib/utils";

export interface ToggleButtonGroupOption {
  value: string;
  count: ReactNode;
  label: string;
}

interface ToggleButtonGroupProps {
  options: ToggleButtonGroupOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

/**
 * A row of BigToggleButton tiles behaving as an exclusive-select filter,
 * e.g. filtering a DataTable by status while surfacing per-status counts.
 */
export function ToggleButtonGroup({
  options,
  value,
  onValueChange,
  className,
}: ToggleButtonGroupProps) {
  return (
    <div
      role="group"
      data-slot="toggle-button-group"
      className={cn("flex w-full flex-wrap gap-lg", className)}
    >
      {options.map((option) => (
        <BigToggleButton
          key={option.value}
          count={option.count}
          label={option.label}
          selected={option.value === value}
          className="min-w-50 flex-1"
          onClick={() => onValueChange(option.value)}
        />
      ))}
    </div>
  );
}
