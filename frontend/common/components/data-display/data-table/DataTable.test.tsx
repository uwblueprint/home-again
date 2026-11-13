import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./DataTable";
import { DataTableColumnHeader } from "./DataTableColumnHeader";

interface Referral {
  id: string;
  clientName: string;
  status: string;
}

const columns: ColumnDef<Referral>[] = [
  { accessorKey: "clientName", header: "Client Name" },
  { accessorKey: "status", header: "Status" },
];

function makeData(count: number): Referral[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i),
    clientName: i === 0 ? "Jane Doe" : `Client ${i}`,
    status: i % 2 === 0 ? "Pending" : "Delivered",
  }));
}

describe("DataTable", () => {
  it("renders rows from data", () => {
    render(<DataTable columns={columns} data={makeData(3)} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Client 1")).toBeInTheDocument();
  });

  it("shows the empty state when there is no data", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyStateMessage="No referrals found"
      />
    );
    expect(screen.getByText("No referrals found")).toBeInTheDocument();
  });

  it("filters rows via the search input", () => {
    render(<DataTable columns={columns} data={makeData(3)} />);
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "Jane" },
    });
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.queryByText("Client 1")).not.toBeInTheDocument();
  });

  it("paginates rows once data exceeds the page size", () => {
    render(<DataTable columns={columns} data={makeData(12)} pageSize={10} />);
    expect(screen.getByText("1 - 10 of 12 results")).toBeInTheDocument();
    expect(screen.queryByText("Client 11")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
    expect(screen.getByText("11 - 12 of 12 results")).toBeInTheDocument();
    expect(screen.getByText("Client 11")).toBeInTheDocument();
  });

  it("invokes onRowClick with the row data", () => {
    const onRowClick = jest.fn();
    render(
      <DataTable columns={columns} data={makeData(1)} onRowClick={onRowClick} />
    );
    fireEvent.click(screen.getByText("Jane Doe"));
    expect(onRowClick).toHaveBeenCalledWith(
      expect.objectContaining({ clientName: "Jane Doe" })
    );
  });

  it("checks the sort option matching a header-click sort", () => {
    const headerColumns: ColumnDef<Referral>[] = [
      {
        accessorKey: "clientName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Client Name" />
        ),
      },
      { accessorKey: "status", header: "Status" },
    ];
    render(
      <DataTable
        columns={headerColumns}
        data={makeData(3)}
        sortOptions={[
          {
            value: "status",
            label: "Status",
            sorting: [{ id: "status", desc: false }],
          },
          {
            value: "name_az",
            label: "Name (A-Z)",
            sorting: [{ id: "clientName", desc: false }],
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Client Name/ }));
    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    expect(screen.getByRole("radio", { name: "Name (A-Z)" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Status" })).not.toBeChecked();
  });

  it("renders loading skeletons only for visible columns", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        loading
        initialColumnVisibility={{ status: false }}
        hideToolbar
      />
    );
    const headerCells = screen.getAllByRole("columnheader");
    const firstBodyRow = screen.getAllByRole("row")[1];
    expect(headerCells).toHaveLength(1);
    expect(within(firstBodyRow).getAllByRole("cell")).toHaveLength(1);
  });

  describe("search scope", () => {
    interface Item {
      id: string;
      name: string | null;
      code: string;
      secret: string;
    }

    const itemColumns: ColumnDef<Item>[] = [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "code", header: "Code" },
      // A sort-only value that shouldn't be searchable.
      { accessorKey: "secret", header: "Secret", enableGlobalFilter: false },
    ];

    const items: Item[] = [
      // First row's name is empty — TanStack's default would then skip the
      // whole column when searching.
      { id: "1", name: null, code: "A-1", secret: "zebra" },
      { id: "2", name: "Mango", code: "B-2", secret: "apple" },
    ];

    it("searches columns whose first cell is empty", () => {
      render(<DataTable columns={itemColumns} data={items} />);
      fireEvent.change(screen.getByPlaceholderText("Search"), {
        target: { value: "mango" },
      });
      expect(screen.getByText("Mango")).toBeInTheDocument();
      expect(screen.queryByText("A-1")).not.toBeInTheDocument();
    });

    it("skips columns with enableGlobalFilter: false", () => {
      render(<DataTable columns={itemColumns} data={items} />);
      fireEvent.change(screen.getByPlaceholderText("Search"), {
        target: { value: "zebra" },
      });
      expect(screen.getByTestId("data-table-search-empty")).toBeInTheDocument();
    });
  });
});
