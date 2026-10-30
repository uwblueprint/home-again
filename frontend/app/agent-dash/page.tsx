"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import {
  referralColumns,
  StatusCards,
  StatusPills,
  useStatusFilter,
} from "@/app/agent-dash/components";
import {
  isReferralAssignedToAgent,
  REFERRAL_ATTRIBUTE_OPTIONS,
  REFERRAL_ROWS,
  REFERRAL_STATUSES,
} from "@/app/agent-dash/data/mockReferrals";
import { DataTable } from "@/common/components/data-display";
import { Button } from "@/common/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { AGENT_DASH_REFERRAL, REFERRAL_FORM } from "@/common/constants";
import { useAuthStore } from "@/common/stores/authStore";

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest",
    sorting: [{ id: "creationDate", desc: true }],
  },
  {
    value: "oldest",
    label: "Oldest",
    sorting: [{ id: "creationDate", desc: false }],
  },
  {
    value: "client_az",
    label: "Client name (A-Z)",
    sorting: [{ id: "clientName", desc: false }],
  },
  {
    value: "client_za",
    label: "Client name (Z-A)",
    sorting: [{ id: "clientName", desc: true }],
  },
];

export default function ClientReferralsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [showAll, setShowAll] = useState(false);

  const scopedRows = showAll
    ? REFERRAL_ROWS
    : REFERRAL_ROWS.filter((row) => isReferralAssignedToAgent(row, user?.id));
  const { filter, setFilter, counts, total, filteredRows } = useStatusFilter(
    scopedRows,
    REFERRAL_STATUSES,
    (row) => row.status
  );

  return (
    <div className="flex flex-col gap-xl">
      <StatusCards
        statuses={REFERRAL_STATUSES}
        counts={counts}
        filter={filter}
        onFilterChange={setFilter}
        className="xl:grid-cols-4"
      />

      <DataTable
        columns={referralColumns}
        data={filteredRows}
        searchPlaceholder="Search"
        emptyStateMessage="No referrals found"
        initialColumnVisibility={{ attributes: false }}
        sortOptions={SORT_OPTIONS}
        filters={[
          {
            columnId: "attributes",
            title: "Filter",
            options: REFERRAL_ATTRIBUTE_OPTIONS,
          },
        ]}
        header={
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <Tabs
              value={showAll ? "all" : "mine"}
              onValueChange={(value) => setShowAll(value === "all")}
            >
              <TabsList>
                <TabsTrigger value="mine">My Referrals</TabsTrigger>
                <TabsTrigger value="all">All Referrals</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button nativeButton={false} render={<Link href={REFERRAL_FORM} />}>
              <Plus className="size-4" data-icon="inline-start" />
              New client referral
            </Button>
          </div>
        }
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
        testId="agent-referrals-table"
      />
    </div>
  );
}
