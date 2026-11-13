import type { ColumnDef } from "@tanstack/react-table";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";

import {
  DonationStatusBadge,
  type DonationHistoryStatus,
} from "@/common/components/status-labels";
import { formatLongDate, formatShortDate } from "@/common/utils/DateUtils";

export interface DonationHistoryRow {
  donationDate: string;
  donationId: string;
  items: string[];
  status: DonationHistoryStatus;
  approvedCount: number;
  scheduledDate?: string;
}

export const donationHistoryColumns: ColumnDef<DonationHistoryRow>[] = [
  {
    accessorKey: "donationDate",
    header: "Donation Date",
    enableSorting: true,
    sortingFn: "datetime",
    cell: ({ getValue }) => formatLongDate(getValue<string>()),
  },
  {
    accessorKey: "donationId",
    header: "Donation ID",
    enableSorting: false,
  },
  {
    accessorKey: "items",
    header: "Items",
    enableSorting: false,
    cell: ({ getValue }) => {
      const items = getValue<string[]>();
      const text = items.join(", ");

      if (!text) return "—";

      return (
        <Tooltip>
          <TooltipTrigger className="block max-w-60 truncate text-left">
            {text}
          </TooltipTrigger>
          <TooltipContent className="bg-secondary text-secondary-foreground [&_svg]:bg-secondary [&_svg]:fill-secondary">
            {text}
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const { status, approvedCount, items, scheduledDate } = row.original;
      if (status === "approved_fraction") {
        return (
          <DonationStatusBadge
            status={status}
            approved={approvedCount}
            total={items.length}
          />
        );
      }
      return (
        <DonationStatusBadge
          status={status}
          scheduledDate={
            scheduledDate ? formatShortDate(scheduledDate) : undefined
          }
        />
      );
    },
  },
];
