"use client";

import { useEffect, useState } from "react";
import {
  getFilePreviewUrl,
  isImage,
  revokeFilePreviewUrl,
} from "@/common/lib/filePreviewUrls";

/**
 * Returns a parallel array of object-URL previews for `files`: image files get a
 * blob URL, non-image files get `null` (callers render an icon instead).
 *
 * URLs are created and released inside an effect — never during render — so the
 * ref-counted cache in `filePreviewUrls` stays balanced even under React Strict
 * Mode's double-invoked renders. The previous set is revoked whenever the file
 * contents change and when the component unmounts.
 */
export function useFilePreviewUrls(files: File[]): (string | null)[] {
  const [urls, setUrls] = useState<(string | null)[]>([]);

  // Re-run only when the file *contents* change, not on every new array
  // identity, so callers can pass a freshly mapped/sliced array each render
  // without thrashing the underlying object URLs.
  const signature = files
    .map(
      (file) => `${file.name}:${file.size}:${file.lastModified}:${file.type}`
    )
    .join("|");

  useEffect(() => {
    setUrls(
      files.map((file) => (isImage(file) ? getFilePreviewUrl(file) : null))
    );
    return () => {
      files.forEach((file) => revokeFilePreviewUrl(file));
    };
    // `files` is tracked via `signature` (see above); listing it directly would
    // re-run the effect on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return urls;
}
