import type {
  ColumnDef,
  SortingFn,
  VisibilityState,
} from "@tanstack/react-table";

import type { SortDirection } from "@/common/components/ui/sort-menu";
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
  /**
   * When the donor last donated, as an ISO date string; null if they never
   * have. Drives "Recency".
   */
  lastDonatedAt: string | null;
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
  header: string
): ColumnDef<DonorListRow> {
  return {
    id: key,
    accessorFn: (row) => present(row[key]),
    header,
    cell: ({ getValue }) => textCell(getValue<string | undefined>()),
    sortingFn: compareNames,
    // Missing names go last in either direction (and never reach compareNames).
    sortUndefined: "last",
    // Searched through `fullName`, which contains both names.
    enableGlobalFilter: false,
  };
}

/**
 * Column ids double as sort fields. `lastDonatedAt` and `fullName` are hidden:
 * one only sorts ("Recency"), the other is how names are searched (so "Jane
 * Smith" matches across the two name columns).
 */
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
    header: "Donation Count",
    sortingFn: "basic",
    // A count isn't something you search for; "3" would otherwise match
    // every donor with three donations.
    enableGlobalFilter: false,
  },
  {
    id: "lastDonatedAt",
    accessorFn: (row) => {
      const time = row.lastDonatedAt ? Date.parse(row.lastDonatedAt) : NaN;
      return Number.isNaN(time) ? undefined : time;
    },
    header: "Last donation",
    sortingFn: "basic",
    // Donors who've never donated go last in either direction.
    sortUndefined: "last",
    enableGlobalFilter: false,
  },
  {
    id: "fullName",
    accessorFn: (row) =>
      [present(row.firstName), present(row.lastName)].filter(Boolean).join(" "),
    header: "Name",
    enableSorting: false,
  },
];

/** Columns that exist for sorting/search only and never render. */
export const donorHiddenColumns: VisibilityState = {
  lastDonatedAt: false,
  fullName: false,
};

export type DonorSortField =
  | "lastDonatedAt"
  | "firstName"
  | "lastName"
  | "donationCount";

interface DonorSortOption {
  value: DonorSortField;
  label: string;
  /** Direction applied when the option is picked; the ↑/↓ arrows override it. */
  defaultDirection: SortDirection;
}

export const donorSortOptions: DonorSortOption[] = [
  { value: "lastDonatedAt", label: "Recency", defaultDirection: "desc" },
  { value: "firstName", label: "First Name", defaultDirection: "asc" },
  { value: "lastName", label: "Last Name", defaultDirection: "asc" },
  { value: "donationCount", label: "Donation Count", defaultDirection: "desc" },
];

/** Initial sort, and what Reset goes back to: Recency, most recent first. */
export const DEFAULT_DONOR_SORT: {
  field: DonorSortField;
  direction: SortDirection;
} = {
  field: donorSortOptions[0].value,
  direction: donorSortOptions[0].defaultDirection,
};
