import { DataTable } from "@/common/components/data-display";
import {
  activeAdminColumns,
  type ActiveAdminRow,
} from "./ActiveAdminsTableColumns";

interface ActiveAdminsTableProps {
  data: ActiveAdminRow[];
  loading?: boolean;
  error?: Error | null;
}

export function ActiveAdminsTable({
  data,
  loading = false,
  error = null,
}: ActiveAdminsTableProps) {
  return (
    <DataTable
      columns={activeAdminColumns}
      data={data}
      loading={loading}
      error={error}
      searchPlaceholder="Search admin by name or email"
      emptyStateMessage="No admins found"
      testId="active-admins-data-table"
    />
  );
}
