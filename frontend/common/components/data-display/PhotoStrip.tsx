"use client";

import Image from "next/image";

import { cn } from "@/common/lib/utils";

export interface PhotoStripPhoto {
  url: string;
  alt?: string;
}

/**
 * Thumbnail edge length in px, from the donation-review frames (75.6 there).
 *
 * Fixed rather than flex-sized on purpose: the strip usually sits in a
 * shrink-to-fit flex row beside the item details, and percentage-width
 * thumbnails collapse to a fraction of their intended size in that context.
 */
const DEFAULT_THUMBNAIL_SIZE = 76;

interface PhotoStripProps {
  photos: PhotoStripPhoto[];
  /** Opens the lightbox at the given index. Also makes thumbnails focusable. */
  onView?: (index: number) => void;
  className?: string;
  /** Caption shown under the strip; defaults to "N photos". */
  caption?: string;
  /** Edge length of each square thumbnail, in px. */
  thumbnailSize?: number;
}

/**
 * Horizontal row of square photo thumbnails with a "N photos · Click to view"
 * caption. Presentational — the parent owns the lightbox open state.
 */
function PhotoStrip({
  photos,
  onView,
  className,
  caption,
  thumbnailSize = DEFAULT_THUMBNAIL_SIZE,
}: PhotoStripProps) {
  if (photos.length === 0) return null;

  const label =
    caption ?? `${photos.length} photo${photos.length === 1 ? "" : "s"}`;
  const box = { width: thumbnailSize, height: thumbnailSize };

  return (
    <div className={cn("flex flex-col items-end gap-xl", className)}>
      <div className="flex gap-3">
        {photos.map((photo, index) => {
          const thumb = (
            <div
              className="relative overflow-hidden rounded-xl bg-muted"
              style={box}
            >
              <Image
                src={photo.url}
                alt={photo.alt ?? `Photo ${index + 1}`}
                fill
                unoptimized
                sizes={`${thumbnailSize}px`}
                className="object-cover"
              />
            </div>
          );

          if (!onView) {
            return <div key={index}>{thumb}</div>;
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => onView(index)}
              aria-label={`View ${photo.alt ?? `photo ${index + 1}`}`}
              className="cursor-pointer rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
