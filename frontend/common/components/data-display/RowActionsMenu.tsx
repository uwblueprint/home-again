"use client";

import type { ReactElement, ReactNode } from "react";
import { EllipsisVertical, type LucideIcon } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { cn } from "@/common/lib/utils";

type RowAction = {
  /** Item text. A node so callers can inline extras, e.g. a role `Badge`. */
  label: ReactNode;
  /** Optional leading lucide icon. */
  icon?: LucideIcon;
  /** `destructive` renders the item (text + icon) in the destructive color. */
  variant?: "default" | "destructive";
  /** Fired when the item is chosen. The menu closes afterwards. */
  onSelect: () => void;
  disabled?: boolean;
};

type RowActionsMenuProps = {
  /** Actions rendered top to bottom. */
  actions: RowAction[];
  /**
   * Element that opens the menu. Defaults to a ghost icon button with a
   * vertical ellipsis.
   */
  trigger?: ReactElement;
  /** Accessible name for the default trigger. @default "More actions" */
  triggerLabel?: string;
  /** Horizontal alignment of the menu against the trigger. @default "end" */
  align?: "start" | "center" | "end";
  /** Extra classes for the menu popup. */
  className?: string;
};

/**
 * Generic per-row actions menu (e.g. "Resend invite" / "Cancel invite",
 * "Change role" / "Delete admin"). Purely presentational: it reports which
 * action was chosen through each action's `onSelect` and owns no follow-up
 * logic — confirmation dialogs and mutations belong to the caller.
 */
function RowActionsMenu({
  actions,
  trigger,
  triggerLabel = "More actions",
  align = "end",
  className,
}: RowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          trigger ?? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={triggerLabel}
            >
              <EllipsisVertical aria-hidden="true" />
            </Button>
          )
        }
      />
      <DropdownMenuContent
        data-slot="row-actions-menu"
        align={align}
        className={cn("w-auto", className)}
      >
        {actions.map(
          (
            { label, icon: Icon, variant = "default", onSelect, disabled },
            i
          ) => (
            <DropdownMenuItem
              key={i}
              variant={variant}
              disabled={disabled}
              onClick={onSelect}
            >
              {Icon ? <Icon aria-hidden="true" /> : null}
              {label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { RowActionsMenu };
export type { RowAction, RowActionsMenuProps };
