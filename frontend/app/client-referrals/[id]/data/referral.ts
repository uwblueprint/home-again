import type { Referral } from "@/common/types";
import type { ReferralRequestPreview } from "@/app/client-referrals/[id]/types";
import {
  normalizeReferralItems,
  normalizeRequestedItems,
} from "@/app/client-referrals/utils";

export function toReferralRequest(raw: Referral): ReferralRequestPreview {
  const items = raw.items?.length
    ? normalizeReferralItems(raw.items)
    : normalizeRequestedItems(raw.requested_items);
  const backendReviewStatus = raw.review_status ?? "pending_review";
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
        : !waitlisted || backendReviewStatus === "pending_review"
          ? "pending-review"
          : backendReviewStatus === "partially_reviewed"
            ? "partially-reviewed"
            : "reviewed",
    items: items.map((item) => ({
      id: item.id,
      furniture: [item.name, item.size].filter(Boolean).join(" / "),
      quantity: item.quantity,
      stock: item.stock,
      description: item.description,
    })),
  };
}
