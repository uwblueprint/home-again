"use client";

import { useState } from "react";
import { ChevronDown, SquarePen } from "lucide-react";

import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
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
import type { DonorInformation } from "./types";

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

  const startEditing = () => {
    setDraft(donor);
    setEditing(true);
    setOpen(true);
  };

  const cancel = () => {
    setDraft(donor);
    setEditing(false);
  };

  const save = () => {
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
    <div className="flex flex-col gap-lg">
      <div className="flex gap-3">
        <InformationBlock label="First name" value={donor.first_name} />
        <InformationBlock label="Last name" value={donor.last_name} />
      </div>
      <div className="flex gap-3">
        <InformationBlock
          label="Email Address"
          value={donor.email}
          valueAction={<CopyButton value={donor.email} label="Copy email" />}
        />
        <InformationBlock label="Phone number" value={donor.phone} />
      </div>
      <div className="flex gap-3">
        <InformationBlock
          label="Does anyone in the household smoke?"
          value={yesNo(donor.smoking_household)}
        />
        <InformationBlock
          label="Are there any pets in the household?"
          value={yesNo(donor.has_pets)}
        />
      </div>
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
  setField,
  onCancel,
  onSave,
}: {
  draft: DonorInformation;
  setField: <K extends keyof DonorInformation>(
    key: K
  ) => (value: DonorInformation[K]) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex gap-3">
        <FieldColumn htmlFor="donor-first" label="First name">
          <Input
            id="donor-first"
            value={draft.first_name}
            onChange={(e) => setField("first_name")(e.target.value)}
          />
        </FieldColumn>
        <FieldColumn htmlFor="donor-last" label="Last name">
          <Input
            id="donor-last"
            value={draft.last_name}
            onChange={(e) => setField("last_name")(e.target.value)}
          />
        </FieldColumn>
      </div>

      <div className="flex gap-3">
        <FieldColumn htmlFor="donor-email" label="Email Address">
          <Input
            id="donor-email"
            type="email"
            value={draft.email}
            onChange={(e) => setField("email")(e.target.value)}
          />
        </FieldColumn>
        <FieldColumn htmlFor="donor-phone" label="Phone number">
          <Input
            id="donor-phone"
            value={draft.phone}
            onChange={(e) => setField("phone")(e.target.value)}
          />
        </FieldColumn>
      </div>

      <div className="flex gap-3">
        <FieldColumn label="Does anyone smoke in the household?">
          <YesNoToggle
            value={draft.smoking_household}
            onChange={setField("smoking_household")}
            name="smoking"
          />
        </FieldColumn>
        <FieldColumn label="Are there any pets in the household?">
          <YesNoToggle
            value={draft.has_pets}
            onChange={setField("has_pets")}
            name="pets"
          />
        </FieldColumn>
      </div>

      <FieldColumn htmlFor="donor-address" label="Pickup address">
        <Input
          id="donor-address"
          value={draft.pickup_address}
          onChange={(e) => setField("pickup_address")(e.target.value)}
        />
      </FieldColumn>

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

function FieldColumn({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-xs">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
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
