"use client";

import type { ColumnDef, RowData } from "@tanstack/react-table";

import {
  DataTableColumnHeader,
  HighlightText,
} from "@/common/components/data-display";

import type { ClientRow } from "../data/mockClients";
import { ClientStatusBadge } from "./ClientStatusBadge";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    globalFilter?: string;
  }
}

function getSearchQuery(table: {
  options: { meta?: { globalFilter?: string } };
}) {
  return table.options.meta?.globalFilter ?? "";
}

export const clientColumns: ColumnDef<ClientRow>[] = [
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
    cell: ({ row, table }) => (
      <HighlightText
        text={row.original.clientName}
        query={getSearchQuery(table)}
      />
    ),
  },
  {
    accessorKey: "clientId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client ID" />
    ),
    cell: ({ row, table }) => (
      <HighlightText
        text={row.original.clientId}
        query={getSearchQuery(table)}
      />
    ),
  },
  {
    id: "mostRecentReferral",
    accessorFn: (row) => row.mostRecentReferralAt,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Most recent referral" />
    ),
    cell: ({ row, table }) => (
      <HighlightText
        text={row.original.mostRecentReferral}
        query={getSearchQuery(table)}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue?.length) return true;
      return filterValue.includes(row.getValue(columnId));
    },
    cell: ({ row }) => (
      <ClientStatusBadge
        status={row.original.status}
        statusDate={row.original.statusDate}
      />
    ),
  },
];
