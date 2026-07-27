"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { Column } from "@tanstack/react-table";

import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

/**
 * Sortable column header for DataTable. Clicking toggles between ascending
 * and descending directly — no dropdown — and the arrow icon always
 * reflects the column's current sort state.
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div className={cn("font-medium text-foreground", className)}>
        {title}
      </div>
    );
  }

  const sortDirection = column.getIsSorted();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => column.toggleSorting(sortDirection === "asc")}
      className={cn(
        // `size="sm"` sets text-[0.8rem], smaller than the plain (unsortable)
        // headers' text-paragraph-small (0.875rem) — force it back to match.
        "-ml-2 h-8 text-sm font-medium text-foreground",
        className
      )}
    >
      <span>{title}</span>
      {sortDirection === "desc" ? (
        <ArrowDown />
      ) : sortDirection === "asc" ? (
        <ArrowUp />
      ) : (
        <ArrowUpDown />
      )}
    </Button>
  );
}
