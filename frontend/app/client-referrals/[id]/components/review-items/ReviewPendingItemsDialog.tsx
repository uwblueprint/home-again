"use client";

import { useState, type ReactElement } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/common/components/ui/collapsible";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";

import { PendingItemRow } from "./PendingItemRow";
import {
  EMPTY_REVIEW_STATE,
  approvedItemsOf,
  buildPendingRows,
  closeReject,
  getItemState,
  hasDecisions,
  openReject,
  setReject,
  toResult,
  unapproveItem,
  type ItemReviewState,
  type ReviewRow,
  type ReviewState,
} from "./reviewState";
import type { ReviewItem, ReviewPendingItemsResult } from "./types";

export type ReviewPendingItemsDialogProps = {
  /**
   * The referral's items, one entry per item type, with pending and approved
   * unit ids. The dialog splits them into the pending list and "Approved
   * items".
   */
  items: ReviewItem[];
  /** Element that opens the dialog. Optional for controlled usage. */
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isSubmitting?: boolean;
  onConfirm?: (result: ReviewPendingItemsResult) => void;
  onCancel?: () => void;
};

export function ReviewPendingItemsDialog({
  items,
  trigger,
  open,
  onOpenChange,
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ReviewPendingItemsDialogProps) {
  const [state, setState] = useState<ReviewState>(EMPTY_REVIEW_STATE);

  const updateItem = (
    row: ReviewRow,
    update: (current: ItemReviewState) => ItemReviewState
  ) =>
    setState((prev) => ({
      ...prev,
      items: { ...prev.items, [row.id]: update(getItemState(row, prev)) },
    }));

  const unapprove = (id: string) => {
    const item = items.find((candidate) => candidate.id === id);
    if (item) setState((prev) => unapproveItem(prev, item));
  };

  const pendingRows = buildPendingRows(items, state.unapprovedIds);
  const visibleApproved = approvedItemsOf(items, state.unapprovedIds);
  const result = toResult(pendingRows, state, items);
  const canConfirm = hasDecisions(result) && !isSubmitting;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setState(EMPTY_REVIEW_STATE);
      }}
    >
      {trigger ? <DialogTrigger render={trigger} /> : null}
      {/* Capped to the screen height: the body scrolls while the title and
          the Cancel / Confirm buttons stay visible. */}
      <DialogContent className="max-h-[90dvh] sm:max-w-3xl">
        <DialogHeader className="after:hidden">
          <DialogTitle>Review Pending Items</DialogTitle>
          <DialogDescription className="text-paragraph-small">
            Approve or reject furniture items in this request. You can come back
            at a later time to complete the request.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="min-h-0 gap-xl overflow-y-auto">
          {pendingRows.length > 0 ? (
            <ul
              aria-label="Pending items"
              className="flex flex-col gap-md rounded-lg border border-border p-md"
            >
              {pendingRows.map((item) => (
                <PendingItemRow
                  key={item.id}
                  item={item}
                  state={getItemState(item, state)}
                  onApproveChange={(approve) =>
                    updateItem(item, (current) => ({ ...current, approve }))
                  }
                  onRejectChange={(reject) =>
                    updateItem(item, (current) =>
                      setReject(item, current, reject)
                    )
                  }
                  onToggleReject={() =>
                    updateItem(item, (current) =>
                      current.rejectOpen
                        ? closeReject(current)
                        : openReject(item, current)
                    )
                  }
                  onToggleHeld={() =>
                    updateItem(item, (current) => ({
                      ...current,
                      heldOpen: !current.heldOpen,
                    }))
                  }
                />
              ))}
            </ul>
          ) : (
            <p className="text-paragraph-small text-muted-foreground">
              No items are waiting for review.
            </p>
          )}

          {visibleApproved.length > 0 ? (
            <ApprovedItemsSection
              items={visibleApproved}
              onUnapprove={unapprove}
            />
          ) : null}
        </DialogBody>

        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button disabled={!canConfirm} onClick={() => onConfirm?.(result)}>
            {isSubmitting ? "Confirming..." : "Confirm review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ApprovedItemsSectionProps = {
  items: ReviewItem[];
  onUnapprove: (id: string) => void;
};

function ApprovedItemsSection({
  items,
  onUnapprove,
}: ApprovedItemsSectionProps) {
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="group/approved flex cursor-pointer items-center gap-xs text-paragraph-large font-semibold text-foreground">
        Approved items in this request
        <ChevronDown
          aria-hidden="true"
          className="size-5 transition-transform duration-300 ease-in-out group-data-panel-open/approved:rotate-180"
          strokeWidth={1.75}
        />
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <ul className="mt-md flex flex-col gap-sm rounded-lg border border-border p-md">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-md">
              <span className="text-paragraph-regular text-foreground">
                {item.approvedUnitIds.length} {item.name}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="xs"
                className="ml-auto"
                onClick={() => onUnapprove(item.id)}
              >
                Unapprove
              </Button>
            </li>
          ))}
        </ul>
      </CollapsiblePanel>
    </Collapsible>
  );
}
