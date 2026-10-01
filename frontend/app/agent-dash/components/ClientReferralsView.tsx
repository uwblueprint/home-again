"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import {
  BigToggleButton,
  DataTable,
  DataTableSearchEmptyState,
} from "@/common/components/data-display";
import { Button } from "@/common/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import { AGENT_DASH_REFERRAL, REFERRAL_FORM } from "@/common/constants";
import { cn } from "@/common/lib/utils";
import { useAuthStore } from "@/common/stores/authStore";

import {
  isReferralAssignedToAgent,
  makeReferralRows,
  REFERRAL_ATTRIBUTE_OPTIONS,
  REFERRAL_STATUSES,
  type ReferralStatus,
} from "../data/mockReferrals";
import { referralColumns } from "./referralColumns";

type ScopeTab = "mine" | "all";
export type StatusFilter = "all" | ReferralStatus;

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

type ClientReferralsViewProps = {
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
};

export function ClientReferralsView({
  statusFilter,
  onStatusFilterChange,
}: ClientReferralsViewProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [rows] = useState(() => makeReferralRows());
  const [scope, setScope] = useState<ScopeTab>("mine");

  const scopedRows = useMemo(() => {
    if (scope === "all") return rows;
    return rows.filter((row) => isReferralAssignedToAgent(row, user?.id));
  }, [rows, scope, user?.id]);

  const statusCounts = useMemo(() => {
    const counts: Record<ReferralStatus, number> = {
      Pending: 0,
      Delivered: 0,
      Scheduled: 0,
      Rejected: 0,
    };
    for (const row of scopedRows) {
      counts[row.status] += 1;
    }
    return counts;
  }, [scopedRows]);

  const filteredRows = useMemo(() => {
    if (statusFilter === "all") return scopedRows;
    return scopedRows.filter((row) => row.status === statusFilter);
  }, [scopedRows, statusFilter]);

  const handleStatusToggle = (status: ReferralStatus) => {
    onStatusFilterChange(statusFilter === status ? "all" : status);
  };

  const statusPills: { value: StatusFilter; label: string }[] = [
    { value: "all", label: `All (${scopedRows.length})` },
    ...REFERRAL_STATUSES.map((status) => ({
      value: status as StatusFilter,
      label: `${status} (${statusCounts[status]})`,
    })),
  ];

  return (
    <div className="flex flex-col gap-xl">
      <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 xl:grid-cols-4">
        {REFERRAL_STATUSES.map((status) => (
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
        columns={referralColumns}
        data={filteredRows}
        searchPlaceholder="Search"
        emptyStateMessage="No referrals found"
        emptyState={({ globalFilter }) => (
          <DataTableSearchEmptyState query={globalFilter} />
        )}
        initialColumnVisibility={{ attributes: false }}
        defaultSortValue="newest"
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
              value={scope}
              onValueChange={(value) => {
                if (value === "mine" || value === "all") setScope(value);
              }}
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
          <div className="flex flex-wrap items-center gap-xs">
            {statusPills.map((pill) => {
              const isActive = statusFilter === pill.value;
              return (
                <button
                  key={pill.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onStatusFilterChange(pill.value)}
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
        testId="agent-referrals-table"
      />
    </div>
  );
}
