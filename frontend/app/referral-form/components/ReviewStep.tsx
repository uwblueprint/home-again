"use client";

import { Pencil } from "lucide-react";

import { ITEMS, type FurnitureFormData } from "./FurnitureForm";
import type { DeliveryFormData } from "./DeliveryForm";
import {
  REFERRAL_REASONS,
  type AgentData,
  type ClientData,
  type ReferralData,
} from "./types";
import type { AgentRecord } from "@/common/types";

type ReviewStepProps = {
  client: ClientData;
  referral: ReferralData;
  agent: AgentData;
  currentAgent: AgentRecord | null;
  secondaryAgent: AgentRecord | null;
  furniture: FurnitureFormData;
  delivery: DeliveryFormData;
  onEditStep: (stepIndex: number) => void;
};

function ReviewCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${title}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="rounded-lg border border-border p-4">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  const isEmpty = value === "" || value === null || value === undefined;
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{isEmpty ? "—" : value}</p>
    </div>
  );
}

export default function ReviewStep({
  client,
  referral,
  agent,
  currentAgent,
  secondaryAgent,
  furniture,
  delivery,
  onEditStep,
}: ReviewStepProps) {
  const selectedReasons = REFERRAL_REASONS.filter(
    (reason) => referral.reasons[reason.id]
  ).map((reason) => reason.label);

  const selectedItems = ITEMS.filter((item) => {
    const subs = furniture.subOptions[item.id];
    if (subs?.length) {
      return subs.some((sub) => sub.quantity > 0);
    }
    return furniture.selected[item.id] && (furniture.quantities[item.id] ?? 0) > 0;
  });

  const selectedMoveLabels = Object.entries(delivery.selectedMoves)
    .filter(([, checked]) => checked)
    .map(([id]) => id.replace(/-/g, " "));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="justify-start text-black text-3xl font-semibold font-['Geist'] leading-8">
          Review &amp; Submit
        </h2>
        <p className="self-stretch justify-start text-neutral-500 text-lg font-normal font-['Geist'] leading-7">
          Review the referral details and agree to the terms and conditions
          before submitting.
        </p>
      </div>

      <ReviewCard title="Client Details" onEdit={() => onEditStep(1)}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="First name" value={client.firstName} />
          <Field label="Last name" value={client.lastName} />
          <Field label="Birthday" value={client.birthday} />
          <Field label="Gender" value={client.gender} />
          <Field
            label="Immigration status"
            value={client.immigrationStatus}
          />
          <Field label="Phone number" value={client.phone} />
          <Field label="Phone notes" value={client.phoneNotes} />
          <Field label="Family type" value={client.familyType} />
          <Field label="Number of adults" value={client.numAdults} />
          <Field label="Number of children" value={client.numChildren} />
          {client.firstLanguageNotEnglish ? (
            <Field
              label="Client's first language is not English"
              value={client.languages}
            />
          ) : null}
        </div>
      </ReviewCard>

      <ReviewCard title="Primary Case Agent">
        {currentAgent ? (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="font-medium uppercase text-foreground">
              {currentAgent.first_name} {currentAgent.last_name}
            </span>
            <span>{currentAgent.email}</span>
            <span>{currentAgent.phone_number}</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </ReviewCard>

      <ReviewCard title="Secondary Case Agent" onEdit={() => onEditStep(3)}>
        <Field
          label="Agent"
          value={
            secondaryAgent
              ? `${secondaryAgent.first_name} ${secondaryAgent.last_name}`
              : ""
          }
        />
      </ReviewCard>

      <ReviewCard title="Program" onEdit={() => onEditStep(3)}>
        <Field label="Program name" value={agent.programSearch} />
      </ReviewCard>

      <ReviewCard title="Referral Details" onEdit={() => onEditStep(2)}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Has received furniture before?"
              value={referral.hasReceivedFurnitureBefore ? "Yes" : "No"}
            />
            {referral.hasReceivedFurnitureBefore ? (
              <Field
                label="Last furniture referral date"
                value={referral.lastFurnitureReferralDate}
              />
            ) : null}
          </div>
          <Field
            label="Reason for new referral"
            value={selectedReasons.join(", ")}
          />
          <Field
            label="Reason for high priority"
            value={
              referral.isHighPriority ? referral.highPriorityReason : "No"
            }
          />
        </div>
      </ReviewCard>

      <ReviewCard title="Furniture Selection" onEdit={() => onEditStep(4)}>
        {selectedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No items selected yet.
          </p>
        ) : (
          <div className="space-y-3">
            {selectedItems.map((item) => {
              const subs = furniture.subOptions[item.id]?.filter(
                (sub) => sub.quantity > 0
              );
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {furniture.notes[item.id] || "Specification here"}
                    </p>
                  </div>
                  {subs?.length ? (
                    <div className="flex gap-2">
                      {subs.map((sub) => (
                        <span
                          key={sub.id}
                          className="rounded-lg bg-muted px-3 py-1 text-sm"
                        >
                          ({sub.quantity}) {sub.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Qty: {furniture.quantities[item.id]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ReviewCard>

      <ReviewCard title="Delivery Details" onEdit={() => onEditStep(5)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Address"
            value={[delivery.address1, delivery.address2]
              .filter(Boolean)
              .join(", ")}
          />
          <Field label="City" value={delivery.city} />
          <Field label="Postal code" value={delivery.postalCode} />
          <Field label="Date items are needed by" value={delivery.dateNeeded} />
          <Field
            label="Information related to the move"
            value={selectedMoveLabels.join(", ")}
          />
          <Field label="Notes and instructions" value={delivery.notes} />
        </div>
      </ReviewCard>
    </div>
  );
}
