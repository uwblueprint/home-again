import type { ComponentType, ReactNode } from "react";
import { CircleAlert, Info } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/common/lib/utils";

const alertVariants = cva(
  "flex items-start gap-2 rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        info: "border-border bg-secondary text-foreground",
        warning: "border-amber-600 bg-amber-50 text-amber-900",
        destructive: "border-red-600 bg-red-50 text-red-900",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const DEFAULT_ICONS: Record<
  NonNullable<VariantProps<typeof alertVariants>["variant"]>,
  ComponentType<{ className?: string }>
> = {
  info: Info,
  warning: CircleAlert,
  destructive: CircleAlert,
};

interface AlertProps
  extends
    Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof alertVariants> {
  children: ReactNode;
  /** Override the variant's default leading icon. Pass `null` to hide it. */
  icon?: ComponentType<{ className?: string }> | null;
}

/**
 * Inline callout for contextual notices (info / warning / destructive).
 * A leading icon is chosen from the variant unless overridden.
 */
function Alert({
  variant = "info",
  icon,
  className,
  children,
  ...props
}: AlertProps) {
  const Icon = icon === undefined ? DEFAULT_ICONS[variant ?? "info"] : icon;

  return (
    <div
      role="note"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
      <span className="font-medium">{children}</span>
    </div>
  );
}

export { Alert, alertVariants };
