import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import {
  AdminBadge,
  SuperadminBadge,
  InviteExpiredBadge,
  InvitePendingBadge,
} from "@/common/components/status-labels";
import { InviteActionsMenu } from "./InviteActionsMenu";
import { Button } from "@/common/components/ui/button";
import type { AdminRole } from "./types";

export type InviteStatus = "invite_pending" | "invite_expired";

export interface InvitedAdminRow {
  id: string;
  name: string;
  role: AdminRole;
  email: string;
  status: InviteStatus;
  /** Hours remaining before the invite expires (0 or negative once expired). */
  hoursLeft: number;
}

const nameCollator = new Intl.Collator(undefined, { sensitivity: "base" });

/**
 * Default row order: soonest-to-expire first, ties broken by superadmin
 * before admin, remaining ties broken alphabetically by name.
 */
export function compareInvitedAdmins(
  a: InvitedAdminRow,
  b: InvitedAdminRow
): number {
  if (a.hoursLeft !== b.hoursLeft) return a.hoursLeft - b.hoursLeft;
  if (a.role !== b.role) return a.role === "superadmin" ? -1 : 1;
  return nameCollator.compare(a.name, b.name);
}

function expiresInText(hoursLeft: number) {
  const hours = Math.max(hoursLeft, 0);
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

export const invitedAdminColumns: ColumnDef<InvitedAdminRow>[] = [
  {
    accessorKey: "name",
    header: "Admin Name",
    enableSorting: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
  },
  {
    accessorKey: "role",
    header: "Role",
    enableSorting: false,
    cell: ({ getValue }) =>
      getValue<AdminRole>() === "superadmin" ? (
        <SuperadminBadge />
      ) : (
        <AdminBadge />
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ getValue }) =>
      getValue<InviteStatus>() === "invite_expired" ? (
        <InviteExpiredBadge />
      ) : (
        <InvitePendingBadge />
      ),
  },
  {
    accessorKey: "hoursLeft",
    header: "Expires In",
    enableSorting: false,
    cell: ({ getValue }) => {
      const hoursLeft = getValue<number>();
      return (
        <span className={hoursLeft <= 0 ? "text-destructive" : undefined}>
          {expiresInText(hoursLeft)}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.status === "invite_expired" ? (
        // Will open a confirmation modal; no action wired up yet.
        <Button
          variant="ghost"
          size="icon-lg"
          className="text-destructive hover:text-destructive"
          aria-label={`Delete invite for ${row.original.email}`}
          onClick={() => {}}
        >
          <Trash2 className="size-4" />
        </Button>
      ) : (
        <InviteActionsMenu
          triggerLabel={`Invite actions for ${row.original.email}`}
          // Not wired up to anything yet.
          onResend={() => {}}
          onCancel={() => {}}
        />
      ),
  },
];
