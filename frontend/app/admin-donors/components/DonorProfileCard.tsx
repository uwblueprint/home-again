"use client";

import { type ChangeEvent, type FormEvent, useId, useState } from "react";
import { ChevronDown, Pencil } from "lucide-react";

import {
  Alert,
  Button,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  CopyButton,
  Input,
} from "@/common/components/ui";
import { InformationBlock } from "@/common/components/data-display";
import { FormField } from "@/common/components/forms";
import {
  formatReviewPhoneNumber,
  validateDonorContact,
  type DonorContact,
  type DonorContactErrors,
} from "@/common/constants/validators";
import { cn } from "@/common/lib/utils";
import type { Donor, UpdateDonorInput } from "@/common/types";

/** Email is deliberately absent: a donor profile is tied to its email. */
type EditableField = "first_name" | "last_name" | "phone";
type DonorDraft = Pick<DonorContact, EditableField>;

const EDITABLE_FIELDS: readonly EditableField[] = [
  "first_name",
  "last_name",
  "phone",
];

const SAVE_ERROR_MESSAGE = "We couldn't save your changes. Please try again.";

function toDraft(donor: Donor): DonorDraft {
  return {
    first_name: donor.first_name ?? "",
    last_name: donor.last_name ?? "",
    phone: donor.phone ?? "",
  };
}

/**
 * The trimmed fields of `draft` that differ from `baseline`. Never includes
 * email (since it is locked).
 */
function getChangedFields(
  baseline: DonorDraft,
  draft: DonorDraft
): UpdateDonorInput {
  const patch: UpdateDonorInput = {};
  for (const field of EDITABLE_FIELDS) {
    const value = draft[field].trim();
    if (value !== baseline[field].trim()) patch[field] = value;
  }
  return patch;
}

interface DonorProfileCardProps {
  donor: Donor;
  /**
   * Persists the changed fields. Reject to keep the card in edit mode with the
   * draft intact and an error shown.
   *
   * The card returns to view mode as soon as this resolves and shows whatever
   * `donor` holds then, so resolve only once `donor` reflects the save (e.g.
   * write the response into the query cache) to avoid flashing stale values.
   */
  onSave: (patch: UpdateDonorInput) => Promise<void>;
  className?: string;
}

/**
 * Collapsible "Donor Information" card for the donor profile. Shows the
 * donor's contact details and lets an admin edit everything except the email.
 */
function DonorProfileCard(props: DonorProfileCardProps) {
  // Edit state belongs to one donor. Remount when the donor changes so a draft
  // can never be saved onto a different donor.
  return <DonorProfileCardContent key={props.donor.id} {...props} />;
}

function DonorProfileCardContent({
  donor,
  onSave,
  className,
}: DonorProfileCardProps) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  // Snapshot of the donor taken when editing starts. Changes are measured
  // against it, not the live `donor` prop, so a refetch mid-edit can't turn an
  // untouched field into a "change" that overwrites someone else's update.
  const [baseline, setBaseline] = useState<DonorDraft>(() => toDraft(donor));
  const [draft, setDraft] = useState<DonorDraft>(() => toDraft(donor));
  const [errors, setErrors] = useState<DonorContactErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const patch = getChangedFields(baseline, draft);
  const isDirty = Object.keys(patch).length > 0;

  const startEditing = () => {
    const snapshot = toDraft(donor);
    setBaseline(snapshot);
    setDraft(snapshot);
    setErrors({});
    setSaveError(null);
    setEditing(true);
  };

  const cancel = () => {
    setDraft(baseline);
    setErrors({});
    setSaveError(null);
    setEditing(false);
  };

  const handleFieldChange =
    (field: EditableField) => (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setDraft((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isDirty || isSaving) return;

    const nextErrors = validateDonorContact(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(patch);
      setEditing(false);
    } catch {
      setSaveError(SAVE_ERROR_MESSAGE);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={className}>
      <Collapsible open={open} onOpenChange={setOpen} className="w-full">
        <CardHeader className="items-center">
          <CardTitle className="text-heading-4 font-semibold text-foreground">
            <h2>Donor Information</h2>
          </CardTitle>
          <CardAction className="self-center">
            {/* Collapsing mid-edit would hide unsaved changes, so it's locked. */}
            <CollapsibleTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={
                    open
                      ? "Collapse donor information"
                      : "Expand donor information"
                  }
                  disabled={editing}
                  className="text-muted-foreground"
                />
              }
            >
              <ChevronDown
                className={cn("transition-transform", open && "rotate-180")}
              />
            </CollapsibleTrigger>
          </CardAction>
        </CardHeader>

        <CollapsiblePanel>
          <CardContent className="pt-lg">
            {editing ? (
              <DonorProfileForm
                donor={donor}
                draft={draft}
                errors={errors}
                saveError={saveError}
                isDirty={isDirty}
                isSaving={isSaving}
                onFieldChange={handleFieldChange}
                onCancel={cancel}
                onSubmit={handleSubmit}
              />
            ) : (
              <DonorProfileReadout donor={donor} onEdit={startEditing} />
            )}
          </CardContent>
        </CollapsiblePanel>
      </Collapsible>
    </Card>
  );
}

