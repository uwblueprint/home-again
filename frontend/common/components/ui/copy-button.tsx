"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";

interface CopyButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children" | "onClick"
> {
  /** Text written to the clipboard when pressed. */
  value: string;
  /** Accessible label; also the tooltip title. Defaults to "Copy". */
  label?: string;
}

/**
 * Icon button that copies `value` to the clipboard and briefly shows a check.
 * Used beside read-only field values (e.g. donor email, pickup address).
 */
function CopyButton({
  value,
  label = "Copy",
  className,
  variant = "ghost",
  size = "icon-sm",
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied (insecure context, permissions) — no-op.
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      aria-label={copied ? `${label} — copied` : label}
      title={label}
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
}

export { CopyButton };
