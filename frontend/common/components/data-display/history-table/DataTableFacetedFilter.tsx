"use client";

import { ListFilter } from "lucide-react";
import type { Column } from "@tanstack/react-table";

import { cn } from "@/common/lib/utils";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
 * Filter dropdown for a single column, matching the "Filter" toolbar button
 * in the Figma design (list-filter icon + checkbox options with row counts).
 */
export function DataTableFacetedFilter<TData, TValue>({
  column,
  title = "Filter",
  options,
  className,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
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
            {selectedValues.size > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full">
                {selectedValues.size}
              </Badge>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{title}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.has(option.value)}
            onCheckedChange={() => toggleValue(option.value)}
          >
            <span className="flex-1">{option.label}</span>
            {facets?.get(option.value) !== undefined && (
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                {facets.get(option.value)}
              </span>
            )}
          </DropdownMenuCheckboxItem>
        ))}
        {selectedValues.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={false}
              onCheckedChange={() => column?.setFilterValue(undefined)}
            >
              Clear filters
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
