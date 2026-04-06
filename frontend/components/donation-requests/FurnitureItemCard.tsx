"use client";

import React, { useCallback, useRef } from "react";
import { ChevronUp, ChevronDown, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FURNITURE_TYPES,
  type FurnitureType,
  type FurnitureItemData,
} from "@/components/donation-requests/DonationFormContext";

// Constants

const MAX_PHOTOS = 5;

// Props

interface FurnitureItemCardProps {
  /** The item data to display / edit. */
  itemData: FurnitureItemData;
  /** 0-based position in the list (used for display label). */
  index: number;
  /** Whether the card is expanded. */
  isExpanded: boolean;
  /** Toggle expand / collapse. */
  onToggle: () => void;
  /** Callback to patch this item's state. */
  onUpdate: (patch: Partial<Omit<FurnitureItemData, "id">>) => void;
  /** Callback to remove this item. */
  onDelete: () => void;
  /** If true the delete button is disabled (only one item in the list). */
  isDeleteDisabled: boolean;
}

// Component

export default function FurnitureItemCard({
  itemData,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  isDeleteDisabled,
}: FurnitureItemCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  //  handlers 

  const handleTypeSelect = useCallback(
    (type: FurnitureType) => {
      onUpdate({ furnitureType: type });
    },
    [onUpdate],
  );

  const handleStainsChange = useCallback(
    (value: boolean) => {
      onUpdate({ hasStains: value });
    },
    [onUpdate],
  );

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remaining = MAX_PHOTOS - itemData.photos.length;
      const newFiles = Array.from(files).slice(0, remaining);
      onUpdate({ photos: [...itemData.photos, ...newFiles] });

      // Reset so the same file can be re-selected if removed
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [itemData.photos, onUpdate],
  );

  //  derived 

  const displayLabel = itemData.furnitureType
    ? `Item ${index + 1} - ${itemData.furnitureType}`
    : `Item ${index + 1}`;

  //  render 

  return (
    <div
      className="rounded-xl border border-dashed border-border bg-background"
      data-testid={`furniture-item-card-${index}`}
    >
      {/* Accordion header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between px-6 py-4"
        aria-expanded={isExpanded}
        aria-controls={`furniture-item-body-${index}`}
      >
        <span className="text-sm text-muted-foreground">{displayLabel}</span>
        {isExpanded ? (
          <ChevronUp className="size-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-5 text-muted-foreground" />
        )}
      </button>

      {/* Accordion body */}
      {isExpanded && (
        <div
          id={`furniture-item-body-${index}`}
          className="flex flex-col gap-6 px-6 pb-6"
        >
          {/* Section heading */}
          <h3 className="text-base font-semibold text-foreground">
            Item Details
          </h3>

          {/* Furniture type radio grid */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-foreground">
              Select Furniture Type
            </legend>
            <div className="grid grid-cols-3 gap-3">
              {FURNITURE_TYPES.map((type) => {
                const isSelected = itemData.furnitureType === type;
                return (
                  <label
                    key={type}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      isSelected
                        ? "border-primary bg-background"
                        : "border-border bg-background hover:border-muted-foreground/30",
                    )}
                  >
                    <input
                      type="radio"
                      name={`furniture-type-${itemData.id}`}
                      value={type}
                      checked={isSelected}
                      onChange={() => handleTypeSelect(type)}
                      className="accent-primary size-4 shrink-0"
                    />
                    <span className="leading-tight">{type}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Stains toggle */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              Are there stains on the furniture item?
            </p>
            <div className="inline-flex overflow-hidden rounded-md border border-border">
              <button
                type="button"
                onClick={() => handleStainsChange(true)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-colors",
                  itemData.hasStains === true
                    ? "bg-primary text-primary-foreground"
                    : "border-l border-border bg-background text-foreground hover:bg-neutral-100"
                )}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleStainsChange(false)}
                className={cn(
                  "border-l border-border px-4 py-1.5 text-sm font-medium transition-colors",
                  itemData.hasStains === false
                    ? "bg-primary text-primary-foreground"
                    : "border-l border-border bg-background text-foreground hover:bg-neutral-100"
                )}
              >
                No
              </button>
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              Upload photos of item (max {MAX_PHOTOS})
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              aria-label="Upload photos"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={itemData.photos.length >= MAX_PHOTOS}
              className="gap-2 hover:bg-neutral-100"
            >
              <Upload className="size-4" />
              Upload Photos
            </Button>

            {/* Photo thumbnails */}
            {itemData.photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {itemData.photos.map((file, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    className="relative size-16 overflow-hidden rounded-md border border-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate({
                          photos: itemData.photos.filter((_, idx) => idx !== i),
                        })
                      }
                      className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground"
                      aria-label={`Remove ${file.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete item */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleteDisabled}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm transition-colors",
                isDeleteDisabled
                  ? "cursor-not-allowed text-muted-foreground/40"
                  : "cursor-pointer text-muted-foreground hover:text-destructive",
              )}
              aria-label={`Delete item ${index + 1}`}
            >
              <Trash2 className="size-4" />
              Delete Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
