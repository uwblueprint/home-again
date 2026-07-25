"use client";

import { Check, SquarePen } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import {
  ConfirmedBadge,
  UnconfirmedBadge,
} from "@/common/components/status-labels";
import { InformationBlock } from "@/common/components/data-display";
import { formatDate } from "@/common/utils/DateUtils";
import type { DonationPickup } from "./types";

interface ScheduledPickupCardProps {
  pickup: DonationPickup;
  onEdit: () => void;
  onConfirm: () => void;
}

/**
 * Summary of a scheduled pickup with its confirmation state. Shows Edit always,
 * and Confirm Date only while the pickup is still unconfirmed.
 */
function ScheduledPickupCard({
  pickup,
  onEdit,
  onConfirm,
}: ScheduledPickupCardProps) {
  const isConfirmed = Boolean(pickup.confirmed_at);

  return (
    <div className="flex w-full flex-col gap-lg rounded-xl border border-[var(--unofficial-border-3)] bg-background px-2xl py-xl shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between">
        <p className="text-heading-4 font-semibold text-foreground">
          Scheduled Pickup
        </p>
        {isConfirmed ? <ConfirmedBadge /> : <UnconfirmedBadge />}
      </div>

      <InformationBlock
        label="Date"
        value={pickup.scheduled_date ? formatDate(pickup.scheduled_date) : "—"}
      />

      <div className="flex items-center gap-sm">
        <Button variant="outline" onClick={onEdit}>
          Edit
          <SquarePen />
        </Button>
        {!isConfirmed && (
          <Button variant="outline" onClick={onConfirm}>
            Confirm Date
            <Check />
          </Button>
        )}
      </div>
    </div>
  );
}

export { ScheduledPickupCard };
