import type { InventoryRecord, Referral } from "@/common/types";
import {
  REFERRAL_REVIEW_STATUS,
  REFERRAL_STATUS,
} from "@/common/constants/referrals";
import type { ReferralRequestPreview } from "@/app/client-referrals/[id]/types";
import { CLIENT_REFERRAL_REQUEST_STATUS } from "@/app/client-referrals/constants";
import {
  normalizeReferralItems,
  normalizeRequestedItems,
} from "@/app/client-referrals/utils";

export function toReferralRequest(
  raw: Referral,
  inventory: InventoryRecord[] = []
): ReferralRequestPreview {
  const items = raw.items?.length
    ? normalizeReferralItems(raw.items, inventory)
    : normalizeRequestedItems(raw.requested_items);
  const backendReviewStatus =
    raw.review_status ?? REFERRAL_REVIEW_STATUS.PENDING_REVIEW;
  const waitlisted =
    raw.status === REFERRAL_STATUS.APPROVED ||
    raw.status === REFERRAL_STATUS.COMPLETED;

  return {
    id: raw.id,
    submittedAt: raw.created_at,
    clientId: raw.client_id,
    agentId: raw.agent_id,
    secondaryAgentId: raw.secondary_agent_id,
    isNew: raw.status === REFERRAL_STATUS.PENDING,
    isPriority: raw.is_priority,
    priorityDescription: raw.priority_description ?? undefined,
    status:
      raw.status === REFERRAL_STATUS.DECLINED
        ? CLIENT_REFERRAL_REQUEST_STATUS.REJECTED
        : !waitlisted ||
            backendReviewStatus === REFERRAL_REVIEW_STATUS.PENDING_REVIEW
          ? CLIENT_REFERRAL_REQUEST_STATUS.PENDING_REVIEW
          : backendReviewStatus === REFERRAL_REVIEW_STATUS.PARTIALLY_REVIEWED
            ? CLIENT_REFERRAL_REQUEST_STATUS.PARTIALLY_REVIEWED
            : CLIENT_REFERRAL_REQUEST_STATUS.REVIEWED,
    items: items.map((item) => ({
      id: item.id,
      furniture: [item.name, item.size].filter(Boolean).join(" / "),
      quantity: item.quantity,
      stock: item.stock,
      description: item.description,
    })),
  };
}
