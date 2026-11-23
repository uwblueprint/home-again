"use client";

import { isAxiosError } from "axios";
import { notFound, useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { SidebarAppShell } from "@/common/components/ui/sidebar-app-shell";
import { AdminSidebar } from "@/common/components/ui/admin-sidebar";
import { AdminHeader } from "@/common/components/layout";
import { Button } from "@/common/components/ui/button";
import { Skeleton } from "@/common/components/ui/skeleton";
import { useDonationRequestStore } from "@/app/donation-request/stores/donationRequestStore";
import {
  ConfirmPickupDateDialog,
  DonationItemCard,
  DonationItemCardSkeleton,
  DonationRequestHeader,
  DonationRequestHeaderSkeleton,
  DonorInformationCard,
  DonorInformationCardSkeleton,
  SchedulePickupDialog,
  ScheduledPickupCard,
  countApproved,
  deriveDonationReviewStatus,
  toDonationRequest,
  type DonationRequest,
} from "@/app/donation-request/components";
import { useDonationDetail } from "@/common/hooks/useApi";
import type { DonationDetail, DonationReviewStatus } from "@/common/types";

/** The page body's loading state; the shell stays rendered around it. */
function PageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading donation request"
      className="flex flex-col gap-2xl"
    >
      <DonationRequestHeaderSkeleton />
      <DonorInformationCardSkeleton />
      <section className="flex flex-col gap-lg">
        <Skeleton className="h-7 w-44" />
        <DonationItemCardSkeleton />
        <DonationItemCardSkeleton />
      </section>
    </div>
  );
}

interface ReviewSummary {
  reviewStatus: DonationReviewStatus;
  approvedCount: number;
  itemCount: number;
}

/**
 * The header's status. The server's derived fields are the source of truth,
 * but review edits are still local-only, so once the store holds an edited copy
 * (or there's no fetched donation, as with the list's sample requests) the
 * status is derived from that copy instead.
 */
function reviewSummary(
  request: DonationRequest,
  donation: DonationDetail | undefined,
  edited: boolean
): ReviewSummary {
  if (donation && !edited) {
    return {
      reviewStatus: donation.review_status,
      approvedCount: donation.approved_count,
      itemCount: donation.item_count,
    };
  }
  return {
    reviewStatus: deriveDonationReviewStatus(
      request,
      donation?.status === "completed"
    ),
    approvedCount: countApproved(request),
    itemCount: request.furniture_items.length,
  };
}

export default function DonationRequestPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");

  const { data: donation, error } = useDonationDetail(id);
  // Unsaved review edits live in the store, keyed by id, and win over the
  // fetched copy, so a refetch or remount can't wipe them.
  const edited = useDonationRequestStore((state) => state.requests[id]);
  const fetched = useMemo(
    () => (donation ? toDonationRequest(donation) : undefined),
    [donation]
  );
  const request = edited ?? fetched;

  if (!request && isAxiosError(error) && error.response?.status === 404) {
    notFound();
  }

  return (
    <SidebarAppShell sidebar={<AdminSidebar activeItem="donation-requests" />}>
      <div className="flex min-h-svh flex-col">
        <AdminHeader
          search={search}
          onSearchChange={setSearch}
          userInitials="WX"
        />

        {request ? (
          // Keyed so dialog state never carries over to another donation.
          <DonationRequestReview
            key={request.id}
            request={request}
            summary={reviewSummary(request, donation, Boolean(edited))}
          />
        ) : (
          <main className="mx-auto flex w-full max-w-[1174px] flex-1 flex-col px-2xl py-lg">
            {error ? (
              <p
                role="alert"
                className="text-paragraph-regular text-muted-foreground"
              >
                We couldn&apos;t load this donation request.
              </p>
            ) : (
              <PageSkeleton />
            )}
          </main>
        )}

        <nav className="mt-auto flex w-full justify-end border-t border-border px-2xl py-lg">
          <Button variant="secondary" onClick={() => router.back()}>
            Back
          </Button>
        </nav>
      </div>
    </SidebarAppShell>
  );
}

function DonationRequestReview({
  request,
  summary,
}: {
  request: DonationRequest;
  summary: ReviewSummary;
}) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<"schedule" | "edit">(
    "schedule"
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const addRequest = useDonationRequestStore((state) => state.addRequest);
  const approveItem = useDonationRequestStore((state) => state.approveItem);
  const rejectItem = useDonationRequestStore((state) => state.rejectItem);
  const updateDonor = useDonationRequestStore((state) => state.updateDonor);
  const schedulePickup = useDonationRequestStore(
    (state) => state.schedulePickup
  );
  const updatePickup = useDonationRequestStore((state) => state.updatePickup);
  const confirmPickup = useDonationRequestStore((state) => state.confirmPickup);

  // The first edit copies the fetched request into the store; later edits
  // change that copy (addRequest is a no-op once it's there).
  const edit =
    <A extends unknown[]>(action: (requestId: string, ...args: A) => void) =>
    (...args: A) => {
      addRequest(request);
      action(request.id, ...args);
    };

  const { pickup } = request;

  const openSchedule = () => {
    setScheduleMode("schedule");
    setScheduleOpen(true);
  };
  const openEdit = () => {
    setScheduleMode("edit");
    setScheduleOpen(true);
  };

  return (
    <>
      <main className="mx-auto flex w-full max-w-[1174px] flex-1 flex-col gap-2xl px-2xl py-lg">
        <DonationRequestHeader
          request={request}
          reviewStatus={summary.reviewStatus}
          approvedCount={summary.approvedCount}
          totalItems={summary.itemCount}
          onSchedulePickup={openSchedule}
        />

        <DonorInformationCard
          donor={request.donor}
          onSave={edit(updateDonor)}
        />

        {pickup?.scheduled_date && (
          <ScheduledPickupCard
            pickup={pickup}
            onEdit={openEdit}
            onConfirm={() => setConfirmOpen(true)}
          />
        )}

        <section className="flex flex-col gap-lg">
          <h2 className="text-heading-3 font-semibold text-foreground">
            {request.furniture_items.length} Items Donated
          </h2>
          {request.furniture_items.map((item) => (
            <DonationItemCard
              key={item.id}
              item={item}
              onApprove={edit(approveItem)}
              onReject={edit(rejectItem)}
            />
          ))}
        </section>
      </main>

      <SchedulePickupDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        mode={scheduleMode}
        isConfirmed={Boolean(pickup?.confirmed_at)}
        defaultDate={pickup?.scheduled_date ?? ""}
        defaultNote={pickup?.note ?? ""}
        onSubmit={
          scheduleMode === "edit" ? edit(updatePickup) : edit(schedulePickup)
        }
      />

      {pickup?.scheduled_date && (
        <ConfirmPickupDateDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          date={pickup.scheduled_date}
          onConfirm={edit(confirmPickup)}
        />
      )}
    </>
  );
}
