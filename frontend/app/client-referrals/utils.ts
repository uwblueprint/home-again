import type {
  ClientReferral,
  ReferralSortField,
  ReferralTab,
  ReviewFilter,
} from "./types";
import type {
  AgentRecord,
  Client,
  InventoryRecord,
  Referral,
  ReferralItem,
} from "@/common/types";
import {
  CLIENT_REFERRAL_REVIEW_STATUS,
  CLIENT_REFERRAL_TAB,
} from "./constants";
import {
  REFERRAL_ITEM_STATUS,
  REFERRAL_REJECTION_REASON,
  REFERRAL_REJECTION_REASON_LABELS,
  REFERRAL_REVIEW_STATUS,
  REFERRAL_STATUS,
  type ReferralItemStatus,
  type ReferralReviewStatus,
} from "@/common/constants/referrals";

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
    normalized.reviewed &&= item.status !== REFERRAL_ITEM_STATUS.PENDING_REVIEW;
    normalized.approved &&= (
      [
        REFERRAL_ITEM_STATUS.APPROVED,
        REFERRAL_ITEM_STATUS.SCHEDULED,
        REFERRAL_ITEM_STATUS.DELIVERED,
      ] as ReferralItemStatus[]
    ).includes(item.status);
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
    raw.status === REFERRAL_STATUS.DECLINED
      ? CLIENT_REFERRAL_TAB.REJECTED
      : raw.status === REFERRAL_STATUS.APPROVED ||
          raw.status === REFERRAL_STATUS.COMPLETED
        ? CLIENT_REFERRAL_TAB.WAITLISTED
        : CLIENT_REFERRAL_TAB.NEW;

  const toAgent = (id: string | null, role: "primary" | "secondary") => {
    const agent = id ? agents.find((item) => item.id === id) : undefined;
    return agent
      ? {
          firstName: agent.first_name,
          lastName: agent.last_name,
          role,
          email: agent.email ?? undefined,
          phone: agent.phone_number ?? undefined,
        }
      : null;
  };

  const client = clients.find((item) => item.id === raw.client_id);
  // Review status comes from item review flags until the API exposes this field.
  const items = raw.items?.length
    ? normalizeReferralItems(raw.items, inventory)
    : normalizeRequestedItems(raw.requested_items);
  const backendReviewStatus =
    raw.review_status ?? REFERRAL_REVIEW_STATUS.PENDING_REVIEW;
  const reviewStatus =
    tab !== "waitlisted"
      ? undefined
      : backendReviewStatus === REFERRAL_REVIEW_STATUS.PARTIALLY_REVIEWED
        ? CLIENT_REFERRAL_REVIEW_STATUS.PARTIALLY_REVIEWED
        : (
              [
                REFERRAL_REVIEW_STATUS.APPROVED,
                REFERRAL_REVIEW_STATUS.PARTIALLY_APPROVED,
                REFERRAL_REVIEW_STATUS.REJECTED,
                REFERRAL_REVIEW_STATUS.SCHEDULED,
                REFERRAL_REVIEW_STATUS.DELIVERED,
              ] as ReferralReviewStatus[]
            ).includes(backendReviewStatus)
          ? CLIENT_REFERRAL_REVIEW_STATUS.REVIEWED
          : CLIENT_REFERRAL_REVIEW_STATUS.PENDING;

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
    rejectionReason:
      raw.rejection_reason === REFERRAL_REJECTION_REASON.OTHER
        ? raw.rejection_details ||
          REFERRAL_REJECTION_REASON_LABELS[REFERRAL_REJECTION_REASON.OTHER]
        : raw.rejection_reason
          ? REFERRAL_REJECTION_REASON_LABELS[raw.rejection_reason]
          : undefined,
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

const collator = new Intl.Collator(undefined, { sensitivity: "base" });

export function sortReferrals(
  referrals: ClientReferral[],
  field: ReferralSortField,
  descending: boolean
) {
  const dir = descending ? -1 : 1;

  const decorated = referrals.map((r) => {
    const [first = "", last = ""] = r.clientName.split(" ", 2);
    return {
      r,
      time: Date.parse(r.submittedAtIso),
      priority: r.isPriority ? 1 : 0,
      first,
      last,
    };
  });

  decorated.sort((a, b) => {
    if (field === "priority" && a.priority !== b.priority) {
      return (a.priority - b.priority) * dir;
    }

    let diff: number;
    if (field === "recency" || field === "priority") {
      diff = a.time - b.time;
    } else {
      const aKey = field === "firstName" ? a.first : a.last;
      const bKey = field === "firstName" ? b.first : b.last;
      diff =
        collator.compare(aKey, bKey) ||
        collator.compare(a.r.clientName, b.r.clientName);
    }
    return diff * dir;
  });

  return decorated.map((d) => d.r);
}
