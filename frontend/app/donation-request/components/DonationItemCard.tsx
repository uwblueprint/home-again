"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import {
  ApprovedBadge,
  RejectedBadge,
} from "@/common/components/status-labels";
import {
  PhotoStrip,
  PhotoLightboxDialog,
} from "@/common/components/data-display";
import { InformationBlock } from "@/common/components/data-display";
import { ApproveItemDialog } from "./ApproveItemDialog";
import { RejectItemDialog, DEFAULT_REJECT_REASONS } from "./RejectItemDialog";
import type { DonationItem } from "./DonationItemPreview";
import type { DonationRequestItem, RejectionReason } from "./types";

interface DonationItemCardProps {
  item: DonationRequestItem;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string, reason: RejectionReason, details?: string) => void;
}

const reasonLabel = (reason: RejectionReason | null): string => {
  if (!reason) return "—";
  return (
    DEFAULT_REJECT_REASONS.find((r) => r.value === reason)?.label ?? reason
  );
};

function DonationItemCard({
  item,
  onApprove,
  onReject,
}: DonationItemCardProps) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const dialogItem: DonationItem = {
    title: item.name,
    condition: item.condition,
    imageSrc: item.photos[0]?.url,
  };

  const photos = item.photos.map((photo, i) => ({
    url: photo.url,
    alt: `${item.name} photo ${i + 1}`,
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="flex w-full flex-col gap-lg rounded-xl border border-[var(--unofficial-border-3)] bg-background px-2xl py-xl">
      <div className="flex items-start justify-between gap-lg">
        <div className="flex flex-col gap-lg">
          <div className="flex flex-col gap-3">
            <p className="text-heading-4 font-semibold text-foreground">
              {item.name}
            </p>
            <p className="text-paragraph-small text-muted-foreground">
              {item.condition}
            </p>
          </div>

          {item.status === "APPROVED" ? (
            <ApprovedBadge />
          ) : item.status === "REJECTED" ? (
            <RejectedBadge />
          ) : (
            <div className="flex items-center gap-sm">
              <Button variant="secondary" onClick={() => setRejectOpen(true)}>
                <X />
                Reject
              </Button>
              <Button onClick={() => setApproveOpen(true)}>
                <Check />
                Approve
              </Button>
            </div>
          )}
        </div>

        {photos.length > 0 && (
          <PhotoStrip photos={photos} onView={openLightbox} />
        )}
      </div>

      {item.status === "REJECTED" && (
        <div className="border-t border-border pt-sm">
          <InformationBlock
            label="Reason for Rejection"
            value={
              item.rejection_details?.trim()
                ? item.rejection_details
                : reasonLabel(item.rejection_reason)
            }
          />
        </div>
      )}

      <ApproveItemDialog
        item={dialogItem}
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onConfirm={() => onApprove(item.id)}
      />
      <RejectItemDialog
        item={dialogItem}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={(reason, details) =>
          onReject(item.id, reason as RejectionReason, details)
        }
      />
      <PhotoLightboxDialog
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        photos={photos}
        initialIndex={lightboxIndex}
        title={`${item.name} photos`}
      />
    </div>
  );
}

export { DonationItemCard };
