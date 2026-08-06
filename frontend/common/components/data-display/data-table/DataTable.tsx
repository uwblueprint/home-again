"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type VisibilityState,
  type Row,
  type SortingState,
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
  type DataTableSortOption,
} from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";

export type { DataTableFilterConfig, DataTableSortOption } from "./DataTableToolbar";
export type { DataTableFilterOption } from "./DataTableFacetedFilter";

export type DataTableSortOptionConfig = DataTableSortOption & {
  /** TanStack sorting state applied when this option is selected. */
  sorting: SortingState;
};

/** Matches a row if any cell value or top-level string field contains the search term. */
function globalSubstringFilter<TData>(
  row: Row<TData>,
  _columnId: string,
  filterValue: string
) {
  const search = String(filterValue ?? "")
    .toLowerCase()
    .trim();
  if (!search) return true;

  const cellMatches = row.getAllCells().some((cell) => {
    const value = cell.getValue();
    if (value == null) return false;
    if (Array.isArray(value)) {
      return value.some((item) =>
        String(item).toLowerCase().includes(search)
      );
    }
    return String(value).toLowerCase().includes(search);
  });
  if (cellMatches) return true;

  const original = row.original as Record<string, unknown>;
  return Object.values(original).some((value) => {
    if (value == null || typeof value === "object") return false;
    return String(value).toLowerCase().includes(search);
  });
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  error?: Error | null;
  emptyStateMessage?: string;
  /** Custom empty UI. Receives the current search query when the table has no rows. */
  emptyState?: ReactNode | ((ctx: { globalFilter: string }) => ReactNode);
  searchPlaceholder?: string;
  filters?: DataTableFilterConfig[];
  sortOptions?: DataTableSortOptionConfig[];
  defaultSortValue?: string;
  header?: ReactNode;
  toolbarLeading?: ReactNode;
  toolbarActions?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  /** Controlled search query. Pair with `onGlobalFilterChange`. */
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  /** Fires when the table search query or filtered row count changes. */
  onSearchStateChange?: (state: {
    query: string;
    resultCount: number;
  }) => void;
  pageSize?: number;
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  /** Hide the search / filter / sort toolbar (e.g. universal search sections). */
  hideToolbar?: boolean;
  /** Hide the pagination footer. */
  hidePagination?: boolean;
  testId?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  error = null,
  emptyStateMessage = "No results found",
  emptyState,
  searchPlaceholder,
  filters,
  sortOptions,
  defaultSortValue,
  header,
  toolbarLeading,
  toolbarActions,
  onRowClick,
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange,
  onSearchStateChange,
  pageSize = 10,
  initialSorting = [],
  initialColumnVisibility = {},
  hideToolbar = false,
  hidePagination = false,
  testId = "data-table",
}: DataTableProps<TData, TValue>) {
  const defaultOption = useMemo(() => {
    if (!sortOptions?.length) return null;
    return (
      sortOptions.find((option) => option.value === defaultSortValue) ??
      sortOptions[0]
    );
  }, [sortOptions, defaultSortValue]);

  const [sortValue, setSortValue] = useState<string | null>(
    defaultOption?.value ?? null
  );
  const [sorting, setSorting] = useState<SortingState>(
    defaultOption?.sorting ?? initialSorting
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility
  );
  const [uncontrolledGlobalFilter, setUncontrolledGlobalFilter] = useState("");
  const isSearchControlled = controlledGlobalFilter !== undefined;
  const globalFilter = isSearchControlled
    ? controlledGlobalFilter
    : uncontrolledGlobalFilter;

  const setGlobalFilter = (
    updater: string | ((previous: string) => string)
  ) => {
    const previous = isSearchControlled
      ? (controlledGlobalFilter ?? "")
      : uncontrolledGlobalFilter;
    const next = typeof updater === "function" ? updater(previous) : updater;
    if (isSearchControlled) {
      onGlobalFilterChange?.(next);
    } else {
      setUncontrolledGlobalFilter(next);
    }
  };

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
    state: { sorting, columnFilters, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalSubstringFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    meta: { globalFilter },
  });

  const filteredRowCount = table.getFilteredRowModel().rows.length;

  useEffect(() => {
    onSearchStateChange?.({
      query: globalFilter,
      resultCount: filteredRowCount,
    });
  }, [globalFilter, filteredRowCount, onSearchStateChange]);

  const handleSortChange = (value: string) => {
    const option = sortOptions?.find((item) => item.value === value);
    if (!option) return;
    setSortValue(value);
    setSorting(option.sorting);
  };

  const handleSortReset = () => {
    setSortValue(null);
    setSorting([]);
  };

  const hasRows = table.getRowModel().rows.length > 0;
  const trimmedSearch = globalFilter.trim();
  const showSearchEmpty =
    !loading && !error && !hasRows && trimmedSearch.length > 0;

  const searchEmptyState = showSearchEmpty
    ? typeof emptyState === "function"
      ? emptyState({ globalFilter: trimmedSearch })
      : emptyState
    : null;

  return (
    <div
      className="flex w-full flex-col gap-xl rounded-xl border border-border p-xl shadow-xs"
      data-testid={testId}
    >
      {header}

      {hideToolbar ? null : (
        <DataTableToolbar
          table={table}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          sortOptions={sortOptions}
          sortValue={sortValue}
          onSortChange={sortOptions ? handleSortChange : undefined}
          onSortReset={sortOptions ? handleSortReset : undefined}
          leading={toolbarLeading}
          actions={toolbarActions}
        />
      )}

      {searchEmptyState ? (
        searchEmptyState
      ) : (
        <>
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
              ) : hasRows ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onRowClick(row.original);
                            }
                          }
                        : undefined
                    }
                    role={onRowClick ? "button" : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
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

          {hidePagination ? null : <DataTablePagination table={table} />}
        </>
      )}
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
