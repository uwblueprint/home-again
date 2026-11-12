import type { Referral } from "@/common/types";
import type { ReferralRequestPreview } from "@/app/referral-requests/[id]/types";

export function toReferralRequest(raw: Referral): ReferralRequestPreview {
  const reviewable = raw.requested_items.filter(
    (item): item is Record<string, unknown> =>
      !!item &&
      typeof item === "object" &&
      (typeof (item as Record<string, unknown>).name === "string" ||
        typeof (item as Record<string, unknown>).item === "string")
  );
  const reviewed = reviewable.filter((item) => item.reviewed === true).length;
  const waitlisted = raw.status === "approved" || raw.status === "completed";

  return {
    id: raw.id,
    submittedAt: raw.created_at,
    clientId: raw.client_id,
    agentId: raw.agent_id,
    secondaryAgentId: raw.secondary_agent_id,
    isNew: raw.status === "pending",
    isPriority: raw.is_priority,
    priorityDescription: raw.priority_description ?? undefined,
    status:
      raw.status === "declined"
        ? "rejected"
        : !waitlisted || reviewed === 0
          ? "pending-review"
          : reviewed < reviewable.length
            ? "partially-reviewed"
            : "reviewed",
    items: reviewable.map((item, index) => ({
      id: typeof item.id === "string" ? item.id : `requested-item-${index}`,
      furniture: [
        typeof item.name === "string" ? item.name : item.item,
        typeof item.size === "string" ? item.size : undefined,
      ]
        .filter(Boolean)
        .join(" / "),
      quantity: typeof item.quantity === "number" ? item.quantity : 1,
      stock: typeof item.stock === "number" ? item.stock : 0,
      description:
        typeof item.description === "string"
          ? item.description
          : typeof item.notes === "string"
            ? item.notes
            : undefined,
    })),
  };
}
