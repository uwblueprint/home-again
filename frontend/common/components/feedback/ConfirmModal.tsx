"use client";
import { useEffect, useRef } from "react";
import type { ConfirmModalProps } from "@/common/types";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  errorMessage,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const modal = modalRef.current;
    if (!modal) {
      return;
    }

    const focusable = modal.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"
    );
    const first = focusable[0] ?? modal;
    first.focus();
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const modal = modalRef.current;
    if (!modal) {
      return;
    }

    const focusable = modal.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"
    );

    if (focusable.length === 0) {
      event.preventDefault();
      modal.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (!active || !modal.contains(active) || active === first) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        ref={modalRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2
          id="confirm-modal-title"
          className="text-xl font-semibold text-gray-900"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        {errorMessage && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Deleting..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
