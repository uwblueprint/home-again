"use client";

import Image from "next/image";
import { cn } from "@/common/lib/utils";
import { Card } from "@/common/components/ui/card";
import { Checkbox } from "@/common/components/ui/checkbox";
import { useDonationForm } from "../context/DonationFormContext";
import type { FurnitureItemData } from "../context/DonationFormContext";
import { useDonor } from "@/common/hooks/useApi";
import { useFilePreviewUrls } from "@/common/hooks/useFilePreviewUrls";

// --- Sub-components ---

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function YesNoToggle({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="inline-flex w-fit overflow-hidden rounded-md border border-border">
      <button
        type="button"
        aria-pressed={value === true}
        onClick={() => onChange(true)}
        className={cn(
          "cursor-pointer px-4 py-1.5 text-sm font-medium transition-colors",
          value === true
            ? "bg-[var(--unofficial-outline-active)] text-foreground"
            : "bg-background text-foreground hover:bg-[var(--unofficial-outline-hover)]"
        )}
      >
        Yes
      </button>
      <button
        type="button"
        aria-pressed={value === false}
        onClick={() => onChange(false)}
        className={cn(
          "cursor-pointer border-l border-border px-4 py-1.5 text-sm font-medium transition-colors",
          value === false
            ? "bg-[var(--unofficial-outline-active)] text-foreground"
            : "bg-background text-foreground hover:bg-[var(--unofficial-outline-hover)]"
        )}
      >
        No
      </button>
    </div>
  );
}

function ItemRow({ item }: { item: FurnitureItemData }) {
  // Only the first photo is shown as the row thumbnail.
  const [thumbnailSrc = null] = useFilePreviewUrls(item.photos.slice(0, 1));

  const stainsLabel =
    item.hasStains === null ? "-" : item.hasStains ? "Has Stains" : "No Stains";

  return (
    <div className="flex items-center gap-3">
      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
        {thumbnailSrc && (
          <Image
            src={thumbnailSrc}
            alt={item.furnitureType ?? "Donation item"}
            fill
            unoptimized
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          {item.furnitureType ?? "Unknown item"}
        </span>
        <span className="text-sm text-foreground">{stainsLabel}</span>
      </div>
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-4 shrink-0 text-muted-foreground"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}

// --- Main component ---

export default function StepDonationSummary() {
  const { formState, setFormState, submitAttempted } = useDonationForm();
  const { data: donor, isLoading: donorLoading } = useDonor(formState.donorId);

  const {
    pickupAddress,
    items,
    smokingInHousehold,
    petsInHousehold,
    feeAgreement,
  } = formState;

  const showSmokingError = submitAttempted && smokingInHousehold === null;
  const showPetsError = submitAttempted && petsInHousehold === null;
  const showFeeError = submitAttempted && !feeAgreement;

  function formatAddress() {
    if (!pickupAddress.streetAddress) return "No address provided";
    return [
      pickupAddress.streetAddress,
      pickupAddress.apartment,
      pickupAddress.city,
      pickupAddress.province,
      pickupAddress.country,
      pickupAddress.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
  }

  function handleSmokingChange(value: boolean) {
    setFormState((prev) => ({ ...prev, smokingInHousehold: value }));
  }

  function handlePetsChange(value: boolean) {
    setFormState((prev) => ({ ...prev, petsInHousehold: value }));
  }

  function handleFeeAgreementChange(checked: boolean) {
    setFormState((prev) => ({ ...prev, feeAgreement: checked === true }));
  }

  const donorFirstName = donorLoading ? "…" : (donor?.first_name ?? "-");
  const donorLastName = donorLoading ? "…" : (donor?.last_name ?? "-");
  const donorEmail = donorLoading ? "…" : (donor?.email ?? "-");
  const donorPhone = donorLoading ? "…" : (donor?.phone ?? "-");

  return (
    <div className="flex flex-col gap-9">
      {/* Page title */}
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Donation Summary
        </h2>
        <p className="text-sm text-muted-foreground">
          Review your donation details before submitting. You&apos;ll receive a
          confirmation and next steps by email.
        </p>
      </div>

      {/* Stacked sections */}
      <div className="flex flex-col gap-6">
        {/* Contact Information */}
        <h3 className="text-xl font-semibold text-foreground">
          Contact Information
        </h3>
        <Card className="rounded-xl border border-border bg-background px-6 py-8 shadow-sm ring-0">
          <div className="flex flex-col gap-4">
            <InfoRow label="First Name" value={donorFirstName} />
            <InfoRow label="Last Name" value={donorLastName} />
            <InfoRow label="Email Address" value={donorEmail} />
            <InfoRow label="Phone Number" value={donorPhone} />
          </div>
        </Card>

        {/* Pickup Details */}
        <h3 className="text-xl font-semibold text-foreground">
          Pickup Details
        </h3>
        <Card className="rounded-xl border border-border bg-background px-6 py-8 shadow-sm ring-0">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <MapPinIcon />
              <span className="text-sm font-medium text-muted-foreground">
                Pickup Address
              </span>
            </div>
            <span className="text-sm text-foreground">{formatAddress()}</span>
          </div>
        </Card>

        {/* Donation Items */}
        <h3 className="text-xl font-semibold text-foreground">
          Donation Items
        </h3>
        <Card className="rounded-xl border border-border bg-background px-6 py-8 shadow-sm ring-0">
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </Card>

        {/* Smoking */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Does anyone smoke in the household?
          </span>
          <YesNoToggle
            value={smokingInHousehold}
            onChange={handleSmokingChange}
          />
          {showSmokingError && (
            <span className="text-xs text-destructive">
              Please select an option
            </span>
          )}
        </div>

        {/* Pets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Are there any pets in the household?
          </span>
          <YesNoToggle value={petsInHousehold} onChange={handlePetsChange} />
          {showPetsError && (
            <span className="text-xs text-destructive">
              Please select an option
            </span>
          )}
        </div>

        {/* Fee agreement */}
        <div className="flex flex-col gap-1.5 pb-8">
          <div>
            <span className="text-sm font-medium text-foreground">
              Pickup fee agreement
            </span>
            <span className="text-xs text-destructive">
              {showFeeError ? "* (Agreement required to submit donation)" : "*"}
            </span>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={feeAgreement}
              onCheckedChange={handleFeeAgreementChange}
              aria-invalid={showFeeError}
              className="size-3.5 rounded-sm shadow-none"
            />
            <span className="text-xs text-[#404040]">
              I agree to a $35 fee, payable at time of pickup (tax receipt will
              be provided)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
