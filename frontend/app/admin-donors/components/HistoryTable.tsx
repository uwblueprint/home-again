import {
  DataTable,
  DonationCountBadge,
} from "@/common/components/data-display";
import { Skeleton } from "@/common/components/ui";
import {
  donationHistoryColumns,
  type DonationHistoryRow,
} from "@/app/admin-donors/components/HistoryTableColumns";

interface HistoryTableProps {
  data: DonationHistoryRow[];
  /** Shows skeleton rows in place of the rows and count. */
  loading?: boolean;
  /** Makes rows clickable and adds the row chevron. */
  onRowClick?: (row: DonationHistoryRow) => void;
}

export function HistoryTable({
  data,
  loading = false,
  onRowClick,
}: HistoryTableProps) {
  return (
    <DataTable
      columns={donationHistoryColumns}
      data={data}
      loading={loading}
      onRowClick={onRowClick}
      header={
        <div className="flex flex-col items-start gap-sm">
          <h2 className="text-heading-4 font-semibold text-foreground">
            Donation History
          </h2>
          {loading ? (
            <Skeleton className="h-5 w-40 rounded-lg" />
          ) : (
            <DonationCountBadge count={data.length} />
          )}
        </div>
      }
      sortOptions={[
        {
          value: "newest",
          label: "Newest",
          sorting: [{ id: "donationDate", desc: true }],
        },
      ]}
      hideToolbar
    />
  );
}
