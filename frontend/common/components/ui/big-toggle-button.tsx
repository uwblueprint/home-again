"use client";

import { cva } from "class-variance-authority";

import { cn } from "@/common/lib/utils";

const bigToggleButtonVariants = cva(
  "flex h-[150px] w-full flex-col items-start justify-center gap-sm rounded-[var(--radius)] bg-background px-xl py-2xl text-left shadow-[var(--shadow-sm)] outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  {
    variants: {
      selected: {
        true: "border-2 border-primary",
        false:
          "border border-[var(--unofficial-border-3)] hover:border-2 hover:border-[var(--unofficial-border-4)]",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

interface BigToggleButtonProps
  extends Omit<React.ComponentProps<"button">, "type" | "ref"> {
  count: React.ReactNode;
  label: string;
  selected?: boolean;
}

function BigToggleButton({
  className,
  count,
  label,
  selected = false,
  ...props
}: BigToggleButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      data-slot="big-toggle-button"
      data-selected={selected}
      className={cn(bigToggleButtonVariants({ selected }), className)}
      {...props}
    >
      <span className="flex-1 text-heading-2 font-semibold text-foreground">
        {count}
      </span>
      <span className="w-full text-paragraph-regular font-medium text-foreground">
        {label}
      </span>
    </button>
  );
}

export { BigToggleButton };
