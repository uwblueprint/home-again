"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";

import { cn } from "@/common/lib/utils";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group/checkbox peer size-4 shrink-0 rounded-[4px] border border-border bg-background shadow-xs outline-none transition-[background-color,border-color,color,box-shadow]",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:border-border disabled:bg-accent disabled:text-primary-foreground/40",
        "data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
        "data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground",
        "disabled:data-checked:border-primary/40 disabled:data-checked:bg-primary/40",
        "disabled:data-indeterminate:border-primary/40 disabled:data-indeterminate:bg-primary/40",
        "aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/20",
        "aria-invalid:data-checked:border-destructive aria-invalid:data-checked:bg-destructive aria-invalid:data-checked:text-destructive-foreground",
        "aria-invalid:data-indeterminate:border-destructive aria-invalid:data-indeterminate:bg-destructive aria-invalid:data-indeterminate:text-destructive-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5 group-data-indeterminate/checkbox:hidden" />
        <MinusIcon className="hidden size-3.5 group-data-indeterminate/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
