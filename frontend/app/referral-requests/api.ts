import { API_STATUS } from "./constants";
import type { ReferralStatusUpdate } from "./types";

// TODO: replace with common/lib/apiClient.ts (and a hook in common/hooks/useApi.ts)
// once its signature is confirmed. Kept isolated here so that's a one-file swap.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const REFERRALS_PATH = "/api/referrals";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export function fetchReferrals() {
  return request<unknown[]>(REFERRALS_PATH);
}

export function updateReferralStatus(
  id: string,
  { target, rejectionReason, isPriority }: ReferralStatusUpdate
) {
  return request(`${REFERRALS_PATH}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: API_STATUS[target],
      ...(isPriority === undefined ? {} : { is_priority: isPriority }),
      // TODO: Referral has no rejection-reason column in SCHEMA.md yet.
      ...(rejectionReason ? { rejection_reason: rejectionReason } : {}),
    }),
  });
}
