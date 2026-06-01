"use client";

import { useEffect, useState } from "react";
import { Check, SquarePen } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Checkbox } from "@/common/components/ui/checkbox";
import { Input } from "@/common/components/ui/input";
import { SelectAndCombo } from "@/common/components/forms/SelectAndCombo";
import { cn } from "@/common/lib/utils";

type FurnitureItemCardProps = {
  className?: string;
  label: string;
  selected: boolean;
  quantity: number;
  notes?: string;
  subOptions?: {
    id: string;
    label: string;
    quantity: number;
  }[];
  minQuantity?: number;
  maxQuantity?: number;
  onToggle?: (nextSelected: boolean) => void;
  onQuantityChange?: (nextQuantity: number) => void;
  onNotesChange?: (nextNotes: string) => void;
  onSubQuantityChange?: (id: string, nextQuantity: number) => void;
};

export function FurnitureItemCard({
  label,
  selected,
  quantity,
  notes = "",
  subOptions,
  minQuantity = 1,
  maxQuantity,
  onToggle,
  onQuantityChange,
  onNotesChange,
  onSubQuantityChange,
  className,
}: FurnitureItemCardProps) {
  const showMainStepper = !subOptions || subOptions.length === 0;
  const [isEditingSubOptions, setIsEditingSubOptions] = useState(
    () => !!subOptions?.length
  );

  const sizeHint = (() => {
    if (!subOptions?.length) return "";
    const labels = subOptions.map((sub) => sub.label);
    if (labels.length === 1) return `Available in ${labels[0]}.`;
    if (labels.length === 2)
      return `Available in ${labels[0]} and ${labels[1]}.`;
    return `Available in ${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}.`;
  })();

  const subQuantitiesSignature =
    subOptions?.map((sub) => `${sub.id}:${sub.quantity}`).join("|") ?? "";
  const hasSubSelections = subOptions?.some((sub) => sub.quantity > 0) ?? false;

  const handleToggle = (nextValue?: boolean) => {
    const next = nextValue ?? !selected;
    onToggle?.(next);
    if (!next) {
      if (!subOptions?.length) {
        onQuantityChange?.(Math.max(minQuantity, 1));
      } else if (onSubQuantityChange) {
        subOptions.forEach((sub) => onSubQuantityChange(sub.id, 0));
        onQuantityChange?.(0);
      }
      setIsEditingSubOptions(false);
    } else {
      if (!subOptions?.length && quantity < Math.max(minQuantity, 1)) {
        onQuantityChange?.(Math.max(minQuantity, 1));
      }
      if (subOptions?.length) {
        setIsEditingSubOptions(true);
      }
    }
  };

  const setQuantity = (next: number) => {
    const clamped =
      maxQuantity !== undefined
        ? Math.min(Math.max(next, minQuantity), maxQuantity)
        : Math.max(next, minQuantity);
    onQuantityChange?.(clamped);
  };

  useEffect(() => {
    if (!selected) return;
    if (!subOptions?.length) return;
    if (!hasSubSelections) {
      setIsEditingSubOptions(true);
    }
  }, [selected, subQuantitiesSignature, subOptions?.length, hasSubSelections]);

  return (
    <div
      className={cn(
        "flex flex-col items-start rounded-lg border border-border bg-card p-3 shadow-sm",
        subOptions?.length ? "gap-1.5" : "gap-2",
        selected && !subOptions?.length ? "min-h-[130px]" : "min-h-0",
        !selected ? "min-h-[130px]" : "",
        "max-w-sm",
        className
      )}
    >
      {showMainStepper ? (
        <div className="flex w-full items-center gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={(next) => handleToggle(!!next)}
            aria-label={`Select ${label}`}
            className="size-[18px] rounded-[5px] border-border shadow-inner data-checked:border-transparent data-checked:bg-primary data-checked:text-primary-foreground"
          />

          <h3 className="text-[16px] font-medium leading-6 text-foreground">
            {label}
          </h3>

          <div
            className={cn(
              "ml-auto flex min-w-[122px] justify-end",
              selected ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            aria-hidden={!selected}
          >
            <SelectAndCombo
              value={quantity}
              onChange={setQuantity}
              min={minQuantity}
              max={maxQuantity}
            />
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selected}
              onCheckedChange={(next) => handleToggle(!!next)}
              aria-label={`Select ${label}`}
              className="size-[18px] rounded-[5px] border-border shadow-inner data-checked:border-transparent data-checked:bg-primary data-checked:text-primary-foreground"
            />

            <h3 className="text-[16px] font-medium leading-6 text-foreground">
              {label}
            </h3>
          </div>

          {!selected && sizeHint ? (
            <p className="pl-7 text-sm font-normal text-muted-foreground">
              {sizeHint}
            </p>
          ) : null}

          <div
            className={cn(
              "flex items-center gap-2",
              isEditingSubOptions ? "h-0" : "min-h-[28px]"
            )}
          >
            {subOptions?.length && hasSubSelections && !isEditingSubOptions ? (
              <div className="flex flex-wrap items-center gap-2">
                {subOptions.map((sub) => {
                  if (!sub.quantity) return null;
                  return (
                    <Badge
                      key={sub.id}
                      className="h-auto rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-[--brand-greens-200]"
                    >
                      ({sub.quantity}) {sub.label}
                    </Badge>
                  );
                })}
              </div>
            ) : null}

            {subOptions?.length ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "ml-auto h-8 w-8 rounded-lg border border-border text-muted-foreground hover:bg-muted",
                  selected && hasSubSelections && !isEditingSubOptions
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsEditingSubOptions(true)}
                aria-label="Edit sizes"
              >
                <SquarePen className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {selected ? (
        <div className="w-full animate-in fade-in-50">
          {subOptions?.length && (isEditingSubOptions || !hasSubSelections) ? (
            <div className="mb-3 rounded-xl border border-border bg-card px-3 py-2.5">
              <div className="mb-2 flex items-start justify-between gap-3">
                {hasSubSelections ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {subOptions.map((sub) => {
                      if (!sub.quantity) return null;
                      return (
                        <Badge
                          key={sub.id}
                          className="h-auto rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-[--brand-greens-200]"
                        >
                          ({sub.quantity}) {sub.label}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-sm font-medium text-foreground">
                    Select a size
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {subOptions.map((sub) => {
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-sm text-foreground">
                        {sub.label}
                      </span>
                      <SelectAndCombo
                        value={sub.quantity}
                        onChange={(next) =>
                          onSubQuantityChange?.(sub.id, Math.max(next, 0))
                        }
                        min={0}
                      />
                    </div>
                  );
                })}
              </div>

              {hasSubSelections ? (
                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="xs"
                    onClick={() => setIsEditingSubOptions(false)}
                    className="rounded-lg"
                    aria-label="Done"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          <Input
            value={notes}
            onChange={(e) => onNotesChange?.(e.target.value)}
            placeholder="Add item details or specifications"
            className="h-12 rounded-lg border border-[--unofficial-border-3] text-base font-normal placeholder:text-muted-foreground"
          />
        </div>
      ) : null}
    </div>
  );
}

export default FurnitureItemCard;
