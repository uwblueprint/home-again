"use client";

import { create } from "zustand";

import type {
  DonationRequest,
  DonorInformation,
  RejectionReason,
} from "@/app/donation-request/components/types";
import { DONATION_REQUEST_FIXTURE } from "@/app/donation-request/components/fixture";

/**
 * Client-side store backing the donation-request review screen.
 *
 * The database is not provisioned yet, so every action mutates local state
 * instead of calling the API. Field names match the backend review schema
 * (PR: donation request review schema), so these actions map one-to-one onto
 * the future endpoints (approve, reject, schedule pickup, confirm).
 */
interface DonationRequestStore {
  request: DonationRequest;

  approveItem: (itemId: string) => void;
  rejectItem: (
    itemId: string,
    reason: RejectionReason,
    details?: string
  ) => void;
  updateDonor: (patch: Partial<DonorInformation>) => void;
  schedulePickup: (scheduledDate: string, note?: string) => void;
  updatePickup: (scheduledDate: string, note?: string) => void;
  confirmPickup: () => void;
  reset: () => void;
}

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `pickup-${Date.now()}`;

export const useDonationRequestStore = create<DonationRequestStore>((set) => ({
  request: DONATION_REQUEST_FIXTURE,

  approveItem: (itemId) =>
    set((state) => ({
      request: {
        ...state.request,
        items: state.request.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: "APPROVED",
                rejection_reason: null,
                rejection_details: null,
              }
            : item
        ),
      },
    })),

  rejectItem: (itemId, reason, details) =>
    set((state) => ({
      request: {
        ...state.request,
        items: state.request.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: "REJECTED",
                rejection_reason: reason,
                rejection_details: details ?? null,
              }
            : item
        ),
      },
    })),

  updateDonor: (patch) =>
    set((state) => ({
      request: {
        ...state.request,
        donor: { ...state.request.donor, ...patch },
      },
    })),

  schedulePickup: (scheduledDate, note) =>
    set((state) => ({
      request: {
        ...state.request,
        pickup: {
          id: state.request.pickup?.id ?? genId(),
          scheduled_date: scheduledDate,
          note: note ?? null,
          confirmed_at: null,
        },
      },
    })),

  updatePickup: (scheduledDate, note) =>
    set((state) => {
      const existing = state.request.pickup;
      // Moving a confirmed pickup to a new date invalidates the confirmation,
      // matching the warning in the Edit Pickup dialog and the backend rule.
      const dateChanged = existing?.scheduled_date !== scheduledDate;
      return {
        request: {
          ...state.request,
          pickup: {
            id: existing?.id ?? genId(),
            scheduled_date: scheduledDate,
            note: note ?? null,
            confirmed_at: dateChanged ? null : (existing?.confirmed_at ?? null),
          },
        },
      };
    }),

  confirmPickup: () =>
    set((state) => {
      if (!state.request.pickup?.scheduled_date) return state;
      return {
        request: {
          ...state.request,
          pickup: {
            ...state.request.pickup,
            confirmed_at:
              state.request.pickup.confirmed_at ?? new Date().toISOString(),
          },
        },
      };
    }),

  reset: () => set({ request: DONATION_REQUEST_FIXTURE }),
}));