function DonorProfileReadout({
  donor,
  onEdit,
}: {
  donor: Donor;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col gap-lg">
      <div className="grid grid-cols-1 gap-x-sm gap-y-lg sm:grid-cols-2">
        <InformationBlock label="First name" value={donor.first_name || "—"} />
        <InformationBlock label="Last name" value={donor.last_name || "—"} />
        <InformationBlock
          label="Email Address"
          value={donor.email || "—"}
          valueAction={
            donor.email ? (
              <CopyButton value={donor.email} label="Copy email" />
            ) : undefined
          }
        />
        <InformationBlock
          label="Phone number"
          value={donor.phone ? formatReviewPhoneNumber(donor.phone) : "—"}
        />
      </div>
      <Button variant="outline" onClick={onEdit} className="self-start">
        Edit
        <Pencil />
      </Button>
    </div>
  );
}

function DonorProfileForm({
  donor,
  draft,
  errors,
  saveError,
  isDirty,
  isSaving,
  onFieldChange,
  onCancel,
  onSubmit,
}: {
  donor: Donor;
  draft: DonorDraft;
  errors: DonorContactErrors;
  saveError: string | null;
  isDirty: boolean;
  isSaving: boolean;
  onFieldChange: (
    field: EditableField
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const id = useId();

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-lg">
      <div className="grid grid-cols-1 gap-x-sm gap-y-lg sm:grid-cols-2">
        <FormField
          htmlFor={`${id}-first-name`}
          label="First name"
          error={errors.first_name}
        >
          <Input
            id={`${id}-first-name`}
            autoComplete="given-name"
            aria-invalid={Boolean(errors.first_name)}
            value={draft.first_name}
            onChange={onFieldChange("first_name")}
          />
        </FormField>
        <FormField
          htmlFor={`${id}-last-name`}
          label="Last name"
          error={errors.last_name}
        >
          <Input
            id={`${id}-last-name`}
            autoComplete="family-name"
            aria-invalid={Boolean(errors.last_name)}
            value={draft.last_name}
            onChange={onFieldChange("last_name")}
          />
        </FormField>
        <FormField htmlFor={`${id}-email`} label="Email Address">
          <Input
            id={`${id}-email`}
            type="email"
            value={donor.email ?? ""}
            disabled
          />
        </FormField>
        <FormField
          htmlFor={`${id}-phone`}
          label="Phone number"
          error={errors.phone}
        >
          <Input
            id={`${id}-phone`}
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            value={draft.phone}
            onChange={onFieldChange("phone")}
          />
        </FormField>
      </div>

      {saveError && <Alert variant="destructive">{saveError}</Alert>}

      {/* Borderless Cancel beside an outlined Save, as on the request card. */}
      <div className="flex justify-end gap-xs">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="submit" variant="outline" disabled={!isDirty || isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export { DonorProfileCard, type DonorProfileCardProps };
