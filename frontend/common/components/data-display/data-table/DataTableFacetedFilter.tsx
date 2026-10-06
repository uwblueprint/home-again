"use client";

import { ListFilter } from "lucide-react";
import type { Column } from "@tanstack/react-table";

import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";
import { Checkbox } from "@/common/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";

export interface DataTableFilterOption {
  label: string;
  value: string;
}

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: DataTableFilterOption[];
  className?: string;
}

/**
 * Filter dropdown for a single column, matching the Figma "Filter" control:
 * list-filter icon, "Select all that apply" heading, checkboxes, and Clear.
 */
export function DataTableFacetedFilter<TData, TValue>({
  column,
  title = "Filter",
  options,
  className,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const selectedValues = new Set(
    (column?.getFilterValue() as string[] | undefined) ?? []
  );

  const toggleValue = (value: string) => {
    const next = new Set(selectedValues);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    column?.setFilterValue(next.size ? Array.from(next) : undefined);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className={cn("gap-2 border-border", className)}
          >
            <ListFilter className="size-4" />
            {title}
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        side="bottom"
        collisionAvoidance={{ side: "none", fallbackAxisSide: "none" }}
        className="min-w-56 p-md"
      >
        <p className="mb-sm text-paragraph-small text-muted-foreground">
          Select all that apply
        </p>

        <div className="flex flex-col gap-xs">
          {options.map((option) => {
            const checked = selectedValues.has(option.value);
            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-sm rounded-md px-xs py-xs hover:bg-accent"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleValue(option.value)}
                />
                <span className="text-paragraph-small text-foreground">
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>

        {selectedValues.size > 0 ? (
          <div className="mt-sm flex justify-end">
            <button
              type="button"
              onClick={() => column?.setFilterValue(undefined)}
              className="cursor-pointer text-paragraph-small text-foreground underline"
            >
              Clear
            </button>
          </div>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
