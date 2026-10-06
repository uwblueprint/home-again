"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import {
  agentColumns,
  StatusCards,
  StatusPills,
  useStatusFilter,
} from "@/app/agent-dash/components";
import { AGENT_ROLES, AGENT_ROWS } from "@/app/agent-dash/data/mockAgents";
import { DataTable } from "@/common/components/data-display";
import { Button } from "@/common/components/ui/button";
import { AGENT_DASH_AGENT, AGENT_DASH_AGENTS_NEW } from "@/common/constants";
import { isAgencyAdminAgent, useAuthStore } from "@/common/stores/authStore";

const SORT_OPTIONS = [
  {
    value: "name_az",
    label: "Agent name (A-Z)",
    sorting: [{ id: "agentName", desc: false }],
  },
  {
    value: "name_za",
    label: "Agent name (Z-A)",
    sorting: [{ id: "agentName", desc: true }],
  },
  {
    value: "pending_desc",
    label: "Pending referrals (high–low)",
    sorting: [{ id: "pendingReferrals", desc: true }],
  },
  {
    value: "delivered_desc",
    label: "Delivered referrals (high–low)",
    sorting: [{ id: "deliveredReferrals", desc: true }],
  },
];

export default function AgentsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { filter, setFilter, counts, total, filteredRows } = useStatusFilter(
    AGENT_ROWS,
    AGENT_ROLES,
    (row) => row.role
  );

  return (
    <div className="flex flex-col gap-xl">
      <StatusCards
        statuses={AGENT_ROLES}
        counts={counts}
        filter={filter}
        onFilterChange={setFilter}
        labels={{ Admin: "Admins", Agent: "Agents" }}
      />

      <DataTable
        columns={agentColumns}
        data={filteredRows}
        searchPlaceholder="Search"
        emptyStateMessage="No agents found"
        sortOptions={SORT_OPTIONS}
        header={
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <h2 className="text-heading-3 font-semibold text-foreground">
              Agents
            </h2>
            {isAgencyAdminAgent(user) ? (
              <Button
                nativeButton={false}
                render={<Link href={AGENT_DASH_AGENTS_NEW} />}
              >
                <Plus className="size-4" data-icon="inline-start" />
                Add new agent
              </Button>
            ) : null}
          </div>
        }
        toolbarLeading={
          <StatusPills
            statuses={AGENT_ROLES}
            counts={counts}
            total={total}
            filter={filter}
            onFilterChange={setFilter}
          />
        }
        onRowClick={(row) => router.push(AGENT_DASH_AGENT(row.id))}
        testId="agency-agents-table"
      />
    </div>
  );
}
