"use client";

import { useRouter } from "next/navigation";

import {
  clientColumns,
  StatusCards,
  StatusPills,
  useStatusFilter,
} from "@/app/agent-dash/components";
import {
  CLIENT_ROWS,
  CLIENT_STATUSES,
} from "@/app/agent-dash/data/mockClients";
import { DataTable } from "@/common/components/data-display";
import { AGENT_DASH_CLIENT } from "@/common/constants";
import { useAuthStore } from "@/common/stores/authStore";

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

const PILL_LABELS = {
  "Referral Pending": "Pending",
  "Referral Scheduled": "Scheduled",
};

export default function ClientsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const myClients = CLIENT_ROWS.filter(
    (row) => !!user && row.agentIds.includes(user.id)
  );
  const { filter, setFilter, counts, total, filteredRows } = useStatusFilter(
    myClients,
    CLIENT_STATUSES,
    (row) => row.status
  );

  return (
    <div className="flex flex-col gap-xl">
      <StatusCards
        statuses={CLIENT_STATUSES}
        counts={counts}
        filter={filter}
        onFilterChange={setFilter}
        className="xl:grid-cols-4"
      />

      <DataTable
        columns={clientColumns}
        data={filteredRows}
        searchPlaceholder="Search"
        emptyStateMessage="No clients found"
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
          <StatusPills
            statuses={CLIENT_STATUSES}
            counts={counts}
            total={total}
            filter={filter}
            onFilterChange={setFilter}
            labels={PILL_LABELS}
          />
        }
        onRowClick={(row) => router.push(AGENT_DASH_CLIENT(row.id))}
        testId="agent-clients-table"
      />
    </div>
  );
}
