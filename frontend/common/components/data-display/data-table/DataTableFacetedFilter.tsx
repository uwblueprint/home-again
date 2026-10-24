"use client";

import { ListFilter } from "lucide-react";
import type { Column } from "@tanstack/react-table";

import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";
import { Checkbox } from "@/common/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
 * Filter dropdown for a single column, matching the "Filter Menu" component
 * in the design system (Figma: Home Again Design System, node 527:869).
 * Multi-select — check as many options as apply; the column's `filterFn`
 * must expect a `string[]` filter value (see `Array.includes`-style checks).
 */
export function DataTableFacetedFilter<TData, TValue>({
  column,
  title = "Filter",
  options,
  className,
}: DataTableFacetedFilterProps<TData, TValue>) {
  // Guard rather than cast: subtabs can share this column, and another
  // filter could write a non-array value (see DataTableToolbar).
  const rawFilterValue = column?.getFilterValue();
  const selectedValues = Array.isArray(rawFilterValue)
    ? (rawFilterValue as string[])
    : [];

  const toggleValue = (value: string) => {
    const next = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    column?.setFilterValue(next.length ? next : undefined);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="secondary"
            className={cn(
              "h-10 gap-(--2xs) rounded-xl border border-border px-sm",
              selectedValues.length > 0 && "bg-accent",
              className
            )}
          >
            <ListFilter className="size-5" />
            {title}
          </Button>
        }
      />
      <DropdownMenuContent
        align="start"
        className="flex w-50 flex-col gap-xs p-md"
      >
        <p className="px-xs pb-xs text-paragraph-small font-normal text-muted-foreground">
          Select all that apply
        </p>
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <DropdownMenuItem
              key={option.value}
              role="menuitemcheckbox"
              aria-checked={isSelected}
              closeOnClick={false}
              onClick={() => toggleValue(option.value)}
            >
              <Checkbox checked={isSelected} tabIndex={-1} aria-hidden />
              <span>{option.label}</span>
            </DropdownMenuItem>
          );
        })}
        {selectedValues.length > 0 && (
          <DropdownMenuItem
            onClick={() => column?.setFilterValue(undefined)}
            className="justify-end text-right text-paragraph-small text-foreground underline"
          >
            Clear
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
