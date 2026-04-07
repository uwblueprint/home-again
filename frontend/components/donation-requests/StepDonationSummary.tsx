"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useDonationForm } from "./DonationFormContext";
import type { FurnitureItemData } from "./DonationFormContext";
import { useDonor } from "@/hooks/useApi";

// --- Sub-components ---

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-6 py-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {children}
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
            ? "bg-primary text-primary-foreground"
            : "bg-background text-foreground hover:bg-muted",
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
            ? "bg-primary text-primary-foreground"
            : "bg-background text-foreground hover:bg-muted",
        )}
      >
        No
      </button>
    </div>
  );
}

function ItemRow({ item }: { item: FurnitureItemData }) {
  const thumbnailSrc =
    item.photos.length > 0 ? URL.createObjectURL(item.photos[0]) : null;

  const stainsLabel =
    item.hasStains === null ? "-" : item.hasStains ? "Has Stains" : "No Stains";

  return (
    <div className="flex items-center gap-3">
      <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
        {thumbnailSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailSrc}
            alt={item.furnitureType ?? "Donation item"}
            className="h-full w-full object-cover"
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

function CheckIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 7L5.5 10L11.5 4"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- Main component ---

export default function StepDonationSummary() {
  const { formState, setFormState } = useDonationForm();
  const { data: donor, isLoading: donorLoading } = useDonor(formState.donorId);
  const [feeAgreementDirty, setFeeAgreementDirty] = useState(false);

  const {
    pickupAddress,
    items,
    smokingInHousehold,
    petsInHousehold,
    feeAgreement,
  } = formState;

  const showFeeError = feeAgreementDirty && !feeAgreement;

  function formatAddress() {
    const parts = [
      pickupAddress.streetAddress,
      pickupAddress.apartment,
      pickupAddress.city,
      pickupAddress.province,
      pickupAddress.country,
      pickupAddress.postalCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "No address provided";
  }

  function handleSmokingChange(value: boolean) {
    setFormState((prev) => ({ ...prev, smokingInHousehold: value }));
  }

  function handlePetsChange(value: boolean) {
    setFormState((prev) => ({ ...prev, petsInHousehold: value }));
  }

  function handleFeeAgreementChange() {
    setFeeAgreementDirty(true);
    setFormState((prev) => ({ ...prev, feeAgreement: !prev.feeAgreement }));
  }

  const donorFirstName = donorLoading ? "…" : (donor?.first_name ?? "-");
  const donorLastName = donorLoading ? "…" : (donor?.last_name ?? "-");
  const donorEmail = donorLoading ? "…" : (donor?.email ?? "-");
  const donorPhone = donorLoading ? "…" : (donor?.phone ?? "-");

  return (
    <div className="flex flex-col gap-4">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Donation Summary
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your donation details before submitting. You&apos;ll receive a
          confirmation and next steps by email.
        </p>
      </div>

      {/* Two-column cards */}
      <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <SummaryCard title="Contact Information">
            <div className="flex flex-col gap-2">
              <InfoRow label="First Name" value={donorFirstName} />
              <InfoRow label="Last Name" value={donorLastName} />
              <InfoRow label="Email Address" value={donorEmail} />
              <InfoRow label="Phone Number" value={donorPhone} />
            </div>
          </SummaryCard>

          <SummaryCard title="Pickup Details">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <MapPinIcon />
                <span className="text-xs font-medium text-muted-foreground">
                  Pickup Address
                </span>
              </div>
              <span className="text-sm text-foreground">{formatAddress()}</span>
            </div>
          </SummaryCard>
        </div>

        {/* Right column */}
        <SummaryCard title="Donation Items">
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </SummaryCard>
      </div>

      {/* Bottom questions */}
      <div className="flex flex-col gap-4">
        {/* Smoking */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Does anyone smoke in the household?
          </span>
          <YesNoToggle value={smokingInHousehold} onChange={handleSmokingChange} />
        </div>

        {/* Pets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            Are there any pets in the household?
          </span>
          <YesNoToggle value={petsInHousehold} onChange={handlePetsChange} />
        </div>

        {/* Fee agreement */}
        <div className="flex flex-col gap-1.5">
          <div>
            <span className="text-sm font-medium text-foreground">
              Pickup fee agreement
            </span>
            <span className="text-xs text-destructive">
              {feeAgreementDirty
                ? "* (Agreement required to submit donation)"
                : "*"}
            </span>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <span className="relative flex size-3.5 shrink-0 items-center justify-center">
              <input
                type="checkbox"
                checked={feeAgreement}
                onChange={handleFeeAgreementChange}
                className={cn(
                  "size-3.5 cursor-pointer appearance-none rounded-sm border transition-colors",
                  feeAgreement
                    ? "border-primary bg-primary"
                    : showFeeError
                      ? "border-destructive bg-background"
                      : "border-border bg-background",
                )}
              />
              {feeAgreement && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <CheckIcon />
                </span>
              )}
            </span>
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
