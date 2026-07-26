"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/common/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import type { PhotoStripPhoto } from "./PhotoStrip";

interface PhotoLightboxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: PhotoStripPhoto[];
  /** Index shown when the dialog opens. Defaults to 0. */
  initialIndex?: number;
  /** Accessible dialog title (visually hidden). */
  title?: string;
}

/**
 * Full-size photo viewer: large image, prev/next controls, and a vertical
 * thumbnail rail. Controlled via `open` / `onOpenChange`.
 */
function PhotoLightboxDialog({
  open,
  onOpenChange,
  photos,
  initialIndex = 0,
  title = "Item photos",
}: PhotoLightboxDialogProps) {
  const [index, setIndex] = useState(initialIndex);

  // Re-seed each time the dialog is opened, so it lands on the clicked thumbnail.
  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  if (photos.length === 0) return null;

  const clamped = Math.min(Math.max(index, 0), photos.length - 1);
  const current = photos[clamped];
  const go = (delta: number) =>
    setIndex((prev) => (prev + delta + photos.length) % photos.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex gap-lg p-2xl">
          <div className="relative flex flex-1 items-center">
            {photos.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                rounded
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="absolute left-2 z-10"
              >
                <ChevronLeft />
              </Button>
            )}

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={current.url}
                alt={current.alt ?? `Photo ${clamped + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            {photos.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                rounded
                onClick={() => go(1)}
                aria-label="Next photo"
                className="absolute right-2 z-10"
              >
                <ChevronRight />
              </Button>
            )}
          </div>

          {photos.length > 1 && (
            <div className="flex max-h-[360px] w-[76px] shrink-0 flex-col gap-sm overflow-y-auto">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`View photo ${i + 1}`}
                  aria-current={i === clamped || undefined}
                  className={cn(
                    "relative aspect-square w-full shrink-0 cursor-pointer overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    i === clamped
                      ? "ring-2 ring-primary"
                      : "opacity-80 hover:opacity-100"
                  )}
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt ?? `Thumbnail ${i + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { PhotoLightboxDialog };
