"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import type { Table } from "@tanstack/react-table";

import { Input } from "@/common/components/ui/input";
import {
  DataTableFacetedFilter,
  type DataTableFilterOption,
} from "./DataTableFacetedFilter";

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
      <div className="relative w-full max-w-75">
        <Search className="pointer-events-none absolute left-sm top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="pl-8"
        />
      </div>
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
