"use client";

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { InformationBlock } from "@/common/components/data-display";
import { formatDate } from "@/common/utils/DateUtils";

interface ConfirmPickupDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** ISO date being confirmed. */
  date: string;
  onConfirm: () => void;
}

/**
 * Final confirmation before notifying the donor of the scheduled pickup date.
 */
function ConfirmPickupDateDialog({
  open,
  onOpenChange,
  date,
  onConfirm,
}: ConfirmPickupDateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Pickup Date</DialogTitle>
          <DialogDescription>
            A confirmation email will be sent to the donor with the chosen
            pickup date.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <InformationBlock label="Selected Date" value={formatDate(date)} />
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <DialogClose render={<Button onClick={onConfirm} />}>
            Confirm and Send
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ConfirmPickupDateDialog };
