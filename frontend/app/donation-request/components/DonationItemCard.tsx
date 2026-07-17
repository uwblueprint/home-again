"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { Card } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/common/components/ui/dialog";
import {
  ApprovedBadge,
  RejectedBadge,
} from "@/common/components/status-labels";
import { cn } from "@/common/lib/utils";

export type DonationItemStatus = "pending" | "approved" | "rejected";

interface DonationItemCardProps {
  name: string;
  notes?: string;
  photos: string[];
  status: DonationItemStatus;
  rejectionReason?: string;
  onApprove?: () => void;
  onReject?: () => void;
  className?: string;
}

export default function DonationItemCard({
  name,
  notes,
  photos,
  status,
  rejectionReason,
  onApprove,
  onReject,
  className,
}: DonationItemCardProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const visiblePhotos = photos.slice(0, 5);

  return (
    <>
      <Card className={cn("w-full", className)}>
        <div className="flex w-full items-start justify-between gap-lg">
          {/* Left column */}
          <div className="flex flex-col items-start gap-sm">
            <div className="flex flex-col gap-xs">
              <span className="text-base font-semibold text-foreground">
                {name}
              </span>
              {notes ? (
                <span className="text-sm text-muted-foreground">{notes}</span>
              ) : null}
            </div>

            {status === "pending" ? (
              <div className="flex gap-sm">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onReject}
                >
                  <X className="size-4" data-icon="inline-start" />
                  Reject
                </Button>
                <Button type="button" size="sm" onClick={onApprove}>
                  <Check className="size-4" data-icon="inline-start" />
                  Approve
                </Button>
              </div>
            ) : status === "approved" ? (
              <ApprovedBadge />
            ) : (
              <RejectedBadge />
            )}
          </div>

          {/* Right column: photos */}
          {visiblePhotos.length > 0 ? (
            <div className="flex flex-col items-end gap-xs shrink-0">
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="flex gap-xs"
                aria-label={`View ${photos.length} photos of ${name}`}
              >
                {visiblePhotos.map((src, i) => (
                  <div
                    key={src + i}
                    className="relative size-20 overflow-hidden rounded-md border border-border"
                  >
                    <Image
                      src={src}
                      alt={`${name} photo ${i + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ))}
              </button>
              <span className="text-sm text-muted-foreground">
                {photos.length} photo{photos.length === 1 ? "" : "s"} • Click
                to view
              </span>
            </div>
          ) : null}
        </div>

        {/* Rejection reason — full width, below both columns */}
        {status === "rejected" && rejectionReason ? (
          <div className="mt-sm w-full border-t border-border pt-sm">
            <p className="text-sm font-semibold text-foreground">
              Reason for Rejection
            </p>
            <p className="text-sm text-muted-foreground">{rejectionReason}</p>
          </div>
        ) : null}
      </Card>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
          </DialogHeader>
          <DialogBody className="grid grid-cols-2 gap-sm sm:grid-cols-3">
            {photos.map((src, i) => (
              <div
                key={src + i}
                className="relative aspect-square overflow-hidden rounded-md border border-border"
              >
                <Image
                  src={src}
                  alt={`${name} photo ${i + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ))}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}