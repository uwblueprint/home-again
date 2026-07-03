"use client";

import type { MouseEvent } from "react";
import type { Table } from "@tanstack/react-table";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/common/components/ui/pagination";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

function preventDefault(event: MouseEvent) {
  event.preventDefault();
}

/**
 * Builds a windowed list of page numbers around the current page, e.g.
 * [1, "...", 4, 5, 6, "...", 10]. Mirrors the Figma pagination footer.
 */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  const maxVisible = 5;
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  pages.add(Math.max(1, current - 1));
  pages.add(Math.min(total, current + 1));

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) {
      result.push("...");
    }
    result.push(page);
  });
  return result;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min(totalRows, (pageIndex + 1) * pageSize);

  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-paragraph-small text-muted-foreground">
        {startRow} - {endRow} of {totalRows} results
      </p>
      <Pagination className="mx-0 w-fit justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={!table.getCanPreviousPage()}
              className={
                table.getCanPreviousPage()
                  ? undefined
                  : "pointer-events-none opacity-50"
              }
              onClick={(event) => {
                preventDefault(event);
                table.previousPage();
              }}
            />
          </PaginationItem>
          {getPageNumbers(pageIndex + 1, pageCount).map((page, i) =>
            page === "..." ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === pageIndex + 1}
                  onClick={(event) => {
                    preventDefault(event);
                    table.setPageIndex(page - 1);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={!table.getCanNextPage()}
              className={
                table.getCanNextPage()
                  ? undefined
                  : "pointer-events-none opacity-50"
              }
              onClick={(event) => {
                preventDefault(event);
                table.nextPage();
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
