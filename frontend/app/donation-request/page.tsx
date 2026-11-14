"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  OUTCOME_FILTER_OPTIONS,
  donationRequestColumns,
  donationRequestHiddenColumns,
  toDonationRequestRow,
  type DonationRequestRow,
} from "@/app/donation-request/components";
import { DataTable } from "@/common/components/data-display";
import { AdminHeader } from "@/common/components/layout";
import { AdminSidebar } from "@/common/components/ui/admin-sidebar";
import { SidebarAppShell } from "@/common/components/ui/sidebar-app-shell";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { DONATION_REQUEST } from "@/common/constants";
import { useDonationDetails } from "@/common/hooks/useApi";
import type { DonationReviewStatus } from "@/common/types";

type TabValue = "all" | "pending" | "partially_reviewed" | "reviewed";

/** Tabs in display order, with the review statuses each one shows. */
const TABS: {
  value: TabValue;
  label: string;
  statuses?: DonationReviewStatus[];
}[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending", statuses: ["pending_review"] },
  {
    value: "partially_reviewed",
    label: "Partially Reviewed",
    statuses: ["partially_reviewed"],
  },
  // Everything past review, including requests already scheduled or picked up.
  {
    value: "reviewed",
    label: "Reviewed",
    statuses: [
      "approved",
      "partially_approved",
      "rejected",
      "scheduled",
      "confirmed",
      "picked_up",
    ],
  },
];

const SORT_OPTIONS = [
  {
    value: "oldest",
    label: "Date submitted (oldest)",
    sorting: [{ id: "dateSubmitted", desc: false }],
  },
  {
    value: "newest",
    label: "Date submitted (newest)",
    sorting: [{ id: "dateSubmitted", desc: true }],
  },
  {
    value: "donor_az",
    label: "Donor name (A-Z)",
    sorting: [{ id: "donorName", desc: false }],
  },
];

function rowsForTab(rows: DonationRequestRow[], tab: TabValue) {
  const statuses = TABS.find((t) => t.value === tab)?.statuses;
  return statuses ? rows.filter((row) => statuses.includes(row.status)) : rows;
}

export default function DonationRequestsPage() {
  const router = useRouter();
  const [headerSearch, setHeaderSearch] = useState("");
  const [tab, setTab] = useState<TabValue>("all");

  const { data, isLoading, error } = useDonationDetails();
  // Memoized: a new array would send the table back to page 1 on every render.
  const rows = useMemo(() => (data ?? []).map(toDonationRequestRow), [data]);
  const visibleRows = useMemo(() => rowsForTab(rows, tab), [rows, tab]);

  return (
    <SidebarAppShell sidebar={<AdminSidebar activeItem="donation-requests" />}>
      <div className="flex min-h-svh flex-col">
        <AdminHeader
          search={headerSearch}
          onSearchChange={setHeaderSearch}
          userInitials="WX"
        />

        <main className="flex w-full flex-1 flex-col gap-lg px-3xl pb-5xl">
          <h1 className="text-heading-2 font-semibold text-foreground">
            Donation Requests
          </h1>

          <DataTable
            columns={donationRequestColumns}
            data={visibleRows}
            loading={isLoading}
            error={error}
            initialColumnVisibility={donationRequestHiddenColumns}
            toolbarPlacement="outside"
            searchPlaceholder="Search for donation"
            emptyStateMessage="No donation requests found"
            sortOptions={SORT_OPTIONS}
            filters={[
              {
                columnId: "outcomes",
                title: "Filter",
                options: OUTCOME_FILTER_OPTIONS,
              },
            ]}
            toolbarLeading={
              <Tabs
                value={tab}
                onValueChange={(value: TabValue) => setTab(value)}
              >
                <TabsList>
                  {TABS.map(({ value, label }) => (
                    <TabsTrigger key={value} value={value}>
                      {`${label} (${rowsForTab(rows, value).length})`}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            }
            onRowClick={(row) => router.push(DONATION_REQUEST(row.id))}
            testId="donation-requests-table"
          />
        </main>
      </div>
    </SidebarAppShell>
  );
}
