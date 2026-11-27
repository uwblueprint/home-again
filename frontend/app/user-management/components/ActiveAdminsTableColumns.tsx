import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { AdminBadge, SuperadminBadge } from "@/common/components/status-labels";
import { RowActionsMenu } from "@/common/components/data-display";

export type AdminRole = "admin" | "superadmin";

export interface ActiveAdminRow {
  id: string;
  name: string;
  role: AdminRole;
  email: string;
}

export const activeAdminColumns: ColumnDef<ActiveAdminRow>[] = [
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
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <RowActionsMenu
        triggerLabel={`Admin actions for ${row.original.email}`}
        actions={[
          // Not wired up to anything yet.
          { label: "Change role", icon: Pencil, onSelect: () => {} },
          {
            label: "Delete admin",
            icon: Trash2,
            variant: "destructive",
            onSelect: () => {},
          },
        ]}
      />
    ),
  },
];
