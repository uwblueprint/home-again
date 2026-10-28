"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/common/components/ui/button";
import { DialogClose } from "@/common/components/ui/dialog";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Textarea } from "@/common/components/ui/textarea";

import ReferralDialogLayout, {
  type ReferralDialogReferral,
} from "./ReferralDialogLayout";

// TYPES
export type ReferralRejectReason = {
  value: string;
  label: string;
  /** When selected, reveals the free-text field. Defaults to true for value "other". */
  requiresDetails?: boolean;
};

export type RejectReferralDialogProps = {
  trigger?: ReactNode;
  referral: ReferralDialogReferral;
  reasons?: ReferralRejectReason[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: (reason: string, details?: string) => void;
  onCancel?: () => void;
};

// CONFIG
// TODO: replace with the backend's referral rejection reasons once they exist.
export const DEFAULT_REFERRAL_REJECT_REASONS: ReferralRejectReason[] = [
  { value: "duplicate", label: "Submitted a referral this year already" },
  { value: "location", label: "Location outside service area" },
  { value: "incomplete", label: "Incomplete information" },
  { value: "other", label: "Other", requiresDetails: true },
];

const MAX_DETAILS_LENGTH = 500;

// DIALOG
export default function RejectReferralDialog({
  trigger,
  referral,
  reasons = DEFAULT_REFERRAL_REJECT_REASONS,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: RejectReferralDialogProps) {
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");

  const requiresDetails = (value: string | null) => {
    const match = reasons.find((r) => r.value === value);
    return match?.requiresDetails ?? match?.value === "other";
  };

  const needsDetails = requiresDetails(reason);
  const isValid =
    reason !== null && (!needsDetails || details.trim().length > 0);

  const reset = () => {
    setReason(null);
    setDetails("");
  };

  return (
    <ReferralDialogLayout
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      // Reset only after the exit animation, so the textarea doesn't vanish
      // and shrink the dialog mid-fade.
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) reset();
      }}
      title="Reject Referral Request"
      referral={referral}
      footer={
        <>
          <DialogClose render={<Button variant="outline" onClick={onCancel} />}>
            Cancel
          </DialogClose>
          <DialogClose
            render={
              <Button
                disabled={!isValid}
                onClick={() =>
                  reason &&
                  onConfirm?.(reason, needsDetails ? details : undefined)
                }
              />
            }
          >
            Confirm and reject
          </DialogClose>
        </>
      }
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="reject-referral-reason">Reason for rejection</Label>
        <Select
          items={reasons}
          value={reason}
          onValueChange={(value) => {
            if (!value) return;
            const next = value as string;
            setReason(next);
            // Drop typed details once the new reason no longer needs them.
            if (!requiresDetails(next)) setDetails("");
          }}
        >
          <SelectTrigger id="reject-referral-reason" className="w-full">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {reasons.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {needsDetails && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="reject-referral-details">
            Please indicate reason below
            <span className="text-destructive"> *</span>
          </Label>
          <Textarea
            id="reject-referral-details"
            placeholder="Type your message here."
            value={details}
            maxLength={MAX_DETAILS_LENGTH}
            onChange={(event) => setDetails(event.target.value)}
          />
          <p className="self-end text-paragraph-mini text-muted-foreground">
            {details.length}/{MAX_DETAILS_LENGTH} characters
          </p>
        </div>
      )}
    </ReferralDialogLayout>
  );
}
