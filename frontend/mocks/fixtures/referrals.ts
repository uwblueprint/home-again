import type {
  Referral,
  ReferralItem,
  ReferralItemStatus,
  ReferralReviewStatus,
} from "@/common/types";

type ReferralRecord = Omit<
  Referral,
  | "review_status"
  | "approved_count"
  | "item_count"
  | "items"
  | "rejection_reason"
  | "rejection_details"
>;

const RECORDS: ReferralRecord[] = [
  {
    id: "referral-001",
    client_id: "client-001",
    requested_items: [
      { item: "Sofa/Couch", quantity: 1 },
      { item: "Dining/Kitchen Table", quantity: 1 },
    ],
    agent_id: "agent-001",
    secondary_agent_id: "agent-002",
    agents_present_during_delivery: true,
    program: null,
    is_priority: false,
    priority_description: null,
    reason_low_income: true,
    reason_exiting_homelessness: false,
    reason_new_to_community: true,
    previous_city_town_country: "Toronto, ON",
    reason_escaping_abuse: false,
    reason_mental_health: false,
    reason_exiting_prison: false,
    reason_physical_disability: false,
    reason_health_issues: false,
    reason_other: false,
    reason_other_info: null,
    address_line_1: "220 Laurier Avenue East",
    address_line_2: "Apt 3",
    city: "Ottawa",
    postal_code: "K1N 6P1",
    date_items_needed: "2024-06-15",
    staircases: false,
    narrow_passageways: false,
    adequate_parking: true,
    move_other_info: null,
    notes_and_instructions: null,
    status: "pending",
    created_at: "2024-06-01T10:00:00Z",
    updated_at: "2024-06-01T10:00:00Z",
  },
  {
    id: "referral-002",
    client_id: "client-002",
    requested_items: [
      { item: "Metal Bed Frame", size: "DB/QN", quantity: 1 },
      { item: "Mattress Only", size: "Double", quantity: 1 },
    ],
    agent_id: "agent-002",
    secondary_agent_id: null,
    agents_present_during_delivery: false,
    program: "Newcomer Settlement Program",
    is_priority: true,
    priority_description: "Family moving in within the week",
    reason_low_income: false,
    reason_exiting_homelessness: true,
    reason_new_to_community: false,
    previous_city_town_country: null,
    reason_escaping_abuse: false,
    reason_mental_health: true,
    reason_exiting_prison: false,
    reason_physical_disability: false,
    reason_health_issues: false,
    reason_other: false,
    reason_other_info: null,
    address_line_1: "88 Bank Street",
    address_line_2: null,
    city: "Ottawa",
    postal_code: "K2P 1T7",
    date_items_needed: "2024-06-01",
    staircases: true,
    narrow_passageways: true,
    adequate_parking: false,
    move_other_info: "Third floor walk-up, no elevator",
    notes_and_instructions: null,
    status: "approved",
    created_at: "2024-05-20T14:30:00Z",
    updated_at: "2024-05-25T09:15:00Z",
  },
  {
    id: "referral-003",
    client_id: "client-003",
    requested_items: [{ item: "Dresser", quantity: 1 }],
    agent_id: "agent-001",
    secondary_agent_id: "agent-003",
    agents_present_during_delivery: true,
    program: null,
    is_priority: false,
    priority_description: null,
    reason_low_income: true,
    reason_exiting_homelessness: false,
    reason_new_to_community: false,
    previous_city_town_country: null,
    reason_escaping_abuse: true,
    reason_mental_health: false,
    reason_exiting_prison: false,
    reason_physical_disability: false,
    reason_health_issues: false,
    reason_other: true,
    reason_other_info: "Rebuilding after house fire",
    address_line_1: "15 Rideau Street",
    address_line_2: "Unit 12B",
    city: "Gatineau",
    postal_code: "J8X 3Y7",
    date_items_needed: "2024-04-25",
    staircases: false,
    narrow_passageways: false,
    adequate_parking: true,
    move_other_info: null,
    notes_and_instructions: "Rebuilding after house fire",
    status: "completed",
    created_at: "2024-04-10T08:45:00Z",
    updated_at: "2024-05-01T16:20:00Z",
  },
];

/**
 * Item status for each referral status, as the backend's referral_items
 * migration sets it: approved shows as "waitlisted" in the referral list.
 */
const ITEM_STATUS: Record<Referral["status"], ReferralItemStatus> = {
  pending: "PENDING_REVIEW",
  approved: "WAITLISTED",
  completed: "DELIVERED",
  declined: "REJECTED",
};

const REVIEW_STATUS: Record<Referral["status"], ReferralReviewStatus> = {
  pending: "pending_review",
  approved: "waitlisted",
  completed: "delivered",
  declined: "rejected",
};

/** One item per requested unit, like the backend's referral_items rows. */
function toItems(record: ReferralRecord): ReferralItem[] {
  const entries = record.requested_items as {
    item: string;
    size?: string;
    quantity?: number;
  }[];
  return entries
    .flatMap((entry) =>
      Array.from({ length: entry.quantity ?? 1 }, () => entry)
    )
    .map((entry, position) => ({
      id: `${record.id}-item-${position}`,
      referral_id: record.id,
      name: entry.item,
      size: entry.size ?? null,
      notes: null,
      status: ITEM_STATUS[record.status],
      rejection_reason: null,
      reviewed_at: record.status === "pending" ? null : record.updated_at,
      inventory_id: null,
      position,
      created_at: record.created_at,
      updated_at: record.updated_at,
    }));
}

export const referrals: Referral[] = RECORDS.map((record) => {
  const items = toItems(record);
  return {
    ...record,
    rejection_reason: null,
    rejection_details: null,
    review_status: REVIEW_STATUS[record.status],
    approved_count: items.filter((item) => item.status === "DELIVERED").length,
    item_count: items.length,
    items,
  };
});
