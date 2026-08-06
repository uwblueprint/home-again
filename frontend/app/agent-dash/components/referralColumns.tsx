"use client";

import type { ColumnDef, RowData } from "@tanstack/react-table";

import { AgentHover } from "@/common/components/agents";
import {
  DataTableColumnHeader,
  HighlightText,
} from "@/common/components/data-display";
import { cn } from "@/common/lib/utils";

import type { ReferralRow } from "../data/mockReferrals";
import { ReferralStatusBadge } from "./ReferralStatusBadge";

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

export const referralColumns: ColumnDef<ReferralRow>[] = [
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
    cell: ({ row, table }) => {
      const showPriority =
        row.original.isPriority && row.original.status !== "Pending";

      return (
        <div className="flex items-center gap-sm">
          <span
            aria-hidden={!showPriority}
            className={cn(
              "size-2 shrink-0 rounded-full",
              showPriority ? "bg-[var(--brand-reds-300)]" : "bg-transparent"
            )}
          />
          <HighlightText
            text={row.original.clientName}
            query={getSearchQuery(table)}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "referralId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Referral ID" />
    ),
    cell: ({ row, table }) => (
      <HighlightText
        text={row.original.referralId}
        query={getSearchQuery(table)}
      />
    ),
  },
  {
    id: "caseAgents",
    accessorFn: (row) =>
      row.caseAgents
        .map((agent) => `${agent.firstName} ${agent.lastName}`)
        .join(" "),
    header: "Case Agents",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center -space-x-2">
        {row.original.caseAgents.map((agent) => (
          <AgentHover
            key={agent.id}
            firstName={agent.firstName}
            lastName={agent.lastName}
            role={agent.role}
            size="sm"
            className="ring-2 ring-background"
          />
        ))}
      </div>
    ),
  },
  {
    id: "creationDate",
    accessorFn: (row) => row.createdAt,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creation Date" />
    ),
    cell: ({ row, table }) => (
      <HighlightText
        text={row.original.creationDate}
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
      <ReferralStatusBadge
        status={row.original.status}
        statusDate={row.original.statusDate}
      />
    ),
  },
  {
    id: "attributes",
    accessorFn: (row) => row.attributes,
    header: () => null,
    enableHiding: true,
    filterFn: (row, _columnId, filterValue: string[]) => {
      if (!filterValue?.length) return true;
      const attributes = row.original.attributes;
      return filterValue.every((value) => attributes.includes(value as never));
    },
    cell: () => null,
  },
];
