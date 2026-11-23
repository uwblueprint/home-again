"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  OUTCOME_FILTER_OPTIONS,
  donationRequestColumns,
  donationRequestHiddenColumns,
  toDonationRequestRow,
  type DonationRequestRow,
  type ReviewStatus,
} from "@/app/donation-request/components";
import { useDonationRequestStore } from "@/app/donation-request/stores/donationRequestStore";
import { DataTable } from "@/common/components/data-display";
import { AdminHeader } from "@/common/components/layout";
import { AdminSidebar } from "@/common/components/ui/admin-sidebar";
import { SidebarAppShell } from "@/common/components/ui/sidebar-app-shell";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { DONATION_REQUEST } from "@/common/constants";

type TabValue = "all" | "pending" | "partially_reviewed" | "reviewed";

/** Tabs in display order, with the review statuses each one shows. */
const TABS: { value: TabValue; label: string; statuses?: ReviewStatus[] }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending", statuses: ["pending_review"] },
  {
    value: "partially_reviewed",
    label: "Partially Reviewed",
    statuses: ["partially_reviewed"],
  },
  // A scheduled request has finished review, so it lives under Reviewed.
  { value: "reviewed", label: "Reviewed", statuses: ["reviewed", "scheduled"] },
];

function rowsForTab(rows: DonationRequestRow[], tab: TabValue) {
  const statuses = TABS.find((t) => t.value === tab)?.statuses;
  return statuses ? rows.filter((row) => statuses.includes(row.status)) : rows;
}

export default function DonationRequestsPage() {
  const router = useRouter();
  const [headerSearch, setHeaderSearch] = useState("");
  const [tab, setTab] = useState<TabValue>("all");

  // Read from the review store so approvals made on the detail page show up
  // here. Swap for the API's requests once GET /donations is wired up.
  const requests = useDonationRequestStore((state) => state.requests);
  // Oldest first until a column header's sort arrow is clicked.
  const rows = useMemo(
    () =>
      Object.values(requests)
        .map(toDonationRequestRow)
        .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)),
    [requests]
  );
  // Memoized: a new array would send the table back to page 1 on every render.
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
            initialColumnVisibility={donationRequestHiddenColumns}
            toolbarPlacement="outside"
            searchPlaceholder="Search for donation"
            emptyStateMessage="No donation requests found"
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
