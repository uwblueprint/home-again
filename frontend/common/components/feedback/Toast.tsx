"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect } from "react";
import { CircleCheck } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/common/lib/utils";

const toastVariants = cva(
  "pointer-events-auto fixed inset-x-lg top-lg z-50 flex items-start sm:left-auto sm:w-full sm:max-w-md gap-xs rounded-lg border px-md py-sm text-paragraph-small shadow-[var(--shadow-xs)]",
  {
    variants: {
      variant: {
        success:
          "border-[var(--unofficial-success-border)] bg-[var(--unofficial-success-subtle)] text-[var(--unofficial-success-text)]",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  }
);

const DEFAULT_ICONS: Record<
  NonNullable<VariantProps<typeof toastVariants>["variant"]>,
  ComponentType<{ className?: string }>
> = {
  success: CircleCheck,
};

interface ToastProps extends VariantProps<typeof toastVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  /** Auto-dismiss delay in ms. Pass `null` to keep it open. */
  duration?: number | null;
  className?: string;
}

/**
 * Transient notice pinned to the top-right corner (e.g. "Password successfully
 * reset"). Controlled: the parent owns `open`; it closes itself after
 * `duration` via `onOpenChange(false)`.
 */
function Toast({
  open,
  onOpenChange,
  children,
  variant = "success",
  duration = 5000,
  className,
}: ToastProps) {
  useEffect(() => {
    if (!open || duration === null) return;
    const timer = setTimeout(() => onOpenChange(false), duration);
    return () => clearTimeout(timer);
  }, [open, duration, onOpenChange]);

  if (!open) return null;

  const Icon = DEFAULT_ICONS[variant ?? "success"];

  return (
    <div
      data-slot="toast"
      role="status"
      aria-live="polite"
      className={cn(toastVariants({ variant }), className)}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span className="font-normal">{children}</span>
    </div>
  );
}

export { Toast, toastVariants };
