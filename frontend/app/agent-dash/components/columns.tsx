"use client";

import type { CellContext, ColumnDef } from "@tanstack/react-table";

import { AgentHover } from "@/common/components/agents";
import {
  DataTableColumnHeader,
  HighlightText,
} from "@/common/components/data-display";
import { AgentDashStatusBadge } from "@/common/components/status-labels";
import { cn } from "@/common/lib/utils";

import type { AgentListRow } from "../data/mockAgents";
import type { ClientRow } from "../data/mockClients";
import type { CaseAgent, ReferralRow } from "../data/mockReferrals";

/** Cell that highlights the table's current search query. */
function highlighted<TData>(getText: (row: TData) => string) {
  function HighlightedCell({ row, table }: CellContext<TData, unknown>) {
    return (
      <HighlightText
        text={getText(row.original)}
        query={table.options.meta?.globalFilter}
      />
    );
  }
  return HighlightedCell;
}

function CaseAgentAvatars({ agents }: { agents: CaseAgent[] }) {
  return (
    <div className="flex items-center -space-x-2">
      {agents.map((agent) => (
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
  );
}

const referralIdColumn: ColumnDef<ReferralRow> = {
  accessorKey: "referralId",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Referral ID" />
  ),
  cell: highlighted((row) => row.referralId),
};

const caseAgentsColumn: ColumnDef<ReferralRow> = {
  id: "caseAgents",
  accessorFn: (row) =>
    row.caseAgents
      .map((agent) => `${agent.firstName} ${agent.lastName}`)
      .join(" "),
  header: "Case Agents",
  enableSorting: false,
  cell: ({ row }) => <CaseAgentAvatars agents={row.original.caseAgents} />,
};

export const referralColumns: ColumnDef<ReferralRow>[] = [
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
    cell: ({ row, table }) => (
      <div className="flex items-center gap-sm">
        <span
          aria-hidden
          className={cn(
            "size-2 shrink-0 rounded-full",
            row.original.isPriority
              ? "bg-[var(--brand-reds-300)]"
              : "bg-transparent"
          )}
        />
        <HighlightText
          text={row.original.clientName}
          query={table.options.meta?.globalFilter}
        />
      </div>
    ),
  },
  referralIdColumn,
  caseAgentsColumn,
  {
    id: "creationDate",
    accessorFn: (row) => row.createdAt,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creation Date" />
    ),
    cell: highlighted((row) => row.creationDate),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <AgentDashStatusBadge
        status={row.original.status}
        date={row.original.statusDate}
      />
    ),
  },
  {
    // Hidden column backing the "Filter" dropdown; rows must have every
    // selected attribute.
    id: "attributes",
    accessorFn: (row) => row.attributes,
    filterFn: (row, _columnId, filterValue: string[]) =>
      filterValue.every((value) =>
        row.original.attributes.includes(value as never)
      ),
  },
];

/** Columns for a client's referral history on the Client Profile page. */
export const referralHistoryColumns: ColumnDef<ReferralRow>[] = [
  referralIdColumn,
  caseAgentsColumn,
  {
    id: "completionDate",
    header: "Completion Date",
    cell: ({ row }) =>
      row.original.status === "Delivered" || row.original.status === "Rejected"
        ? row.original.creationDate
        : "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <AgentDashStatusBadge status={row.original.status} />,
  },
];

export const clientColumns: ColumnDef<ClientRow>[] = [
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
    cell: highlighted((row) => row.clientName),
  },
  {
    accessorKey: "clientId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client ID" />
    ),
    cell: highlighted((row) => row.clientId),
  },
  {
    id: "mostRecentReferral",
    accessorFn: (row) => row.mostRecentReferralAt,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Most recent referral" />
    ),
    cell: highlighted((row) => row.mostRecentReferral),
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: (row, columnId, filterValue: string[]) =>
      filterValue.includes(row.getValue(columnId)),
    cell: ({ row }) => (
      <AgentDashStatusBadge
        status={row.original.status}
        date={row.original.statusDate}
      />
    ),
  },
];

export const agentColumns: ColumnDef<AgentListRow>[] = [
  {
    accessorKey: "agentName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agent Name" />
    ),
    cell: highlighted((row) => row.agentName),
  },
  {
    accessorKey: "agentId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agent ID" />
    ),
    cell: highlighted((row) => row.agentId),
  },
  {
    accessorKey: "role",
    header: "Agent role",
    cell: ({ row }) => <AgentDashStatusBadge status={row.original.role} />,
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
