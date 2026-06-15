"use client";

import React, { useCallback, useState } from "react";
import { ChevronUp, ChevronDown, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";
import Image from "next/image";
import {
  FURNITURE_TYPES,
  type FurnitureType,
  type FurnitureItemData,
} from "@/app/donate/context/DonationFormContext";
import { FileUpload } from "@/common/components/file-upload";
import { useFilePreviewUrls } from "@/common/hooks/useFilePreviewUrls";

// Constants

const MAX_PHOTOS = 5;

// Props

interface FurnitureItemCardProps {
  itemData: FurnitureItemData;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<Omit<FurnitureItemData, "id">>) => void;
  onDelete: () => void;
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
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleTypeSelect = useCallback(
    (type: FurnitureType) => {
      onUpdate({ furnitureType: type });
    },
    [onUpdate]
  );

  const handleStainsChange = useCallback(
    (value: boolean) => {
      onUpdate({ hasStains: value });
    },
    [onUpdate]
  );

  const photoUrls = useFilePreviewUrls(itemData.photos);

  const displayLabel = itemData.furnitureType
    ? `Item ${index + 1} - ${itemData.furnitureType}`
    : `Item ${index + 1}`;

  return (
    <>
      <div
        className="rounded-xl border border-border bg-background"
        data-testid={`furniture-item-card-${index}`}
      >
        {/* Accordion header */}
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center justify-between px-6 py-6"
          aria-expanded={isExpanded}
          aria-controls={`furniture-item-body-${index}`}
        >
          <span className="text-lg text-muted-foreground">{displayLabel}</span>
          {isExpanded ? (
            <ChevronUp className="size-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-5 text-muted-foreground" />
          )}
        </button>

        {/* Accordion body - animated */}
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-in-out",
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <div
              id={`furniture-item-body-${index}`}
              className="flex flex-col gap-6 px-6 pb-8"
            >
              <h3 className="text-xl font-semibold text-foreground">
                Item Details
              </h3>

              {/* Furniture type */}
              <fieldset>
                <legend className="mb-3 text-sm font-medium text-foreground">
                  Select Furniture Type<span className="text-destructive">*</span>
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
                            : "border-border bg-background hover:border-muted-foreground/30"
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
                    aria-pressed={itemData.hasStains === true}
                    onClick={() => handleStainsChange(true)}
                    className={cn(
                      "cursor-pointer px-4 py-1.5 text-sm font-medium transition-colors",
                      itemData.hasStains === true
                        ? "bg-[var(--unofficial-outline-active)] text-foreground"
                        : "bg-background text-foreground hover:bg-[var(--unofficial-outline-hover)]"
                    )}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    aria-pressed={itemData.hasStains === false}
                    onClick={() => handleStainsChange(false)}
                    className={cn(
                      "cursor-pointer border-l border-border px-4 py-1.5 text-sm font-medium transition-colors",
                      itemData.hasStains === false
                        ? "bg-[var(--unofficial-outline-active)] text-foreground"
                        : "bg-background text-foreground hover:bg-[var(--unofficial-outline-hover)]"
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

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                  className="gap-2 hover:bg-[var(--unofficial-outline-hover)]"
                >
                  <Upload className="size-4" />
                  Upload Photos
                </Button>

                {itemData.photos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {itemData.photos.map((file, i) => (
                      <div
                        key={`${file.name}-${file.lastModified}-${file.size}-${i}`}
                        className="relative size-16"
                      >
                        <div className="relative size-full overflow-hidden rounded-md border border-border">
                          {photoUrls[i] && (
                            <Image
                              src={photoUrls[i] as string}
                              alt={file.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdate({
                              photos: itemData.photos.filter(
                                (_, idx) => idx !== i
                              ),
                            })
                          }
                          className="absolute -left-1 -top-1 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full border border-[#a3a3a3]/70 bg-white text-foreground shadow-sm hover:bg-[linear-gradient(var(--black-alpha-333),var(--black-alpha-333)),linear-gradient(#fff,#fff)]"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={isDeleteDisabled}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
                    isDeleteDisabled
                      ? "cursor-not-allowed text-muted-foreground/40"
                      : "cursor-pointer text-muted-foreground hover:text-destructive"
                  )}
                  aria-label={`Delete item ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FileUpload
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentFiles={itemData.photos}
        onSave={(photos) => onUpdate({ photos })}
        accept="image/*"
        maxFiles={MAX_PHOTOS}
        title="Upload Photos of Your Item"
      />
    </>
  );
}
