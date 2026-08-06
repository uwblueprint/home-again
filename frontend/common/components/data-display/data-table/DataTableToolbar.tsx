"use client";

import type { ReactNode } from "react";
import { ArrowUpDown } from "lucide-react";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import {
  SortMenu,
  type SortMenuOption,
} from "@/common/components/ui/sort-menu";
import {
  DataTableFacetedFilter,
  type DataTableFilterOption,
} from "./DataTableFacetedFilter";
import { SearchBar } from "../SearchBar";

export interface DataTableFilterConfig {
  columnId: string;
  title: string;
  options: DataTableFilterOption[];
}

export type DataTableSortOption = SortMenuOption;

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  filters?: DataTableFilterConfig[];
  sortOptions?: DataTableSortOption[];
  sortValue?: string | null;
  onSortChange?: (value: string) => void;
  onSortReset?: () => void;
  /** Content rendered on the left (e.g. status filter pills). */
  leading?: ReactNode;
  actions?: ReactNode;
}

/**
 * Toolbar above the table: optional leading content on the left, then search,
 * faceted filters, sort, and any caller-supplied actions on the right.
 */
export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search",
  filters = [],
  sortOptions,
  sortValue = null,
  onSortChange,
  onSortReset,
  leading,
  actions,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-sm">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-xs">
        {leading}
      </div>
      <div className="flex shrink-0 items-center gap-xs">
        <SearchBar
          placeholder={searchPlaceholder}
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(value) => table.setGlobalFilter(value)}
        />
        {filters.map((filter) => (
          <DataTableFacetedFilter
            key={filter.columnId}
            column={table.getColumn(filter.columnId)}
            title={filter.title}
            options={filter.options}
          />
        ))}
        {sortOptions && onSortChange ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="gap-2 border-border">
                  <ArrowUpDown className="size-4" />
                  Sort
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-56 p-0">
              <SortMenu
                options={sortOptions}
                value={sortValue}
                onChange={onSortChange}
                onReset={onSortReset}
                className="border-0 shadow-none"
              />
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        {actions}
      </div>
    </div>
  );
}
