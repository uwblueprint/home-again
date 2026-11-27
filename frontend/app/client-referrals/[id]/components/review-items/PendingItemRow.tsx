"use client";

import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";

import { StockItemChip } from "@/common/components/data-display";
import { SelectAndCombo } from "@/common/components/forms";
import { Button } from "@/common/components/ui/button";
import { REFERRAL_REQUEST } from "@/common/constants/Routes";

import {
  approveMax,
  heldCount,
  quantityOf,
  rejectMax,
  type ItemReviewState,
  type ReviewRow,
} from "./reviewState";
import type { HeldByReferral } from "./types";

type PendingItemRowProps = {
  item: ReviewRow;
  state: ItemReviewState;
  onApproveChange: (next: number) => void;
  onRejectChange: (next: number) => void;
  onToggleReject: () => void;
  onToggleHeld: () => void;
};

export function PendingItemRow({
  item,
  state,
  onApproveChange,
  onRejectChange,
  onToggleReject,
  onToggleHeld,
}: PendingItemRowProps) {
  const quantity = quantityOf(item);
  const held = heldCount(item);
  const heldBy = item.heldBy ?? [];

  return (
    <li className="flex flex-col gap-xs">
      <div className="flex flex-wrap items-center gap-x-md gap-y-xs">
        <div className="flex min-w-0 flex-wrap items-center gap-sm">
          <span className="text-paragraph-regular text-foreground">
            {quantity} {item.name}
          </span>
          <StockItemChip stock={item.stock} quantity={quantity} />
          {held > 0 ? (
            <button
              type="button"
              onClick={onToggleHeld}
              disabled={heldBy.length === 0}
              aria-expanded={heldBy.length > 0 ? state.heldOpen : undefined}
              aria-label={`${held} held by other referrals`}
              className="cursor-pointer rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default"
            >
              <StockItemChip stock={held} variant="held" />
            </button>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-sm">
          {item.stock > 0 ? (
            <div
              role="group"
              aria-label={`Approve ${item.name}`}
              className="flex items-center gap-sm text-paragraph-small"
            >
              <span className="text-foreground">Approve:</span>
              <SelectAndCombo
                value={state.approve}
                onChange={onApproveChange}
                min={0}
                max={approveMax(item, state)}
              />
            </div>
          ) : null}
          <Button
            type="button"
            size="xs"
            variant={state.rejectOpen ? "default" : "secondary"}
            aria-pressed={state.rejectOpen}
            aria-label={`Reject ${item.name}`}
            onClick={onToggleReject}
          >
            Reject…
          </Button>
        </div>
      </div>

      {state.rejectOpen ? (
        <RejectQuantityPanel
          itemName={item.name}
          value={state.reject}
          max={rejectMax(item)}
          onChange={onRejectChange}
          onCancel={onToggleReject}
        />
      ) : null}

      {state.heldOpen && heldBy.length > 0 ? (
        <HeldByPanel
          itemName={item.name}
          referrals={heldBy}
          onClose={onToggleHeld}
        />
      ) : null}
    </li>
  );
}

type RejectQuantityPanelProps = {
  itemName: string;
  value: number;
  max: number;
  onChange: (next: number) => void;
  onCancel: () => void;
};

function RejectQuantityPanel({
  itemName,
  value,
  max,
  onChange,
  onCancel,
}: RejectQuantityPanelProps) {
  return (
    <div
      role="group"
      aria-label={`Reject quantity for ${itemName}`}
      className="flex flex-wrap items-center gap-x-md gap-y-xs rounded-lg bg-(--brand-purples-50) px-sm py-xs text-paragraph-small"
    >
      <span className="text-foreground">Reject quantity:</span>
      <SelectAndCombo value={value} onChange={onChange} min={1} max={max} />
      <span className="text-muted-foreground">
        Remaining items will stay pending
      </span>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="ml-auto"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
}

type HeldByPanelProps = {
  itemName: string;
  referrals: HeldByReferral[];
  onClose: () => void;
};

function HeldByPanel({ itemName, referrals, onClose }: HeldByPanelProps) {
  return (
    <div className="flex items-end gap-md rounded-lg bg-orange-50 px-sm py-xs text-paragraph-small">
      <ul
        aria-label={`Referrals holding ${itemName}`}
        className="flex max-h-32 min-w-0 flex-1 flex-col gap-xs overflow-y-auto"
      >
        {referrals.map((referral) => (
          <li
            key={referral.referralId}
            className="flex min-w-0 items-center gap-sm py-1"
          >
            <Link
              href={REFERRAL_REQUEST(referral.referralId)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${referral.clientName}'s referral in a new tab`}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <SquareArrowOutUpRight aria-hidden="true" className="size-4" />
            </Link>
            <span className="shrink-0 text-foreground">
              {referral.clientName}
            </span>
            <span className="truncate text-muted-foreground">
              {referral.referralId}
            </span>
            <span aria-hidden="true" className="text-muted-foreground">
              •
            </span>
            <span className="shrink-0 text-muted-foreground">
              {referral.units} {referral.units === 1 ? "unit" : "units"}{" "}
              approved and unconfirmed
            </span>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" size="xs" onClick={onClose}>
        Close
      </Button>
    </div>
  );
}
