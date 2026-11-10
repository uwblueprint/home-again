import type { ClientReferral, ReferralTab, ReviewFilter } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

/** MM/DD/YY (submitted) or MM/DD/YYYY (previous submission), matching the design. */
export function formatDate(iso?: string | null, fullYear = false): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const year = fullYear
    ? d.getUTCFullYear()
    : String(d.getUTCFullYear()).slice(-2);
  return `${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}/${year}`;
}

export const unfulfillableMsg = (count: number) =>
  count > 0
    ? `${count} items that can't be fully fulfilled right now.`
    : undefined;

/**
 * Backend Referral (docs/SCHEMA.md) -> view model.
 * Nested client/agent shapes and stock/review data are assumptions - adjust
 * once the list endpoint's response is confirmed.
 */
export function toClientReferral(raw: any): ClientReferral {
  const tab: ReferralTab =
    raw.status === "rejected" || raw.status === "declined"
      ? "rejected"
      : raw.status === "waitlisted"
        ? "waitlisted"
        : "new";

  const toAgent = (a: any, role: string) =>
    a
      ? {
          firstName: a.first_name,
          lastName: a.last_name,
          role,
          imageUrl: a.image_url,
        }
      : null;

  return {
    id: raw.id,
    tab,
    clientName: raw.client
      ? `${raw.client.first_name} ${raw.client.last_name}`
      : "Client",
    referralId: raw.id,
    submittedAt: formatDate(raw.created_at),
    isPriority: Boolean(raw.is_priority),
    agents: [
      toAgent(raw.agent, "Primary Agent"),
      toAgent(raw.secondary_agent, "Secondary Agent"),
    ].filter(Boolean) as ClientReferral["agents"],
    // TODO: join requested_items with inventory stock
    items: [],
    reviewStatus: tab === "waitlisted" ? "pending-review" : undefined,
    rejectionReason: raw.rejection_reason ?? undefined,
  };
}

export function matchesQuery(r: ClientReferral, query: string) {
  const q = query.trim().toLowerCase();
  return !q || `${r.clientName} ${r.referralId}`.toLowerCase().includes(q);
}

export function matchesReviewFilter(r: ClientReferral, filter: ReviewFilter) {
  return filter === "all" || r.reviewStatus === filter;
}
