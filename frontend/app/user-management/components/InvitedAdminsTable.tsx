import { useMemo } from "react";

import { DataTable } from "@/common/components/data-display";
import {
  compareInvitedAdmins,
  invitedAdminColumns,
  type InvitedAdminRow,
} from "./InvitedAdminsTableColumns";
import { NewAdminButton } from "./NewAdminButton";

interface InvitedAdminsTableProps {
  data: InvitedAdminRow[];
  loading?: boolean;
  error?: Error | null;
}

export function InvitedAdminsTable({
  data,
  loading = false,
  error = null,
}: InvitedAdminsTableProps) {
  const sortedData = useMemo(
    () => [...data].sort(compareInvitedAdmins),
    [data]
  );

  return (
    <DataTable
      columns={invitedAdminColumns}
      data={sortedData}
      loading={loading}
      error={error}
      searchPlaceholder="Search admin by name or email"
      emptyStateMessage="No invited admins found"
      toolbarActions={<NewAdminButton />}
      testId="invited-admins-data-table"
    />
  );
}
