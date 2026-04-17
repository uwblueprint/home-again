"use client";

import { useState } from "react";
import ConfirmModal from "@/common/components/feedback/ConfirmModal";
import type { ResourceDetailProps } from "@/common/types";

function defaultDisplayValue(value: unknown, emptyValue = "-") {
  if (value === null || value === undefined || value === "") {
    return emptyValue;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value) || typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function extractErrorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    return error.trim() ? error : null;
  }

  if (error instanceof Error) {
    return error.message?.trim() ? error.message : null;
  }

  if (typeof error === "object") {
    const maybeAxiosDetail = (error as { response?: { data?: { detail?: unknown } } })
      ?.response?.data?.detail;
    if (typeof maybeAxiosDetail === "string" && maybeAxiosDetail.trim()) {
      return maybeAxiosDetail;
    }

    const maybeMessage = (error as { message?: unknown })?.message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
  }

  return null;
}

export default function ResourceDetail<T extends object>({
  title,
  fields,
  data,
  onDelete,
  deleteTitle = "Confirm deletion",
  deleteMessage = "Are you sure you want to delete this item?",
  isDeleting = false,
}: ResourceDetailProps<T>) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!onDelete) {
      return;
    }

    setConfirmError(null);
    try {
      await onDelete();
      setShowConfirmModal(false);
    } catch (error) {
      setConfirmError(
        extractErrorMessage(error) ?? "Unable to delete. Please try again."
      );
    }
  };

  return (
    <>
      <section className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {title ?? "Resource Details"}
          </h2>
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                setConfirmError(null);
                setShowConfirmModal(true);
              }}
              disabled={isDeleting}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Delete
            </button>
          )}
        </div>

        <dl className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          {fields.map((field) => {
            const rawValue = data[field.key];
            const renderedValue = field.render
              ? field.render(rawValue, data)
              : defaultDisplayValue(rawValue, field.emptyValue);

            return (
              <div
                key={String(field.key)}
                className="rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {field.label}
                </dt>
                <dd className="mt-1 break-words text-sm text-gray-900">{renderedValue}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      <ConfirmModal
        isOpen={showConfirmModal}
        title={deleteTitle}
        message={deleteMessage}
        errorMessage={confirmError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirmError(null);
          setShowConfirmModal(false);
        }}
        isLoading={isDeleting}
      />
    </>
  );
}
