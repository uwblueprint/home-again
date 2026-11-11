import type { ReferralCardAgent, ReferralCardItem } from "@/common/components";

export type ReferralTab = "new" | "waitlisted" | "rejected";

export type ReviewStatus = "pending-review" | "partially-reviewed" | "reviewed";
export type ReviewFilter = "all" | ReviewStatus;


export interface ClientReferral {
  id: string;
  tab: ReferralTab;
  clientName: string;
  referralId: string;
  submittedAt: string;
  previousSubmissionAt?: string;
  agents: ReferralCardAgent[];
  isPriority: boolean;
  priorityDescription?: string;
  errorMsg?: string;
  items: ReferralCardItem[];
  reviewStatus?: ReviewStatus;
  approvedCount?: number;
  totalCount?: number;
  hasIncompleteScheduling?: boolean;
  rejectionReason?: string;
}

export interface ClientReferralsData {
  referrals: ClientReferral[];
  isMock: boolean;
}

export type MoveTarget = "waitlisted" | "rejected";

export type ReferralStatusUpdate = {
  target: MoveTarget;
  rejectionReason?: string;
  isPriority?: boolean;
  priorityDescription?: string;
};
