"use client";

import { useState } from "react";
import { ChevronDown, SquarePen } from "lucide-react";

import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { CopyButton } from "@/common/components/ui/copy-button";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/common/components/ui/collapsible";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/common/components/ui/toggle-group";
import { InformationBlock } from "@/common/components/data-display";
import { FormField } from "@/common/components/forms";
import { EMAIL_REGEX, PHONE_REGEX } from "@/common/constants/validators";
import type { DonorInformation } from "./types";

type DonorErrors = Partial<Record<keyof DonorInformation, string>>;

function validateDonor(draft: DonorInformation): DonorErrors {
  const errors: DonorErrors = {};
  if (!draft.first_name.trim()) errors.first_name = "Enter a first name.";
  if (!draft.last_name.trim()) errors.last_name = "Enter a last name.";
  const email = draft.email.trim();
  if (!email) errors.email = "Enter an email address.";
  else if (!EMAIL_REGEX.test(email))
    errors.email = "Enter a valid email address.";
  const phone = draft.phone.trim();
  if (!phone) errors.phone = "Enter a phone number.";
  else if (!PHONE_REGEX.test(phone))
    errors.phone = "Enter a valid phone number.";
  if (!draft.pickup_address.trim())
    errors.pickup_address = "Enter a pickup address.";
  return errors;
}

interface DonorInformationCardProps {
  donor: DonorInformation;
  onSave: (patch: Partial<DonorInformation>) => void;
}

const yesNo = (value: boolean | null) =>
  value === null ? "—" : value ? "Yes" : "No";

function DonorInformationCard({ donor, onSave }: DonorInformationCardProps) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DonorInformation>(donor);
  const [errors, setErrors] = useState<DonorErrors>({});

  const startEditing = () => {
    setDraft(donor);
    setErrors({});
    setEditing(true);
    setOpen(true);
  };

  const cancel = () => {
    setDraft(donor);
    setErrors({});
    setEditing(false);
  };

  const save = () => {
    const nextErrors = validateDonor(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSave(draft);
    setEditing(false);
  };

  const setField =
    <K extends keyof DonorInformation>(key: K) =>
    (value: DonorInformation[K]) =>
      setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => {
        // Keep the card open while editing so the form can't be collapsed away.
        if (!editing) setOpen(next);
      }}
      className="w-full rounded-xl border border-[var(--unofficial-border-3)] bg-background px-2xl py-xl shadow-[var(--shadow-sm)]"
    >
      <div className="flex items-center justify-between">
        <p className="text-heading-4 font-semibold text-foreground">
          Donor Information
        </p>
        <div className="flex items-center gap-xs">
          {!editing && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={startEditing}
              aria-label="Edit donor information"
              className="text-muted-foreground"
            >
              <SquarePen />
            </Button>
          )}
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={open ? "Collapse" : "Expand"}
                disabled={editing}
                className="text-muted-foreground"
              />
            }
          >
            <ChevronDown
              className={cn("transition-transform", open && "rotate-180")}
            />
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsiblePanel>
        <div className="pt-lg">
          {editing ? (
            <DonorInformationForm
              draft={draft}
              errors={errors}
              setField={setField}
              onCancel={cancel}
              onSave={save}
            />
          ) : (
            <DonorInformationReadout donor={donor} yesNo={yesNo} />
          )}
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}

function DonorInformationReadout({
  donor,
  yesNo,
}: {
  donor: DonorInformation;
  yesNo: (value: boolean | null) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-lg">
      <InformationBlock label="First name" value={donor.first_name} />
      <InformationBlock label="Last name" value={donor.last_name} />
      <InformationBlock
        label="Email Address"
        value={donor.email}
        valueAction={<CopyButton value={donor.email} label="Copy email" />}
      />
      <InformationBlock label="Phone number" value={donor.phone} />
      <InformationBlock
        label="Does anyone in the household smoke?"
        value={yesNo(donor.smoking_household)}
      />
      <InformationBlock
        label="Are there any pets in the household?"
        value={yesNo(donor.has_pets)}
      />
      <InformationBlock
        label="Pickup address"
        value={donor.pickup_address}
        valueAction={
          <CopyButton value={donor.pickup_address} label="Copy address" />
        }
      />
    </div>
  );
}

function DonorInformationForm({
  draft,
  errors,
  setField,
  onCancel,
  onSave,
}: {
  draft: DonorInformation;
  errors: DonorErrors;
  setField: <K extends keyof DonorInformation>(
    key: K
  ) => (value: DonorInformation[K]) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-col gap-lg">
      <div className="grid grid-cols-2 gap-x-3 gap-y-lg">
        <FormField
          htmlFor="donor-first"
          label="First name"
          error={errors.first_name}
        >
          <Input
            id="donor-first"
            aria-invalid={Boolean(errors.first_name)}
            value={draft.first_name}
            onChange={(e) => setField("first_name")(e.target.value)}
          />
        </FormField>
        <FormField
          htmlFor="donor-last"
          label="Last name"
          error={errors.last_name}
        >
          <Input
            id="donor-last"
            aria-invalid={Boolean(errors.last_name)}
            value={draft.last_name}
            onChange={(e) => setField("last_name")(e.target.value)}
          />
        </FormField>
        <FormField
          htmlFor="donor-email"
          label="Email Address"
          error={errors.email}
        >
          <Input
            id="donor-email"
            aria-invalid={Boolean(errors.email)}
            type="email"
            value={draft.email}
            onChange={(e) => setField("email")(e.target.value)}
          />
        </FormField>
        <FormField
          htmlFor="donor-phone"
          label="Phone number"
          error={errors.phone}
        >
          <Input
            id="donor-phone"
            aria-invalid={Boolean(errors.phone)}
            value={draft.phone}
            onChange={(e) => setField("phone")(e.target.value)}
          />
        </FormField>
        <FormField label="Does anyone smoke in the household?">
          <YesNoToggle
            value={draft.smoking_household}
            onChange={setField("smoking_household")}
            name="smoking"
          />
        </FormField>
        <FormField label="Are there any pets in the household?">
          <YesNoToggle
            value={draft.has_pets}
            onChange={setField("has_pets")}
            name="pets"
          />
        </FormField>
        <FormField
          htmlFor="donor-address"
          label="Pickup address"
          error={errors.pickup_address}
        >
          <Input
            id="donor-address"
            aria-invalid={Boolean(errors.pickup_address)}
            value={draft.pickup_address}
            onChange={(e) => setField("pickup_address")(e.target.value)}
          />
        </FormField>
      </div>

      {/* Figma's donor card uses a borderless Cancel next to an outlined Save —
          distinct from the dialogs, where Save is the filled primary action. */}
      <div className="flex justify-end gap-xs">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="outline" onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  );
}

function YesNoToggle({
  value,
  onChange,
  name,
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
  name: string;
}) {
  return (
    <ToggleGroup
      value={value === null ? [] : [value ? "yes" : "no"]}
      onValueChange={(groupValue) => {
        const next = groupValue[0];
        if (next) onChange(next === "yes");
      }}
      aria-label={name}
    >
      <ToggleGroupItem value="yes">Yes</ToggleGroupItem>
      <ToggleGroupItem value="no">No</ToggleGroupItem>
    </ToggleGroup>
  );
}

export { DonorInformationCard };
