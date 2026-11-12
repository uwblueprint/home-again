import { InformationBlock } from "@/common/components/data-display";
import {
  FAMILY_TYPES,
  GENDERS,
  IMMIGRATION_STATUSES,
} from "@/app/referral-requests/[id]/components/ClientDetailsForm";
import type { Client, Referral } from "@/common/types";

function optionLabel(
  value: string | null,
  options: { value: string; label: string }[]
) {
  return (
    options.find((option) => option.value === value)?.label ?? value ?? "—"
  );
}

function displayDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        timeZone: "UTC",
      }).format(date);
}

export function ClientDetailsSummary({ client }: { client: Client }) {
  return (
    <div className="grid w-full gap-xl md:grid-cols-3">
      <InformationBlock label="First name" value={client.first_name} />
      <InformationBlock label="Last name" value={client.last_name} />
      <InformationBlock label="Birthday" value={displayDate(client.birthday)} />
      <InformationBlock
        label="Gender"
        value={optionLabel(client.gender, GENDERS)}
      />
      <InformationBlock
        label="Immigration status"
        value={optionLabel(client.immigration_status, IMMIGRATION_STATUSES)}
      />
      <InformationBlock label="Phone number" value={client.phone || "—"} />
      <InformationBlock
        className="col-span-full"
        label="Phone notes"
        value={client.phone_notes || "—"}
      />
      <InformationBlock
        label="Family type"
        value={optionLabel(client.family_type, FAMILY_TYPES)}
      />
      <InformationBlock label="Number of adults" value={client.num_adults} />
      <InformationBlock
        label="Number of children"
        value={client.num_children}
      />
      {!client.speaks_english && (
        <InformationBlock
          className="col-span-full"
          label="Client’s first language is not English"
          value={client.language || "—"}
        />
      )}
    </div>
  );
}

export function DeliveryDetailsSummary({
  referral,
  phone,
}: {
  referral: Referral;
  phone?: string | null;
}) {
  const moveDetails = [
    referral.staircases && "Staircases",
    referral.narrow_passageways && "Narrow passageways",
    referral.adequate_parking && "Adequate parking",
    referral.move_other_info,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <div className="grid w-full gap-xl md:grid-cols-3">
      <InformationBlock
        label="Address"
        value={
          [
            referral.address_line_1,
            referral.address_line_2,
            referral.city,
            referral.postal_code,
          ]
            .filter(Boolean)
            .join(", ") || "—"
        }
      />
      <InformationBlock
        label="Date items are needed by"
        value={displayDate(referral.date_items_needed)}
      />
      <InformationBlock label="Phone number" value={phone || "—"} />
      <InformationBlock
        className="col-span-full"
        label="Information related to the move"
        value={moveDetails || "—"}
      />
      <InformationBlock
        className="col-span-full"
        label="Notes and instructions"
        value={referral.notes_and_instructions || "—"}
      />
    </div>
  );
}
