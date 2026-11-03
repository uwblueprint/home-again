import React, { useState } from "react";
import { act, render, screen, fireEvent, within } from "@testing-library/react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

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

  describe("controlled state", () => {
    const sortableColumns: ColumnDef<Referral>[] = [
      { accessorKey: "clientName", header: "Client Name" },
      { accessorKey: "status", header: "Status" },
    ];

    const people: Referral[] = [
      { id: "1", clientName: "Bravo", status: "Pending" },
      { id: "2", clientName: "Alpha", status: "Delivered" },
      { id: "3", clientName: "Charlie", status: "Pending" },
    ];

    // Search/sort controlled from outside, as with a custom header.
    const tableProps = {
      columns: sortableColumns,
      data: people,
      hideToolbar: true,
    };

    function renderedNames() {
      return screen
        .getAllByTestId(/^data-table-row-/)
        .map((row) => within(row).getAllByRole("cell")[0].textContent);
    }

    it("orders rows by the sorting prop", () => {
      const { rerender } = render(
        <DataTable
          {...tableProps}
          sorting={[{ id: "clientName", desc: false }]}
        />
      );
      expect(renderedNames()).toEqual(["Alpha", "Bravo", "Charlie"]);

      rerender(
        <DataTable
          {...tableProps}
          sorting={[{ id: "clientName", desc: true }]}
        />
      );
      expect(renderedNames()).toEqual(["Charlie", "Bravo", "Alpha"]);
    });

    it("reports sort changes and follows the parent's sorting", () => {
      const onSortingChange = jest.fn();

      function Parent() {
        const [sorting, setSorting] = useState<SortingState>([
          { id: "clientName", desc: false },
        ]);
        return (
          <>
            <button
              type="button"
              onClick={() => setSorting([{ id: "clientName", desc: true }])}
            >
              Flip
            </button>
            <DataTable
              columns={sortableColumns}
              data={people}
              sorting={sorting}
              onSortingChange={(updater) => {
                onSortingChange(updater);
                setSorting(updater);
              }}
              sortOptions={[
                {
                  value: "name",
                  label: "Name",
                  sorting: [{ id: "clientName", desc: false }],
                },
                {
                  value: "status",
                  label: "Status",
                  sorting: [{ id: "status", desc: false }],
                },
              ]}
            />
          </>
        );
      }

      render(<Parent />);
      expect(renderedNames()).toEqual(["Alpha", "Bravo", "Charlie"]);

      fireEvent.click(screen.getByRole("button", { name: "Flip" }));
      expect(renderedNames()).toEqual(["Charlie", "Bravo", "Alpha"]);

      // No option describes Z–A, so the menu shows none checked rather than
      // the stale "Name".
      fireEvent.click(screen.getByRole("button", { name: "Sort" }));
      expect(screen.getByRole("radio", { name: "Name" })).not.toBeChecked();
      expect(screen.getByRole("radio", { name: "Status" })).not.toBeChecked();

      // The table's own sort menu goes through onSortingChange too.
      fireEvent.click(screen.getByRole("radio", { name: "Status" }));
      expect(onSortingChange).toHaveBeenLastCalledWith([
        { id: "status", desc: false },
      ]);
      expect(renderedNames()).toEqual(["Alpha", "Bravo", "Charlie"]);
      expect(screen.getByRole("radio", { name: "Status" })).toBeChecked();
    });

    it("filters rows by the globalFilter prop", () => {
      const { rerender } = render(
        <DataTable {...tableProps} globalFilter="alp" />
      );
      expect(renderedNames()).toEqual(["Alpha"]);

      rerender(<DataTable {...tableProps} globalFilter="" />);
      expect(renderedNames()).toHaveLength(3);
    });

    it("shows the search-empty state for a controlled query", () => {
      render(<DataTable {...tableProps} globalFilter="nobody" />);
      expect(screen.getByText("No results found for 'nobody'")).toBeVisible();
    });

    it("reports typing in the toolbar search without filtering on its own", () => {
      const onGlobalFilterChange = jest.fn();
      render(
        <DataTable
          columns={sortableColumns}
          data={people}
          globalFilter=""
          onGlobalFilterChange={onGlobalFilterChange}
        />
      );
      fireEvent.change(screen.getByPlaceholderText("Search"), {
        target: { value: "Alpha" },
      });
      expect(onGlobalFilterChange).toHaveBeenCalledWith("Alpha");
      // The parent didn't update the prop, so nothing is filtered.
      expect(renderedNames()).toHaveLength(3);
    });

    it("goes back to the first page when the controlled query changes", async () => {
      const many = makeData(25);

      function Parent() {
        const [query, setQuery] = useState("");
        return (
          <>
            <input
              aria-label="query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <DataTable
              columns={columns}
              data={many}
              globalFilter={query}
              onGlobalFilterChange={setQuery}
              hideToolbar
            />
          </>
        );
      }

      render(<Parent />);
      // TanStack arms its page-index auto-reset in a microtask after the
      // first render; a real user can't type before that, so flush it.
      await act(async () => {});
      fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
      expect(screen.getByText("11 - 20 of 25 results")).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText("query"), {
        target: { value: "Client 1" },
      });
      // Client 1, 10–19 → 11 matches, back on page 1. TanStack resets the
      // page index in a microtask, hence findBy.
      expect(
        await screen.findByText("1 - 10 of 11 results")
      ).toBeInTheDocument();
    });
  });
});
