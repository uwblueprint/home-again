import type { Referral } from "@/common/types";
import type { ReferralRequestPreview } from "@/app/client-referrals/[id]/types";
import { normalizeRequestedItems } from "@/app/client-referrals/utils";

export function toReferralRequest(raw: Referral): ReferralRequestPreview {
  const items = normalizeRequestedItems(raw.requested_items);
  const reviewed = items.filter((item) => item.reviewed).length;
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
          : reviewed < items.length
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
