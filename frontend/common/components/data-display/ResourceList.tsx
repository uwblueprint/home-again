"use client";

import React from "react";
import type { ResourceListProps, CellRendererProps, ResourceListSkeletonProps } from "@/common/types";
import { formatDate } from "@/common/utils/DateUtils";

/**
 * ResourceList Component
 *
 * A generic, reusable table component for displaying any resource type.
 * Supports loading states, empty states, and row actions.
 *
 * @example
 * ```tsx
 * <ResourceList<Agency>
 *   columns={agencyColumns}
 *   data={agencies}
 *   loading={isLoading}
 *   rowActions={agencyActions}
 *   emptyStateMessage="No agencies found"
 * />
 * ```
 */
export default function ResourceList<T extends { id: string }>({
  columns,
  data,
  loading,
  error,
  rowActions,
  emptyStateMessage = "No items found",
  testId = "resource-list",
}: ResourceListProps<T>) {
  return (
    <div className="w-full" data-testid={testId}>
      {/* Error State */}
      {error && !loading && (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
          role="alert"
        >
          <p className="font-medium">Error loading data</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && <ResourceListSkeleton columns={columns} hasActions={rowActions.length > 0} />}

      {/* Empty State */}
      {!loading && !error && data.length === 0 && (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-4 text-gray-600">{emptyStateMessage}</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && data.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="w-full divide-y divide-gray-200">
            {/* Table Header */}
            <thead className="bg-gray-50">
              <tr className="divide-x divide-gray-200">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    scope="col"
                    style={{ width: column.width }}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                  >
                    {column.label}
                  </th>
                ))}
                {rowActions.length > 0 && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className="divide-x divide-gray-200 hover:bg-gray-50 transition-colors"
                  data-testid={`resource-row-${rowIndex}`}
                >
                  {columns.map((column) => (
                    <td
                      key={`${row.id}-${String(column.key)}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      <CellRenderer
                        column={column}
                        row={row}
                        value={row[column.key]}
                      />
                    </td>
                  ))}
                  {rowActions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {rowActions.map((action) => {
                          // Check if action should be shown
                          if (action.show && !action.show(row)) {
                            return null;
                          }

                          return (
                            <button
                              key={action.id}
                              onClick={() => action.onClick(row)}
                              className={
                                action.className ||
                                "text-blue-600 hover:text-blue-800 hover:underline transition"
                              }
                              title={action.label}
                              data-testid={`action-${action.id}-${row.id}`}
                            >
                              {action.icon && (
                                <span className="mr-1">{action.icon}</span>
                              )}
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * CellRenderer
 *
 * Renders cell content with optional custom formatting.
 * Falls back to default rendering if no custom render function is provided.
 */
function CellRenderer<T>({ column, row, value }: CellRendererProps<T>) {
  if (column.render) {
    return <>{column.render(value, row)}</>;
  }

  switch (column.type) {
    case "email":
      return (
        <a
          href={`mailto:${value}`}
          className="text-blue-600 hover:underline"
        >
          {String(value)}
        </a>
      );

    case "phone":
      return (
        <a href={`tel:${value}`} className="text-blue-600 hover:underline">
          {String(value)}
        </a>
      );

    case "status":
      return <StatusBadge status={String(value)} />;

    case "date":
      return <>{formatDate(value as string)}</>;

    case "text":
    default:
      return <>{value != null ? String(value) : "—"}</>;
  }
}

/**
 * StatusBadge
 *
 * Displays status values with appropriate styling.
 */
function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    approved: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    active: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
    unprocessed: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
    deactivated: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
    inactive: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
  };

  const style = statusStyles[status.toLowerCase()] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${style.border} ${style.bg} ${style.text} px-3 py-1 text-xs font-medium capitalize`}
    >
      {status}
    </span>
  );
}

/**
 * ResourceListSkeleton
 *
 * Loading skeleton that mimics the table structure.
 */
function ResourceListSkeleton<T>({
  columns,
  hasActions,
}: ResourceListSkeletonProps<T>) {
  const rows = 5;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr className="divide-x divide-gray-200">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                style={{ width: column.width }}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
              >
                {column.label}
              </th>
            ))}
            {hasActions && (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {Array.from({ length: rows }).map((_, i) => (
            <tr
              key={`skeleton-${i}`}
              className="divide-x divide-gray-200 animate-pulse"
            >
              {columns.map((column) => (
                <td
                  key={`skeleton-${i}-${String(column.key)}`}
                  className="px-6 py-4 whitespace-nowrap"
                >
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </td>
              ))}
              {hasActions && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <div className="h-4 w-12 rounded bg-gray-200" />
                    <div className="h-4 w-12 rounded bg-gray-200" />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
