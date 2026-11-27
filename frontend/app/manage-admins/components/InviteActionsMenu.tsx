"use client";

import type { ReactElement } from "react";
import { RotateCcw, Trash2 } from "lucide-react";

import { RowActionsMenu } from "@/common/components/data-display";

type InviteActionsMenuProps = {
  /** Fired when "Resend invite" is chosen. */
  onResend: () => void;
  /** Fired when "Cancel invite" is chosen. */
  onCancel: () => void;
  /** Element that opens the menu. Defaults to a vertical-ellipsis button. */
  trigger?: ReactElement;
  /**
   * Accessible name for the default trigger, e.g. "Invite actions for
   * jane@example.com". @default "Invite actions"
   */
  triggerLabel?: string;
  className?: string;
};

/**
 * Per-row menu for a pending admin invite: "Resend invite" and a destructive
 * "Cancel invite". Presentational only — the caller decides what each choice
 * does (e.g. open the "Resend invite?" / "Cancel admin invite?" dialogs).
 */
function InviteActionsMenu({
  onResend,
  onCancel,
  trigger,
  triggerLabel = "Invite actions",
  className,
}: InviteActionsMenuProps) {
  return (
    <RowActionsMenu
      trigger={trigger}
      triggerLabel={triggerLabel}
      className={className}
      actions={[
        { label: "Resend invite", icon: RotateCcw, onSelect: onResend },
        {
          label: "Cancel invite",
          icon: Trash2,
          variant: "destructive",
          onSelect: onCancel,
        },
      ]}
    />
  );
}

export { InviteActionsMenu };
export type { InviteActionsMenuProps };
