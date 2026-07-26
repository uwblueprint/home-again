import type { ComponentProps, ComponentType, ReactNode } from "react";
import { CircleAlert, Info } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/common/lib/utils";

// NOTE: font size stays `text-sm` rather than the `text-paragraph-small` token.
// tailwind-merge classifies our custom typography tokens as text *colors*, so
// `cn("text-paragraph-small", "text-foreground")` silently drops the size. Switch
// this once `cn()` is taught the custom font-size scale via extendTailwindMerge.
const alertVariants = cva(
  "flex items-start gap-xs rounded-lg border px-md py-sm text-sm",
  {
    variants: {
      variant: {
        info: "border-border bg-secondary text-foreground",
        // TODO(design): the palette has no warning ramp — only a lone
        // --raw-colors-yellow-100 — so this variant is still raw Tailwind amber.
        // Needs --unofficial-warning-{border,subtle,text} to match `destructive`.
        warning: "border-amber-600 bg-amber-50 text-amber-900",
        destructive:
          "border-[var(--unofficial-destructive-border)] bg-[var(--unofficial-destructive-subtle)] text-[var(--unofficial-destructive-text)]",
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
    Omit<ComponentProps<"div">, "children">,
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
  const resolved = variant ?? "info";
  const Icon = icon === undefined ? DEFAULT_ICONS[resolved] : icon;

  return (
    <div
      data-slot="alert"
      // Informational callouts are static page content and need no role; the
      // louder variants announce themselves politely when they appear.
      role={resolved === "info" ? undefined : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
      <span className="font-medium">{children}</span>
    </div>
  );
}

export { Alert, alertVariants };
