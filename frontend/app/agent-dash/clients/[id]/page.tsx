"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";

import {
  DetailCard,
  DetailPage,
  DetailSection,
  referralHistoryColumns,
} from "@/app/agent-dash/components";
import {
  getClientProfile,
  getClientReferralHistory,
  getClientRowById,
} from "@/app/agent-dash/data/mockClients";
import { isReferralAssignedToAgent } from "@/app/agent-dash/data/mockReferrals";
import { DataTable, InformationBlock } from "@/common/components/data-display";
import { AGENT_DASH_CLIENTS, AGENT_DASH_REFERRAL } from "@/common/constants";
import { useAuthStore } from "@/common/stores/authStore";

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const row = getClientRowById(id);
  if (!row) notFound();

  const profile = getClientProfile(row);
  const history = getClientReferralHistory(row).filter((referral) =>
    isReferralAssignedToAgent(referral, user?.id)
  );

  return (
    <DetailPage
      title={`${profile.firstName} ${profile.lastName}`}
      backHref={AGENT_DASH_CLIENTS}
    >
      <DetailCard>
        <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-3">
          <InformationBlock label="First Name" value={profile.firstName} />
          <InformationBlock label="Last Name" value={profile.lastName} />
          <InformationBlock label="Birthday" value={profile.birthday} />
          <InformationBlock label="Gender" value={profile.gender} />
          <InformationBlock
            label="Immigration status"
            value={profile.immigrationStatus}
          />
          <InformationBlock label="Phone number" value={profile.phone} />
          <InformationBlock label="Phone notes" value={profile.phoneNotes} />
          <InformationBlock
            label="Number of adults"
            value={profile.numAdults}
          />
          <InformationBlock
            label="Number of children"
            value={profile.numChildren}
          />
          <InformationBlock label="Family type" value={profile.familyType} />
          <InformationBlock
            label="Coordinated access"
            value={profile.coordinatedAccess}
          />
        </div>
      </DetailCard>

      <DetailSection title="Referral History">
        <DataTable
          columns={referralHistoryColumns}
          data={history}
          emptyStateMessage="No referral history"
          hideToolbar
          hidePagination
          onRowClick={(referral) =>
            router.push(AGENT_DASH_REFERRAL(referral.id))
          }
          testId="client-referral-history"
        />
      </DetailSection>
    </DetailPage>
  );
}
