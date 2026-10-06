"use client";

import { useState } from "react";

import { BigToggleButton } from "@/common/components/data-display";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { cn } from "@/common/lib/utils";

/** Single-select status filter shared by the cards and pills on list pages. */
export function useStatusFilter<TRow, TStatus extends string>(
  rows: TRow[],
  statuses: readonly TStatus[],
  getStatus: (row: TRow) => TStatus
) {
  const [filter, setFilter] = useState<TStatus | "all">("all");

  const counts = Object.fromEntries(
    statuses.map((status) => [
      status,
      rows.filter((row) => getStatus(row) === status).length,
    ])
  ) as Record<TStatus, number>;

  return {
    filter,
    setFilter,
    counts,
    total: rows.length,
    filteredRows:
      filter === "all" ? rows : rows.filter((row) => getStatus(row) === filter),
  };
}

type StatusFilterProps<TStatus extends string> = {
  statuses: readonly TStatus[];
  counts: Record<TStatus, number>;
  filter: TStatus | "all";
  onFilterChange: (filter: TStatus | "all") => void;
  labels?: Partial<Record<TStatus, string>>;
};

export function StatusCards<TStatus extends string>({
  statuses,
  counts,
  filter,
  onFilterChange,
  labels,
  className,
}: StatusFilterProps<TStatus> & { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-lg sm:grid-cols-2", className)}>
      {statuses.map((status) => (
        <BigToggleButton
          key={status}
          count={counts[status]}
          label={labels?.[status] ?? status}
          selected={filter === status}
          onClick={() => onFilterChange(filter === status ? "all" : status)}
        />
      ))}
    </div>
  );
}

export function StatusPills<TStatus extends string>({
  statuses,
  counts,
  total,
  filter,
  onFilterChange,
  labels,
}: StatusFilterProps<TStatus> & { total: number }) {
  const pills = [
    { value: "all" as const, label: "All", count: total },
    ...statuses.map((status) => ({
      value: status,
      label: labels?.[status] ?? status,
      count: counts[status],
    })),
  ];

  return (
    <Tabs
      value={filter}
      onValueChange={(value: TStatus | "all") => onFilterChange(value)}
    >
      <TabsList variant="segmented">
        {pills.map((pill) => (
          <TabsTrigger key={pill.value} value={pill.value}>
            {pill.label} ({pill.count})
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
