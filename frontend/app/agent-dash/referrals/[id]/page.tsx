import { notFound } from "next/navigation";

import {
  DetailCard,
  DetailPage,
  DetailSection,
} from "@/app/agent-dash/components";
import {
  getReferralDetailsById,
  type CaseAgentDetails,
} from "@/app/agent-dash/data/mockReferralDetails";
import { InformationBlock } from "@/common/components/data-display";
import { AgentDashStatusBadge } from "@/common/components/status-labels";
import { Badge } from "@/common/components/ui/badge";
import { AGENT_DASH } from "@/common/constants";

function CaseAgentSection({
  title,
  agent,
}: {
  title: string;
  agent: CaseAgentDetails;
}) {
  return (
    <DetailSection title={title}>
      <DetailCard className="flex flex-col gap-xs">
        <p className="text-paragraph-regular font-semibold uppercase tracking-wide text-foreground">
          {agent.firstName} {agent.lastName}
        </p>
        <p className="text-paragraph-small text-muted-foreground">
          {agent.email}
        </p>
        <p className="text-paragraph-small text-muted-foreground">
          {agent.phone}
        </p>
      </DetailCard>
    </DetailSection>
  );
}

export default async function ReferralDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const details = getReferralDetailsById(id);
  if (!details) notFound();

  const {
    row,
    client,
    primaryAgent,
    secondaryAgent,
    referralInfo,
    furniture,
    delivery,
  } = details;

  return (
    <DetailPage
      title="Referral Details"
      subtitle={
        <>
          Referral ID: {row.referralId}
          <span className="mx-xs">·</span>
          Created {row.creationDate}
        </>
      }
      aside={
        <div className="flex flex-wrap items-center gap-xs">
          {row.isPriority ? (
            <Badge className="rounded-lg border-transparent bg-orange-100 font-normal text-orange-900">
              + Priority
            </Badge>
          ) : null}
          <AgentDashStatusBadge status={row.status} date={row.statusDate} />
        </div>
      }
      backHref={AGENT_DASH}
    >
      <DetailSection title="Client Details">
        <DetailCard className="flex flex-col gap-xl">
          <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-3">
            <InformationBlock label="First name" value={client.firstName} />
            <InformationBlock label="Last name" value={client.lastName} />
            <InformationBlock label="Birthday" value={client.birthday} />
            <InformationBlock label="Gender" value={client.gender} />
            <InformationBlock
              label="Immigration status"
              value={client.immigrationStatus}
            />
            <InformationBlock label="Phone number" value={client.phone} />
          </div>
          <InformationBlock label="Phone notes" value={client.phoneNotes} />
          <div className="grid grid-cols-1 gap-xl sm:grid-cols-3">
            <InformationBlock label="Family type" value={client.familyType} />
            <InformationBlock
              label="Number of adults"
              value={client.numAdults}
            />
            <InformationBlock
              label="Number of children"
              value={client.numChildren}
            />
          </div>
          <InformationBlock
            label="Client's first language is not English"
            value={client.languages}
          />
        </DetailCard>
      </DetailSection>

      <CaseAgentSection title="Primary Case Agent" agent={primaryAgent} />
      {secondaryAgent ? (
        <CaseAgentSection title="Secondary Case Agent" agent={secondaryAgent} />
      ) : null}

      <DetailSection title="Referral Details">
        <DetailCard className="flex flex-col gap-xl">
          <InformationBlock
            label="Has received furniture before?"
            value={referralInfo.receivedFurnitureBefore}
          />
          <InformationBlock
            label="Last furniture referral date"
            value={referralInfo.lastFurnitureReferralDate}
          />
          <InformationBlock
            label="Reason for repeat referral"
            value={referralInfo.reasonForRepeat}
          />
        </DetailCard>
        <DetailCard className="flex flex-col gap-xl">
          <InformationBlock
            label="Reason for new referral"
            value={referralInfo.reasonForNewReferral}
          />
          <InformationBlock
            label="Other notes"
            value={referralInfo.otherNotes}
          />
          {referralInfo.reasonForHighPriority ? (
            <InformationBlock
              label="Reason for high priority"
              value={referralInfo.reasonForHighPriority}
            />
          ) : null}
        </DetailCard>
      </DetailSection>

      <DetailSection title="Furniture Selection">
        <div className="flex flex-col gap-sm">
          {furniture.map((item, index) => (
            <DetailCard
              key={`${item.name}-${index}`}
              className="flex flex-row flex-wrap items-center justify-between gap-sm py-md"
            >
              <div className="flex min-w-0 flex-col gap-xs">
                <span className="text-paragraph-regular font-medium text-foreground">
                  {item.name}
                </span>
                {item.specification ? (
                  <span className="text-paragraph-small text-muted-foreground">
                    {item.specification}
                  </span>
                ) : null}
                {item.sizeTags?.length ? (
                  <div className="flex flex-wrap gap-xs">
                    {item.sizeTags.map((tag) => (
                      <Badge
                        key={tag}
                        className="rounded-lg border-transparent bg-lime-100 font-normal text-lime-900"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
              {item.quantity != null ? (
                <span className="text-paragraph-small text-muted-foreground">
                  Quantity: {item.quantity}
                </span>
              ) : null}
            </DetailCard>
          ))}
        </div>
      </DetailSection>

      <DetailSection title="Delivery Details">
        <DetailCard className="flex flex-col gap-xl">
          <div className="grid grid-cols-1 gap-xl sm:grid-cols-2">
            <InformationBlock label="Address" value={delivery.address} />
            <InformationBlock
              label="Date items are needed by"
              value={delivery.dateNeeded}
            />
            <InformationBlock label="City" value={delivery.city} />
            <InformationBlock label="Postal code" value={delivery.postalCode} />
            <InformationBlock label="Phone number" value={delivery.phone} />
          </div>
          <InformationBlock
            label="Information related to move"
            value={delivery.moveInfo}
          />
          <InformationBlock
            label="Notes and instructions"
            value={delivery.notes}
          />
          <InformationBlock
            label="Coordinated access required"
            value={delivery.coordinatedAccessRequired}
          />
        </DetailCard>
      </DetailSection>
    </DetailPage>
  );
}
