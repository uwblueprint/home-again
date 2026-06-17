import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/common/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex min-h-9 w-full min-w-0 shrink-0 items-center gap-xs self-stretch rounded-lg border border-border bg-input px-sm py-[var(--scale-hacks-7p5)] shadow-[var(--shadow-xs)] text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-[var(--unofficial-destructive-border)] aria-invalid:ring-0 md:text-sm dark:disabled:bg-input/80",
        className
      )}
      {...props}
    />
  );
}

function InputError({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      role="alert"
      data-slot="input-error"
      className={cn(
        "flex self-stretch items-center pb-[5px] font-normal text-paragraph-mini [color:var(--unofficial-destructive-text)]",
        className
      )}
      {...props}
    />
  );
}

export { Input, InputError };
