import type { ClientReferral, ReferralTab, ReviewFilter } from "./types";
import type { AgentRecord, Client, Referral } from "@/common/types";

const pad = (n: number) => String(n).padStart(2, "0");

export function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}/${d.getUTCFullYear()}`;
}

export const unfulfillableMsg = (count: number) =>
  count > 0
    ? `${count} items that can't be fully fulfilled right now.`
    : undefined;

function toReferralItems(rawItems: unknown[]) {
  return rawItems.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];

    const value = item as Record<string, unknown>;
    if (typeof value.name !== "string") return [];

    return [
      {
        id: typeof value.id === "string" ? value.id : `requested-item-${index}`,
        name: value.name,
        quantity: typeof value.quantity === "number" ? value.quantity : 1,
        stock: typeof value.stock === "number" ? value.stock : 0,
      },
    ];
  });
}

function getReviewSummary(rawItems: unknown[]) {
  const reviewableItems = rawItems.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as Record<string, unknown>).name === "string"
  );
  const reviewedItems = reviewableItems.filter(
    (item) => item.reviewed === true
  );

  return {
    totalCount: reviewableItems.length,
    reviewedCount: reviewedItems.length,
    approvedCount: reviewedItems.filter((item) => item.approved === true)
      .length,
  };
}

/**
 * Backend Referral -> view model used by the referral cards.
 */
export function toClientReferral(
  raw: Referral,
  clients: Client[],
  agents: AgentRecord[]
): ClientReferral {
  const tab: ReferralTab =
    raw.status === "declined"
      ? "rejected"
      : raw.status === "approved" || raw.status === "completed"
        ? "waitlisted"
        : "new";

  const toAgent = (id: string | null, role: "primary" | "secondary") => {
    const agent = id ? agents.find((item) => item.id === id) : undefined;
    return agent
      ? {
          firstName: agent.first_name,
          lastName: agent.last_name,
          role,
        }
      : null;
  };

  const client = clients.find((item) => item.id === raw.client_id);
  const review = getReviewSummary(raw.requested_items);
  const reviewStatus =
    tab !== "waitlisted" || review.reviewedCount === 0
      ? tab === "waitlisted"
        ? "pending-review"
        : undefined
      : review.reviewedCount < review.totalCount
        ? "partially-reviewed"
        : "reviewed";

  return {
    id: raw.id,
    tab,
    clientName: client ? `${client.first_name} ${client.last_name}` : "Client",
    referralId: raw.id,
    submittedAt: formatDate(raw.created_at),
    submittedAtIso: raw.created_at,
    isPriority: Boolean(raw.is_priority),
    priorityDescription: raw.priority_description ?? undefined,
    agents: [
      toAgent(raw.agent_id, "primary"),
      toAgent(raw.secondary_agent_id, "secondary"),
    ].filter(Boolean) as ClientReferral["agents"],
    items: toReferralItems(raw.requested_items),
    reviewStatus,
    approvedCount:
      reviewStatus === "reviewed" ? review.approvedCount : undefined,
    totalCount: reviewStatus === "reviewed" ? review.totalCount : undefined,
  };
}

export function matchesQuery(r: ClientReferral, query: string) {
  const q = query.trim().toLowerCase();
  const searchableText = [
    r.clientName,
    r.referralId,
    r.submittedAt,
    ...r.agents.flatMap((agent) => [
      agent.firstName,
      agent.lastName,
      `${agent.firstName} ${agent.lastName}`,
    ]),
  ]
    .join(" ")
    .toLowerCase();

  return !q || searchableText.includes(q);
}

export function matchesReviewFilter(r: ClientReferral, filter: ReviewFilter) {
  return filter === "all" || r.reviewStatus === filter;
}

export function sortBySubmissionDate(
  referrals: ClientReferral[],
  descending: boolean
) {
  return [...referrals].sort((a, b) => {
    const difference =
      Date.parse(a.submittedAtIso) - Date.parse(b.submittedAtIso);
    return descending ? -difference : difference;
  });
}
