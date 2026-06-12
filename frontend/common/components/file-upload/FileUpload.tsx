"use client";

import React, { useEffect, useRef, useState } from "react";
import { Upload, X, File as FileIcon } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import Image from "next/image";
import { useFilePreviewUrls } from "@/common/hooks/useFilePreviewUrls";

const DEFAULT_MAX_FILES = 5;

/**
 * Returns true when a file satisfies the `accept` rule. The rule follows the
 * same syntax as the HTML `<input accept>` attribute: a comma-separated list of
 * file extensions (".pdf"), MIME types ("application/pdf"), or MIME wildcards
 * ("image/*"). An empty/undefined rule accepts every file.
 */
function isFileAccepted(file: File, accept?: string): boolean {
  if (!accept || accept.trim() === "") return true;

  const tokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  return tokens.some((token) => {
    if (token.startsWith(".")) {
      return fileName.endsWith(token);
    }
    if (token.endsWith("/*")) {
      const group = token.slice(0, token.indexOf("/"));
      return fileType.startsWith(`${group}/`);
    }
    return fileType === token;
  });
}

interface FileUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFiles: File[];
  onSave: (files: File[]) => void;
  /**
   * Allowed file types, using the HTML `<input accept>` syntax
   * (e.g. "image/*", ".pdf,.docx", "application/pdf").
   * Defaults to allowing any file type.
   */
  accept?: string;
  /** Maximum number of files that can be uploaded. Defaults to 5. */
  maxFiles?: number;
  /** Dialog heading. */
  title?: string;
  /** Optional helper text shown below the heading. */
  description?: string;
}

export default function FileUpload({
  open,
  onOpenChange,
  currentFiles,
  onSave,
  accept,
  maxFiles = DEFAULT_MAX_FILES,
  title = "Upload files",
  description,
}: FileUploadProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [overflowCount, setOverflowCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const helperText = description ?? `Maximum ${maxFiles} uploads`;

  // Preview URLs are managed by the hook (created/revoked inside an effect).
  // Non-image files get `null` and render a generic icon.
  const previewUrls = useFilePreviewUrls(pendingFiles);

  // Sync pending state to the committed files whenever the dialog opens, and
  // clear it (releasing preview URLs via the hook) whenever it closes.
  useEffect(() => {
    if (open) {
      setPendingFiles(currentFiles.slice(0, maxFiles));
      setOverflowCount(Math.max(0, currentFiles.length - maxFiles));
    } else {
      setPendingFiles([]);
      setOverflowCount(0);
    }
    // Intentionally keyed on `open` only: re-syncing on every `currentFiles`
    // identity change would discard the user's in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    // Clearing pending files releases their preview URLs even when the parent
    // keeps the dialog controlled-open across this render.
    setPendingFiles([]);
    setOverflowCount(0);
    onOpenChange(false);
  };

  const addFiles = (files: File[]) => {
    const allowed = files.filter((file) => isFileAccepted(file, accept));
    const room = Math.max(0, maxFiles - pendingFiles.length);
    const accepted = allowed.slice(0, room);
    setPendingFiles((prev) => [...prev, ...accepted]);
    setOverflowCount(allowed.length - accepted.length);
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

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setOverflowCount(0);
  };

  const handleSave = () => {
    onSave(pendingFiles);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}
    >
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[640px] gap-0 rounded-[10px] border border-border p-0 shadow-lg ring-0 sm:max-w-[640px]"
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="Close dialog"
          onClick={handleClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-[var(--unofficial-outline-hover)]"
        >
          <X className="size-4" />
        </button>

        {/* Body */}
        <div className="flex flex-col gap-lg px-2xl pb-xs pt-2xl">
          <DialogHeader className="gap-3 border-b border-[var(--unofficial-border-3)] pb-md">
            <DialogTitle className="font-semibold text-foreground text-[length:var(--heading-4-font-size)] leading-[var(--heading-4-line-height)]">
              {title}
            </DialogTitle>
            <DialogDescription className="text-foreground text-[length:var(--paragraph-mini-font-size)] leading-[var(--paragraph-mini-line-height)]">
              {helperText}
            </DialogDescription>
          </DialogHeader>

          {/* Upload zone */}
          <div
            className={cn(
              "flex flex-col items-center gap-[28px] rounded-xl border border-dashed px-6 py-12 transition-colors",
              isDragOver ? "border-primary bg-primary/5" : "border-border"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="size-6 text-muted-foreground" />
            <p className="text-heading-4 font-semibold text-muted-foreground">
              Drop files to upload or browse
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex w-80 cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2 text-paragraph-small hover:bg-[var(--unofficial-outline-hover)]",
                overflowCount > 0
                  ? "border-[var(--unofficial-destructive-border)]"
                  : "border-border"
              )}
            >
              <span className="font-medium text-foreground">Choose File</span>
              <span className="text-muted-foreground">
                {pendingFiles.length === 0
                  ? "No files chosen"
                  : `${pendingFiles.length} ${pendingFiles.length === 1 ? "file" : "files"} chosen`}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={maxFiles > 1}
              onChange={handleFileChange}
              aria-label="Choose files"
              aria-invalid={overflowCount > 0}
              aria-describedby={
                overflowCount > 0 ? "file-overflow-error" : undefined
              }
              className="hidden"
            />
            {overflowCount > 0 && (
              <p
                id="file-overflow-error"
                role="alert"
                className="text-center text-paragraph-mini text-destructive"
              >
                {`You can upload up to ${maxFiles} ${maxFiles === 1 ? "file" : "files"}. ${overflowCount} ${overflowCount === 1 ? "file wasn't" : "files weren't"} added.`}
              </p>
            )}
          </div>

          {/* Thumbnails */}
          {pendingFiles.length > 0 && (
            <div className="flex flex-wrap gap-sm">
              {pendingFiles.map((file, i) => {
                const previewUrl = previewUrls[i];
                return (
                  <div
                    key={`${file.name}-${file.lastModified}-${file.size}-${i}`}
                    className="relative size-[75px] shrink-0"
                  >
                    <div className="relative size-full overflow-hidden rounded-xl">
                      {previewUrl ? (
                        <Image
                          src={previewUrl}
                          alt={file.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full flex-col items-center justify-center gap-1 bg-muted px-1 text-center">
                          <FileIcon className="size-5 text-muted-foreground" />
                          <span className="line-clamp-2 break-all text-[10px] leading-tight text-muted-foreground">
                            {file.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove ${file.name}`}
                      className="absolute -left-1 -top-1 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full border border-[var(--unofficial-border-4)] bg-background shadow-sm hover:bg-[linear-gradient(var(--black-alpha-333),var(--black-alpha-333)),linear-gradient(#fff,#fff)]"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-xs px-2xl py-xl">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleClose}
            className="border-[var(--unofficial-border-3)] px-4 hover:bg-[var(--black-alpha-333)]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleSave}
            disabled={pendingFiles.length === 0}
            className="px-4"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { FileUploadProps };
