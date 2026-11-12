"use client";

import { FormField } from "@/common/components/forms";
import { Checkbox, Input, Textarea } from "@/common/components/ui";
import type {
  DeliveryDetailsFormData,
  DeliveryDetailsErrors,
} from "@/app/referral-requests/[id]/types";

const MOVE_OPTIONS = [
  { id: "staircases", label: "Staircases" },
  { id: "narrow-passageways", label: "Narrow passageways" },
  { id: "adequate-parking", label: "Adequate parking" },
  { id: "other", label: "Other" },
];

export function DeliveryDetailsForm({
  data,
  onChange,
  errors,
  phone,
}: {
  data: DeliveryDetailsFormData;
  onChange: (data: DeliveryDetailsFormData) => void;
  errors: DeliveryDetailsErrors;
  phone?: string | null;
}) {
  const patch = (update: Partial<DeliveryDetailsFormData>) =>
    onChange({ ...data, ...update });
  return (
    <div className="grid gap-xl md:grid-cols-3">
      <FormField label="Address" htmlFor="request-delivery-address">
        <Input
          id="request-delivery-address"
          value={[data.address1, data.address2, data.city, data.postalCode]
            .filter(Boolean)
            .join(", ")}
          disabled
        />
      </FormField>
      <FormField
        label="Date items are needed by"
        htmlFor="request-delivery-date"
      >
        <Input
          id="request-delivery-date"
          type="date"
          value={data.dateNeeded}
          disabled
        />
      </FormField>
      <FormField label="Phone number" htmlFor="request-delivery-phone">
        <Input id="request-delivery-phone" value={phone ?? ""} disabled />
      </FormField>
      <fieldset className="col-span-full flex flex-col gap-sm">
        <legend className="mb-sm text-paragraph-small font-medium">
          Information related to the move
        </legend>
        {MOVE_OPTIONS.map(({ id, label }) => (
          <label
            key={id}
            className="flex items-center gap-xs text-paragraph-small"
          >
            <Checkbox
              checked={!!data.selectedMoves[id]}
              onCheckedChange={(checked) =>
                patch({
                  selectedMoves: {
                    ...data.selectedMoves,
                    [id]: checked === true,
                  },
                  ...(id === "other" && !checked ? { otherDetails: "" } : {}),
                })
              }
            />
            {label}
          </label>
        ))}
        {data.selectedMoves.other && (
          <FormField
            label="Other move details"
            htmlFor="request-delivery-other"
            error={errors.otherDetails}
          >
            <Input
              id="request-delivery-other"
              value={data.otherDetails}
              aria-invalid={!!errors.otherDetails}
              onChange={(event) => patch({ otherDetails: event.target.value })}
            />
          </FormField>
        )}
      </fieldset>
      <FormField
        label="Notes and instructions"
        htmlFor="request-delivery-notes"
        className="col-span-full"
      >
        <Textarea
          id="request-delivery-notes"
          value={data.notes}
          onChange={(event) => patch({ notes: event.target.value })}
        />
      </FormField>
    </div>
  );
}
