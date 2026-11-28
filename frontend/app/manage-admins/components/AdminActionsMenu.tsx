"use client";

import type { ReactElement } from "react";
import { RotateCcw, Trash2 } from "lucide-react";

import { RowActionsMenu } from "@/common/components/data-display";
import { AdminBadge, SuperadminBadge } from "@/common/components/status-labels";
import type { AdminRole } from "./types";

type AdminActionsMenuProps = {
  /** The admin's current role — the menu offers switching to the other one. */
  role: AdminRole;
  /** Fired when "Change to [role]" is chosen. */
  onChangeRole: () => void;
  /** Fired when "Delete admin" is chosen. */
  onDelete: () => void;
  /** Element that opens the menu. Defaults to a vertical-ellipsis button. */
  trigger?: ReactElement;
  /**
   * Accessible name for the default trigger, e.g. "Admin actions for
   * jane@example.com". @default "Admin actions"
   */
  triggerLabel?: string;
  className?: string;
};

/**
 * Per-row menu for an active admin: "Change to [the other role]" and a
 * destructive "Delete admin". Presentational only — the caller decides what
 * each choice does (e.g. open a confirmation dialog).
 */
function AdminActionsMenu({
  role,
  onChangeRole,
  onDelete,
  trigger,
  triggerLabel = "Admin actions",
  className,
}: AdminActionsMenuProps) {
  const targetRole: AdminRole = role === "superadmin" ? "admin" : "superadmin";

  return (
    <RowActionsMenu
      trigger={trigger}
      triggerLabel={triggerLabel}
      className={className}
      actions={[
        {
          label: (
            <span className="flex items-center gap-2">
              Change to{" "}
              {targetRole === "superadmin" ? (
                <SuperadminBadge />
              ) : (
                <AdminBadge />
              )}
            </span>
          ),
          icon: RotateCcw,
          onSelect: onChangeRole,
        },
        {
          label: "Delete admin",
          icon: Trash2,
          variant: "destructive",
          onSelect: onDelete,
        },
      ]}
    />
  );
}

export { AdminActionsMenu };
export type { AdminActionsMenuProps };
