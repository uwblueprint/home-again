"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import {
  DataTable,
  DataTableSearchEmptyState,
} from "@/common/components/data-display";
import { Button } from "@/common/components/ui/button";
import { AGENT_DASH_AGENTS, AGENT_DASH_REFERRAL } from "@/common/constants";
import { cn } from "@/common/lib/utils";

import {
  getAgentById,
  getAssociatedReferralsForAgent,
} from "../data/mockAgents";
import {
  REFERRAL_STATUSES,
  type ReferralStatus,
} from "../data/mockReferrals";
import { AgentRoleBadge } from "./AgentRoleBadge";
import { referralColumns } from "./referralColumns";

function SectionCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background p-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-paragraph-small font-semibold text-foreground">
        {label}
      </span>
      <span className="text-paragraph-regular text-foreground">{value}</span>
    </div>
  );
}

type StatusFilter = "all" | ReferralStatus;

type AgentDetailsViewProps = {
  agentId: string;
};

export function AgentDetailsView({ agentId }: AgentDetailsViewProps) {
  const router = useRouter();
  const agent = getAgentById(agentId);
  const [referrals] = useState(() => getAssociatedReferralsForAgent(agentId));
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const statusCounts = useMemo(() => {
    const counts: Record<ReferralStatus, number> = {
      Pending: 0,
      Delivered: 0,
      Scheduled: 0,
      Rejected: 0,
    };
    for (const row of referrals) {
      counts[row.status] += 1;
    }
    return counts;
  }, [referrals]);

  const filteredReferrals = useMemo(() => {
    if (statusFilter === "all") return referrals;
    return referrals.filter((row) => row.status === statusFilter);
  }, [referrals, statusFilter]);

  const statusPills: { value: StatusFilter; label: string }[] = [
    { value: "all", label: `All (${referrals.length})` },
    ...REFERRAL_STATUSES.map((status) => ({
      value: status as StatusFilter,
      label: `${status} (${statusCounts[status]})`,
    })),
  ];

  if (!agent) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-md">
        <p className="text-paragraph-regular text-muted-foreground">
          Agent not found.
        </p>
        <Button
          type="button"
          variant="secondary"
          nativeButton={false}
          render={<Link href={AGENT_DASH_AGENTS} />}
        >
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-xl">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <h1 className="text-heading-2 font-semibold text-foreground">
            Agent Details
          </h1>
          <p className="text-paragraph-small text-muted-foreground">
            Agent ID: {agent.agentId}
          </p>
        </div>
        <AgentRoleBadge role={agent.role} />
      </div>

      <SectionCard>
        <div className="grid grid-cols-1 gap-xl sm:grid-cols-2">
          <DetailField label="First Name" value={agent.firstName} />
          <DetailField label="Last Name" value={agent.lastName} />
          <DetailField label="Email" value={agent.email} />
          <DetailField label="Phone number" value={agent.phone} />
        </div>
      </SectionCard>

      <section className="flex flex-col gap-md">
        <h2 className="text-heading-4 font-semibold text-foreground">
          Associated Referrals
        </h2>
        <DataTable
          columns={referralColumns}
          data={filteredReferrals}
          searchPlaceholder="Search"
          emptyStateMessage="No associated referrals"
          emptyState={({ globalFilter }) => (
            <DataTableSearchEmptyState query={globalFilter} />
          )}
          initialColumnVisibility={{ attributes: false }}
          defaultSortValue="newest"
          sortOptions={[
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
          ]}
          toolbarLeading={
            <div className="flex flex-wrap items-center gap-xs">
              {statusPills.map((pill) => {
                const isActive = statusFilter === pill.value;
                return (
                  <button
                    key={pill.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setStatusFilter(pill.value)}
                    className={cn(
                      "rounded-lg px-sm py-xs text-paragraph-small font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          }
          onRowClick={(row) => {
            router.push(AGENT_DASH_REFERRAL(row.id));
          }}
          testId="agent-associated-referrals"
        />
      </section>

      <div className="mt-auto flex justify-end pt-xl">
        <Button
          type="button"
          variant="secondary"
          nativeButton={false}
          render={<Link href={AGENT_DASH_AGENTS} />}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
