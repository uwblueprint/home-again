"use client";

import { type ReactElement, type ReactNode } from "react";

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
import { DonationItemPreview, type DonationItem } from "./DonationItemPreview";

export type ApproveItemDialogProps = {
  /** Element that opens the dialog (e.g. a Button). Optional for controlled usage. */
  trigger?: ReactNode;
  item: DonationItem;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
};

function ApproveItemDialog({
  trigger,
  item,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: ApproveItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger render={trigger as ReactElement} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Item</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DonationItemPreview {...item} />
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" onClick={onCancel} />}>
            Cancel
          </DialogClose>
          <DialogClose render={<Button onClick={onConfirm} />}>
            Confirm and approve
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ApproveItemDialog };
