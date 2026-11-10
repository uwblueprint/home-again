import type { ClientReferral } from "./types";

const agents: ClientReferral["agents"] = [
  { firstName: "Kyle", lastName: "Su", role: "secondary" },
  { firstName: "Wanyun", lastName: "Xue", role: "primary" },
];

const base = {
  clientName: "John Doe",
  referralId: "REFERRAL ID",
  submittedAt: "09/20/25",
  agents,
  isPriority: false,
  items: [],
} satisfies Partial<ClientReferral>;

const bed = { id: "bed", name: "Bed frame", quantity: 1, stock: 8 };
const mattress = { id: "mattress", name: "Mattress", quantity: 2, stock: 3 };
const nightstand = {
  id: "nightstand",
  name: "Nightstand",
  quantity: 2,
  stock: 1,
};
const dining = { id: "dining", name: "Dining table", quantity: 1, stock: 0 };

export const MOCK_REFERRALS: ClientReferral[] = [
  // NEW
  {
    ...base,
    id: "n1",
    tab: "new",
    isPriority: true,
    previousSubmissionAt: "01/02/2025",
    errorMsg: "2 items that can't be fully fulfilled right now.",
  },
  { ...base, id: "n2", tab: "new", previousSubmissionAt: "01/02/2025" },
  { ...base, id: "n3", tab: "new" },

  // WAITLISTED
  {
    ...base,
    id: "w1",
    tab: "waitlisted",
    reviewStatus: "pending-review",
    items: [mattress, nightstand, dining],
  },
  {
    ...base,
    id: "w2",
    tab: "waitlisted",
    reviewStatus: "pending-review",
    isPriority: true,
    items: [bed, mattress, nightstand, dining],
  },
  {
    ...base,
    id: "w3",
    tab: "waitlisted",
    reviewStatus: "pending-review",
    items: [bed, nightstand, dining],
  },
  {
    ...base,
    id: "w4",
    tab: "waitlisted",
    reviewStatus: "partially-reviewed",
    items: [bed, nightstand, dining],
  },
  {
    ...base,
    id: "w5",
    tab: "waitlisted",
    reviewStatus: "reviewed",
    approvedCount: 2,
    totalCount: 4,
    hasIncompleteScheduling: true,
  },
  {
    ...base,
    id: "w6",
    tab: "waitlisted",
    reviewStatus: "reviewed",
    approvedCount: 2,
    totalCount: 4,
    hasIncompleteScheduling: true,
  },

  // REJECTED
  {
    ...base,
    id: "r1",
    tab: "rejected",
    previousSubmissionAt: "01/02/2025",
    rejectionReason: "Submitted a referral this year already",
  },
  {
    ...base,
    id: "r2",
    tab: "rejected",
    previousSubmissionAt: "01/02/2025",
    rejectionReason: "Submitted a referral this year already",
  },
];
