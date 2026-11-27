import type { ColumnDef } from "@tanstack/react-table";

import { AdminBadge, SuperadminBadge } from "@/common/components/status-labels";
import { AdminActionsMenu } from "./AdminActionsMenu";

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
      <AdminActionsMenu
        role={row.original.role}
        triggerLabel={`Admin actions for ${row.original.email}`}
        // Not wired up to anything yet.
        onChangeRole={() => {}}
        onDelete={() => {}}
      />
    ),
  },
];
