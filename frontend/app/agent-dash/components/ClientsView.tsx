"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  BigToggleButton,
  DataTable,
  DataTableSearchEmptyState,
} from "@/common/components/data-display";
import { cn } from "@/common/lib/utils";
import { useAuthStore } from "@/common/stores/authStore";
import { AGENT_DASH_CLIENT } from "@/common/constants";

import {
  CLIENT_STATUSES,
  CLIENT_STATUS_PILLS,
  isClientAssignedToAgent,
  makeClientRows,
  type ClientStatus,
} from "../data/mockClients";
import { clientColumns } from "./clientColumns";

type StatusFilter = "all" | ClientStatus;

const SORT_OPTIONS = [
  {
    value: "name_az",
    label: "Client name (A-Z)",
    sorting: [{ id: "clientName", desc: false }],
  },
  {
    value: "name_za",
    label: "Client name (Z-A)",
    sorting: [{ id: "clientName", desc: true }],
  },
  {
    value: "recent",
    label: "Most recent referral",
    sorting: [{ id: "mostRecentReferral", desc: true }],
  },
];

export function ClientsView() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [rows] = useState(() => makeClientRows());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const agentClients = useMemo(
    () => rows.filter((row) => isClientAssignedToAgent(row, user?.id)),
    [rows, user?.id]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<ClientStatus, number> = {
      "Referral Pending": 0,
      "Referral Scheduled": 0,
      Eligible: 0,
      "Not Eligible": 0,
    };
    for (const row of agentClients) {
      counts[row.status] += 1;
    }
    return counts;
  }, [agentClients]);

  const filteredRows = useMemo(() => {
    if (statusFilter === "all") return agentClients;
    return agentClients.filter((row) => row.status === statusFilter);
  }, [agentClients, statusFilter]);

  const handleStatusToggle = (status: ClientStatus) => {
    setStatusFilter((current) => (current === status ? "all" : status));
  };

  const pillCounts = {
    all: agentClients.length,
    Pending: statusCounts["Referral Pending"],
    Scheduled: statusCounts["Referral Scheduled"],
    Eligible: statusCounts.Eligible,
    "Not Eligible": statusCounts["Not Eligible"],
  };

  return (
    <div className="flex flex-col gap-xl">
      <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 xl:grid-cols-4">
        {CLIENT_STATUSES.map((status) => (
          <BigToggleButton
            key={status}
            count={statusCounts[status]}
            label={status}
            selected={statusFilter === status}
            onClick={() => handleStatusToggle(status)}
          />
        ))}
      </div>

      <DataTable
        columns={clientColumns}
        data={filteredRows}
        searchPlaceholder="Search"
        emptyStateMessage="No clients found"
        emptyState={({ globalFilter }) => (
          <DataTableSearchEmptyState query={globalFilter} />
        )}
        defaultSortValue="name_az"
        sortOptions={SORT_OPTIONS}
        filters={[
          {
            columnId: "status",
            title: "Filter",
            options: CLIENT_STATUSES.map((status) => ({
              label: status,
              value: status,
            })),
          },
        ]}
        header={
          <h2 className="text-heading-3 font-semibold text-foreground">
            Clients
          </h2>
        }
        toolbarLeading={
          <div className="flex flex-wrap items-center gap-xs">
            {CLIENT_STATUS_PILLS.map((pill) => {
              const isActive =
                pill.value === "all"
                  ? statusFilter === "all"
                  : statusFilter === pill.status;
              const count =
                pillCounts[pill.value as keyof typeof pillCounts] ?? 0;

              return (
                <button
                  key={pill.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() =>
                    setStatusFilter(
                      pill.value === "all"
                        ? "all"
                        : (pill.status as ClientStatus)
                    )
                  }
                  className={cn(
                    "rounded-lg px-sm py-xs text-paragraph-small font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {pill.label} ({count})
                </button>
              );
            })}
          </div>
        }
        onRowClick={(row) => {
          router.push(AGENT_DASH_CLIENT(row.id));
        }}
        testId="agent-clients-table"
      />
    </div>
  );
}
