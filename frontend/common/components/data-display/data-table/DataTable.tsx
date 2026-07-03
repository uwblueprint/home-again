"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "@/common/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import {
  DataTableToolbar,
  type DataTableFilterConfig,
} from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";

export type { DataTableFilterConfig } from "./DataTableToolbar";
export type { DataTableFilterOption } from "./DataTableFacetedFilter";

/** Matches a row if any cell's stringified value contains the search term. */
function globalSubstringFilter(
  row: { getAllCells: () => { getValue: () => unknown }[] },
  _columnId: string,
  filterValue: string
) {
  const search = filterValue.toLowerCase();
  return row.getAllCells().some((cell) =>
    String(cell.getValue() ?? "")
      .toLowerCase()
      .includes(search)
  );
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  error?: Error | null;
  emptyStateMessage?: string;
  searchPlaceholder?: string;
  filters?: DataTableFilterConfig[];
  toolbarActions?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  pageSize?: number;
  testId?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  error = null,
  emptyStateMessage = "No results found",
  searchPlaceholder,
  filters,
  toolbarActions,
  onRowClick,
  pageSize = 10,
  testId = "data-table",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const tableColumns = onRowClick
    ? [
        ...columns,
        {
          id: "__chevron",
          enableSorting: false,
          enableHiding: false,
          header: () => null,
          cell: () => <ChevronRight className="size-4 text-muted-foreground" />,
        } satisfies ColumnDef<TData, TValue>,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalSubstringFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div
      className="flex w-full flex-col gap-xl rounded-xl border border-border p-xl shadow-xs"
      data-testid={testId}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        actions={toolbarActions}
      />

      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-auto px-xs py-3.5 text-paragraph-small font-medium text-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <DataTableSkeletonRows columns={tableColumns.length} />
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center text-destructive"
                >
                  {error.message || "Error loading data"}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "border-border",
                    onRowClick && "cursor-pointer"
                  )}
                  data-testid={`${testId}-row-${row.index}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="whitespace-nowrap px-xs py-3.5 text-paragraph-small text-foreground"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyStateMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}

function DataTableSkeletonRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <TableRow key={`skeleton-${rowIndex}`} className="border-border">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell
              key={`skeleton-${rowIndex}-${colIndex}`}
              className="px-xs py-3.5"
            >
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
