"use client";

import * as React from "react";
import { CheckIcon, MinusIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "@/common/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-(--raw-colors-neutral-300) bg-background shadow-xs outline-none transition-[background-color,border-color,color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground disabled:border-[var(--raw-colors-neutral-200)] disabled:bg-[var(--raw-colors-neutral-100)] disabled:text-primary-foreground/40 disabled:data-[state=checked]:border-primary/40 disabled:data-[state=checked]:bg-primary/40 disabled:data-[state=indeterminate]:border-primary/40 disabled:data-[state=indeterminate]:bg-primary/40 aria-invalid:border-destructive aria-invalid:data-[state=checked]:border-destructive aria-invalid:data-[state=checked]:bg-destructive aria-invalid:data-[state=checked]:text-destructive-foreground aria-invalid:data-[state=indeterminate]:border-destructive aria-invalid:data-[state=indeterminate]:bg-destructive aria-invalid:data-[state=indeterminate]:text-destructive-foreground aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/20",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group/checkbox-indicator grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5 group-data-[state=indeterminate]/checkbox-indicator:hidden" />
        <MinusIcon className="hidden size-3.5 group-data-[state=indeterminate]/checkbox-indicator:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
