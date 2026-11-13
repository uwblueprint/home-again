import {
  DataTable,
  DonationCountBadge,
} from "@/common/components/data-display";
import {
  donationHistoryColumns,
  type DonationHistoryRow,
} from "@/app/admin-donors/components/HistoryTableColumns";

interface HistoryTableProps {
  data: DonationHistoryRow[];
  /** Makes rows clickable and adds the row chevron. */
  onRowClick?: (row: DonationHistoryRow) => void;
}

export function HistoryTable({ data, onRowClick }: HistoryTableProps) {
  return (
    <DataTable
      columns={donationHistoryColumns}
      data={data ?? []}
      onRowClick={onRowClick}
      header={
        <div className="flex flex-col items-start gap-sm">
          <h2 className="text-heading-4 font-semibold text-foreground">
            Donation History
          </h2>
          <DonationCountBadge count={data.length} />
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
