"use client";

import type { ColumnDef, RowData } from "@tanstack/react-table";

import {
  DataTableColumnHeader,
  HighlightText,
} from "@/common/components/data-display";

import type { AgentListRow } from "../data/mockAgents";
import { AgentRoleBadge } from "./AgentRoleBadge";

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

export const agentColumns: ColumnDef<AgentListRow>[] = [
  {
    accessorKey: "agentName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agent Name" />
    ),
    cell: ({ row, table }) => (
      <HighlightText
        text={row.original.agentName}
        query={getSearchQuery(table)}
      />
    ),
  },
  {
    accessorKey: "agentId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agent ID" />
    ),
    cell: ({ row, table }) => (
      <HighlightText
        text={row.original.agentId}
        query={getSearchQuery(table)}
      />
    ),
  },
  {
    accessorKey: "role",
    header: "Agent role",
    cell: ({ row }) => <AgentRoleBadge role={row.original.role} />,
  },
  {
    accessorKey: "pendingReferrals",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pending Referrals" />
    ),
  },
  {
    accessorKey: "scheduledReferrals",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Scheduled Referrals" />
    ),
  },
  {
    accessorKey: "deliveredReferrals",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Delivered Referrals" />
    ),
  },
];
