"use client";

import { FormField } from "@/common/components/forms";
import { Checkbox, Input } from "@/common/components/ui";
import { DetailSelect } from "@/app/referral-requests/[id]/components/DetailFormFields";
import type {
  ClientDetailsErrors,
  ClientDetailsFormData,
} from "@/app/referral-requests/[id]/types";

// Values mirror the backend GenderEnum, ImmigrationStatusEnum, and FamilyTypeEnum.
export const GENDERS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];
export const IMMIGRATION_STATUSES = [
  { value: "PR", label: "Permanent resident" },
  { value: "Refugee", label: "Refugee" },
  { value: "Canadian citizen", label: "Canadian citizen" },
];
export const FAMILY_TYPES = [
  { value: "single", label: "Single" },
  { value: "family", label: "Family" },
];

export function ClientDetailsForm({
  data,
  onChange,
  errors,
}: {
  data: ClientDetailsFormData;
  onChange: (data: ClientDetailsFormData) => void;
  errors: ClientDetailsErrors;
}) {
  const patch = (update: Partial<ClientDetailsFormData>) =>
    onChange({ ...data, ...update });
  return (
    <div className="grid gap-xl md:grid-cols-3">
      <FormField
        label="First name"
        htmlFor="request-client-first-name"
        error={errors.firstName}
      >
        <Input
          id="request-client-first-name"
          disabled
          value={data.firstName}
          aria-invalid={!!errors.firstName}
          onChange={(event) => patch({ firstName: event.target.value })}
        />
      </FormField>
      <FormField
        label="Last name"
        htmlFor="request-client-last-name"
        error={errors.lastName}
      >
        <Input
          id="request-client-last-name"
          disabled
          value={data.lastName}
          aria-invalid={!!errors.lastName}
          onChange={(event) => patch({ lastName: event.target.value })}
        />
      </FormField>
      <FormField label="Birthday" htmlFor="request-client-birthday">
        <Input
          id="request-client-birthday"
          type="date"
          value={data.birthday}
          disabled
        />
      </FormField>
      <DetailSelect
        id="request-client-gender"
        label="Gender"
        value={data.gender}
        options={GENDERS}
        onChange={(gender) => patch({ gender })}
      />
      <DetailSelect
        id="request-client-immigration"
        label="Immigration status"
        value={data.immigrationStatus}
        options={IMMIGRATION_STATUSES}
        onChange={(immigrationStatus) => patch({ immigrationStatus })}
      />
      <FormField label="Phone number" htmlFor="request-client-phone">
        <Input
          id="request-client-phone"
          disabled
          type="tel"
          value={data.phone}
          onChange={(event) => patch({ phone: event.target.value })}
        />
      </FormField>
      <FormField
        label="Phone notes"
        htmlFor="request-client-phone-notes"
        className="col-span-full"
      >
        <Input
          id="request-client-phone-notes"
          value={data.phoneNotes}
          onChange={(event) => patch({ phoneNotes: event.target.value })}
        />
      </FormField>
      <DetailSelect
        id="request-client-family"
        disabled
        label="Family type"
        value={data.familyType}
        options={FAMILY_TYPES}
        error={errors.familyType}
        onChange={(familyType) => patch({ familyType })}
      />
      <FormField label="Number of adults" htmlFor="request-client-adults">
        <Input
          id="request-client-adults"
          disabled
          type="number"
          min={0}
          step={1}
          required
          value={data.numAdults}
          onChange={(event) =>
            patch({ numAdults: event.target.valueAsNumber || 0 })
          }
        />
      </FormField>
      <FormField label="Number of children" htmlFor="request-client-children">
        <Input
          id="request-client-children"
          disabled
          type="number"
          min={0}
          step={1}
          required
          value={data.numChildren}
          onChange={(event) =>
            patch({ numChildren: event.target.valueAsNumber || 0 })
          }
        />
      </FormField>
      <div className="col-span-full flex flex-col gap-xs">
        <label className="flex items-center gap-xs text-paragraph-small">
          <Checkbox
            checked={data.firstLanguageNotEnglish}
            onCheckedChange={(checked) =>
              patch({ firstLanguageNotEnglish: checked === true })
            }
          />
          Client&apos;s first language is not English
        </label>
        {data.firstLanguageNotEnglish && (
          <FormField
            label="Languages spoken"
            htmlFor="request-client-languages"
          >
            <Input
              id="request-client-languages"
              value={data.languages}
              onChange={(event) => patch({ languages: event.target.value })}
            />
          </FormField>
        )}
      </div>
    </div>
  );
}
