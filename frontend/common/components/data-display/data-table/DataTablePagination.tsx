"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/common/components/ui/pagination";

interface DataTablePaginationProps {
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (pageIndex: number) => void;
}

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

export function DataTablePagination({
  pageIndex,
  pageCount,
  pageSize,
  totalRows,
  onPageChange,
}: DataTablePaginationProps) {
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min(totalRows, (pageIndex + 1) * pageSize);
  const canPrevious = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;

  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-paragraph-small text-muted-foreground">
        {startRow} - {endRow} of {totalRows} results
      </p>
      <Pagination className="mx-0 w-fit justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={!canPrevious}
              onClick={() => canPrevious && onPageChange(pageIndex - 1)}
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
                  isActive={page === pageIndex + 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              disabled={!canNext}
              onClick={() => canNext && onPageChange(pageIndex + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
