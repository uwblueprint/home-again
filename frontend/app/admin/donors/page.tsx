"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { DonorsTable, type DonorListRow } from "@/app/admin-donors/components";
import { ADMIN_DONOR } from "@/common/constants";
import { useDonors } from "@/common/hooks/useApi";
import type { DonorListItem } from "@/common/types";

function toDonorListRow(donor: DonorListItem): DonorListRow {
  return {
    id: donor.id,
    firstName: donor.first_name,
    lastName: donor.last_name,
    email: donor.email,
    phone: donor.phone,
    donationCount: donor.donation_count,
  };
}

export default function AdminDonorsPage() {
  const router = useRouter();
  const { data: donors, isLoading, error } = useDonors();

  // Memoized: a new array would reset the table to page 1.
  const rows = useMemo(() => (donors ?? []).map(toDonorListRow), [donors]);

  return (
    <main className="flex flex-1 flex-col px-2xl py-lg">
      <DonorsTable
        data={rows}
        loading={isLoading}
        error={error}
        onRowClick={(row) => router.push(ADMIN_DONOR(row.id))}
      />
    </main>
  );
}
