"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";
import Image from "next/image";
import {
  getFilePreviewUrl,
  revokeFilePreviewUrls,
} from "@/common/lib/filePreviewUrls";

const MAX_PHOTOS = 5;
const FOCUSABLE_SELECTOR =
  "a[href], button, textarea, input, select, [tabindex]:not([tabindex='-1'])";

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      !element.hasAttribute("data-disabled") &&
      element.getAttribute("aria-disabled") !== "true" &&
      element.getAttribute("tabindex") !== "-1"
  );
}

interface PhotoUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhotos: File[];
  onSave: (photos: File[]) => void;
}

export default function PhotoUpload({
  open,
  onOpenChange,
  currentPhotos,
  onSave,
}: PhotoUploadProps) {
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [overflowCount, setOverflowCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const closeDialog = () => {
    setPendingPhotos([]);
    setOverflowCount(0);
    onOpenChange(false);
  };

  // Reset to committed photos each time the dialog opens
  useEffect(() => {
    if (open) {
      const clampedPhotos = currentPhotos.slice(0, MAX_PHOTOS);
      const rejected = Math.max(0, currentPhotos.length - MAX_PHOTOS);
      setPendingPhotos(clampedPhotos);
      setOverflowCount(rejected);
      previouslyFocusedElementRef.current =
        document.activeElement as HTMLElement | null;

      const dialog = dialogRef.current;
      if (dialog) {
        const focusable = getFocusableElements(dialog);
        const first = focusable[0] ?? dialog;
        first.focus();
      }
      return;
    }
    setPendingPhotos([]);
    setOverflowCount(0);

    const previous = previouslyFocusedElementRef.current;
    if (previous && typeof previous.focus === "function") {
      previous.focus();
    }
    previouslyFocusedElementRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const photoUrls = useMemo(
    () => pendingPhotos.map((file) => getFilePreviewUrl(file)),
    [pendingPhotos]
  );

  // Release refs from the previous pending photo set whenever it changes
  // (including individual thumbnail removals), and on unmount.
  useEffect(() => {
    return () => {
      revokeFilePreviewUrls(pendingPhotos);
    };
  }, [pendingPhotos]);

  const addFiles = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    setPendingPhotos((prev) => {
      const totalRequested = prev.length + imageFiles.length;
      const rejected = Math.max(0, totalRequested - MAX_PHOTOS);
      const accepted = imageFiles.slice(0, imageFiles.length - rejected);
      setOverflowCount(rejected > 0 ? rejected : 0);
      return [...prev, ...accepted];
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const removePhoto = (index: number) => {
    setPendingPhotos((prev) => prev.filter((_, i) => i !== index));
    setOverflowCount(0);
  };

  const handleSave = () => {
    onSave(pendingPhotos);
    closeDialog();
  };

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusableElements(dialog);

    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (!active || !dialog.contains(active) || active === first) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      data-testid="photo-upload-overlay"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-upload-title"
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
        className="relative w-full max-w-[640px] rounded-[10px] bg-background shadow-lg ring-1 ring-foreground/10"
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="Close dialog"
          onClick={closeDialog}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        {/* Body */}
        <div className="px-12 pb-4 pt-8">
          <h2
            id="photo-upload-title"
            className="text-xl font-semibold text-foreground"
          >
            Upload photos of your item
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Max 5 uploads</p>

          {/* Upload zone */}
          <div
            className={cn(
              "mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 transition-colors",
              isDragOver ? "border-primary bg-primary/5" : "border-border"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="size-6 text-muted-foreground" />
            <p className="text-xl font-semibold text-muted-foreground">
              Drop files to upload or browse
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex w-80 cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-[var(--unofficial-outline-hover)]",
                overflowCount > 0 ? "border-destructive" : "border-border"
              )}
            >
              <span className="font-semibold text-foreground">
                Choose Files
              </span>
              <span className="text-muted-foreground">
                {pendingPhotos.length === 0
                  ? "No files chosen"
                  : `${pendingPhotos.length} ${pendingPhotos.length === 1 ? "photo" : "photos"} selected`}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              aria-label="Choose files"
              aria-invalid={overflowCount > 0}
              aria-describedby={
                overflowCount > 0 ? "photo-overflow-error" : undefined
              }
              className="hidden"
            />
            {overflowCount > 0 && (
              <p
                id="photo-overflow-error"
                role="alert"
                className="text-center text-xs text-destructive"
              >
                Only {MAX_PHOTOS} photos allowed. {overflowCount}{" "}
                {overflowCount === 1 ? "file was" : "files were"} discarded.
              </p>
            )}
          </div>

          {/* Thumbnails */}
          {pendingPhotos.length > 0 && (
            <div className="mt-4 flex gap-3">
              {pendingPhotos.map((file, i) => (
                <div
                  key={`${file.name}-${file.lastModified}-${file.size}-${i}`}
                  className="relative size-[75px] shrink-0"
                >
                  <div className="relative size-full overflow-hidden rounded-xl border border-border">
                    <Image
                      src={photoUrls[i]}
                      alt={file.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={`Remove ${file.name}`}
                    className="absolute -left-1 -top-1 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-[linear-gradient(var(--black-alpha-333),var(--black-alpha-333)),linear-gradient(#fff,#fff)]"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-12 py-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={closeDialog}
            className="px-4 hover:bg-[var(--black-alpha-333)]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleSave}
            disabled={pendingPhotos.length === 0}
            className="px-4"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
