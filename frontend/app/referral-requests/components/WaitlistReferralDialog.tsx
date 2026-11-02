"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/common/components/ui/button";
import { Checkbox } from "@/common/components/ui/checkbox";
import { DialogClose } from "@/common/components/ui/dialog";
import { Separator } from "@/common/components/ui/separator";

import ReferralDialogLayout, {
  type ReferralDialogReferral,
} from "./ReferralDialogLayout";

// TYPES
export type WaitlistReferralDialogProps = {
  trigger?: ReactNode;
  referral: ReferralDialogReferral;
  /** Whether the agent flagged this referral as high priority. Pre-checks the box. */
  isPriority?: boolean;
  /** The agent's stated reason for the priority flag. */
  priorityReason?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called with the admin's final decision on the priority flag. */
  onConfirm?: (isPriority: boolean) => void;
  onCancel?: () => void;
};

// DIALOG
export default function WaitlistReferralDialog({
  trigger,
  referral,
  isPriority = false,
  priorityReason,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: WaitlistReferralDialogProps) {
  const [confirmedPriority, setConfirmedPriority] = useState(isPriority);

  return (
    <ReferralDialogLayout
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      // Reset only after the exit animation, so content doesn't change mid-fade.
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setConfirmedPriority(isPriority);
      }}
      title="Waitlist Referral Request"
      description="This referral will move to the waitlist. The case agents on this request will be notified."
      referral={referral}
      footer={
        <>
          <DialogClose render={<Button variant="outline" onClick={onCancel} />}>
            Cancel
          </DialogClose>
          <DialogClose
            render={<Button onClick={() => onConfirm?.(confirmedPriority)} />}
          >
            Confirm and waitlist
          </DialogClose>
        </>
      }
    >
      <Separator />

      <section className="flex flex-col gap-2.5">
        <p className="text-paragraph-regular font-semibold text-foreground">
          Confirm Priority
        </p>
        {priorityReason ? (
          <p className="text-sm font-normal text-muted-foreground">
            Priority Reason: {priorityReason}
          </p>
        ) : null}
        <label className="flex cursor-pointer items-center gap-sm text-base font-medium text-foreground">
          <Checkbox
            checked={confirmedPriority}
            onCheckedChange={(checked) =>
              setConfirmedPriority(checked === true)
            }
          />
          This referral is high priority
        </label>
      </section>
    </ReferralDialogLayout>
  );
}
