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

export interface DonationHistoryRow {
  donationDate: string;
  donationId: string;
  items: string[];
  status: DonationHistoryStatus;
}

export const donationHistoryColumns: ColumnDef<DonationHistoryRow>[] = [
  {
    accessorKey: "donationDate",
    header: "Donation Date",
    enableSorting: true,
    sortingFn: "datetime",
    cell: ({ getValue }) => {
      const date = getValue<string>();

      return date
        ? new Intl.DateTimeFormat("en-CA", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(new Date(date))
        : "—";
    },
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
          <TooltipTrigger className="block max-w-[240px] truncate text-left">
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
    cell: ({ getValue }) => (
      <DonationStatusBadge
        status={getValue<DonationHistoryStatus>()}
      />
    ),
  },
];