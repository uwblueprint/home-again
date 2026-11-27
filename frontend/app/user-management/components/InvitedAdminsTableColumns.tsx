import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import {
  AdminBadge,
  SuperadminBadge,
  InviteExpiredBadge,
  InvitePendingBadge,
} from "@/common/components/status-labels";
import { InviteActionsMenu } from "@/app/manage-admins/components";
import { Button } from "@/common/components/ui/button";
import { formatShortDate } from "@/common/utils/DateUtils";
import type { AdminRole } from "./ActiveAdminsTableColumns";

export type InviteStatus = "invite_pending" | "invite_expired";

export interface InvitedAdminRow {
  id: string;
  name: string;
  role: AdminRole;
  email: string;
  invitedBy: string;
  inviteDate: string;
  status: InviteStatus;
}

export const invitedAdminColumns: ColumnDef<InvitedAdminRow>[] = [
  {
    accessorKey: "name",
    header: "Admin Name",
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
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
  },
  {
    accessorKey: "invitedBy",
    header: "Invited By",
    enableSorting: false,
  },
  {
    accessorKey: "inviteDate",
    header: "Invite Date",
    enableSorting: false,
    cell: ({ getValue }) => formatShortDate(getValue<string>()),
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
