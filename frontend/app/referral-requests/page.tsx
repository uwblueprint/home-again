"use client";

import { useMemo, useState } from "react";
import { PAGE_SIZE, REVIEW_FILTERS, TABS } from "./constants";
import { useClientReferrals } from "./hooks";
import {
  DataTablePagination,
} from "@/common/components/data-display";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import {
  ReferralList,
  ReferralToolbar,
  RejectReferralDialog,
  WaitlistReferralDialog,
} from "./components";
import type { ClientReferral, ReferralTab, ReviewFilter } from "./types";
import {
  matchesQuery,
  matchesReviewFilter,
  sortBySubmissionDate,
} from "./utils";

function toDialogReferral(referral: ClientReferral) {
  return {
    clientName: referral.clientName,
    referralId: referral.referralId,
    submittedAt: referral.submittedAt,
    previousSubmissionAt: referral.previousSubmissionAt,
    agents: referral.agents.map((agent) => ({
      firstName: agent.firstName,
      lastName: agent.lastName,
      role: agent.role,
    })),
  };
}

export default function ClientReferralsPage() {
  const { referrals, isLoading, isError, waitlist, reject } =
    useClientReferrals();

  const [tab, setTab] = useState<ReferralTab>("new");
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [query, setQuery] = useState("");
  const [sortDescending, setSortDescending] = useState(true);
  const [page, setPage] = useState(1);
  const [waitlistTarget, setWaitlistTarget] = useState<ClientReferral | null>(
    null
  );
  const [rejectTarget, setRejectTarget] = useState<ClientReferral | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const byTab = useMemo(
    () => ({
      new: referrals.filter((r) => r.tab === "new"),
      waitlisted: referrals.filter((r) => r.tab === "waitlisted"),
      rejected: referrals.filter((r) => r.tab === "rejected"),
    }),
    [referrals]
  );

  const tabCounts = {
    new: byTab.new.length,
    waitlisted: byTab.waitlisted.length,
    rejected: byTab.rejected.length,
  };

  const reviewCounts: Record<ReviewFilter, number> = {
    all: byTab.waitlisted.length,
    "pending-review": byTab.waitlisted.filter(
      (r) => r.reviewStatus === "pending-review"
    ).length,
    "partially-reviewed": byTab.waitlisted.filter(
      (r) => r.reviewStatus === "partially-reviewed"
    ).length,
    reviewed: byTab.waitlisted.filter((r) => r.reviewStatus === "reviewed")
      .length,
  };

  const filtered = useMemo(() => {
    const matchingReferrals = byTab[tab].filter(
      (r) =>
        matchesQuery(r, query) &&
        (tab !== "waitlisted" || matchesReviewFilter(r, reviewFilter))
    );
    return sortBySubmissionDate(matchingReferrals, sortDescending);
  }, [byTab, tab, query, reviewFilter, sortDescending]);

  // Design paginates the waitlisted tab only.
  const paginated = tab === "waitlisted";
  const visible = paginated
    ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : filtered;

  const changeTab = (next: ReferralTab) => {
    setTab(next);
    setReviewFilter("all");
    setPage(1);
  };

  const handleWaitlist = async (
    referral: ClientReferral,
    isPriority: boolean,
    priorityDescription?: string
  ) => {
    setActionError(null);
    try {
      await waitlist(referral.id, isPriority, priorityDescription);
      setWaitlistTarget(null);
    } catch {
      setActionError("Unable to waitlist this referral. Please try again.");
    }
  };

  const handleReject = async (
    referral: ClientReferral,
    reason: string,
    details?: string
  ) => {
    setActionError(null);
    try {
      const rejectionReason =
        reason === "other" ? (details?.trim() ?? "") : reason;
      await reject(referral.id, rejectionReason);
      setRejectTarget(null);
    } catch {
      setActionError("Unable to reject this referral. Please try again.");
    }
  };

  return (
    <div className="mx-auto flex max-w-275 flex-col px-xl py-xl">
      <div className="flex flex-col gap-5">
        <p className="text-black text-3xl font-semibold leading-8">
          Client Referrals
        </p>
        {isError && (
          <p role="alert" className="text-paragraph-small text-destructive">
            Unable to load referrals.
          </p>
        )}
        {actionError && (
          <p role="alert" className="text-paragraph-small text-destructive">
            {actionError}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Tabs
            value={tab}
            onValueChange={(value) => {
              const nextTab = TABS.find((item) => item.key === value)?.key;
              if (nextTab) changeTab(nextTab);
            }}
          >
            <TabsList aria-label="Referral status">
              {TABS.map(({ key, label }) => (
                <TabsTrigger key={key} value={key}>
                  {label} ({tabCounts[key]})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <ReferralToolbar
            query={query}
            onQueryChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            onSort={() => {
              setSortDescending((descending) => !descending);
              setPage(1);
            }}
          />
        </div>
        {tab === "waitlisted" && (
          <Tabs
            value={reviewFilter}
            onValueChange={(value) => {
              const nextFilter = REVIEW_FILTERS.find(
                (filter) => filter.key === value
              )?.key;
              if (nextFilter) {
                setReviewFilter(nextFilter);
                setPage(1);
              }
            }}
          >
            <TabsList variant="segmented" aria-label="Review status">
              {REVIEW_FILTERS.map(({ key, label }) => (
                <TabsTrigger key={key} value={key}>
                  {label} ({reviewCounts[key]})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>
      {isLoading ? (
        <p className="py-12 text-center text-paragraph-regular text-muted-foreground">
          Loading...
        </p>
      ) : (
        <div className="py-2xl">
          <ReferralList
            referrals={visible}
            onWaitlist={setWaitlistTarget}
            onReject={setRejectTarget}
            onViewDetails={() => {
              /* TODO: navigate to referral details */
            }}
          />
        </div>
      )}

      {waitlistTarget ? (
        <WaitlistReferralDialog
          open
          onOpenChange={(open) => {
            if (!open) setWaitlistTarget(null);
          }}
          referral={toDialogReferral(waitlistTarget)}
          isPriority={waitlistTarget.isPriority}
          priorityReason={waitlistTarget.priorityDescription}
          onConfirm={(isPriority) =>
            void handleWaitlist(
              waitlistTarget,
              isPriority,
              waitlistTarget.priorityDescription
            )
          }
        />
      ) : null}

      {rejectTarget ? (
        <RejectReferralDialog
          open
          onOpenChange={(open) => {
            if (!open) setRejectTarget(null);
          }}
          referral={toDialogReferral(rejectTarget)}
          onConfirm={(reason, details) =>
            void handleReject(rejectTarget, reason, details)
          }
        />
      ) : null}

      {paginated && (
        <DataTablePagination
          pageIndex={page - 1}
          pageCount={Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
          pageSize={PAGE_SIZE}
          totalRows={filtered.length}
          onPageChange={(nextPage) => setPage(nextPage + 1)}
        />
      )}
    </div>
  );
}
