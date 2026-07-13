"use client";

import type { ReactNode } from "react";
import type { Table } from "@tanstack/react-table";

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

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  filters?: DataTableFilterConfig[];
  actions?: ReactNode;
}

/**
 * Toolbar above the table: a global search input on the left, faceted
 * column filters and any caller-supplied actions on the right.
 */
export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search",
  filters = [],
  actions,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex w-full items-center justify-between gap-sm">
      <SearchBar
        placeholder={searchPlaceholder}
        value={(table.getState().globalFilter as string) ?? ""}
        onChange={(value) => table.setGlobalFilter(value)}
      />
      <div className="flex items-center gap-xs">
        {filters.map((filter) => (
          <DataTableFacetedFilter
            key={filter.columnId}
            column={table.getColumn(filter.columnId)}
            title={filter.title}
            options={filter.options}
          />
        ))}
        {actions}
      </div>
    </div>
  );
}
