"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";

import {
  DetailCard,
  DetailPage,
  DetailSection,
  referralColumns,
  StatusPills,
  useStatusFilter,
} from "@/app/agent-dash/components";
import {
  getAgentById,
  getAssociatedReferrals,
} from "@/app/agent-dash/data/mockAgents";
import { REFERRAL_STATUSES } from "@/app/agent-dash/data/mockReferrals";
import { DataTable, InformationBlock } from "@/common/components/data-display";
import { AgentDashStatusBadge } from "@/common/components/status-labels";
import { AGENT_DASH_AGENTS, AGENT_DASH_REFERRAL } from "@/common/constants";

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Most recent",
    sorting: [{ id: "creationDate", desc: true }],
  },
  {
    value: "oldest",
    label: "Oldest",
    sorting: [{ id: "creationDate", desc: false }],
  },
];

export default function AgentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const agent = getAgentById(id);
  const { filter, setFilter, counts, total, filteredRows } = useStatusFilter(
    getAssociatedReferrals(id),
    REFERRAL_STATUSES,
    (row) => row.status
  );
  if (!agent) notFound();

  return (
    <DetailPage
      title="Agent Details"
      subtitle={`Agent ID: ${agent.agentId}`}
      aside={<AgentDashStatusBadge status={agent.role} />}
      backHref={AGENT_DASH_AGENTS}
    >
      <DetailCard>
        <div className="grid grid-cols-1 gap-xl sm:grid-cols-2">
          <InformationBlock label="First Name" value={agent.firstName} />
          <InformationBlock label="Last Name" value={agent.lastName} />
          <InformationBlock label="Email" value={agent.email} />
          <InformationBlock label="Phone number" value={agent.phone} />
        </div>
      </DetailCard>

      <DetailSection title="Associated Referrals">
        <DataTable
          columns={referralColumns}
          data={filteredRows}
          searchPlaceholder="Search"
          emptyStateMessage="No associated referrals"
          initialColumnVisibility={{ attributes: false }}
          sortOptions={SORT_OPTIONS}
          toolbarLeading={
            <StatusPills
              statuses={REFERRAL_STATUSES}
              counts={counts}
              total={total}
              filter={filter}
              onFilterChange={setFilter}
            />
          }
          onRowClick={(row) => router.push(AGENT_DASH_REFERRAL(row.id))}
          testId="agent-associated-referrals"
        />
      </DetailSection>
    </DetailPage>
  );
}
