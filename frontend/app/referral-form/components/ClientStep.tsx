"use client";

import { Input, InputError } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Checkbox } from "@/common/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { SelectAndCombo } from "@/common/components/forms/SelectAndCombo";
import {
  GENDER_OPTIONS,
  IMMIGRATION_STATUS_OPTIONS,
  FAMILY_TYPE_OPTIONS,
  type ClientData,
} from "./types";

export type ClientStepErrors = Partial<
  Record<"firstName" | "lastName" | "birthday" | "familyType", string>
>;

export function validateClient(data: ClientData): ClientStepErrors {
  const errors: ClientStepErrors = {};
  if (!data.firstName.trim()) errors.firstName = "First name is required.";
  if (!data.lastName.trim()) errors.lastName = "Last name is required.";
  if (!data.birthday.trim()) errors.birthday = "Birthday is required.";
  if (!data.familyType.trim()) errors.familyType = "Family type is required.";
  return errors;
}

type ClientStepProps = {
  data: ClientData;
  onChange: (data: ClientData) => void;
  errors?: ClientStepErrors;
  onBlurField?: (field: "firstName" | "lastName" | "birthday" | "familyType") => void;
  onFindAnotherClient: () => void;
};

export default function ClientStep({
  data,
  onChange,
  errors = {},
  onBlurField,
  onFindAnotherClient,
}: ClientStepProps) {
  function patch(updates: Partial<ClientData>) {
    onChange({ ...data, ...updates });
  }

  return (
    <div className="space-y-2">
      <h2 className="justify-start text-black text-3xl font-semibold font-['Geist'] leading-8">
        Client Details
      </h2>
      <p className="self-stretch justify-start text-neutral-500 text-lg font-normal font-['Geist'] leading-7">
        Enter the details of the client you are referring.
      </p>

      <div className="mt-6 grid gap-xl sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="client-first-name">
            First name<span className="text-destructive">*</span>
          </Label>
          <Input
            id="client-first-name"
            placeholder="Enter first name"
            value={data.firstName}
            onChange={(e) => patch({ firstName: e.target.value })}
            onBlur={() => onBlurField?.("firstName")}
            aria-invalid={Boolean(errors.firstName)}
          />
          {errors.firstName ? (
            <InputError>{errors.firstName}</InputError>
          ) : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor="client-last-name">
            Last name<span className="text-destructive">*</span>
          </Label>
          <Input
            id="client-last-name"
            placeholder="Enter last name"
            value={data.lastName}
            onChange={(e) => patch({ lastName: e.target.value })}
            onBlur={() => onBlurField?.("lastName")}
            aria-invalid={Boolean(errors.lastName)}
          />
          {errors.lastName ? (
            <InputError>{errors.lastName}</InputError>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-xl sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="client-birthday">
            Birthday<span className="text-destructive">*</span>
          </Label>
          <Input
            id="client-birthday"
            type="date"
            placeholder="MM/DD/YYYY"
            value={data.birthday}
            onChange={(e) => patch({ birthday: e.target.value })}
            onBlur={() => onBlurField?.("birthday")}
            aria-invalid={Boolean(errors.birthday)}
          />
          {errors.birthday ? <InputError>{errors.birthday}</InputError> : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor="client-gender">Gender</Label>
          <Select
            value={data.gender}
            onValueChange={(value) => patch({ gender: value ?? "" })}
          >
            <SelectTrigger id="client-gender" className="w-full">
              <SelectValue placeholder="Select an option" className="capitalize" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="client-immigration-status">
            Immigration Status
          </Label>
          <Select
            value={data.immigrationStatus}
            onValueChange={(value) =>
              patch({ immigrationStatus: value ?? "" })
            }
          >
            <SelectTrigger id="client-immigration-status" className="w-full">
              <SelectValue placeholder="Select an option" className="capitalize" />
            </SelectTrigger>
            <SelectContent>
              {IMMIGRATION_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={data.firstLanguageNotEnglish}
            onCheckedChange={(checked) =>
              patch({ firstLanguageNotEnglish: checked === true })
            }
          />
          Client&apos;s first language is not English
        </label>
        {data.firstLanguageNotEnglish ? (
          <Input
            placeholder="Languages spoken (e.g. Portuguese, Greek)"
            value={data.languages}
            onChange={(e) => patch({ languages: e.target.value })}
          />
        ) : null}
      </div>

      <div className="mt-6 grid gap-xl sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="client-phone">Phone number</Label>
          <Input
            id="client-phone"
            placeholder="Enter phone number"
            value={data.phone}
            onChange={(e) => patch({ phone: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="client-phone-notes">Phone notes</Label>
          <Input
            id="client-phone-notes"
            placeholder="e.g. Number belongs to a relative or neighbour"
            value={data.phoneNotes}
            onChange={(e) => patch({ phoneNotes: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-xl sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="client-family-type">
            Family type<span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.familyType}
            onValueChange={(value) => patch({ familyType: value ?? "" })}
          >
            <SelectTrigger
              id="client-family-type"
              className="w-full"
              onBlur={() => onBlurField?.("familyType")}
              aria-invalid={Boolean(errors.familyType)}
            >
              <SelectValue placeholder="Select an option" className="capitalize" />
            </SelectTrigger>
            <SelectContent>
              {FAMILY_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.familyType ? (
            <InputError>{errors.familyType}</InputError>
          ) : null}
        </div>
        <div className="space-y-1">
          <Label>
            Number of adults<span className="text-destructive">*</span>
          </Label>
          <SelectAndCombo
            value={data.numAdults}
            onChange={(value) => patch({ numAdults: value })}
            min={0}
            className="w-full"
          />
        </div>
        <div className="space-y-1">
          <Label>
            Number of children<span className="text-destructive">*</span>
          </Label>
          <SelectAndCombo
            value={data.numChildren}
            onChange={(value) => patch({ numChildren: value })}
            min={0}
            className="w-full"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onFindAnotherClient}
        className="mt-2 text-sm font-medium text-foreground underline"
      >
        Find another existing client
      </button>
    </div>
  );
}
