import type { ClientReferral, ReferralTab, ReviewFilter } from "./types";
import type {
  AgentRecord,
  Client,
  InventoryRecord,
  Referral,
  ReferralItem,
} from "@/common/types";

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

export type NormalizedRequestedItem = {
  id: string;
  name: string;
  size?: string;
  quantity: number;
  stock: number;
  description?: string;
  reviewed: boolean;
  approved: boolean;
};

export function normalizeReferralItems(
  items: ReferralItem[],
  inventory: InventoryRecord[] = []
) {
  const grouped = new Map<string, NormalizedRequestedItem>();
  for (const item of items) {
    const key = `${item.name}|${item.size ?? ""}`;
    const existing = grouped.get(key);
    const inventoryItem = item.inventory_id
      ? inventory.find((record) => record.id === item.inventory_id)
      : undefined;
    const normalized = existing ?? {
      id: item.id,
      name: item.name,
      size: item.size ?? undefined,
      quantity: 0,
      stock: inventoryItem?.available ?? 0,
      description: item.notes ?? undefined,
      reviewed: true,
      approved: true,
    };
    normalized.quantity += 1;
    normalized.reviewed &&= item.status !== "PENDING_REVIEW";
    normalized.approved &&= ["APPROVED", "SCHEDULED", "DELIVERED"].includes(
      item.status
    );
    grouped.set(key, normalized);
  }
  return [...grouped.values()];
}

export function normalizeRequestedItems(
  rawItems: unknown[]
): NormalizedRequestedItem[] {
  return rawItems.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];

    const value = item as Record<string, unknown>;
    const name =
      typeof value.name === "string"
        ? value.name
        : typeof value.item === "string"
          ? value.item
          : undefined;
    if (!name) return [];

    return [
      {
        id: typeof value.id === "string" ? value.id : `requested-item-${index}`,
        name,
        size: typeof value.size === "string" ? value.size : undefined,
        quantity: typeof value.quantity === "number" ? value.quantity : 1,
        stock: typeof value.stock === "number" ? value.stock : 0,
        description:
          typeof value.description === "string"
            ? value.description
            : typeof value.notes === "string"
              ? value.notes
              : undefined,
        reviewed: value.reviewed === true,
        approved: value.approved === true,
      },
    ];
  });
}

/**
 * Backend Referral -> view model used by the referral cards.
 */
export function toClientReferral(
  raw: Referral,
  clients: Client[],
  agents: AgentRecord[],
  inventory: InventoryRecord[] = []
): ClientReferral {
  const tab: ReferralTab =
    // Completed referrals stay in the waitlist because there is no completed tab.
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
  // Review status comes from item review flags until the API exposes this field.
  const items = raw.items?.length
    ? normalizeReferralItems(raw.items, inventory)
    : normalizeRequestedItems(raw.requested_items);
  const backendReviewStatus = raw.review_status ?? "pending_review";
  const reviewStatus =
    tab !== "waitlisted"
      ? undefined
      : backendReviewStatus === "partially_reviewed"
        ? "partially-reviewed"
        : [
              "approved",
              "partially_approved",
              "rejected",
              "scheduled",
              "delivered",
            ].includes(backendReviewStatus)
          ? "reviewed"
          : "pending-review";

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
    items: items.map((item) => ({
      id: item.id,
      name: [item.name, item.size].filter(Boolean).join(" / "),
      quantity: item.quantity,
      stock: item.stock,
    })),
    reviewStatus,
    approvedCount:
      reviewStatus === "reviewed" ? (raw.approved_count ?? 0) : undefined,
    totalCount:
      reviewStatus === "reviewed"
        ? (raw.item_count ?? items.length)
        : undefined,
  };
}

export function matchesQuery(r: ClientReferral, query: string) {
  const q = query.trim().toLowerCase();
  // Search uses display values so users can search what they see on the card.
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
