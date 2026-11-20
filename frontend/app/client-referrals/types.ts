import type { ReferralCardAgent, ReferralCardItem } from "@/common/components";
import type { ReferralRejectionReason } from "@/common/constants/referrals";

export type ReferralTab = "new" | "waitlisted" | "rejected";

export type ReviewStatus = "pending-review" | "partially-reviewed" | "reviewed";
export type ReviewFilter = "all" | ReviewStatus;

export interface ClientReferral {
  id: string;
  tab: ReferralTab;
  clientName: string;
  referralId: string;
  submittedAt: string;
  submittedAtIso: string;
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

export type MoveTarget = "waitlisted" | "rejected";

export type ReferralSortField =
  | "recency"
  | "priority"
  | "firstName"
  | "lastName";

export type ReferralStatusUpdate = {
  target: MoveTarget;
  rejectionReason?: ReferralRejectionReason;
  rejectionDetails?: string;
  isPriority?: boolean;
  priorityDescription?: string;
};

export type { ReferralRejectionReason };
