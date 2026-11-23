"use client";

import { create } from "zustand";

import type {
  DonationRequest,
  DonorInformation,
  RejectionReason,
} from "@/app/donation-request/components/types";
import { DONATION_REQUEST_SAMPLES } from "@/app/donation-request/components/listFixture";

/**
 * Client-side store backing the donation-request list and review screens.
 *
 * The database is not provisioned yet, so every action mutates local state
 * instead of calling the API. Field names match the backend review schema
 * (PR: donation request review schema), so these actions map one-to-one onto
 * the future endpoints (approve, reject, schedule pickup, confirm). Requests
 * are keyed by id so the list reflects reviews made on the detail page.
 *
 * The detail page seeds its request from GET /donations/{id}/detail via
 * `loadRequest`.
 */
interface DonationRequestStore {
  requests: Record<string, DonationRequest>;

  /** Stores a request under its id, e.g. freshly fetched data. */
  loadRequest: (request: DonationRequest) => void;

  approveItem: (requestId: string, itemId: string) => void;
  rejectItem: (
    requestId: string,
    itemId: string,
    reason: RejectionReason,
    details?: string
  ) => void;
  updateDonor: (requestId: string, patch: Partial<DonorInformation>) => void;
  schedulePickup: (
    requestId: string,
    scheduledDate: string,
    note?: string
  ) => void;
  updatePickup: (
    requestId: string,
    scheduledDate: string,
    note?: string
  ) => void;
  confirmPickup: (requestId: string) => void;
  reset: () => void;
}

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `pickup-${Date.now()}`;

const seedRequests = (): Record<string, DonationRequest> =>
  Object.fromEntries(
    DONATION_REQUEST_SAMPLES.map((request) => [request.id, request])
  );

/**
 * Applies `update` to one request. Unknown ids leave the state untouched, so a
 * stale id from the URL can't create a half-formed request.
 */
function updateRequest(
  state: DonationRequestStore,
  requestId: string,
  update: (request: DonationRequest) => DonationRequest
): Partial<DonationRequestStore> {
  const request = state.requests[requestId];
  if (!request) return {};
  return { requests: { ...state.requests, [requestId]: update(request) } };
}

export const useDonationRequestStore = create<DonationRequestStore>((set) => ({
  requests: seedRequests(),

  loadRequest: (request) =>
    set((state) => ({
      requests: { ...state.requests, [request.id]: request },
    })),

  approveItem: (requestId, itemId) =>
    set((state) =>
      updateRequest(state, requestId, (request) => ({
        ...request,
        furniture_items: request.furniture_items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: "APPROVED",
                rejection_reason: null,
                rejection_details: null,
              }
            : item
        ),
      }))
    ),

  rejectItem: (requestId, itemId, reason, details) =>
    set((state) =>
      updateRequest(state, requestId, (request) => {
        const furniture_items = request.furniture_items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: "REJECTED" as const,
                rejection_reason: reason,
                rejection_details: details ?? null,
              }
            : item
        );
        // With nothing approved there is nothing to pick up, so a pickup booked
        // for the earlier approvals is dropped rather than left "Scheduled".
        const hasApproved = furniture_items.some(
          (item) => item.status === "APPROVED"
        );
        return {
          ...request,
          furniture_items,
          pickup: hasApproved ? request.pickup : null,
        };
      })
    ),

  updateDonor: (requestId, patch) =>
    set((state) =>
      updateRequest(state, requestId, (request) => ({
        ...request,
        donor: { ...request.donor, ...patch },
      }))
    ),

  schedulePickup: (requestId, scheduledDate, note) =>
    set((state) =>
      updateRequest(state, requestId, (request) => ({
        ...request,
        pickup: {
          id: request.pickup?.id ?? genId(),
          scheduled_date: scheduledDate,
          note: note ?? null,
          confirmed_at: null,
        },
      }))
    ),

  updatePickup: (requestId, scheduledDate, note) =>
    set((state) =>
      updateRequest(state, requestId, (request) => {
        const existing = request.pickup;
        // Moving a confirmed pickup to a new date invalidates the confirmation,
        // matching the warning in the Edit Pickup dialog and the backend rule.
        const dateChanged = existing?.scheduled_date !== scheduledDate;
        return {
          ...request,
          pickup: {
            id: existing?.id ?? genId(),
            scheduled_date: scheduledDate,
            note: note ?? null,
            confirmed_at: dateChanged ? null : (existing?.confirmed_at ?? null),
          },
        };
      })
    ),

  confirmPickup: (requestId) =>
    set((state) =>
      updateRequest(state, requestId, (request) => {
        if (!request.pickup?.scheduled_date) return request;
        return {
          ...request,
          pickup: {
            ...request.pickup,
            confirmed_at:
              request.pickup.confirmed_at ?? new Date().toISOString(),
          },
        };
      })
    ),

  reset: () => set({ requests: seedRequests() }),
}));
