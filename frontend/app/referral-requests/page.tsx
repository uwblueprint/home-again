"use client";

import { useState } from "react";

import { Button } from "@/common/components/ui/button";
import { RejectReferralDialog, WaitlistReferralDialog } from "./components";
import type { ReferralDialogReferral } from "./components/ReferralDialogLayout";

const REFERRAL: ReferralDialogReferral = {
  clientName: "John Doe",
  referralId: "WCYIECNIE",
  submittedAt: "09/20/25",
  previousSubmissionAt: "01/02/2025",
  agents: [
    {
      firstName: "Kim",
      lastName: "Soo",
      role: "primary",
      email: "kim@agency.com",
      phone: "(+1) 647 123 4567",
    },
    {
      firstName: "Wendy",
      lastName: "Xu",
      role: "secondary",
      email: "wendy@agency.com",
      phone: "(+1) 647 123 4567",
    },
  ],
};

const PRIORITY_REASON =
  "Client is currently in a shelter, needs furniture before move-out date on 10/01.";

export default function ReferralRequestPage() {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [isPriority, setIsPriority] = useState(true);
  const [result, setResult] = useState("No action yet");

  return (
    <main className="mx-auto flex w-full max-w-[1174px] flex-col gap-lg px-2xl py-lg">
      <div className="flex gap-sm">
        <Button variant="secondary" onClick={() => setRejectOpen(true)}>
          Reject
        </Button>
        <Button onClick={() => setWaitlistOpen(true)}>Waitlist</Button>
      </div>

      <p className="text-paragraph-small text-muted-foreground">
        Last action: {result} (priority: {isPriority ? "yes" : "no"})
      </p>

      <RejectReferralDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        referral={REFERRAL}
        onConfirm={(reason, details) =>
          setResult(`Rejected: ${reason}${details ? `: ${details}` : ""}`)
        }
        onCancel={() => setResult("Reject cancelled")}
      />

      <WaitlistReferralDialog
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
        referral={REFERRAL}
        isPriority={isPriority}
        priorityReason={PRIORITY_REASON}
        onConfirm={(next) => {
          setIsPriority(next);
          setResult(`Waitlisted, priority: ${next ? "yes" : "no"}`);
        }}
        onCancel={() => setResult("Waitlist cancelled")}
      />
    </main>
  );
}
