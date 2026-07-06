"use client";

import { useState, type ReactElement, type ReactNode } from "react";

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Textarea } from "@/common/components/ui/textarea";
import { DonationItemPreview, type DonationItem } from "./DonationItemPreview";

export type RejectReason = {
  value: string;
  label: string;
  /** When selected, reveals the free-text field. Defaults to true for value "other". */
  requiresDetails?: boolean;
};

export const DEFAULT_REJECT_REASONS: RejectReason[] = [
  { value: "condition", label: "Item condition not suitable" },
  { value: "pickup", label: "Unable to arrange pickup" },
  { value: "location", label: "Location outside service area" },
  { value: "other", label: "Other", requiresDetails: true },
];

const MAX_DETAILS_LENGTH = 500;

export type RejectItemDialogProps = {
  /** Element that opens the dialog (e.g. a Button). Optional for controlled usage. */
  trigger?: ReactNode;
  item: DonationItem;
  reasons?: RejectReason[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: (reason: string, details?: string) => void;
  onCancel?: () => void;
};

function RejectItemDialog({
  trigger,
  item,
  reasons = DEFAULT_REJECT_REASONS,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: RejectItemDialogProps) {
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");

  const selectedReason = reasons.find((r) => r.value === reason);
  const needsDetails =
    selectedReason?.requiresDetails ?? selectedReason?.value === "other";
  const isValid =
    reason !== null && (!needsDetails || details.trim().length > 0);

  const reset = () => {
    setReason(null);
    setDetails("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange?.(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger render={trigger as ReactElement} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Item</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DonationItemPreview {...item} />

          <div className="flex flex-col gap-1">
            <Label htmlFor="reject-reason">Reason for rejection</Label>
            <Select
              items={reasons}
              value={reason ?? undefined}
              onValueChange={(value) => value && setReason(value as string)}
            >
              <SelectTrigger id="reject-reason" className="w-full">
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
              <Label htmlFor="reject-details">
                Please Indicate Reason Below
                <span className="text-destructive"> *</span>
              </Label>
              <Textarea
                id="reject-details"
                placeholder="Type your message here."
                value={details}
                maxLength={MAX_DETAILS_LENGTH}
                onChange={(event) => setDetails(event.target.value)}
              />
              <p className="self-end text-paragraph-mini text-muted-foreground">
                {details.length}/{MAX_DETAILS_LENGTH} Characters
              </p>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { RejectItemDialog };
