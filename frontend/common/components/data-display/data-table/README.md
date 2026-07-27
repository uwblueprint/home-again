# DataTable

A shared table for any list view — search, sortable columns, faceted filtering, an
optional segmented tabs bar, pagination, and row-click navigation, all wired up for
you. Built on [TanStack Table](https://tanstack.com/table); see it live in
`app/component-gallery/page.tsx` (`DataTableDemo`).

---

## Minimal example

```tsx
import { DataTable } from "@/common/components/data-display";
import type { ColumnDef } from "@tanstack/react-table";

interface Referral {
  id: string;
  clientName: string;
  status: string;
}

const columns: ColumnDef<Referral>[] = [
  { accessorKey: "clientName", header: "Client Name" },
  { accessorKey: "status", header: "Status" },
];

function ReferralsTable({ referrals }: { referrals: Referral[] }) {
  return <DataTable columns={columns} data={referrals} />;
}
```

That's it for a static table — search and pagination already work. Everything below is
opt-in.

---

## Sortable column headers

A plain string/JSX `header` (like `"Status"` above) is never sortable. To make a
column sortable, use `DataTableColumnHeader` instead, which renders the label plus an
arrow that reflects the current sort direction:

```tsx
import { DataTableColumnHeader } from "@/common/components/data-display";

const columns: ColumnDef<Referral>[] = [
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
  },
  { accessorKey: "status", header: "Status" }, // stays unsortable
];
```

One click toggles directly between ascending and descending — there's no dropdown and
no column-hiding menu.

---

## Custom cell rendering

Use `cell` on the column def same as any TanStack Table column — e.g. to render a
status badge instead of raw text:

```tsx
{
  accessorKey: "status",
  header: "Status",
  cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
}
```

---

## Search

Built in — pass `searchPlaceholder` to customize the placeholder text (defaults to
"Search"). It matches if **any** cell in the row contains the search term
(case-insensitive substring match); no per-column config needed.

```tsx
<DataTable columns={columns} data={referrals} searchPlaceholder="Search referrals" />
```

---

## Filters (`filters` prop)

Renders a "Filter" dropdown button per entry — a "Select all that apply" checklist
(Figma: Home Again Design System, node 527:869). Multi-select: check as many options
as apply, and a "Clear" link appears once at least one is checked.

```tsx
<DataTable
  columns={columns}
  data={referrals}
  filters={[
    {
      columnId: "status",
      title: "Filter",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "Delivered", value: "Delivered" },
      ],
    },
  ]}
/>
```

**The filtered column needs an array-based `filterFn`** — TanStack's default is a fuzzy substring match, which doesn't work against a list of checked values:

```tsx
{
  accessorKey: "status",
  header: "Status",
  filterFn: (row, columnId, filterValue: string[]) =>
    filterValue.includes(row.getValue(columnId)),
  cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
}
```

You can pass more than one entry in `filters`, each targets its own column independently (useful for "select all that apply" filters)

---

## Subtabs (`subtabs` prop)

A segmented pill bar (Figma: Home Again Main Design File, node 2018:11280) rendered on
the **left** of the toolbar, sharing its row with search/filters instead of stacking
above them. It's optional — DataTable only renders it when you pass this prop. Its
column always stores a `string[]` — same shape `filters` uses — so **the column needs
the array-based `filterFn`, not an equality one:**

```tsx
<DataTable
  columns={columns}
  data={referrals}
  subtabs={{
    columnId: "status", // needs the same array-based filterFn as `filters`
    options: [
      { label: "Pending", value: "Pending" },
      { label: "Delivered", value: "Delivered" },
    ],
    // allLabel: "All" (default) — label for the tab that clears the filter
  }}
/>
```

```tsx
{
  accessorKey: "status",
  header: "Status",
  filterFn: (row, columnId, filterValue: string[]) =>
    filterValue.includes(row.getValue(columnId)),
}
```

`subtabs` and `filters` usually target **different** columns — e.g. subtabs grouping
by status while the Filter dropdown narrows by something unrelated, like agent — and
that's the simpler default to reach for. But because both share the same `string[]`
storage, **they can also target the same column** if you want a tab bar and a
checklist controlling the exact same field:

```tsx
<DataTable
  columns={columns}
  data={referrals}
  subtabs={{ columnId: "status", options: statusOptions }}
  filters={[{ columnId: "status", title: "Filter", options: statusOptions }]}
/>
```

When they share a column: clicking a tab **replaces** the filter with just that one
value (`setFilterValue([value])`); checking a box in the Filter dropdown adds/removes
just that value, leaving the rest alone. A tab shows as active only when the column's
value is a single-element array matching it — pick more than one status via the Filter
dropdown (or none) and the tabs fall back to showing "All" as active, since no single
tab represents "several" or "none." If they target different columns instead, both
filters simply combine (a row must pass both).

---

## Row click / navigation

Pass `onRowClick` to make rows clickable (keyboard-accessible — `Enter`/`Space` work
too). Passing it also adds a chevron column at the far right of every row as a visual
affordance that the row is clickable:

```tsx
<DataTable
  columns={columns}
  data={referrals}
  onRowClick={(referral) => router.push(`/referrals/${referral.id}`)}
/>
```

Omit `onRowClick` for a display-only table — no chevron column is added.

---

## Toolbar actions

Anything passed as `toolbarActions` renders on the far right, after the filter
buttons — typically a primary action button:

```tsx
<DataTable
  columns={columns}
  data={referrals}
  toolbarActions={
    <Button>
      <Plus data-icon="inline-start" />
      New referral
    </Button>
  }
/>
```

---

## Loading / error / empty states

```tsx
<DataTable
  columns={columns}
  data={referrals ?? []}
  loading={isPending}
  error={error}
  emptyStateMessage="No referrals found"
/>
```

`loading` shows skeleton rows, `error` shows the error message in place of rows (both
take priority over `data`), and `emptyStateMessage` covers the zero-rows case.

---

## Pagination

Automatic — pass `pageSize` to change the page size (defaults to 10). No other setup
needed.

---

## Full example

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import {
  DataTable,
  DataTableColumnHeader,
} from "@/common/components/data-display";
import { Button } from "@/common/components/ui/button";
import { StatusBadge } from "@/common/components/status-labels";

interface Referral {
  id: string;
  clientName: string;
  caseAgent: string;
  createdAt: string;
  status: "Pending" | "Delivered" | "Scheduled" | "Rejected";
}

const STATUSES: Referral["status"][] = [
  "Pending",
  "Delivered",
  "Scheduled",
  "Rejected",
];

const columns: ColumnDef<Referral>[] = [
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
  },
  { accessorKey: "caseAgent", header: "Case Agent" },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: (row, columnId, filterValue: string[]) =>
      filterValue.includes(row.getValue(columnId)),
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  },
];

export function ReferralsPage() {
  const { data: referrals = [], isPending, error } = useQuery(/* ... */);

  return (
    <DataTable
      columns={columns}
      data={referrals}
      loading={isPending}
      error={error}
      searchPlaceholder="Search referrals"
      subtabs={{
        columnId: "status",
        options: STATUSES.map((status) => ({ label: status, value: status })),
      }}
      onRowClick={(referral) => router.push(`/referrals/${referral.id}`)}
      toolbarActions={
        <Button>
          <Plus data-icon="inline-start" />
          New referral
        </Button>
      }
    />
  );
}
```

---