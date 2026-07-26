"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SidebarAppShell } from "@/common/components/ui/sidebar-app-shell";
import { AdminSidebar } from "@/common/components/ui/admin-sidebar";
import { AdminHeader } from "@/common/components/layout";
import { Button } from "@/common/components/ui/button";
import { useDonationRequestStore } from "@/app/donation-request/stores/donationRequestStore";
import {
  ConfirmPickupDateDialog,
  DonationItemCard,
  DonationRequestHeader,
  DonorInformationCard,
  SchedulePickupDialog,
  ScheduledPickupCard,
  countApproved,
  deriveReviewStatus,
} from "@/app/donation-request/components";

export default function DonationRequestPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<"schedule" | "edit">(
    "schedule"
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const request = useDonationRequestStore((state) => state.request);
  const approveItem = useDonationRequestStore((state) => state.approveItem);
  const rejectItem = useDonationRequestStore((state) => state.rejectItem);
  const updateDonor = useDonationRequestStore((state) => state.updateDonor);
  const schedulePickup = useDonationRequestStore(
    (state) => state.schedulePickup
  );
  const updatePickup = useDonationRequestStore((state) => state.updatePickup);
  const confirmPickup = useDonationRequestStore((state) => state.confirmPickup);

  const reviewStatus = deriveReviewStatus(request);
  const approvedCount = countApproved(request);
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
    <SidebarAppShell sidebar={<AdminSidebar activeItem="donation-requests" />}>
      <div className="flex min-h-svh flex-col">
        <AdminHeader
          search={search}
          onSearchChange={setSearch}
          userInitials="WX"
        />

        <main className="mx-auto flex w-full max-w-[1174px] flex-1 flex-col gap-2xl px-2xl py-lg">
          <DonationRequestHeader
            request={request}
            reviewStatus={reviewStatus}
            approvedCount={approvedCount}
            totalItems={request.furniture_items.length}
            onSchedulePickup={openSchedule}
          />

          <DonorInformationCard donor={request.donor} onSave={updateDonor} />

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
                onApprove={approveItem}
                onReject={rejectItem}
              />
            ))}
          </section>
        </main>

        <nav className="mt-auto flex w-full justify-end border-t border-border px-2xl py-lg">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </nav>
      </div>

      <SchedulePickupDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        mode={scheduleMode}
        isConfirmed={Boolean(pickup?.confirmed_at)}
        defaultDate={pickup?.scheduled_date ?? ""}
        defaultNote={pickup?.note ?? ""}
        onSubmit={(date, note) =>
          scheduleMode === "edit"
            ? updatePickup(date, note)
            : schedulePickup(date, note)
        }
      />

      {pickup?.scheduled_date && (
        <ConfirmPickupDateDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          date={pickup.scheduled_date}
          onConfirm={confirmPickup}
        />
      )}
    </SidebarAppShell>
  );
}
