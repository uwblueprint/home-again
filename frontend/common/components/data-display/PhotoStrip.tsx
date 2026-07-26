"use client";

import Image from "next/image";

import { cn } from "@/common/lib/utils";

export interface PhotoStripPhoto {
  url: string;
  alt?: string;
}

interface PhotoStripProps {
  photos: PhotoStripPhoto[];
  /** Opens the lightbox at the given index. Also makes thumbnails focusable. */
  onView?: (index: number) => void;
  className?: string;
  /** Caption shown under the strip; defaults to "N photos". */
  caption?: string;
}

/**
 * Horizontal row of square photo thumbnails with a "N photos · Click to view"
 * caption. Presentational — the parent owns the lightbox open state.
 */
function PhotoStrip({ photos, onView, className, caption }: PhotoStripProps) {
  if (photos.length === 0) return null;

  const label =
    caption ?? `${photos.length} photo${photos.length === 1 ? "" : "s"}`;

  return (
    <div className={cn("flex flex-col items-end gap-lg", className)}>
      <div className="flex h-[75px] w-full max-w-[426px] items-end gap-3">
        {photos.map((photo, index) => {
          const thumb = (
            <div className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-xl bg-muted">
              <Image
                src={photo.url}
                alt={photo.alt ?? `Photo ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          );

          if (!onView) {
            return (
              <div key={index} className="min-w-0 flex-1">
                {thumb}
              </div>
            );
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => onView(index)}
              aria-label={`View ${photo.alt ?? `photo ${index + 1}`}`}
              className="min-w-0 flex-1 cursor-pointer rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {thumb}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 text-paragraph-small text-muted-foreground">
        <span>{label}</span>
        {onView && (
          <>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onView(0)}
              className="cursor-pointer rounded outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Click to view
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export { PhotoStrip };
