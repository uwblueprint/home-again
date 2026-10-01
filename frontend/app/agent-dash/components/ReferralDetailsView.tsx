"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { AGENT_DASH } from "@/common/constants";
import { cn } from "@/common/lib/utils";

import type { ReferralDetails } from "../data/mockReferralDetails";
import { ReferralStatusBadge } from "./ReferralStatusBadge";

function SectionCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background p-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-paragraph-small text-muted-foreground">{label}</span>
      <span className="text-paragraph-regular text-foreground">{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-heading-4 font-semibold text-foreground">{children}</h2>
  );
}

function AgentCard({
  title,
  name,
  email,
  phone,
}: {
  title: string;
  name: string;
  email: string;
  phone: string;
}) {
  return (
    <section className="flex flex-col gap-md">
      <SectionTitle>{title}</SectionTitle>
      <SectionCard className="flex flex-col gap-xs">
        <p className="text-paragraph-regular font-semibold uppercase tracking-wide text-foreground">
          {name}
        </p>
        <p className="text-paragraph-small text-muted-foreground">{email}</p>
        <p className="text-paragraph-small text-muted-foreground">{phone}</p>
      </SectionCard>
    </section>
  );
}

type ReferralDetailsViewProps = {
  details: ReferralDetails;
};

export function ReferralDetailsView({ details }: ReferralDetailsViewProps) {
  const {
    row,
    client,
    primaryAgent,
    secondaryAgent,
    referralInfo,
    furniture,
    delivery,
  } = details;

  const showPriority = row.isPriority && row.status !== "Pending";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-xl">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <h1 className="text-heading-2 font-semibold text-foreground">
            Referral Details
          </h1>
          <p className="text-paragraph-small text-muted-foreground">
            Referral ID: {row.referralId}
            <span className="mx-xs">·</span>
            Created {row.creationDate}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-xs">
          {showPriority ? (
            <Badge className="rounded-lg border-transparent bg-orange-100 font-normal text-orange-900">
              + Priority
            </Badge>
          ) : null}
          <ReferralStatusBadge status={row.status} statusDate={row.statusDate} />
        </div>
      </div>

      <section className="flex flex-col gap-md">
        <SectionTitle>Client Details</SectionTitle>
        <SectionCard className="flex flex-col gap-xl">
          <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="First name" value={client.firstName} />
            <DetailField label="Last name" value={client.lastName} />
            <DetailField label="Birthday" value={client.birthday} />
            <DetailField label="Gender" value={client.gender} />
            <DetailField
              label="Immigration status"
              value={client.immigrationStatus}
            />
            <DetailField label="Phone number" value={client.phone} />
          </div>

          <DetailField label="Phone notes" value={client.phoneNotes} />

          <div className="grid grid-cols-1 gap-xl sm:grid-cols-3">
            <DetailField label="Family type" value={client.familyType} />
            <DetailField
              label="Number of adults"
              value={String(client.numAdults)}
            />
            <DetailField
              label="Number of children"
              value={String(client.numChildren)}
            />
          </div>

          <DetailField
            label="Client's first language is not English"
            value={client.languages}
          />
        </SectionCard>
      </section>

      <AgentCard
        title="Primary Case Agent"
        name={`${primaryAgent.firstName} ${primaryAgent.lastName}`}
        email={primaryAgent.email}
        phone={primaryAgent.phone}
      />

      {secondaryAgent ? (
        <AgentCard
          title="Secondary Case Agent"
          name={`${secondaryAgent.firstName} ${secondaryAgent.lastName}`}
          email={secondaryAgent.email}
          phone={secondaryAgent.phone}
        />
      ) : null}

      <section className="flex flex-col gap-md">
        <SectionTitle>Referral Details</SectionTitle>
        <SectionCard className="flex flex-col gap-xl">
          <DetailField
            label="Has received furniture before?"
            value={referralInfo.receivedFurnitureBefore}
          />
          <DetailField
            label="Last furniture referral date"
            value={referralInfo.lastFurnitureReferralDate}
          />
          <DetailField
            label="Reason for repeat referral"
            value={referralInfo.reasonForRepeat}
          />
        </SectionCard>

        <SectionCard className="flex flex-col gap-xl">
          <DetailField
            label="Reason for new referral"
            value={referralInfo.reasonForNewReferral}
          />
          <DetailField label="Other notes" value={referralInfo.otherNotes} />
          {referralInfo.reasonForHighPriority ? (
            <DetailField
              label="Reason for high priority"
              value={referralInfo.reasonForHighPriority}
            />
          ) : null}
        </SectionCard>
      </section>

      <section className="flex flex-col gap-md">
        <SectionTitle>Furniture Selection</SectionTitle>
        <div className="flex flex-col gap-sm">
          {furniture.map((item, index) => (
            <SectionCard
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
            </SectionCard>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-md">
        <SectionTitle>Delivery Details</SectionTitle>
        <SectionCard className="flex flex-col gap-xl">
          <div className="grid grid-cols-1 gap-xl sm:grid-cols-2">
            <DetailField label="Address" value={delivery.address} />
            <DetailField
              label="Date items are needed by"
              value={delivery.dateNeeded}
            />
            <DetailField label="City" value={delivery.city} />
            <DetailField label="Postal code" value={delivery.postalCode} />
            <DetailField label="Phone number" value={delivery.phone} />
          </div>
          <DetailField
            label="Information related to move"
            value={delivery.moveInfo}
          />
          <DetailField label="Notes and instructions" value={delivery.notes} />
          <DetailField
            label="Coordinated access required"
            value={delivery.coordinatedAccessRequired}
          />
        </SectionCard>
      </section>

      <div className="mt-auto flex justify-end pt-xl">
        <Button
          type="button"
          variant="secondary"
          nativeButton={false}
          render={<Link href={AGENT_DASH} />}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
