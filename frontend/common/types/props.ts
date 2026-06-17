/**
 * Shared component prop interfaces for components in common/components/.
 * Flow-specific prop types live in the feature's own context/ or components/ file.
 */

import type { ReactNode } from "react";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export interface ResourceDetailField<
  T extends object,
  K extends keyof T = keyof T,
> {
  key: K;
  label: string;
  emptyValue?: string;
  render?: (value: T[K], data: T) => ReactNode;
}

export interface ResourceDetailProps<T extends object> {
  title?: string;
  fields: ResourceDetailField<T>[];
  data: T;
  onDelete?: () => Promise<void> | void;
  deleteTitle?: string;
  deleteMessage?: string;
  isDeleting?: boolean;
}

export type ColumnType = "text" | "email" | "phone" | "status" | "date";

export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  type?: ColumnType;
  width?: string;
  render?: (value: unknown, row: T) => ReactNode;
}

export interface RowActionConfig<T> {
  id: string;
  label: string;
  icon?: string;
  className?: string;
  onClick: (row: T) => void;
  show?: (row: T) => boolean;
}

export interface ResourceListProps<T> {
  columns: ColumnConfig<T>[];
  data: T[];
  loading: boolean;
  error?: Error | null;
  rowActions: RowActionConfig<T>[];
  emptyStateMessage?: string;
  testId?: string;
}

export interface CellRendererProps<T> {
  column: ColumnConfig<T>;
  row: T;
  value: unknown;
}

export interface ResourceListSkeletonProps<T = unknown> {
  columns: ColumnConfig<T>[];
  hasActions: boolean;
}
