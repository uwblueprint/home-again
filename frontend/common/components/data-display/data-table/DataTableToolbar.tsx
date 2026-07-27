"use client";

import type { ReactNode } from "react";
import type { Table } from "@tanstack/react-table";

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
  actions?: ReactNode;
  subtabs?: DataTableSubtabsConfig;
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search",
  filters = [],
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
  );

  if (subtabs) {
    const column = table.getColumn(subtabs.columnId);
    // Stored as string[] (not a lone string) so this column can also be
    // targeted by a multi-select `filters` entry at the same time — see the
    // README's "Subtabs" section for why the shapes have to match. A tab
    // click replaces the whole array with its one value; "All" shows active
    // whenever zero or more-than-one values are selected (e.g. via filters).
    const filterValue = column?.getFilterValue() as string[] | undefined;
    const activeValue =
      filterValue?.length === 1 ? filterValue[0] : ALL_SUBTAB_VALUE;
    const facets = column?.getFacetedUniqueValues();
    const totalRows = column?.getFacetedRowModel().rows.length ?? 0;

    return (
      <div className="flex w-full items-center justify-between gap-sm">
        <SubTabs
          value={activeValue}
          onValueChange={(value) =>
            column?.setFilterValue(
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
                {option.label} ({facets?.get(option.value) ?? 0})
              </SubTabsTrigger>
            ))}
          </SubTabsList>
        </SubTabs>
        <div className="flex items-center gap-sm">
          {search}
          {filterControls}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-between gap-sm">
      {search}
      {filterControls}
    </div>
  );
}
