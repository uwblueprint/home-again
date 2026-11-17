import type {
  ColumnDef,
  SortingFn,
  VisibilityState,
} from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/common/components/data-display";
import { formatReviewPhoneNumber } from "@/common/constants/validators";

/**
 * One row of the donors list. A view model rather than the API's
 * `DonorListItem`, so the table doesn't depend on the API's shape or
 * nullability — map API donors to this before passing them in.
 */
export interface DonorListRow {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  donationCount: number;
}

const MISSING_VALUE = "—";

/**
 * Trimmed text, or `undefined` for null, empty or whitespace-only text, so it
 * renders "—" and sorts last (and " Zed" doesn't sort before "Al").
 */
function present(value: string | null): string | undefined {
  return value?.trim() || undefined;
}

function textCell(value: string | undefined) {
  return value ?? MISSING_VALUE;
}

// Case- and accent-insensitive, so "émile" sorts with "Emile", not after "Z".
const nameCollator = new Intl.Collator(undefined, { sensitivity: "base" });

const compareNames: SortingFn<DonorListRow> = (a, b, columnId) =>
  nameCollator.compare(
    a.getValue<string>(columnId),
    b.getValue<string>(columnId)
  );

function nameColumn(
  key: "firstName" | "lastName",
  title: string
): ColumnDef<DonorListRow> {
  return {
    id: key,
    accessorFn: (row) => present(row[key]),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={title} />
    ),
    cell: ({ getValue }) => textCell(getValue<string | undefined>()),
    sortingFn: compareNames,
    // A-Z on first click. Explicit because TanStack otherwise guesses from the
    // first row's value, and a missing name (undefined) would make it Z-A.
    sortDescFirst: false,
    // Missing names go last in either direction (and never reach compareNames).
    sortUndefined: "last",
    // Searched through `fullName` instead.
    enableGlobalFilter: false,
  };
}

export const donorColumns: ColumnDef<DonorListRow>[] = [
  nameColumn("firstName", "First Name"),
  nameColumn("lastName", "Last Name"),
  {
    id: "email",
    accessorFn: (row) => present(row.email),
    header: "Email",
    cell: ({ getValue }) => textCell(getValue<string | undefined>()),
  },
  {
    id: "phone",
    accessorFn: (row) => present(row.phone),
    header: "Phone number",
    cell: ({ getValue }) => {
      const phone = getValue<string | undefined>();
      return phone ? formatReviewPhoneNumber(phone) : MISSING_VALUE;
    },
  },
  {
    accessorKey: "donationCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Donation Count" />
    ),
    sortingFn: "basic",
    sortDescFirst: true,
    // Otherwise searching "3" matches every donor with three donations.
    enableGlobalFilter: false,
  },
  // Hidden; lets "Jane Smith" match across the two name columns.
  {
    id: "fullName",
    accessorFn: (row) =>
      [present(row.firstName), present(row.lastName)].filter(Boolean).join(" "),
    header: "Name",
    enableSorting: false,
  },
];

export const donorHiddenColumns: VisibilityState = {
  fullName: false,
};
