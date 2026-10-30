import { DataTable, DonationCountBadge } from "@/common/components";
import {
  donationHistoryColumns,
  type DonationHistoryRow,
} from "./HistoryTableColumns";

interface HistoryTableProps {
  data: DonationHistoryRow[];
}

export function HistoryTable({ data }: HistoryTableProps) {
  return (
    <DataTable
      columns={donationHistoryColumns}
      data={data ?? []}
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