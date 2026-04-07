"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  getFilePreviewUrl,
  revokeFilePreviewUrls,
} from "@/lib/filePreviewUrls";

const MAX_PHOTOS = 5;

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset to committed photos each time the dialog opens
  useEffect(() => {
    if (open) {
      setPendingPhotos(currentPhotos);
      setOverflowCount(0);
      return;
    }
    setPendingPhotos([]);
    setOverflowCount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const photoUrls = useMemo(
    () => pendingPhotos.map((file) => getFilePreviewUrl(file)),
    [pendingPhotos],
  );

  useEffect(() => {
    return () => {
      revokeFilePreviewUrls(pendingPhotos);
    };
  }, [pendingPhotos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const totalRequested = pendingPhotos.length + files.length;
    const rejected = Math.max(0, totalRequested - MAX_PHOTOS);
    const acceptedCount = files.length - rejected;
    const accepted = files.slice(0, acceptedCount);
    setPendingPhotos((prev) => [...prev, ...accepted]);
    setOverflowCount(rejected > 0 ? rejected : 0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPendingPhotos((prev) => prev.filter((_, i) => i !== index));
    setOverflowCount(0);
  };

  const handleSave = () => {
    onSave(pendingPhotos);
    setPendingPhotos([]);
    setOverflowCount(0);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      data-testid="photo-upload-overlay"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-upload-title"
        className="relative w-full max-w-[640px] rounded-[10px] bg-background shadow-lg ring-1 ring-foreground/10"
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="Close dialog"
          onClick={() => {
            setPendingPhotos([]);
            setOverflowCount(0);
            onOpenChange(false);
          }}
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
          <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12">
            <Upload className="size-6 text-muted-foreground" />
            <p className="text-xl font-semibold text-[#757575]">
              Drop files to upload or browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              aria-label="Choose files"
              className={cn(
                "w-80 cursor-pointer rounded-lg border px-3 py-2 text-sm file:cursor-pointer",
                overflowCount > 0 ? "border-destructive" : "border-border",
              )}
            />
            {overflowCount > 0 && (
              <p className="text-center text-xs text-destructive">
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
                    className="absolute -left-1 -top-1 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full border border-[#a3a3a3]/70 bg-white shadow-sm hover:bg-muted"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-12 py-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setPendingPhotos([]);
              setOverflowCount(0);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={pendingPhotos.length === 0}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

