"use client";

import { DataTable } from "@/common/components/data-display";
import {
  donorColumns,
  donorHiddenColumns,
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
 * The admin donors list. Rows keep the order given until a sortable header
 * (names, donation count) is clicked.
 */
export function DonorsTable({
  data,
  onRowClick,
  loading = false,
  error = null,
}: DonorsTableProps) {
  return (
    <DataTable
      columns={donorColumns}
      data={data}
      loading={loading}
      error={error}
      // Not `header`, which would put the title on its own row above search.
      toolbarLeading={
        <h2 className="text-heading-3 font-semibold text-foreground">Donors</h2>
      }
      searchPlaceholder="Search for donor"
      emptyStateMessage="No donors found"
      onRowClick={onRowClick}
      initialColumnVisibility={donorHiddenColumns}
      testId="donors-data-table"
    />
  );
}
