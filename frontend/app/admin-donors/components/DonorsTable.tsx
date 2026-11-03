"use client";

import { useMemo, useState } from "react";
import type { SortingState } from "@tanstack/react-table";

import {
  DataTable,
  SearchBar,
  SortDropdown,
} from "@/common/components/data-display";
import {
  DEFAULT_DONOR_SORT,
  donorColumns,
  donorHiddenColumns,
  donorSortOptions,
  type DonorListRow,
} from "./DonorsTableColumns";

interface DonorsTableProps {
  /**
   * Donors to list. Keep the array reference stable between renders (e.g.
   * memoize the mapping from API donors): a new array resets the table to
   * page 1.
   */
  data: DonorListRow[];
  /** Makes rows clickable and adds the row chevron. */
  onRowClick?: (row: DonorListRow) => void;
  loading?: boolean;
  error?: Error | null;
}

/**
 * The admin donors list: "Donors" title with search and sort on the right,
 * above a paginated table. Search and sort sit outside the table card (per
 * Figma), so this owns their state and drives `DataTable` through its
 * controlled `globalFilter` / `sorting` props.
 */
export function DonorsTable({
  data,
  onRowClick,
  loading = false,
  error = null,
}: DonorsTableProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(DEFAULT_DONOR_SORT);

  // Memoized: a new array each render would make TanStack re-sort.
  const sorting = useMemo<SortingState>(
    () => [{ id: sort.field, desc: sort.direction === "desc" }],
    [sort]
  );

  const handleSortFieldChange = (value: string) => {
    const option = donorSortOptions.find((item) => item.value === value);
    if (option) {
      setSort({ field: option.value, direction: option.defaultDirection });
    }
  };

  return (
    <div className="flex w-full flex-col gap-lg" data-testid="donors-table">
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <h2 className="text-heading-3 font-semibold text-foreground">Donors</h2>
        <div className="flex min-w-0 items-center gap-xs">
          <SearchBar
            placeholder="Search for donor"
            value={search}
            onChange={setSearch}
          />
          <SortDropdown
            options={donorSortOptions}
            value={sort.field}
            onChange={handleSortFieldChange}
            onReset={() => setSort(DEFAULT_DONOR_SORT)}
            direction={sort.direction}
            onDirectionChange={(direction) =>
              setSort((current) => ({ ...current, direction }))
            }
          />
        </div>
      </div>

      <DataTable
        columns={donorColumns}
        data={data}
        loading={loading}
        error={error}
        emptyStateMessage="No donors found"
        onRowClick={onRowClick}
        initialColumnVisibility={donorHiddenColumns}
        sorting={sorting}
        globalFilter={search}
        hideToolbar
        testId="donors-data-table"
      />
    </div>
  );
}
