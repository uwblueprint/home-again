import { ReferralCard } from "@/common/components";
import type { ClientReferral } from "../types";

interface ReferralListProps {
  referrals: ClientReferral[];
  onReject: (referral: ClientReferral) => void;
  onWaitlist: (referral: ClientReferral) => void;
  onViewDetails: (referral: ClientReferral) => void;
}

export function ReferralList({
  referrals,
  onReject,
  onWaitlist,
  onViewDetails,
}: ReferralListProps) {
  if (referrals.length === 0) {
    return (
      <p className="py-12 text-center text-paragraph-regular text-muted-foreground">
        No referrals here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-xl">
      {referrals.map((r) => {
        const common = {
          clientName: r.clientName,
          referralId: r.referralId,
          submittedAt: r.submittedAt,
          previousSubmissionAt: r.previousSubmissionAt,
          agents: r.agents,
          isPriority: r.isPriority,
          errorMsg: r.errorMsg,
          onViewDetails: () => onViewDetails(r),
        };

        if (r.tab === "new") {
          return (
            <ReferralCard
              key={r.id}
              {...common}
              status="pending"
              onReject={() => onReject(r)}
              onWaitlist={() => onWaitlist(r)}
            />
          );
        }

        if (r.tab === "rejected") {
          return (
            <ReferralCard
              key={r.id}
              {...common}
              status="rejected"
              rejectionReason={r.rejectionReason ?? ""}
            />
          );
        }

        // waitlisted
        if (r.reviewStatus === "reviewed") {
          return (
            <ReferralCard
              key={r.id}
              {...common}
              status="reviewed"
              approvedCount={r.approvedCount ?? 0}
              totalCount={r.totalCount ?? 0}
              hasIncompleteScheduling={r.hasIncompleteScheduling}
              items={r.items}
            />
          );
        }

        return (
          <ReferralCard
            key={r.id}
            {...common}
            status={r.reviewStatus ?? "pending-review"}
            items={r.items}
          />
        );
      })}
    </div>
  );
}
