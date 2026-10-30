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
  SubTabs,
  SubTabsList,
  SubTabsTrigger,
} from "@/common/components/ui/subtabs";
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

export interface DataTableSubtabsConfig {
  columnId: string;
  allLabel?: string;
  options: DataTableFilterOption[];
}

const ALL_SUBTAB_VALUE = "__all__";

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
  subtabs?: DataTableSubtabsConfig;
}

/**
 * Toolbar above the table: optional leading content or subtabs on the left,
 * then search, faceted filters, sort, and any caller-supplied actions on the right.
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
  subtabs,
}: DataTableToolbarProps<TData>) {
  const search = (
    <SearchBar
      placeholder={searchPlaceholder}
      value={(table.getState().globalFilter as string) ?? ""}
      onChange={(value) => table.setGlobalFilter(value)}
    />
  );

  const filterControls = (
    <div className="flex items-center gap-(--2xs)">
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
  );

  if (subtabs) {
    const column = table.getColumn(subtabs.columnId);

    if (!column) {
      return (
        <div className="flex w-full items-center justify-between gap-sm">
          {search}
          {filterControls}
        </div>
      );
    }

    // Stored as string[] (not a lone string) so this column can also be
    // targeted by a multi-select `filters` entry at the same time — see the
    // README's "Subtabs" section for why the shapes have to match. A tab
    // click replaces the whole array with its one value. "All" shows active
    // only when nothing is selected; with several values selected via
    // `filters`, no tab is active (null) since none describes the view.
    // Another column filter could write a non-array value — hence the
    // Array.isArray guard rather than a blind cast.
    const rawFilterValue = column.getFilterValue();
    const filterValue = Array.isArray(rawFilterValue)
      ? (rawFilterValue as string[])
      : undefined;
    const activeValue = !filterValue?.length
      ? ALL_SUBTAB_VALUE
      : filterValue.length === 1
        ? filterValue[0]
        : null;
    const facets = column.getFacetedUniqueValues();
    const totalRows = column.getFacetedRowModel().rows.length;

    return (
      <div className="flex w-full items-center justify-between gap-sm">
        <SubTabs
          value={activeValue}
          onValueChange={(value) =>
            column.setFilterValue(
              value === ALL_SUBTAB_VALUE ? undefined : [value]
            )
          }
        >
          <SubTabsList>
            <SubTabsTrigger value={ALL_SUBTAB_VALUE}>
              {subtabs.allLabel ?? "All"} ({totalRows})
            </SubTabsTrigger>
            {subtabs.options.map((option) => (
              <SubTabsTrigger key={option.value} value={option.value}>
                {option.label} ({facets.get(option.value) ?? 0})
              </SubTabsTrigger>
            ))}
          </SubTabsList>
        </SubTabs>
        <div className="flex min-w-0 items-center gap-(--2xs)">
          {search}
          {filterControls}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-sm">
      <div className="flex flex-1 flex-wrap items-center gap-xs">{leading}</div>
      <div className="flex shrink-0 items-center gap-xs">
        {search}
        {filterControls}
      </div>
    </div>
  );
}
