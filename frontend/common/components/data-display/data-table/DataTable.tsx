"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type VisibilityState,
  type Row,
  type RowData,
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

export type { DataTableFilterConfig } from "./DataTableToolbar";
export type { DataTableFilterOption } from "./DataTableFacetedFilter";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    /** Current search query, for highlighting matches in cells. */
    globalFilter?: string;
  }
}

export type DataTableSortOptionConfig = DataTableSortOption & {
  /** TanStack sorting state applied when this option is selected. */
  sorting: SortingState;
};

/** Matches a row if any cell's stringified value contains the search term. */
function globalSubstringFilter<TData>(
  row: Row<TData>,
  _columnId: string,
  filterValue: string
) {
  const search = filterValue.trim().toLowerCase();
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
  /** Sort menu options; the first one is applied by default. */
  sortOptions?: DataTableSortOptionConfig[];
  header?: ReactNode;
  toolbarLeading?: ReactNode;
  toolbarActions?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  /** Highlights this query in cells without filtering rows. */
  highlightQuery?: string;
  pageSize?: number;
  initialColumnVisibility?: VisibilityState;
  hideToolbar?: boolean;
  hidePagination?: boolean;
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
  sortOptions,
  header,
  toolbarLeading,
  toolbarActions,
  onRowClick,
  highlightQuery,
  pageSize = 10,
  initialColumnVisibility = {},
  hideToolbar = false,
  hidePagination = false,
  testId = "data-table",
}: DataTableProps<TData, TValue>) {
  const [sortValue, setSortValue] = useState<string | null>(
    sortOptions?.[0]?.value ?? null
  );
  const [sorting, setSorting] = useState<SortingState>(
    sortOptions?.[0]?.sorting ?? []
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility
  );
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
    meta: { globalFilter: highlightQuery ?? globalFilter },
  });

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
  const showSearchEmpty = !loading && !error && !hasRows && !!trimmedSearch;
  const { pageIndex } = table.getState().pagination;

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

      {showSearchEmpty ? (
        <DataTableSearchEmptyState query={trimmedSearch} />
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

          {hidePagination ? null : (
            <DataTablePagination
              pageIndex={pageIndex}
              pageCount={table.getPageCount()}
              pageSize={pageSize}
              totalRows={table.getFilteredRowModel().rows.length}
              onPageChange={table.setPageIndex}
            />
          )}
        </>
      )}
    </div>
  );
}

function DataTableSearchEmptyState({ query }: { query: string }) {
  return (
    <div
      className="flex min-h-[280px] flex-col items-center justify-center gap-xs rounded-xl border border-border px-xl py-2xl text-center"
      data-testid="data-table-search-empty"
    >
      <p className="text-heading-3 font-semibold text-muted-foreground">
        Search not found
      </p>
      <p className="text-paragraph-small text-muted-foreground">
        No results found for &apos;{query}&apos;
      </p>
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
