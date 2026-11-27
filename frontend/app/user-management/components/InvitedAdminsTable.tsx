import { DataTable } from "@/common/components/data-display";
import {
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
  return (
    <DataTable
      columns={invitedAdminColumns}
      data={data}
      loading={loading}
      error={error}
      searchPlaceholder="Search admin by name or email"
      emptyStateMessage="No invited admins found"
      toolbarActions={<NewAdminButton />}
      testId="invited-admins-data-table"
    />
  );
}
