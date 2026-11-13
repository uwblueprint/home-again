"use client";

import { isAxiosError } from "axios";
import { notFound, useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import {
  DonorProfileCard,
  DonorProfileCardSkeleton,
  HistoryTable,
  toDonationHistoryRow,
} from "@/app/admin-donors/components";
import { DONATION_REQUEST } from "@/common/constants";
import {
  useDonor,
  useDonorDonations,
  useUpdateDonor,
} from "@/common/hooks/useApi";
import type { UpdateDonorInput } from "@/common/types";

function ErrorMessage({ children }: { children: string }) {
  return (
    <p role="alert" className="text-paragraph-regular text-muted-foreground">
      {children}
    </p>
  );
}

export default function AdminDonorPage() {
  const router = useRouter();
  const { donorId } = useParams<{ donorId: string }>();
  const { data: donor, error: donorError } = useDonor(donorId);
  const { data: donations, error: donationsError } = useDonorDonations(donorId);
  const { mutateAsync: updateDonor } = useUpdateDonor(donorId);

  // Memoized: a new array would reset the table to page 1.
  const historyRows = useMemo(
    () => donations?.map(toDonationHistoryRow),
    [donations]
  );

  const handleSave = async (patch: UpdateDonorInput) => {
    await updateDonor(patch);
  };

  if (isAxiosError(donorError) && donorError.response?.status === 404) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-2xl px-2xl py-lg">
      <h1 className="text-heading-3 font-semibold text-foreground">
        Donor Profile
      </h1>

      {donor ? (
        <DonorProfileCard donor={donor} onSave={handleSave} />
      ) : donorError ? (
        <ErrorMessage>We couldn&apos;t load this donor.</ErrorMessage>
      ) : (
        <DonorProfileCardSkeleton />
      )}

      {donationsError && !historyRows ? (
        <ErrorMessage>
          We couldn&apos;t load this donor&apos;s donation history.
        </ErrorMessage>
      ) : (
        <HistoryTable
          data={historyRows ?? []}
          loading={!historyRows}
          onRowClick={(row) => router.push(DONATION_REQUEST(row.donationId))}
        />
      )}
    </main>
  );
}
