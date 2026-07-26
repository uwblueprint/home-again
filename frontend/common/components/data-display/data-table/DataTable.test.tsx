import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./DataTable";

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
      <DataTable
        columns={columns}
        data={makeData(1)}
        onRowClick={onRowClick}
      />
    );
    fireEvent.click(screen.getByText("Jane Doe"));
    expect(onRowClick).toHaveBeenCalledWith(
      expect.objectContaining({ clientName: "Jane Doe" })
    );
  });
});
